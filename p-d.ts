import { P} from './p.js';
import { define } from 'xtal-element/xtal-latx.js';
import {NavDown} from 'xtal-element/NavDown.js';
import {PDProps} from './types.js';
import {AttributeProps, PropDefGet} from 'xtal-element/types.d.js';

/**
 * Pass data from one element down the DOM tree to other elements
 * @element p-d
 *
 */
export class PD extends P implements PDProps {
    static is = 'p-d';

    static attributeProps: any = ({
            disabled, on, to, careOf, noblock, val, prop, ifTargetMatches, m, from, observe, 
            fireEvent, skipInit, debug, log, withPath, async
    } : PD) => {
        const bool =  [disabled, noblock, skipInit, debug, log, async];
        const num = [m];
        const str = [on, to, careOf, val, prop, ifTargetMatches, from, observe, fireEvent, withPath];
        const reflect = [...bool, ...num, ...str];
        return {
            bool,
            num,
            str,
            reflect
        } as AttributeProps;
    }

    _pdNavDown: NavDown | null = null;




    //_hasMax!: boolean;

    /**
     * Maximum number of matching elements expected to be found.
     * @attr
     */
    m: number | undefined;


    /**
     * Source element to start matches from
     * @attr
     */
    from: string | undefined;



    pass(e: Event) {
        this._lastEvent = e;
        this.attr('pds', '🌩️');
        const count = this.applyProps(this._pdNavDown!);
        this.attr('pds', '👂');
    }
    getMatches(pd: NavDown){
        return pd.matches;
    }
    applyProps(pd: NavDown){
        //if(this._iIP && this.skI()) return;
        if(this._iIP) return 0;
        if(this._lastEvent === null) return;
        const matches = this.getMatches(pd);
        //const matches = pd.getMatches();
        matches.forEach(el =>{
            if(pd._inMutLoop){
                if((el as HTMLElement).dataset.__pdWIP !== '1') return;
            }
            this.injectVal(this._lastEvent!, el);
        });
        const len = matches.length;
        this.attr('mtch', len.toString());
        return len;
    }

    newNavDown(){
        const bndApply = this.applyProps.bind(this);
        let seed : Element | null = this._trigger || this;
        if(this.from !== undefined){
            seed = seed.closest(this.from);
            if(seed === null){
                throw this.from + ' not found.';
            }
        }
        return new NavDown(seed, this.to, this.careOf, bndApply, this.m!);
    }
    _iIP = false;
    connectedCallback(trigger?: HTMLElement) {
        this._trigger = trigger;
        super.connectedCallback();
        this.attr('pds', '📞');
        if(!this.to){
            //apply to next only
            this.to='*';  
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
define(PD);
declare global {
    interface HTMLElementTagNameMap {
        "p-d": PD,
    }
}
