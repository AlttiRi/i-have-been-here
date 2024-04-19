type Command = `${string}--message`;
type CommandExchange = `${Command}-exchange`;
type Message<T> = {
    command: Command;
    data: T;
}
type MessageExchange<T> = {
    command: `${string}-message-exchange`;
    data: T;
}
type MessageHandler<T>     = (data: T, sender?: chrome.runtime.MessageSender) => void;
type ExchangeHandler<T, R> = (data: T, sender: chrome.runtime.MessageSender) => R | Promise<R>;
type SendResponse<R> = (response: R) => void;

class Service<C extends string> {
    protected readonly command: C;
    /** Just logs a warning if `false` and there are multiple listeners */
    protected readonly allowMultiple: boolean;
    protected count: number;
    constructor(name: C, multiple = false) {
        this.command = name;
        this.allowMultiple = multiple;
        this.count = 0;
    }
    protected beforeAddListener() {
        if (++this.count > 1 && !this.allowMultiple) {
            console.warn(`[warning][${this.command}] Multiple listeners`);
        }
    }
}
export class SendService<D> extends Service<Command> {
    constructor(name: string, multiple = false) {
        super(`${name}--message`, multiple);
    }
    send(data: D): void {
        const message: Message<D> = {
            command: this.command,
            data,
        };
        chrome.runtime.sendMessage(message);
    }
    addListener(handler: MessageHandler<D>): void {
        super.beforeAddListener();
        chrome.runtime.onMessage.addListener((message: Message<any>, sender: chrome.runtime.MessageSender): void => {
            if (message?.command !== this.command) {
                return;
            }
            handler(message.data as D, sender);
        });
    }
}
export class PingService extends SendService<undefined> {
    ping() {
        super.send(undefined);
    }
}
export class ExchangeService<D, R> extends Service<CommandExchange> {
    constructor(name: string, multiple = false) {
        super(`${name}--message-exchange`, multiple);
    }
    exchange(data: D): Promise<R> {
        const message: MessageExchange<D> = {
            command: this.command,
            data,
        };
        return new Promise(async (resolve, reject) => {
            chrome.runtime.sendMessage(message, response => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve(response);
            });
        });
    }
    addListener(handler: ExchangeHandler<D, R>): void {
        super.beforeAddListener();
        chrome.runtime.onMessage.addListener((
            message: MessageExchange<any>, sender: chrome.runtime.MessageSender, sendResponse: SendResponse<R>
        ): void | boolean => {
            if (message?.command !== this.command) {
                return;
            }
            const response: R | Promise<R> = handler(message.data as D, sender);
            if (isPromise(response)) {
                response.then(sendResponse);
                return true;
            } else {
                sendResponse(response);
            }
            // // or
            // Promise.resolve(response).then(sendResponse);
            // return true;
        });
    }
}
export class GetService<R> extends ExchangeService<undefined, R> {
    get(): Promise<R> {
        return super.exchange(undefined);
    }
}

function isPromise(value: any): value is Promise<unknown> {
    return Boolean(typeof value?.then === "function");
}
