import {readonly, ref, Ref} from "../../../libs/vue-reactivity.js";
import {getFromStoreLocal, setToStoreLocal} from "../../util-ext.js";
import {StoreLocalModel} from "../../types.js";

export class ReactiveStoreLocalValue<K extends keyof StoreLocalModel> {

    private readonly keyName: K;
    private readonly _ref: Ref<StoreLocalModel[K]>;
    private isReadyRef: Ref<boolean>;
    private resolve!: Function;

    public readonly defaultValue: StoreLocalModel[K];
    public readonly ref: Readonly<Ref<StoreLocalModel[K]>>;
    public readonly onReady: Promise<void>;

    constructor(keyName: K, defaultValue: StoreLocalModel[K]) {
        this.keyName = keyName;
        this.defaultValue = defaultValue;
        this.isReadyRef = ref(false);
        this.onReady = new Promise(resolve => this.resolve = resolve);

        this._ref = ref(defaultValue)  as Ref<StoreLocalModel[K]>;
        this.ref = readonly(this._ref) as Readonly<Ref<StoreLocalModel[K]>>;

        chrome.runtime.onMessage.addListener(message => {
            if (message.command === `set-${this.keyName}--message`) {
                void this.setValue(message.data, true);
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
        this.resolve();
    }

    public get value(): StoreLocalModel[K] {
        return this.ref.value;
    }
    public get isReady(): boolean {
        return this.isReadyRef.value;
    }
    public async getValue(): Promise<StoreLocalModel[K]> {
        if (!this.isReady) {
            await this.onReady;
        }
        return this.value;
    }
    public async setValue(newValue: StoreLocalModel[K], isSync: boolean = false): Promise<void> {
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
