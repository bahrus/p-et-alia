import { P} from './p.js';
import { define } from 'trans-render/define.js';
import {NavDown} from 'xtal-element/NavDown.js';
import {PDProps} from './types.js';

const m = 'm';
const from = 'from';

/**
 * Pass data from one element down the DOM tree to other elements
 * @element p-d
 *
 */
export class PD extends P implements PDProps {
    static get is() { return 'p-d'; }
    _pdNavDown: NavDown | null = null;




    //_hasMax!: boolean;
    _m: number = Infinity; 
    get m() {
        return this._m;
    }
    /**
     * Maximum number of matching elements expected to be found.
     * @attr
     */
    set m(val) {
        this.attr(m, val.toString());
    }

    _from!: string;
    get from(){
        return this._from;
    }
    /**
     * Source element to start matches from
     * @attr
     */
    set from(nv){
        this.attr(from, nv);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([m, from]);
    }

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
    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        switch (name) {
            case m:
                if (newVal !== null) {
                    this._m = parseInt(newVal);
                } 
                break;
            case from:
                this._from = newVal;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
        
    }
    newNavDown(){
        const bndApply = this.applyProps.bind(this);
        let seed : Element | null = this._trigger || this;
        if(this._from !== undefined){
            seed = seed.closest(this._from);
            if(seed === null){
                throw this._from + ' not found.';
            }
        }
        return new NavDown(seed, this.to, this._careOf, bndApply, this.m);
    }
    _iIP = false;
    connectedCallback(trigger?: HTMLElement) {
        this._trigger = trigger;
        super.connectedCallback();
        this.propUp([m, from]);
        this.attr('pds', '📞');
        if(!this.to){
            //apply to next only
            this.to='*';  
            this.m = 1;
        }
        const pdnd = this.newNavDown();
        //const pdnd = new PDNavDown(this, this.to, nd => bndApply(nd), this.m);
        //pdnd.root = this;
        pdnd.ignore = 'p-d,p-d-x,p-d-r,script';
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
