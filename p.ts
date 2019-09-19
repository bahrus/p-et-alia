import {XtallatX, lispToCamel} from 'xtal-element/xtal-latx.js';
import {hydrate} from 'trans-render/hydrate.js';
import {createNestedProp} from 'xtal-element/createNestedProp.js';
import {WithPath, with_path} from 'xtal-element/with-path.js';
import {PProps} from './types.d.js';

const on = 'on';
const noblock = 'noblock';
const iff = 'if';
const to = 'to';
const prop ='prop';
const val = 'val';
const care_of = 'care-of';
const fire_event = 'fire-event';


function getProp(val: any, pathTokens: (string | [string, string[]])[]){
    let context = val;
    pathTokens.forEach(token => {
        if(context)  {
            switch(typeof token){
                case 'string':
                    context = context[token];
                    break;
                default:
                    context = context[token[0]].apply(context, token[1]);
            }
        }
    });
    return context;
}

export abstract class P extends WithPath(XtallatX(hydrate(HTMLElement))) implements PProps{
    constructor(){
        super();
        
    }
    //* region props
    _on!: string;
    get on(){
        return this._on;
    }
    /**
     * The event name to monitor for, from previous non p-* element.
     * @attr
     */
    set on(val){
        this.attr(on, val)
    }
    _to!: string;
    get to(){
        return this._to;
    }
    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    set to(val){
        this.attr(to, val);
    }

    _careOf!: string;

    get careOf(){
        return this._careOf;
    }
    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     * 
     */
    set careOf(nv){
        this.attr(care_of, nv);
    }

    _noblock!: boolean;
    get noblock(){
        return this._noblock;
    }
    /**
     * Don't block event propagation.
     * @attr
     */
    set noblock(val){
        this.attr(noblock, val, '')
    }
    
    _if!: string;
    get if(){return this._if;}
    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    set if(val){
        this.attr(iff, val);
    }

    _prop!: string | symbol;
    get prop(){return this._prop;}
    /**
     * Name of property to set on matching downstream siblings.
     * @attr
     */
    set prop(val){
        switch(typeof val){
            case 'symbol':
                this._prop = val;
                break;
            default:
                this.attr(prop, val);
        }
        
    }

    _val!: string;
    get val(){return this._val;}
    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    set val(nv){
        this.attr(val, nv);
    }

    _fireEvent!: string;
    get fireEvent(){
        return this._fireEvent;
    }
    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
    set fireEvent(nv){
        this.attr(fire_event, nv);
    }
    
    static get observedAttributes(){
        return (<any>super.observedAttributes).concat([on, to, noblock, iff, prop, val, care_of, with_path, fire_event]);
    }
    _s: (string | [string, string[]])[] | null = null;  // split prop using '.' as deliiter
    getSplit(newVal: string){
        if(newVal === '.'){
            return [];
        }else{
            return newVal.split('.') as any;
        }
    }
    attributeChangedCallback(name: string, oldVal: string, newVal: string){
        const f = '_' + name;
        switch(name){
            case iff:
            case on:
            case prop:
            case val:
            case to:
                (<any>this)[f] = newVal;
                break;
            case noblock:
                (<any>this)[f] = newVal !== null;
                break;
            case care_of:
            case with_path:
            case fire_event:
                const key = '_' + lispToCamel(name);
                (<any>this)[key] = newVal;
                break;
        }
        if(name === val && newVal !== null){
            this._s = this.getSplit(newVal);
        }
        super.attributeChangedCallback(name, oldVal, newVal);
    }
    /**
     * get previous sibling
     */
    getPreviousSib() : Element | null{
        let prevSib = this as Element | null;
        while(prevSib && prevSib.tagName.startsWith('P-')){
            prevSib = prevSib.previousElementSibling!;
        }
        if(prevSib === null) {
            prevSib = this.parentElement;
        }
        return prevSib;
    }


    connectedCallback(){
        this.style.display = 'none';
        this.propUp([on, to, noblock, iff, prop, val, 'careOf', 'withPath', 'fireEvent']);
        //this.init();
    }
    _trigger: HTMLElement | undefined;
    init(){
        //this._trigger = trigger;
        this.attchEvListnrs();
        this.doFake();
    };
    nudge(prevSib: Element){
        const da = prevSib.getAttribute('disabled');
        if(da !== null){
            if(da.length === 0 ||da==="1"){
                prevSib.removeAttribute('disabled');
            }else{
                prevSib.setAttribute('disabled', (parseInt(da) - 1).toString());
            }
        }
    }
    attchEvListnrs(){
        if(this._bndHndlEv){
            return;
        }else{
            this._bndHndlEv = this._hndEv.bind(this);
        }
        const prevSib = this._trigger === undefined ? this.getPreviousSib() : this._trigger;
        if(!prevSib) return;
        prevSib.addEventListener(this._on, this._bndHndlEv);
        if(prevSib === this.parentElement && this._if){
            prevSib.querySelectorAll(this._if).forEach(publisher =>{
                this.nudge(publisher);
            })
        }else{
            this.nudge(prevSib);
        }

    }
    skI(){
        return this.hasAttribute('skip-init')
    }
    doFake(){
        if(!this._if && !this.skI()){
            let lastEvent = this._lastEvent;
            if(!lastEvent){
                lastEvent = <any>{
                    target: this.getPreviousSib(),
                    isFake: true
                } as Event;
            }
            if(this._hndEv) this._hndEv(lastEvent);
        }        

    }

    _bndHndlEv!: any;
    abstract pass(e: Event) : void;
    _lastEvent: Event | null = null;
    _hndEv(e: Event){
        if(this.hasAttribute('debug')) debugger;
        if(!e) return;
        if(this._if && !(e.target as HTMLElement).matches(this._if)) return;
        if(e.stopPropagation && !this._noblock) e.stopPropagation();
        this._lastEvent = e;
        this.pass(e);
    }
    _destIsNA!: boolean;
    //https://stackoverflow.com/questions/476436/is-there-a-null-coalescing-operator-in-javascript
    $N(value: any, ifnull: any) {
        if (value === null || value === undefined)
          return ifnull;
        return value;
     }
    valFromEvent(e: Event){
        //const gpfp = getProp.bind(this);
        return this._s !== null ? getProp(e, this._s) : this.$N(getProp(e, ['detail', 'value']), getProp(e, ['target', 'value']));
    }
    setVal(e: Event, target: any){
        this.commit(target, this.valFromEvent(e), e);
    }
    commit(target: HTMLElement, valx: any, e: Event){
        if(valx===undefined) return;
        let prop = this._prop;
        let attr: string | undefined;
        if(prop === undefined){
            //TODO:  optimize (cache, etc)
            const thingToSplit = this._careOf || this._to;
            const toSplit = thingToSplit.split('[');
            const len = toSplit.length;
            if(len > 1){
                
                const last = toSplit[len - 1].replace(']', '');
                if(last.startsWith('-') || last.startsWith('data-')){
                    attr = last.split('-').slice(1).join('-');
                    prop = lispToCamel(attr);
                }
            }
        }
        //const targetPath = prop;
        if(target.hasAttribute !== undefined && target.hasAttribute('debug')) debugger;

        switch(typeof prop){
            case 'symbol':
                (<any>target)[prop] = valx;
                break;
            default:
                if (prop.startsWith('.')) {
                    const cssClass = prop.substr(1);
                    const method = (valx === undefined && valx === null) ? 'remove' : 'add';
                    target.classList[method](cssClass);
                } else if (this._withPath !== undefined){
                    const currentVal = (<any>target)[prop];
                    const wrappedVal = this.wrap(valx, {});
                    (<any>target)[prop] = (typeof(currentVal) === 'object' && currentVal !== null) ? {...currentVal, ...wrappedVal} : wrappedVal;
                } else if(attr !== undefined && this.hasAttribute('set-attr')){
                    target.setAttribute(attr, valx.toString());
                }else {
                    (<any>target)[prop] = valx;
                }
        }
        if(this._fireEvent){
            target.dispatchEvent(new CustomEvent(this._fireEvent, { 
                detail: this.getDetail(valx),
                bubbles: true
            }));
        }

        //(<any>target)[prop] = val;
    }
    getDetail(val: any){
        return {value: val};
    }

    detach(pS: Element){
        pS.removeEventListener(this._on, this._bndHndlEv);
    }
    disconnectedCallback(){
        const pS = this.getPreviousSib();
        if(pS && this._bndHndlEv) this.detach(pS);
    }
}