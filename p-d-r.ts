import {PD} from './p-d.js';
import { define } from 'trans-render/define.js';
import {PDNavDown} from './PDNavDown.js';

/**
 * Pass data from one element down the DOM tree to other elements, including children, recursively.
 * Only drills into children if p-d-if matches css of p-d-r element.
 * @element p-d-r
 */
export class PDR extends PD{
    static is = 'p-d-r';

    static attributeProps: any = ({} : PDR) => (<any>PD).props;
        
    getMatches(pd: PDNavDown){
        return pd.getMatches();
    }
    newNavDown(){
        const bndApply = this.applyProps.bind(this);
        const pdnd = new PDNavDown(this, this.to, this.careOf, bndApply, this.m!);
        pdnd.root = this;
        return pdnd;
    }
}
define(PDR);
declare global {
    interface HTMLElementTagNameMap {
        "p-d-r": PDR,
    }
}