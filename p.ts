import {XtallatX, lispToCamel} from 'xtal-element/xtal-latx.js';
import {hydrate} from 'trans-render/hydrate.js';

const on = 'on';
const noblock = 'noblock';
const iff = 'if';
const to = 'to';
const prop ='prop';
const val = 'val';
const care_of = 'care-of';

// getPropFromPath(val: any, path: string){
//     if(!path || path==='.') return val;
//     return this.getProp(val, path.split('.'));
// }
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

export abstract class P extends XtallatX(hydrate(HTMLElement)){
    constructor(){
        super();
        
    }
    //* region props
    _on!: string;
    get on(){
        return this._on;
    }
    set on(val){
        this.attr(on, val)
    }
    _to!: string;
    get to(){
        return this._to;
    }
    set to(val){
        this.attr(to, val);
    }

    _careOf!: string;
    get careOf(){
        return this._careOf;
    }
    set careOf(nv){
        this.attr(care_of, nv);
    }

    _noblock!: boolean;
    get noblock(){
        return this._noblock;
    }
    set noblock(val){
        this.attr(noblock, val, '')
    }
    
    _if!: string;
    get if(){return this._if;}
    set if(val){
        this.attr(iff, val);
    }

    _prop!: string | symbol;
    get prop(){return this._prop;}
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
    set val(nv){
        this.attr(val, nv);
    }
    
    static get observedAttributes(){
        return (<any>super.observedAttributes).concat([on, to, noblock, iff, prop, val, care_of]);
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
                this._careOf = newVal;
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
        this.propUp([on, to, noblock, iff, prop, val, 'careOf']);
        //this.init();
    }
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
        const prevSib = this.getPreviousSib();
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
        if(e.stopPropagation && !this._noblock) e.stopPropagation();
        if(this._if && !(e.target as HTMLElement).matches(this._if)) return;
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
        this.commit(target, this.valFromEvent(e));
    }
    commit(target: HTMLElement, val: any){
        if(val===undefined) return;
        let prop = this._prop;
        if(prop === undefined){
            //TODO:  optimize (cache, etc)
            const thingToSplit = this._careOf || this._to;
            const toSplit = thingToSplit.split('[');
            const len = toSplit.length;
            if(len > 1){
                
                const last = toSplit[len - 1].replace(']', '');
                if(last.startsWith('-') || last.startsWith('data-')){
                    prop = lispToCamel( last.split('-').slice(1).join('-'));
                }
            }
        }
        (<any>target)[prop] = val;
    }

    detach(pS: Element){
        pS.removeEventListener(this._on, this._bndHndlEv);
    }
    disconnectedCallback(){
        const pS = this.getPreviousSib();
        if(pS && this._bndHndlEv) this.detach(pS);
    }
}