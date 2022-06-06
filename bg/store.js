import {getFromStoreLocal, setToStoreLocal} from "../util-ext.js";

const manifest = chrome.runtime.getManifest();
const defaultIcon = manifest.browser_action.default_icon;
const defaultTitle = manifest.browser_action.default_title;
const defaultPopup = manifest.browser_action.default_popup;

console.log("Store");

const ObservablePropertyClass      = hoistObservablePropertyClass();
const ObservableAsyncPropertyClass = hoistObservableStoreLocalPropertyClass();
const LSObservablePropertyClass    = hoistLSObservableProperty(ObservablePropertyClass);
const LS = hoistLS();


class Store {

    /** @type {ObservableStoreLocalProperty} */
    static bookmarkOpenerMode = new ObservableAsyncPropertyClass("bookmarkOpenerMode", false);

    /** @type {ObservableStoreLocalProperty} */
    static download_shelf = new ObservableAsyncPropertyClass("download_shelf", true);


    /** @type {ObservableProperty} */
    static popup = new ObservablePropertyClass(defaultIcon);
    /** @type {ObservableProperty} */
    static title = new ObservablePropertyClass(defaultTitle);
    /** @type {ObservableProperty} */
    static icon = new ObservablePropertyClass(defaultPopup);

    // just a test
    static text = new LSObservablePropertyClass("text", "text");


    /**
     * @typedef {ObservableProperty} property
     * @param {ObservableProperty} property
     * @param {function(property)} callback
     * @param {boolean} immediately
     */
    static on(property, callback, immediately = false) {
        if (immediately) {
            callback(property.value);
        }
        property.onChanged(callback);
    }
}


const ProxiedStore = new Proxy(Store, {
    set(target, property, value, receiver) {
        if (target[property] instanceof ObservablePropertyClass) {
            target[property].value = value;
            return true;
        } else {
            return Reflect.set(target, property, value, receiver);
        }
    },
    // DO NOT USE if you want to use `Store.on(ObservableProperty)` or `ObservableProperty.onChanged()`
    // get(target, property, receiver) {
    //     if (target[property] instanceof ObservablePropertyClass) {
    //         return target[property].value;
    //     } else {
    //         return Reflect.get(target, property, receiver);
    //     }
    // }
});
export {ProxiedStore as Store};

function hoistObservablePropertyClass() {
    /**
     * @typedef {*} T
     * @type ObservableProperty<T>
     */
    class ObservableProperty {
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
        onChanged(listener) {
            this._listeners.push(listener);
        }
    }
    return ObservableProperty;
}

function hoistObservableStoreLocalPropertyClass() {
    /**
     * @typedef {*} T
     * @type ObservableProperty<T>
     */
    class ObservableStoreLocalProperty {
        _listeners = [];
        _valueListeners = [];
        _valueOneTimeListeners = [];
        _ready = false;
        _value;
        constructor(key, defaultValue) {
            this._key = key;
            getFromStoreLocal(key).then(async (value) => {
                if (value === undefined && defaultValue !== undefined) {
                    await setToStoreLocal(key, defaultValue);
                    value = defaultValue;
                }
                this._onValueHandler(value);
                this._ready = true;
            });
        }
        _onValueHandler(value) {
            this._value = value;
            this._listeners.forEach(listener => listener(value));
            this._valueListeners.forEach(listener => {
                listener(value);
                this._listeners.push(listener);
            });
            this._valueOneTimeListeners.forEach(listener => listener(value));
            this._valueListeners = [];
            this._valueOneTimeListeners = [];
        }
        set value(value) {
            void setToStoreLocal(this._key, value).then(() => {
                this._onValueHandler(value);
            });
            console.log("setter");
        }
        onValue(listener) {
            this._valueListeners.push(listener);
            if (this._ready) {
                listener(this._value);
            }
        }
        onValueOnce(listener) {
            if (this._ready) {
                listener(this._value);
            } else {
                this._valueOneTimeListeners.push(listener);
            }
        }
        onChanged(listener) {
            this._listeners.push(listener);
        }
    }
    return ObservableStoreLocalProperty;
}

function hoistLSObservableProperty(ObservableProperty) {
    /**
     * @typedef {*} T
     * @type LSObservableProperty<T>
     * @extends ObservableProperty<T>
     */
    class LSObservableProperty extends ObservableProperty {
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
    return LSObservableProperty;
}


function hoistLS() {
    class LS {
        static getItem(name, defaultValue) {
            const value = localStorage.getItem(name);
            if (value === undefined) {
                return undefined;
            }
            if (value === null) { // when there is no such item
                LS.setItem(name, defaultValue);
                return defaultValue;
            }
            return JSON.parse(value);
        }
        static setItem(name, value) {
            localStorage.setItem(name, JSON.stringify(value));
        }
        static removeItem(name) {
            localStorage.removeItem(name);
        }
        static pushItem(name, value) {
            const array = LS.getItem(name, []);
            array.push(value);
            LS.setItem(name, array);
        }
        static popItem(name, value) {
            const array = LS.getItem(name, []);
            if (array.indexOf(value) !== -1) {
                array.splice(array.indexOf(value), 1);
                LS.setItem(name, array);
            }
        }
    }
    return LS;
}


globalThis.Store = ProxiedStore;

ProxiedStore.on(Store.text, property => {
    console.log("on", property);
}, true);

ProxiedStore.text.onChanged(property => {
    console.log("onChanged", property);
})

// ProxiedStore.text = "123";
// ProxiedStore.text = "3434";
