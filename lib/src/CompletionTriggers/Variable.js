'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompletionTrigger_1 = require("./CompletionTrigger");
/**
 * Waits for a variable to be true.
 *
 * @export
 * @class Variable
 * @extends {CompletionTrigger}
 */
class Variable extends CompletionTrigger_1.CompletionTrigger {
    /**
     * Creates an instance of the Variable CompletionTrigger.
     * @param {string} [variableName] the variable to listen on.
     *  Defaults to htmlPdfDone.
     * @param {number} [timeout] ms to wait until timing out.
     * @memberof Variable
     */
    constructor(variableName, timeout) {
        super(timeout);
        this.variableName = variableName;
    }
    wait(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Runtime } = client;
            const varName = this.variableName || 'htmlPdfDone';
            return Runtime.evaluate({
                awaitPromise: true,
                expression: `
        new Promise((resolve, reject) => {
          Object.defineProperty(window, '${varName}', {
            set: (val) => { if (val === true) resolve(); }
          });
          setTimeout(() => reject('${this.timeoutMessage}'), ${this.timeout});
        })`,
            });
        });
    }
}
exports.Variable = Variable;

//# sourceMappingURL=Variable.js.map
