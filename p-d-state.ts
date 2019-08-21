import {PDX} from './p-d-x.js';
import {define} from 'trans-render/define.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';

const guid = 'guid';

export class PDState extends PDX{
    static get is(){return 'p-d-state';}
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
    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid']);
        const xtalWatch = document.createElement('xtal-state-watch') as XtalStateWatch;
        xtalWatch.addEventListener('history-changed', e =>{
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}

define(PDState);