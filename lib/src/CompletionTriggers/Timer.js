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
 * Waits for a specified amount of time.
 *
 * @export
 * @class Timer
 * @extends {CompletionTrigger}
 */
class Timer extends CompletionTrigger_1.CompletionTrigger {
    /**
     * Creates an instance of the Timer CompletionTrigger.
     * @param {number} timeout ms to wait until timing out.
     * @memberof Timer
     */
    constructor(timeout) {
        super(timeout);
    }
    wait() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, this.timeout);
            });
        });
    }
}
exports.Timer = Timer;

//# sourceMappingURL=Timer.js.map
