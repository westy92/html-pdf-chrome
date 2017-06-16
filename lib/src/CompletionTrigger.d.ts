export declare abstract class CompletionTrigger {
    protected timeout: number;
    constructor(timeout?: number);
    abstract wait(client: any): Promise<any>;
}
export declare class Timer extends CompletionTrigger {
    constructor(timeout: number);
    wait(client: any): Promise<any>;
}
export declare class Event extends CompletionTrigger {
    protected event: string;
    protected elementId: string;
    constructor(event: string, elementId?: string, timeout?: number);
    wait(client: any): Promise<any>;
}
