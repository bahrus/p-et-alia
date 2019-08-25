import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
import { XtalStateWatch } from 'xtal-state/xtal-state-watch.js';
const init_and_popstate_only = 'init-and-popstate-only';
const from_path = 'from-path';
export const doNotCCEventToState = 'dncc';
export class PhD extends PDX {
    constructor() {
        super(...arguments);
        this._initAndPopStateOnly = false;
    }
    static get is() { return 'p-h-d'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([init_and_popstate_only, from_path]);
    }
    getDetail(val) {
        return {
            value: val,
            [doNotCCEventToState]: true
        };
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case init_and_popstate_only:
                this._initAndPopStateOnly = newVal !== null;
                break;
            case from_path:
                this._fromPath = newVal;
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
    get fromPath() {
        return this._fromPath;
    }
    set fromPath(nv) {
        this._fromPath = nv;
    }
    connectedCallback() {
        super.connectedCallback();
        this.propUp(['guid', 'initOnly', 'fromPath']);
        const xtalWatch = document.createElement(XtalStateWatch.is);
        xtalWatch.guid = this._guid;
        if (this._val === undefined) {
            const path = this._fromPath === undefined ? '' : '.' + this._fromPath;
            this.val = 'target.history.state' + path;
        }
        xtalWatch.addEventListener('history-changed', e => {
            const cei = e;
            if (this._initAndPopStateOnly && !cei.detail.isInitialEvent && !cei.detail.isPopstate)
                return;
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}
define(PhD);
