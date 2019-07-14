import { XtallatX, lispToCamel } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
const on = 'on';
const noblock = 'noblock';
const iff = 'if';
const to = 'to';
const prop = 'prop';
const val = 'val';
// getPropFromPath(val: any, path: string){
//     if(!path || path==='.') return val;
//     return this.getProp(val, path.split('.'));
// }
function getProp(val, pathTokens) {
    let context = val;
    pathTokens.forEach(token => {
        if (context) {
            switch (typeof token) {
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
export class P extends XtallatX(hydrate(HTMLElement)) {
    constructor() {
        super();
        this._s = null; // split prop using '.' as deliiter
        this._lastEvent = null;
    }
    get on() {
        return this._on;
    }
    set on(val) {
        this.attr(on, val);
    }
    get to() {
        return this._to;
    }
    set to(val) {
        this.attr(to, val);
    }
    get noblock() {
        return this._noblock;
    }
    set noblock(val) {
        this.attr(noblock, val, '');
    }
    get if() { return this._if; }
    set if(val) {
        this.attr(iff, val);
    }
    get prop() { return this._prop; }
    set prop(val) {
        switch (typeof val) {
            case 'symbol':
                this._prop = val;
                break;
            default:
                this.attr(prop, val);
        }
    }
    get val() { return this._val; }
    set val(nv) {
        this.attr(val, nv);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([on, to, noblock, iff, prop, val]);
    }
    getSplit(newVal) {
        if (newVal === '.') {
            return [];
        }
        else {
            return newVal.split('.');
        }
    }
    attributeChangedCallback(name, oldVal, newVal) {
        const f = '_' + name;
        switch (name) {
            case iff:
            case on:
            case prop:
            case val:
            case to:
                this[f] = newVal;
                break;
            case noblock:
                this[f] = newVal !== null;
                break;
        }
        if (name === val && newVal !== null) {
            this._s = this.getSplit(newVal);
        }
        super.attributeChangedCallback(name, oldVal, newVal);
    }
    /**
     * get previous sibling
     */
    getPreviousSib() {
        let pS = this;
        while (pS && pS.tagName.startsWith('P-')) {
            pS = pS.previousElementSibling;
        }
        if (pS === null)
            pS = this.parentElement;
        return pS;
    }
    connectedCallback() {
        this.style.display = 'none';
        this.propUp([on, to, noblock, iff, prop, val]);
        this.init();
    }
    init() {
        this.attchEvListnrs();
        this.doFake();
    }
    ;
    attchEvListnrs() {
        if (this._bndHndlEv) {
            return;
        }
        else {
            this._bndHndlEv = this._hndEv.bind(this);
        }
        const pS = this.getPreviousSib();
        if (!pS)
            return;
        pS.addEventListener(this._on, this._bndHndlEv);
        const da = pS.getAttribute('disabled');
        if (da !== null) {
            if (da.length === 0 || da === "1") {
                pS.removeAttribute('disabled');
            }
            else {
                pS.setAttribute('disabled', (parseInt(da) - 1).toString());
            }
        }
    }
    skI() {
        return this.hasAttribute('skip-init');
    }
    doFake() {
        if (!this._if && !this.skI()) {
            let lastEvent = this._lastEvent;
            if (!lastEvent) {
                lastEvent = {
                    target: this.getPreviousSib(),
                    isFake: true
                };
            }
            if (this._hndEv)
                this._hndEv(lastEvent);
        }
    }
    _hndEv(e) {
        if (this.hasAttribute('debug'))
            debugger;
        if (!e)
            return;
        if (e.stopPropagation && !this._noblock)
            e.stopPropagation();
        if (this._if && !e.target.matches(this._if))
            return;
        this._lastEvent = e;
        this.pass(e);
    }
    //https://stackoverflow.com/questions/476436/is-there-a-null-coalescing-operator-in-javascript
    $N(value, ifnull) {
        if (value === null || value === undefined)
            return ifnull;
        return value;
    }
    valFromEvent(e) {
        //const gpfp = getProp.bind(this);
        return this._s !== null ? getProp(e, this._s) : this.$N(getProp(e, ['detail', 'value']), getProp(e, ['target', 'value']));
    }
    setVal(e, target) {
        this.commit(target, this.valFromEvent(e));
    }
    commit(target, val) {
        if (val === undefined)
            return;
        let prop = this._prop;
        if (prop === undefined) {
            const toSplit = this.to.split('[');
            const len = toSplit.length;
            if (len > 1) {
                //TODO:  optimize (cache, etc)
                const last = toSplit[len - 1].replace(']', '');
                if (last.startsWith('-') || last.startsWith('data-')) {
                    prop = lispToCamel(last.split('-').slice(1).join('-'));
                }
            }
        }
        target[prop] = val;
    }
    detach(pS) {
        pS.removeEventListener(this._on, this._bndHndlEv);
    }
    disconnectedCallback() {
        const pS = this.getPreviousSib();
        if (pS && this._bndHndlEv)
            this.detach(pS);
    }
}
