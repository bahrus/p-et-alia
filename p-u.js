import { P } from './p.js';
import { define } from 'xtal-element/xtal-latx.js';
/**
 * Pass data from one element to a targeted DOM element elsewhere
 * @element p-u
 *
 */
export class PU extends P {
    pass(e) {
        const cssSel = this.to;
        const split = cssSel.split('/');
        const id = split[split.length - 1];
        let targetElement;
        if (cssSel.startsWith('/')) {
            targetElement = self[cssSel.substr(1)];
        }
        else {
            const len = cssSel.startsWith('./') ? 0 : split.length;
            const host = this.getHost(this, len);
            if (host !== undefined) {
                targetElement = host.querySelector('#' + id);
            }
            else {
                throw 'Target Element Not found';
            }
        }
        this.injectVal(e, targetElement);
    }
    getHost(el, maxLevel) {
        let parent = el.getRootNode();
        if (maxLevel === 0)
            return parent;
        if (parent.host)
            return this.getHost(parent.host, maxLevel - 1);
        return undefined;
    }
    connectedCallback() {
        super.connectedCallback();
        this.init();
    }
}
PU.is = 'p-u';
PU.attributeProps = ({ disabled, on, to, careOf, noblock, val, prop, ifTargetMatches, observe, fireEvent }) => {
    const bool = [disabled, noblock];
    const str = [on, to, careOf, val, prop, ifTargetMatches, observe, fireEvent];
    const refl = [...bool, ...str];
    return {
        boolean: bool,
        string: str,
        reflect: refl
    };
};
define(PU);
