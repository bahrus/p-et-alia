import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
import { XtalStateUpdate } from 'xtal-state/xtal-state-update.js';
const with_state_path = 'with-state-path';
const push = 'push';
export class PDAndCCState extends PDX {
    constructor() {
        super(...arguments);
        this._push = false;
    }
    static get is() { return 'p-d-and-cc-state'; }
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
        const xtalWatch = document.createElement(XtalStateUpdate.is);
        xtalWatch.rewrite = true;
        xtalWatch.withPath = this._withStatePath;
        xtalWatch.guid = this._guid;
        this.appendChild(xtalWatch);
        this._xtalWatch = xtalWatch;
    }
    commit(target, val) {
        super.commit(target, val);
        window.requestAnimationFrame(() => {
            this._xtalWatch.history = val;
        });
    }
}
define(PDAndCCState);
