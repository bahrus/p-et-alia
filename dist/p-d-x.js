import { PD } from './p-d.js';
//import { ICssPropMap } from './p.js';
import { define } from 'trans-render/define.js';
import { createNestedProp } from 'xtal-element/createNestedProp.js';
//const attrib_filter = 'attrib-filter';
export class PDX extends PD {
    static get is() { return 'p-d-x'; }
    commit(target, val) {
        if (val === undefined)
            return;
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        const targetPath = this.prop;
        switch (typeof targetPath) {
            case 'symbol':
                target[targetPath] = val;
                break;
            default:
                if (targetPath.startsWith('.')) {
                    const cssClass = targetPath.substr(1);
                    const method = val ? 'add' : 'remove';
                    target.classList[method](cssClass);
                }
                else if (targetPath.indexOf('.') > -1) {
                    const pathTokens = targetPath.split('.');
                    // const lastToken = pathTokens.pop();
                    createNestedProp(target, pathTokens, val, true);
                }
                else {
                    target[targetPath] = val;
                }
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
