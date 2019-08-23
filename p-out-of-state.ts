import {PDX} from './p-d-x.js';
import {define} from 'trans-render/define.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';

const init_and_popstate_only ='init-and-popstate-only';

export class POutOfState extends PDX{
    static get is(){return 'p-out-of-state';}

    static get observedAttributes() {
        return super.observedAttributes.concat([init_and_popstate_only]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        switch(name){
            case init_and_popstate_only:
                this._initAndPopStateOnly = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }

    _initAndPopStateOnly = false;
    get initAndPopStateOnly(){
        return this._initAndPopStateOnly;
    }
    set initAndPopStateOnly(nv){
        this._initAndPopStateOnly = nv;
    }
    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid', 'initOnly']);
        const xtalWatch = document.createElement(XtalStateWatch.is) as XtalStateWatch;
        xtalWatch.guid = this._guid;
        xtalWatch.addEventListener('history-changed', e =>{
            const cei = e as CustomEventInit;
            if(this._initAndPopStateOnly && !cei.detail.isInitialEvent && !cei.detail.isPopstate) return;
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}

define(POutOfState);