'use strict';

export abstract class CompletionTrigger {
  constructor(
    protected timeout = 1000,
    protected timeoutMessage = 'CompletionTrigger timed out.',
  ) {}

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
      expression: `
        new Promise((resolve, reject) => {
          document.${selector}.addEventListener('${this.event}', resolve, { once: true });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
    });
  }
}

export class Callback extends CompletionTrigger {
  constructor(protected callbackName?: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
    const cbName = this.callbackName || 'htmlPdfCb';
    return Runtime.evaluate({
      awaitPromise: true,
      expression: `
        new Promise((resolve, reject) => {
          ${cbName} = resolve;
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
    });
  }
}

export class Element extends CompletionTrigger {
  constructor(protected cssSelector: string, timeout?: number) {
    super(timeout);
  }

  public async wait(client: any): Promise<any> {
    const {Runtime} = client;
    return Runtime.evaluate({
      awaitPromise: true,
      expression: `
        new Promise((resolve, reject) => {
          new MutationObserver((mutations, observer) => {
            mutations.forEach((mutation) => {
              if ([...mutation.addedNodes].find((node) => node.matches('${this.cssSelector}'))) {
                observer.disconnect();
                resolve();
              }
            });
          }).observe(document.body, { childList: true });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
    });
  }
}
