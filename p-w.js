import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
import { doNotCCEventToState } from './p-h-d.js';
const state_path = 'state-path';
const push = 'push';
const cc = 'cc';
/**
 * "planted weirwood" -- passes data down just like p-d, but also updates history.state
 * @element p-w
 */
export class PW extends PDX {
    constructor() {
        super(...arguments);
        this._push = false;
        this._cc = false;
        this._addedState = false;
    }
    static get is() { return 'p-w'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([state_path, push, cc]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case state_path:
                this._statePath = newVal;
                break;
            case cc:
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
    get cc() {
        return this._cc;
    }
    /**
     * Should carbon copy data to state
     * @attr
     */
    set cc(nv) {
        this.attr(cc, nv, '');
    }
    connectedCallback() {
        super.connectedCallback();
        this.propUp(['guid', 'statePath', 'push', 'cc']);
        this.addState();
    }
    async addState() {
        if (!this._cc || this._addedState)
            return;
        this._addedState = true;
        const { XtalStateUpdate } = await import('xtal-state/xtal-state-update.js');
        const xtalUpdate = document.createElement(XtalStateUpdate.is);
        xtalUpdate.rewrite = !this._push;
        xtalUpdate.make = !!this._push;
        xtalUpdate.withPath = this._statePath;
        xtalUpdate.guid = this._guid;
        this.appendChild(xtalUpdate);
        this._xtalUpdate = xtalUpdate;
    }
    commit(target, val, e) {
        super.commit(target, val, e);
        if (e.detail && e.detail[doNotCCEventToState])
            return;
        window.requestAnimationFrame(() => {
            this._xtalUpdate.history = val;
        });
    }
}
define(PW);
