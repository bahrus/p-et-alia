import {PDX} from './p-d-x.js';
import {define, mergeProps} from 'xtal-element/xtal-latx.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';
import { AttributeProps } from '../xtal-element/types.js';

export const doNotCCEventToState = 'dncc';
/**
 * Pass history to downstream elements
 * @element p-h-d
 */
export class PhD extends PDX{
    static  is = 'p-h-d';

    static attributeProps: any = ({initAndPopStateOnly, fromPath} : PhD) => {
        const ap = {
            bool: [initAndPopStateOnly],
            str: [fromPath],
            reflect: [fromPath, initAndPopStateOnly]
        } as AttributeProps
        return mergeProps(ap, (<any>PDX).props);
    } 

    getDetail(val: any){
        return {
            value: val,
            [doNotCCEventToState]: true
        };
    }

    /**
     * Only pass down history if is initial history and/or popstate event
     * @attr init-and-pop-state-only
     */
    initAndPopStateOnly!: boolean;


    /**
     * JS path within history.state to pass down.
     * @attr from-path
     */
    fromPath!: string

    connectedCallback(){
        super.connectedCallback();
        const xtalWatch = document.createElement(XtalStateWatch.is) as XtalStateWatch;
        xtalWatch.guid = this.guid;
        if(this.val === undefined){
            const path = this.fromPath === undefined ? '' : '.' + this.fromPath; 
            this.val = 'target.history.state' + path;
        }
        xtalWatch.addEventListener('history-changed', e =>{
            const cei = e as CustomEventInit;
            if(this.initAndPopStateOnly && !cei.detail.isInitialEvent && !cei.detail.isPopstate) return;
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}

define(PhD);
declare global {
    interface HTMLElementTagNameMap {
        "p-h-d": PhD,
    }
}