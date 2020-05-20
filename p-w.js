import { PUnt } from './p-unt.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { doNotCCEventToState } from './p-h-d.js';
const state_path = 'state-path';
const push = 'push';
const replace = 'replace';
/**
 * "planted weirwood" -- passes data down just like p-d, but also updates history.state
 * @element p-w
 */
export class PW extends PUnt {
    constructor() {
        super(...arguments);
        this._addedState = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.addState();
    }
    async addState() {
        if ((!this.replace && !this.push) || this._addedState) {
            return;
        }
        this._addedState = true;
        const { XtalStateUpdate } = await import('xtal-state/xtal-state-update.js');
        const xtalUpdate = document.createElement(XtalStateUpdate.is);
        xtalUpdate.rewrite = this.replace;
        xtalUpdate.make = this.push;
        xtalUpdate.withPath = this.statePath;
        xtalUpdate.guid = this.guid;
        this.appendChild(xtalUpdate);
        this._xtalUpdate = xtalUpdate;
        if (this._tempVal !== undefined) {
            xtalUpdate.history = this._tempVal;
            delete this._tempVal;
        }
    }
    commit(target, val, e) {
        super.commit(target, val, e);
        if ((e.detail && e.detail[doNotCCEventToState]))
            return;
        window.requestAnimationFrame(() => {
            if (this._xtalUpdate !== undefined) {
                this._xtalUpdate.history = val;
            }
            else {
                this._tempVal = val;
            }
        });
    }
}
PW.is = 'p-w';
PW.attributeProps = ({ statePath, replace, push }) => {
    const bool = [replace, push];
    const str = [statePath];
    const ap = {
        boolean: bool,
        string: str,
        reflect: [...bool, ...str],
    };
    return mergeProps(ap, PUnt.props);
};
define(PW);
