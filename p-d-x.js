import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
const guid = 'guid';
export class PDX extends PD {
    static get is() { return 'p-d-x'; }
    commit(target, val) {
        if (val === undefined) {
            super.commit(target, val);
            return;
        }
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        super.commit(target, val);
    }
    get guid() {
        return this._guid;
    }
    set guid(val) {
        this.attr(guid, val);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([guid]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case guid:
                if (this._guid !== undefined)
                    return;
                this._guid = newVal;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }
}
define(PDX);
export function extend(name, params) {
    class Extension extends PDX {
        valFromEvent(e) {
            return params.valFromEvent(e);
        }
    }
    customElements.define('p-d-x-' + name, Extension);
}
