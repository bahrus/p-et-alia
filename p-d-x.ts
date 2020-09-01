import { PD } from './p-d.js';
import {define, mergeProps} from 'xtal-element/xtal-latx.js';
import {ExtensionParams} from './types.d.js';
import {AttributeProps} from 'xtal-element/types.d.js';

const regLookup:{[key: string]: string} = {};

/**
 * Extends element p-d with experimental features.
 * @element p-d-x
 */
export class PDX extends PD {
    static is = 'p-d-x';
    static attributeProps = ({del, guid} : PDX) => ({
        bool: [del],
        str: [guid],
        reflect: [del, guid]
    });
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
    guid!: string;

    del: boolean = false;



    
    static extend(params: ExtensionParams) : string | HTMLElement{
        const nameDefined = params.name !== undefined;
        let name: string | undefined;
        const pdxPrefix = 'p-d-x-';
        if(nameDefined){
            name = pdxPrefix +  params.name;
        }else{
            const fnSig = '' + params?.valFromEvent?.toString() + params?.chkIf?.toString();
            const prevName = regLookup[fnSig];
            if(prevName !== undefined){
                name = prevName;
            }else{
                name = pdxPrefix + (new Date()).valueOf().toString();
                regLookup[fnSig] = name;
            }
        }
        if(!customElements.get(name)){
            class Extension extends PDX{
                static is = name!;
                _valBind: ((e: Event) => any) | undefined;
                _chkIf?: ((e:Event) => boolean) | undefined;
                constructor(){
                    super();
                    this._valBind = params?.valFromEvent?.bind(this);
                    this._chkIf = params?.chkIf?.bind(this);
                }
                valFromEvent(e: Event){
                    if(this._valBind !== undefined) return this._valBind(e);
                    return super.valFromEvent(e);
                }
                filterEvent(e: Event){
                    if(this._chkIf !== undefined) return this._chkIf(e);
                    return super.filterEvent(e);
                }
            }
            define(Extension);
        }

        if(params.insertAfter !== undefined){
            const newElement = document.createElement(name);
            //params.insertAfter.after(newEl); //Safari doesn't support yet
            params.insertAfter.insertAdjacentElement('afterend', newElement);
            return newElement;
        }else{
            return name;
        }
    }

}
define(PDX);

export const extend = PDX.extend;

declare global {
    interface HTMLElementTagNameMap {
        "p-d-x": PDX,
    }
}


