import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
const guid = 'guid';


export class PDX extends PD {
    static get is() { return 'p-d-x'; }
    commit(target: HTMLElement, val: any) {
        if(val === undefined) {
            super.commit(target, val);
            return;
        }
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        super.commit(target, val);    
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