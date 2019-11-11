import {PDX} from './p-d-x.js';
import {define} from 'trans-render/define.js';
//import {XtalStateUpdate} from 'xtal-state/xtal-state-update.js';
import {XtalStateUpdateProps} from 'xtal-state/types.d.js';
import {doNotCCEventToState} from './p-h-d.js';
const state_path = 'state-path';
const push = 'push';
const cc = 'cc';

/**
 * "planted weirwood" -- passes data down just like p-d, but also updates history.state
 * @element p-w
 */
export class PW extends PDX{
    static get is(){return 'p-w';}

    static get observedAttributes() {
        return super.observedAttributes.concat([state_path, push, cc]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        switch(name){
            case state_path:
                this._statePath = newVal;
                break;
            case cc:
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

    _cc = false;
    get cc(){
        return this._cc;
    }
    /**
     * Should carbon copy data to state
     * @attr
     */
    set cc(nv){
        this.attr(cc, nv, '');
    }

    _xtalUpdate: XtalStateUpdateProps | undefined;

    connectedCallback(){
        super.connectedCallback();
        this.propUp(['guid', 'statePath', 'push', 'cc']);
        this.addState();

    }

    _addedState = false;
    async addState(){
        if(!this._cc || this._addedState) {
            return;
        }
        this._addedState = true;
        const {XtalStateUpdate} = await import('xtal-state/xtal-state-update.js');
        const xtalUpdate = (<any>document.createElement(XtalStateUpdate.is)) as XtalStateUpdateProps;
        xtalUpdate.rewrite = !this._push;
        xtalUpdate.make = !!this._push;
        xtalUpdate.withPath = this._statePath;
        xtalUpdate.guid = this._guid;
        this.appendChild((<any>xtalUpdate) as HTMLElement);
        this._xtalUpdate = xtalUpdate;
    }

    commit(target: HTMLElement, val: any, e: CustomEventInit) {
        super.commit(target, val, e as Event);
        if((e.detail && e.detail[doNotCCEventToState])) return;
        window.requestAnimationFrame(() =>{
            if(this._xtalUpdate !== undefined) this._xtalUpdate.history = val;
        })
    }
}

define(PW);