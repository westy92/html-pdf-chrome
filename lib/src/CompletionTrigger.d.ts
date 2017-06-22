export declare abstract class CompletionTrigger {
    protected timeout: number;
    protected timeoutMessage: string;
    constructor(timeout?: number, timeoutMessage?: string);
    abstract wait(client: any): Promise<any>;
}
export declare class Timer extends CompletionTrigger {
    constructor(timeout: number);
    wait(client: any): Promise<any>;
}
export declare class Event extends CompletionTrigger {
    protected event: string;
    protected cssSelector: string;
    constructor(event: string, cssSelector?: string, timeout?: number);
    wait(client: any): Promise<any>;
}
export declare class Callback extends CompletionTrigger {
    protected callbackName: string;
    constructor(callbackName?: string, timeout?: number);
    wait(client: any): Promise<any>;
}
export declare class Element extends CompletionTrigger {
    protected cssSelector: string;
    constructor(cssSelector: string, timeout?: number);
    wait(client: any): Promise<any>;
}
