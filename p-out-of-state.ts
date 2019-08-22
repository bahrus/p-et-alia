import {PDX} from './p-d-x.js';
import {define} from 'trans-render/define.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';


export class POutOfState extends PDX{
    static get is(){return 'p-out-of-state';}


    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid']);
        const xtalWatch = document.createElement(XtalStateWatch.is) as XtalStateWatch;
        xtalWatch.guid = this._guid;
        xtalWatch.addEventListener('history-changed', e =>{
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}

define(POutOfState);