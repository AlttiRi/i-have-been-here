import {readonly, ref, Ref} from "vue";
import {getFromStoreLocal, setToStoreLocal} from "@/util-ext";
import {StoreLocalModel} from "@/types";

export class ReactiveStoreLocalValue<K extends keyof StoreLocalModel> {

    private readonly keyName: K;
    private readonly _ref: Ref<StoreLocalModel[K]>;
    private isReadyRef: Ref<boolean>; // todo remove ref
    private resolve!: (value: StoreLocalModel[K]) => void;

    public readonly defaultValue: StoreLocalModel[K];
    /** READONLY. To change the value use `setValue`. */
    public readonly ref: Readonly<Ref<StoreLocalModel[K]>>;
    public readonly onReady: Promise<StoreLocalModel[K]>;

    constructor(keyName: K, defaultValue: StoreLocalModel[K]) {
        this.keyName = keyName;
        this.defaultValue = defaultValue;
        this.isReadyRef = ref(false);
        this.onReady = new Promise<StoreLocalModel[K]>(resolve => this.resolve = resolve);

        this._ref = ref(defaultValue)  as Ref<StoreLocalModel[K]>;
        this.ref = readonly(this._ref) as Readonly<Ref<StoreLocalModel[K]>>; // todo: rename to "readonlyRef"?

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

    public get value(): StoreLocalModel[K] {
        return this.ref.value;
    }
    public set value(newValue: StoreLocalModel[K]) {
        void this.setValue(newValue);
    }

    public get isReady(): boolean {
        return this.isReadyRef.value;
    }
    public async getValue(): Promise<StoreLocalModel[K]> {
        if (!this.isReady) {
            await this.onReady; // todo use `return`
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
