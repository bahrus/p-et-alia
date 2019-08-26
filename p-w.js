import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
import { XtalStateUpdate } from 'xtal-state/xtal-state-update.js';
import { doNotCCEventToState } from './p-h-d.js';
const with_state_path = 'with-state-path';
const push = 'push';
export class PW extends PDX {
    constructor() {
        super(...arguments);
        this._push = false;
    }
    static get is() { return 'p-w'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([with_state_path, push]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case with_state_path:
                this._withStatePath = newVal;
                break;
            case push:
                this._push = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }
    get withStatePath() {
        return this._withStatePath;
    }
    set withStatePath(nv) {
        this.attr(with_state_path, nv);
    }
    get push() {
        return this._push;
    }
    set push(nv) {
        this.attr(push, nv, '');
    }
    connectedCallback() {
        super.connectedCallback();
        this.propUp(['guid', 'withStatePath', 'push']);
        const xtalUpdate = document.createElement(XtalStateUpdate.is);
        xtalUpdate.rewrite = !this._push;
        xtalUpdate.make = !!this._push;
        xtalUpdate.withPath = this._withStatePath;
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
