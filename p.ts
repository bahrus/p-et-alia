import {XtallatX, lispToCamel} from 'xtal-element/xtal-latx.js';
import {PropAction} from 'xtal-element/types.d.js';
import {hydrate} from 'trans-render/hydrate.js';
import {createNestedProp} from 'xtal-element/createNestedProp.js';
import {WithPath, with_path} from 'xtal-element/with-path.js';
import {PProps} from './types.d.js';

function getProp(val: any, pathTokens: (string | [string, string[]])[], src: HTMLElement){
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if(context && token!=='')  {
            if(first && token==='target' && context['target'] === null){
                context = (<any>src)._trigger;
            }else{
                switch(typeof token){
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        context = context[token[0]].apply(context, token[1]);
                }
            }
            first = false;
        }
    });
    return context;
}

export abstract class P extends WithPath(XtallatX(hydrate(HTMLElement))) implements PProps{


    //* region props
    /**
     * The event name to monitor for, from previous non-petalian element.
     * @attr
     */
    on!: string;

    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    to!: string;


    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     * 
     */
    careOf!: string;

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock!: boolean;
    
    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches!: string;


    /**
     * Name of property to set on matching downstream siblings.
     * @attr
     */
    prop!: string;


    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val!: string;


    /**
    * Specifies element to latch on to, and listen for events.
    * @attr
    */
    observe!: string;


    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
    fireEvent!: string;

    /**
     * Don't raise a "fake" event when attaching to element.
     * @attr skip-init
     */
    skipInit!: boolean;

    debug!: boolean;

    log!: boolean;

    async!: boolean;
    
    _s: (string | [string, string[]])[] | null = null;  // split prop using '.' as delimiter
    getSplit(newVal: string){
        if(newVal === '.'){
            return [];
        }else{
            return newVal.split('.') as any;
        }
    }

    propActions = [
        ({val, self} : P) =>{
            if(val !== null){
                self._s = self.getSplit(val);
            }
        } 
    ] as PropAction[];


    /**
     * get previous sibling
     */
    getPreviousSib() : Element | null{
        const obs = this.observe;
        let prevSib = this as Element | null;
        while(prevSib && ( (obs!=undefined && !prevSib.matches(obs)) || prevSib.hasAttribute('on'))){
            prevSib = prevSib.previousElementSibling!;
            if(prevSib === null) {
                prevSib = this.parentElement;
            }
        }
        return prevSib;
    }


    connectedCallback(){
        this.style.display = 'none';
        super.connectedCallback();
    }

    _trigger: HTMLElement | undefined;
    init(){
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
        this._trigger = prevSib as HTMLElement;
        prevSib.addEventListener(this.on, this._bndHndlEv);
        if(prevSib === this.parentElement && this.ifTargetMatches){
            prevSib.querySelectorAll(this.ifTargetMatches).forEach(publisher =>{
                this.nudge(publisher);
            })
        }else{
            this.nudge(prevSib);
        }

    }

    doFake(){
        if(!this.ifTargetMatches && !this.skipInit){
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
    filterEvent(e: Event) : boolean{
        if(this.ifTargetMatches === undefined) return true;
        return (e.target as HTMLElement).matches(this.ifTargetMatches);
    }
    _hndEv(e: Event){
        if(this.log){
            console.log('handlingEvent', this, e);
        }
        if(this.debug) debugger;
        if(!e) return;
        if(!this.filterEvent(e)) return;
        if(e.stopPropagation && !this.noblock) e.stopPropagation();
        this._lastEvent = e;
        if(this.async){
            setTimeout(() => {
                Object.assign(e, {isFake: true, target: this.getPreviousSib()});
                this.pass(e);
            });
        }else{
            this.pass(e);
        }
        
    }
    _destIsNA!: boolean;

    valFromEvent(e: Event){
        let val = this._s !== null ? getProp(e, this._s, this) : getProp(e, ['target', 'value'], this);
        if(val === undefined && (typeof(this.val) ==='string') && (e.target as HTMLElement).hasAttribute(this.val)) {
            val = (e.target as HTMLElement).getAttribute(this.val);
        }
        return val;
    }
    injectVal(e: Event, target: any){
        this.commit(target, this.valFromEvent(e), e);
    }
    setVal(target: HTMLElement, valx: any, attr: string | undefined, prop: string | symbol){
        switch(typeof prop){
            case 'symbol':
                this.setProp(target, prop, valx);
                break;
            default:
                if (prop.startsWith('.')) {
                    const cssClass = prop.substr(1);
                    const method = (valx === undefined && valx === null) ? 'remove' : 'add';
                    target.classList[method](cssClass);
                } else if (this.withPath !== undefined){
                    const currentVal = (<any>target)[prop];
                    const wrappedVal = this.wrap(valx, {});
                    (<any>target)[prop] = (typeof(currentVal) === 'object' && currentVal !== null) ? {...currentVal, ...wrappedVal} : wrappedVal;
                } else if(attr !== undefined && this.hasAttribute('as-attr')){
                    this.setAttr(target, attr, valx);
                }else {
                    this.setProp(target, prop, valx);
                    
                }
        }
    }
    setAttr(target: HTMLElement, attr: string, valx: any){
        target.setAttribute(attr, valx.toString());
    }
    setProp(target: HTMLElement, prop: string | symbol, valx: any){
        (<any>target)[prop] = valx;
    }
    commit(target: HTMLElement, valx: any, e: Event){
        if(valx===undefined) return;
        let prop = this.prop;
        let attr: string | undefined;
        if(prop === undefined){
            //TODO:  optimize (cache, etc)
            const thingToSplit = this.careOf || this.to;
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
        if(target.hasAttribute !== undefined && target.hasAttribute('debug')) debugger;
        this.setVal(target, valx, attr, prop);
        if(this.fireEvent){
            target.dispatchEvent(new CustomEvent(this.fireEvent, { 
                detail: this.getDetail(valx),
                bubbles: true
            }));
        }

    }
    getDetail(val: any){
        return {value: val};
    }

    detach(pS: Element){
        pS.removeEventListener(this.on, this._bndHndlEv);
    }
    disconnectedCallback(){
        const pS = this.getPreviousSib();
        if(pS && this._bndHndlEv) this.detach(pS);
    }


}