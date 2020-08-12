import { P } from './p.js';
import { define } from 'xtal-element/xtal-latx.js';
import { NavDown } from 'xtal-element/NavDown.js';
/**
 * Pass data from one element down the DOM tree to other elements
 * @element p-d
 *
 */
export class PD extends P {
    constructor() {
        super(...arguments);
        this._pdNavDown = null;
        this._iIP = false;
    }
    pass(e) {
        this._lastEvent = e;
        this.attr('pds', '🌩️');
        const count = this.applyProps(this._pdNavDown);
        this.attr('pds', '👂');
    }
    getMatches(pd) {
        return pd.matches;
    }
    applyProps(pd) {
        //if(this._iIP && this.skI()) return;
        if (this._iIP)
            return 0;
        if (this._lastEvent === null)
            return;
        const matches = this.getMatches(pd);
        //const matches = pd.getMatches();
        matches.forEach(el => {
            if (pd._inMutLoop) {
                if (el.dataset.__pdWIP !== '1')
                    return;
            }
            this.injectVal(this._lastEvent, el);
        });
        const len = matches.length;
        this.attr('mtch', len.toString());
        return len;
    }
    newNavDown() {
        const bndApply = this.applyProps.bind(this);
        let seed = this._trigger || this;
        if (this.from !== undefined) {
            seed = seed.closest(this.from);
            if (seed === null) {
                throw this.from + ' not found.';
            }
        }
        return new NavDown(seed, this.to, this.careOf, bndApply, this.m);
    }
    connectedCallback(trigger) {
        this._trigger = trigger;
        super.connectedCallback();
        this.attr('pds', '📞');
        if (!this.to) {
            //apply to next only
            this.to = '*';
            this.m = 1;
        }
        const pdnd = this.newNavDown();
        //const pdnd = new PDNavDown(this, this.to, nd => bndApply(nd), this.m);
        //pdnd.root = this;
        this._iIP = true;
        pdnd.init();
        this._iIP = false;
        this._pdNavDown = pdnd;
        this.init();
    }
}
PD.is = 'p-d';
PD.attributeProps = ({ disabled, on, to, careOf, noblock, val, prop, ifTargetMatches, m, from, observe, fireEvent, skipInit, debug, log, withPath, async, propFromEvent, capture }) => {
    const bool = [disabled, noblock, skipInit, debug, log, async, capture];
    const num = [m];
    const str = [on, to, careOf, val, prop, ifTargetMatches, from, observe, fireEvent, withPath, propFromEvent];
    const reflect = [...bool, ...num, ...str];
    return {
        bool,
        num,
        str,
        reflect
    };
};
define(PD);
