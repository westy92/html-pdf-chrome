'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CompletionTrigger {
    constructor(timeout = 1000) {
        this.timeout = timeout;
    }
}
exports.CompletionTrigger = CompletionTrigger;
class Timer extends CompletionTrigger {
    constructor(timeout) {
        super(timeout);
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, this.timeout);
            });
        });
    }
}
exports.Timer = Timer;
class Event extends CompletionTrigger {
    constructor(event, elementId, timeout) {
        super(timeout);
        this.event = event;
        this.elementId = elementId;
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Runtime } = client;
            const selector = this.elementId ? `getElementById('${this.elementId}')` : 'body';
            return Runtime.evaluate({
                awaitPromise: true,
                expression: `new Promise(resolve => {
        document.${selector}.addEventListener('${this.event}', resolve, { once: true });
        setTimeout(resolve, ${this.timeout});
      })`,
            });
        });
    }
}
exports.Event = Event;

//# sourceMappingURL=CompletionTrigger.js.map
