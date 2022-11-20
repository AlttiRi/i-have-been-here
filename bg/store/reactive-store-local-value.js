import {readonly, ref} from "/libs/vue-reactivity.js";
import {getFromStoreLocal, setToStoreLocal} from "/util-ext.js";

/**
 * @template T
 */
export class ReactiveStoreLocalValue {
    constructor(keyName, defaultValue) {
        /** @private
         *  @type {String}  */
        this.keyName = keyName;

        // /** @private */
        this.defaultValue = defaultValue;

        /** @type {import("@vue/reactivity").Ref<boolean>} */
        this.isReadyRef = ref(false);

        /** @type {Promise} */
        this.onReady = new Promise(resolve => /** @private */ this.resolve = resolve);

        /** @private
         *  @type {import("@vue/reactivity").Ref<T>}  */
        this._ref = ref(null);
        /** @type {import("@vue/reactivity").ComputedRef<T>} */
        this.ref = readonly(this._ref);

        chrome.runtime.onMessage.addListener(message => {
            if (message.command === `set-${this.keyName}--message`) {
                void this.setValue(message.data, true);
            }
        });

        void this._init();
    }

    /** @return {T} */
    get value() {
        return this.ref.value;
    }
    /** @return {Boolean} */
    get isReady() {
        return this.isReadyRef.value;
    }
    /** @return {Promise<T>} */
    async getValue() {
        if (!this.isReady) {
            await this.onReady;
        }
        return this.value;
    }

    /** @private */
    async _init() {
        /** @type {T|undefined} */
        let value = await getFromStoreLocal(this.keyName);
        if (value === undefined) {
            await setToStoreLocal(this.keyName, this.defaultValue);
            value = this.defaultValue;
        }
        this._ref.value = value;
        this.isReadyRef.value = true;
        this.resolve();
    }

    /**
     * @param {T} newValue
     * @param {Boolean} isSync
     * @return {Promise<void>}
     */
    async setValue(newValue, isSync = false) {
        if (newValue === this._ref.value) {
            return;
        }
        if (isSync) {
            this._ref.value = newValue;
            return;
        }
        await setToStoreLocal(this.keyName, newValue);
        this._ref.value = newValue;
        chrome.runtime.sendMessage({
            command: `set-${this.keyName}--message`,
            data: newValue
        });
    }
}
