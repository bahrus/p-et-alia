import { PDX } from './p-d-x.js';
import {define} from 'trans-render/define.js';
import {getHost} from 'xtal-element/getHost.js';
const bubbles = 'bubbles';
const composed = 'composed';
const dispatch = 'dispatch';
const cancelable = 'cancelable';
/**
 * Dispatch event when previous non p-element triggers prescribed event
 * @element p-unt
 */
export class PUnt extends PDX {
    static get is() { return 'p-unt'; }

    static get observedAttributes() {
        return super.observedAttributes.concat([bubbles, composed, dispatch, cancelable]);
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        switch (name) {
            case bubbles:
            case composed:
            case dispatch:
            case cancelable:
                (<any>this)['_' + name] = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
        
    }

    connectedCallback(){
        this.propUp([bubbles, composed, dispatch, cancelable]);
        super.connectedCallback();
        this.init();
    }
    
    pass(e: Event) {
        if(this._dispatch){
            const detail = {};
            (<any>detail).target = e.target;
            this.injectVal(e, detail);
            const customEventInit = new CustomEvent(this.to, {
                bubbles: this._bubbles,
                composed: this._composed,
                cancelable: this._cancelable,
                detail: detail,
            } as CustomEventInit);
            const host = getHost(this) as any;
            if( host!== null){
                host.dispatchEvent(customEventInit);
                if(host.incAttr) host.incAttr(this.to);
            }else{
                this.dispatchEvent(customEventInit);
                this.incAttr(this.to);
            }
        }
        super.pass(e);
        
    }
    _bubbles!: boolean;
    get bubbles() {
        return this._bubbles;
    }
    /**
     * event should bubble up
     * @attr
     */
    set bubbles(val) {
        this.attr(bubbles, val, '');
    }
    _composed!: boolean;
    get composed() {
        return this._composed;
    }
    /**
     * Event bubbling should pierce shadow dom
     * @attr
     */
    set composed(val) {
        this.attr(composed, val, '')
    }
    _cancelable!: boolean;
    get cancelable(){
        return this._cancelable
    }
    set cancelable(val){
        this.attr(cancelable, val, '');
    }
    /**
     * Allow preventDefault
     * @attr
     */
    _dispatch!: boolean;
    get dispatch() {
        return this._dispatch;
    }
    /**
     * dispatch event
     */
    set dispatch(val) {
        this.attr(dispatch, val, '');
    }
}
define(PUnt);

declare global {
    interface HTMLElementTagNameMap {
        "p-unt": PUnt,
    }
}