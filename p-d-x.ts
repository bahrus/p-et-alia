import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
const guid = 'guid';

/**
 * Extends element p-d with experimental features.
 * @element p-d-x
 */
export class PDX extends PD {
    static get is() { return 'p-d-x'; }
    commit(target: HTMLElement, val: any, e: Event) {
        if(val === undefined) {
            super.commit(target, val, e);
            return;
        }
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        super.commit(target, val, e);    
    }

    //TODO:  shared mixin
    protected _guid!: string;
    get guid(){
        return this._guid;
    }
    set guid(val){
        this.attr(guid, val);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([guid]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        
        switch(name){
            case guid:
                if(this._guid !== undefined) return;
                this._guid = newVal;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
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