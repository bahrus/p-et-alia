import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
import { PDNavDown } from './PDNavDown.js';
/**
 * Pass data from one element down the DOM tree to other elements, including children, recursively.
 * Only drills into children if p-d-if matches css of p-d-r element.
 * @element p-d-r
 */
export class PDR extends PD {
    getMatches(pd) {
        return pd.getMatches();
    }
    newNavDown() {
        const bndApply = this.applyProps.bind(this);
        const pdnd = new PDNavDown(this, this.to, this.careOf, bndApply, this.m);
        pdnd.root = this;
        return pdnd;
    }
}
PDR.is = 'p-d-r';
PDR.attributeProps = ({}) => PD.props;
define(PDR);
