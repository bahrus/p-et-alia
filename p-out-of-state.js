import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
import { XtalStateWatch } from 'xtal-state/xtal-state-watch.js';
const init_and_popstate_only = 'init-and-popstate-only';
export class POutOfState extends PDX {
    constructor() {
        super(...arguments);
        this._initAndPopStateOnly = false;
    }
    static get is() { return 'p-out-of-state'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([init_and_popstate_only]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case init_and_popstate_only:
                this._initAndPopStateOnly = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }
    get initAndPopStateOnly() {
        return this._initAndPopStateOnly;
    }
    set initAndPopStateOnly(nv) {
        this._initAndPopStateOnly = nv;
    }
    connectedCallback() {
        super.connectedCallback();
        this.propUp(['guid', 'initOnly']);
        const xtalWatch = document.createElement(XtalStateWatch.is);
        xtalWatch.guid = this._guid;
        xtalWatch.addEventListener('history-changed', e => {
            const cei = e;
            if (this._initAndPopStateOnly && !cei.detail.isInitialEvent && !cei.detail.isPopstate)
                return;
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}
define(POutOfState);
