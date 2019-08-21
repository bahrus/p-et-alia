import {PDX} from './p-d-x.js';
import {define} from 'trans-render/define.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';

const guid = 'guid';
console.log(XtalStateWatch.is);
export class PStateDown extends PDX{
    static get is(){return 'p-state-down';}
    //TODO:  shared mixin
    private _guid!: string;
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
        super.attributeChangedCallback(name, oldVal, newVal);
        switch(name){
            case guid:
                if(this._guid !== undefined) return;
                this._guid = newVal;
                break;
            
        }
    }
    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid']);
        const xtalWatch = document.createElement('xtal-state-watch') as XtalStateWatch;
        xtalWatch.guid = this._guid;
        xtalWatch.addEventListener('history-changed', e =>{
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}

define(PStateDown);