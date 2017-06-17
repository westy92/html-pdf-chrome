'use strict';

export abstract class CompletionTrigger {
  constructor(protected timeout = 1000) {}

  public abstract async wait(client: any): Promise<any>;
}

export class Timer extends CompletionTrigger {
  constructor(timeout: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(resolve, this.timeout);
    });
  }
}

export class Event extends CompletionTrigger {
  constructor(protected event: string, protected cssSelector?: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
    const selector = this.cssSelector ? `querySelector('${this.cssSelector}')` : 'body';
    return Runtime.evaluate({
      awaitPromise: true,
      expression: `new Promise(resolve => {
        document.${selector}.addEventListener('${this.event}', resolve, { once: true });
        setTimeout(resolve, ${this.timeout});
      })`,
    });
  }
}
