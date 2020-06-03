import { P } from './p.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
import { AttributeProps } from '../xtal-element/types.js';
/**
 * Pass data from one element to a targeted DOM element elsewhere
 * @element p-u
 *  
 */
export class PU extends P {
    static is = 'p-u';

    static attributeProps: any = ({disabled, on, to, careOf, noblock, val, prop, ifTargetMatches,  observe, fireEvent, withPath, async} : PU) => {
        const bool = [disabled, noblock, async];
        const str = [on, to, careOf, val, prop, ifTargetMatches, observe, fireEvent, withPath];
        const reflect = [...bool, ...str];
        return {
            bool,
            str,
            reflect
        } as AttributeProps;
    }

    pass(e: Event) {
        
        const cssSel = this.to;
        const split = cssSel.split('/');
        const id = split[split.length - 1];
        let targetElement: HTMLElement;
        if (cssSel.startsWith('/')) {
            targetElement = (<any>self)[cssSel.substr(1)];
        } else {
            const len = cssSel.startsWith('./') ? 0 : split.length;
            const host = this.getHost(<any>this as HTMLElement, len) as HTMLElement;
            if (host !== undefined) {
                targetElement = host.querySelector('#' + id) as HTMLElement;
            } else {
                throw 'Target Element Not found';
            }
        }
        this.injectVal(e, targetElement);
    }

    _host!: HTMLElement
    getHost(el: HTMLElement, maxLevel: number): Node | undefined {
        let parent = el.getRootNode();
        if(maxLevel === 0) return parent;
        if((<any>parent).host) return this.getHost((<any>parent).host as HTMLElement, maxLevel - 1);
        return undefined;

    }
    connectedCallback() {
        super.connectedCallback();
        this.init();
    }


}
define(PU);

declare global {
    interface HTMLElementTagNameMap {
        "p-u": PU,
    }
}