import { PDX } from './p-d-x.js';
import {define, mergeProps} from 'xtal-element/xtal-latx.js';
import {getHost} from 'xtal-element/getHost.js';
import { AttributeProps } from '../xtal-element/types.js';
const bubbles = 'bubbles';
const composed = 'composed';
const dispatch = 'dispatch';
const cancelable = 'cancelable';
/**
 * Dispatch event when previous non p-element triggers prescribed event
 * @element p-unt
 */
export class PUnt extends PDX {

    static is = 'p-unt';

    static attributeProps: any = ({bubbles, cancelable, composed, dispatch}: PUnt) => ({
        bool: [bubbles, cancelable, composed, dispatch],
        reflect: [bubbles, cancelable, composed, dispatch],
    })



    connectedCallback(){
        super.connectedCallback();
        this.init();
    }
    
    pass(e: Event) {
        if(this.dispatch){
            const detail = {};
            (<any>detail).target = e.target;
            this.injectVal(e, detail);
            const customEventInit = new CustomEvent(this.to, {
                bubbles: this.bubbles,
                composed: this.composed,
                cancelable: this.cancelable,
                detail: detail,
            } as CustomEventInit);
            const host = getHost(this) as any;
            if( host!== null){
                setTimeout(() => host.dispatchEvent(customEventInit));
                if(host.incAttr) host.incAttr(this.to);
            }else{
                setTimeout(() => this.dispatchEvent(customEventInit));
                this.__incAttr(this.to);
            }
        }
        super.pass(e);
        
    }

    /**
     * event should bubble up
     * @attr
     */
    bubbles!: boolean;


    /**
     * Event bubbling should pierce shadow dom
     * @attr
     */
    composed!: boolean;

    cancelable!: boolean;

    /**
     * dispatch event
     */
    dispatch!: boolean;
}
define(PUnt);

declare global {
    interface HTMLElementTagNameMap {
        "p-unt": PUnt,
    }
}