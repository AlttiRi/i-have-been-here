/**
 * @typedef {*} T
 * @type ObservableProperty<T>
 */
export class ObservableAsyncProperty {
    _listeners = [];
    _oneTimeListeners = [];
    _ready = false;
    _value;
    constructor(asyncValueProducer) {
        if (asyncValueProducer) {
            asyncValueProducer().then(value => {
                this._onReadyValue(value);
            });
        }
    }
    _onReadyValue(value) {
        this._onValueHandler(value);
        this._ready = true;
    };
    _onValueHandler(value) {
        this._value = value;
        this._listeners.forEach(listener => listener(value));
        this._oneTimeListeners.forEach(listener => listener(value));
        this._oneTimeListeners = [];
    }

    /** @abstract */
    _asyncValueSetter(value) {
        return Promise.resolve();
    }
    set value(value) {
        console.log("setter", value);
        void this._asyncValueSetter(value).then(() => {
            this._onValueHandler(value);
        });
    }
    onValue(listener) {
        this._listeners.push(listener);
        if (this._ready) {
            listener(this._value);
        }
    }
    onValueOnce(listener) {
        if (this._ready) {
            listener(this._value);
        } else {
            this._oneTimeListeners.push(listener);
        }
    }
    onChanged(listener) {
        this._listeners.push(listener);
    }
}


import {getFromStoreLocal, setToStoreLocal} from "../util-ext.js";
/**
 * @typedef {*} T
 * @type ObservableStoreLocalProperty<T>
 */
export class ObservableStoreLocalProperty extends ObservableAsyncProperty {
    constructor(key, defaultValue) {
        super();
        this._key = key;
        this._defaultValue = defaultValue;
        this._asyncValueProducer().then(value => this._onReadyValue(value));
    }
    _asyncValueProducer() {
        return getFromStoreLocal(this._key)
            .then(async (value) => {
                if (value === undefined && this._defaultValue !== undefined) {
                    await setToStoreLocal(this._key, this._defaultValue);
                    value = this._defaultValue;
                }
                return value;
            });
    }
    async _asyncValueSetter(value) {
        await setToStoreLocal(this._key, value);
    }
}

export class ComputedProperty extends ObservableAsyncProperty {
    /** @param {ObservableStoreLocalProperty<T>} property
     *  @param {function(T): any} onValueCallback  */
    constructor(property, onValueCallback) {
        super();
        property.onValue(value => {
            this._onValueHandler(onValueCallback(value));
            this._ready = true;
        });
    }
}


/**
 * @typedef {*} T
 * @type ObservableProperty<T>
 */
export class ObservableProperty {
    _listeners = [];
    _value;
    constructor(value) {
        this.value = value;
    }

    set value(value) {
        this._value = value;
        this._listeners.forEach(listener => listener(this.value));
        console.log("setter");
    }
    get value() {
        return this._value;
    }
    onValue(listener) {
        this._listeners.push(listener);
        listener(this._value);
    }
    onValueOnce(listener) {
        listener(this._value);
    }
    onChanged(listener) {
        this._listeners.push(listener);
    }
}

import {LS} from "../util.js";
/**
 * @typedef {*} T
 * @type LSObservableProperty<T>
 * @extends ObservableProperty<T>
 */
export class LSObservableProperty extends ObservableProperty {
    name = null;

    /**
     * @param {any} defaultValue
     * @param {String} name
     */
    constructor(defaultValue, name) {
        if (!name) {
            throw "LocalStorage entry name is required";
        }
        const value = LS.getItem(name, defaultValue);
        super(value);
        this.name = name;
    }

    set value(value) {
        super.value = value;
        if (this.name) { // `undefined` when called from ObservableProperty' constructor
            LS.setItem(this.name, value);
        }
    }
    get value() {
        return super.value;
    }
}
