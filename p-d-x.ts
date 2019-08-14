import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';



export class PDX extends PD {
    static get is() { return 'p-d-x'; }
    commit(target: HTMLElement, val: any) {
        if(val === undefined) return;
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        super.commit(target, val);    
    }

}
define(PDX);

export interface ExtensionParams{
    valFromEvent: (e: Event) => any;
}

export function extend(name: string, params: ExtensionParams){
    class Extension extends PDX{
        valFromEvent(e: Event){
            return params.valFromEvent(e);
        }
    }
    customElements.define('p-d-x-' + name, Extension);
}