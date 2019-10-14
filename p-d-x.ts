import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
import {ExtensionParams} from './types.js';
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

    static extend(params: ExtensionParams) : string | HTMLElement{
        class Extension extends PDX{
            valFromEvent(e: Event){
                return params.valFromEvent(e);
            }
        }
        const name = 'p-d-x-' +  (params.name ? params.name : (new Date()).valueOf().toString());
        customElements.define('p-d-x-' + name, Extension);
        if(params.insertAfter !== undefined){
            const newEl = document.createElement(name);
            params.insertAfter.after(newEl);
            return newEl;
        }else{
            return name;
        }
    }

}
define(PDX);

export const extend = PDX.extend;


