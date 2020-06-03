import { PDX } from './p-d-x.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { getHost } from 'xtal-element/getHost.js';
const bubbles = 'bubbles';
const composed = 'composed';
const dispatch = 'dispatch';
const cancelable = 'cancelable';
/**
 * Dispatch event when previous non p-element triggers prescribed event
 * @element p-unt
 */
let PUnt = /** @class */ (() => {
    class PUnt extends PDX {
        connectedCallback() {
            super.connectedCallback();
            this.init();
        }
        pass(e) {
            if (this.dispatch) {
                const detail = {};
                detail.target = e.target;
                this.injectVal(e, detail);
                const customEventInit = new CustomEvent(this.to, {
                    bubbles: this.bubbles,
                    composed: this.composed,
                    cancelable: this.cancelable,
                    detail: detail,
                });
                const host = getHost(this);
                if (host !== null) {
                    setTimeout(() => host.dispatchEvent(customEventInit));
                    if (host.incAttr)
                        host.incAttr(this.to);
                }
                else {
                    setTimeout(() => this.dispatchEvent(customEventInit));
                    this.incAttr(this.to);
                }
            }
            super.pass(e);
        }
    }
    PUnt.is = 'p-unt';
    PUnt.attributeProps = ({ bubbles, cancelable, composed, dispatch }) => {
        const bool = [bubbles, cancelable, composed, dispatch];
        const ap = {
            bool: bool,
            reflect: bool,
        };
        return mergeProps(ap, PDX.props);
    };
    return PUnt;
})();
export { PUnt };
define(PUnt);
