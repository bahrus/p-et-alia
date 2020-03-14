import { PUnt } from './p-unt.js';
import { define } from 'trans-render/define.js';
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
        this._push = false;
        this._replace = false;
        this._addedState = false;
    }
    static get is() { return 'p-w'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([state_path, push, replace]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case state_path:
                this._statePath = newVal;
                break;
            case replace:
            case push:
                this['_' + name] = newVal !== null;
                //this._push = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }
    get statePath() {
        return this._statePath;
    }
    /**
     * path within history.state to deep merge data into
     * @attr state-path
     */
    set statePath(nv) {
        this.attr(state_path, nv);
    }
    get push() {
        return this._push;
    }
    /**
     * push new stack element into history
     * @attr
     */
    set push(nv) {
        this.attr(push, nv, '');
    }
    get replace() {
        return this._replace;
    }
    /**
     * Should carbon copy data to state
     * @attr
     */
    set replace(nv) {
        this.attr(replace, nv, '');
    }
    connectedCallback() {
        super.connectedCallback();
        this.propUp(['guid', 'statePath', 'push', 'replace']);
        this.addState();
    }
    async addState() {
        if ((!this._replace && !this._push) || this._addedState) {
            return;
        }
        this._addedState = true;
        const { XtalStateUpdate } = await import('xtal-state/xtal-state-update.js');
        const xtalUpdate = document.createElement(XtalStateUpdate.is);
        xtalUpdate.rewrite = this._replace;
        xtalUpdate.make = this._push;
        xtalUpdate.withPath = this._statePath;
        xtalUpdate.guid = this._guid;
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
define(PW);
