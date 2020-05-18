import {PUnt} from './p-unt.js';
import {define, mergeProps} from 'xtal-element/xtal-latx.js';
import {XtalStateUpdateProps} from 'xtal-state/types.d.js';
import {doNotCCEventToState} from './p-h-d.js';
import { AttributeProps } from '../xtal-element/types.js';
const state_path = 'state-path';
const push = 'push';
const replace = 'replace';

/**
 * "planted weirwood" -- passes data down just like p-d, but also updates history.state
 * @element p-w
 */
export class PW extends PUnt{
    static is = 'p-w';
    static attributeProps: any = ({statePath, replace, push} : PW) => {
        const ap = {
            boolean: [replace, push],
            string: [statePath]
        } as AttributeProps
        return mergeProps(ap, (<any>PUnt).props);
    } 

    /**
     * path within history.state to deep merge data into
     * @attr state-path
     */
    statePath!: string;

    /**
     * push new stack element into history
     * @attr
     */
    push!: boolean;
        

    /**
     * Should carbon copy data to state
     * @attr
     */
    replace!: boolean;

    _xtalUpdate: XtalStateUpdateProps | undefined;

    connectedCallback(){
        super.connectedCallback();
        
        this.addState();

    }

    _addedState = false;
    _tempVal: any | undefined;
    async addState(){
        if((!this.replace && !this.push) || this._addedState) {
            return;
        }
        this._addedState = true;
        const {XtalStateUpdate} = await import('xtal-state/xtal-state-update.js');
        const xtalUpdate = (<any>document.createElement(XtalStateUpdate.is)) as XtalStateUpdateProps;
        xtalUpdate.rewrite = this.replace;
        xtalUpdate.make = this.push;
        xtalUpdate.withPath = this.statePath;
        xtalUpdate.guid = this.guid;
        this.appendChild((<any>xtalUpdate) as HTMLElement);
        this._xtalUpdate = xtalUpdate;
        if(this._tempVal !== undefined) {
            xtalUpdate.history = this._tempVal;
            delete this._tempVal;
        }
    }
    
    commit(target: HTMLElement, val: any, e: CustomEventInit) {
        super.commit(target, val, e as Event);
        if((e.detail && e.detail[doNotCCEventToState])) return;
        window.requestAnimationFrame(() =>{
            if(this._xtalUpdate !== undefined){
                this._xtalUpdate.history = val;
            }else{
                this._tempVal = val;
            }
        })
    }
}

define(PW);
declare global {
    interface HTMLElementTagNameMap {
        "p-w": PW,
    }
}