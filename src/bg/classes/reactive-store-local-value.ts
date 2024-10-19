import {readonly, ref, Ref} from "vue";
import {getFromStoreLocal, setToStoreLocal} from "@/util-ext";
import {StoreLocalModel} from "@/types";

export class ReactiveStoreLocalValue<K extends keyof StoreLocalModel> {

    private readonly keyName: K;
    private readonly _ref: Ref<StoreLocalModel[K]>;
    /** Makes `isReady` getter reactive. */
    private isReadyRef: Ref<boolean>;
    private resolve!: (value: StoreLocalModel[K]) => void;

    public readonly defaultValue: StoreLocalModel[K];
    /**
     * READONLY. Use only for `watch`ing.
     * For reading use `value` getter, or `getValue`.
     * To change the value use `value` setter, or `setValue`.
     */
    public readonly ref: Readonly<Ref<StoreLocalModel[K]>>;
    public readonly onReady: Promise<StoreLocalModel[K]>;

    constructor(keyName: K, defaultValue: StoreLocalModel[K]) {
        this.keyName = keyName;
        this.defaultValue = defaultValue;
        this.isReadyRef = ref(false);
        this.onReady = new Promise<StoreLocalModel[K]>(resolve => this.resolve = resolve);

        this._ref = ref(defaultValue)  as Ref<StoreLocalModel[K]>;
        this.ref = readonly(this._ref) as Readonly<Ref<StoreLocalModel[K]>>; // todo?: rename to "readonlyRef"

        chrome.runtime.onMessage.addListener(message => {
            if (message.command === `set-${this.keyName}--message`) {
                void this._setValue(message.data, true);
            }
        });

        void this._init();
    }
    private async _init() {
        let value: StoreLocalModel[K] = await getFromStoreLocal(this.keyName);
        if (value === undefined) {
            await setToStoreLocal(this.keyName, this.defaultValue);
            value = this.defaultValue;
        }
        this._ref.value = value;
        this.isReadyRef.value = true;
        this.resolve(value);
    }

    /** Get the value instantly. May return the default value if `isReady` is `false`. Reactive. */
    public get value(): StoreLocalModel[K] {
        return this._ref.value;
    }
    public set value(newValue: StoreLocalModel[K]) {
        void this.setValue(newValue);
    }

    /** Is `value` ready, or it's still have the default value. Reactive. */
    public get isReady(): boolean {
        return this.isReadyRef.value;
    }
    /** To get the finished value. (Does not return the default value.)*/
    public async getValue(): Promise<StoreLocalModel[K]> {
        if (!this.isReady) {
            return this.onReady;
        }
        return this.value;
    }
    public setValue(newValue: StoreLocalModel[K]): Promise<void> {
        return this._setValue(newValue);
    }
    // todo setValueDebounced
    private async _setValue(newValue: StoreLocalModel[K], isSyncMessage: boolean = false): Promise<void> {
        if (newValue === this._ref.value) {
            return;
        }
        if (isSyncMessage) {
            this._ref.value = newValue;
            return;
        }
        await setToStoreLocal(this.keyName, newValue);
        this._ref.value = newValue;
        chrome.runtime.sendMessage({ // todo add "time" param (to prevent race condition)
            command: `set-${this.keyName}--message`,
            data: newValue
        });
    }
}
