import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
export class PDX extends PD {
    static get is() { return 'p-d-x'; }
    commit(target, val) {
        if (val === undefined)
            return;
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        super.commit(target, val);
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
