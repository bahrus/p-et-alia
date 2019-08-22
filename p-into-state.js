import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
import { XtalStateUpdate } from 'xtal-state/xtal-state-update.js';
const with_state_path = 'with-state-path';
export class PIntoState extends PDX {
    static get is() { return 'p-into-state'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([with_state_path]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case with_state_path:
                this._withStatePath = newVal;
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
    connectedCallback() {
        super.connectedCallback();
        this.propUp(['guid', 'withStatePath']);
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
define(PIntoState);
