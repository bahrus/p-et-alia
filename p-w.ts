import {PUnt} from './p-unt.js';
import {define} from 'trans-render/define.js';
//import {XtalStateUpdate} from 'xtal-state/xtal-state-update.js';
import {XtalStateUpdateProps} from 'xtal-state/types.d.js';
import {doNotCCEventToState} from './p-h-d.js';
const state_path = 'state-path';
const push = 'push';
const replace = 'replace';

/**
 * "planted weirwood" -- passes data down just like p-d, but also updates history.state
 * @element p-w
 */
export class PW extends PUnt{
    static get is(){return 'p-w';}

    static get observedAttributes() {
        return super.observedAttributes.concat([state_path, push, replace]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        switch(name){
            case state_path:
                this._statePath = newVal;
                break;
            case replace:
            case push:
                (<any>this)['_' + name] = newVal !== null;
                //this._push = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }

    _statePath!: string;
    get statePath(){
        return this._statePath;
    }
    /**
     * path within history.state to deep merge data into
     * @attr state-path
     */
    set statePath(nv){
        this.attr(state_path, nv);
    }

    _push = false;
    get push(){
        return this._push;
    }
    /**
     * push new stack element into history
     * @attr
     */
    set push(nv){
        this.attr(push, nv, '');
    }

    _replace = false;
    get replace(){
        return this._replace;
    }
    /**
     * Should carbon copy data to state
     * @attr
     */
    set replace(nv){
        this.attr(replace, nv, '');
    }

    _xtalUpdate: XtalStateUpdateProps | undefined;

    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid', 'statePath', 'push', 'replace']);
        this.addState();

    }

    _addedState = false;
    _tempVal: any | undefined;
    async addState(){
        if((!this._replace && !this._push) || this._addedState) {
            return;
        }
        this._addedState = true;
        const {XtalStateUpdate} = await import('xtal-state/xtal-state-update.js');
        const xtalUpdate = (<any>document.createElement(XtalStateUpdate.is)) as XtalStateUpdateProps;
        xtalUpdate.rewrite = this._replace;
        xtalUpdate.make = this._push;
        xtalUpdate.withPath = this._statePath;
        xtalUpdate.guid = this._guid;
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