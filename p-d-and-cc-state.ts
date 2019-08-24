import {PDX} from './p-d-x.js';
import {define} from 'trans-render/define.js';
import {XtalStateUpdate} from 'xtal-state/xtal-state-update.js';
import {doNotCCEventToState} from './p-d-state.js';
const with_state_path = 'with-state-path';
const push = 'push';

export class PDAndCCState extends PDX{
    static get is(){return 'p-d-and-cc-state';}

    static get observedAttributes() {
        return super.observedAttributes.concat([with_state_path, push]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        switch(name){
            case with_state_path:
                this._withStatePath = newVal;
                break;
            case push:
                this._push = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }

    _withStatePath!: string;
    get withStatePath(){
        return this._withStatePath;
    }
    set withStatePath(nv){
        this.attr(with_state_path, nv);
    }

    _push = false;
    get push(){
        return this._push;
    }
    set push(nv){
        this.attr(push, nv, '');
    }

    _xtalUpdate!: XtalStateUpdate;
    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid', 'withStatePath', 'push']);
        const xtalUpdate = document.createElement(XtalStateUpdate.is) as XtalStateUpdate;
        xtalUpdate.rewrite = !this._push;
        xtalUpdate.make = !!this._push;
        xtalUpdate.withPath = this._withStatePath;
        xtalUpdate.guid = this._guid;

        this.appendChild(xtalUpdate);
        this._xtalUpdate = xtalUpdate;
    }



    commit(target: HTMLElement, val: any, e: CustomEventInit) {
        super.commit(target, val, e as Event);
        if(e.detail && e.detail[doNotCCEventToState]) return;
        window.requestAnimationFrame(() =>{
            this._xtalUpdate.history = val;
        })
    }
}

define(PDAndCCState);