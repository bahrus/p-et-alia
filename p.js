import { XtallatX, lispToCamel } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { WithPath, with_path } from 'xtal-element/with-path.js';
const on = 'on';
const noblock = 'noblock';
const iff = 'if';
const to = 'to';
const prop = 'prop';
const val = 'val';
const care_of = 'care-of';
const fire_event = 'fire-event';
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
export class P extends WithPath(XtallatX(hydrate(HTMLElement))) {
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
    get careOf() {
        return this._careOf;
    }
    set careOf(nv) {
        this.attr(care_of, nv);
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
    get fireEvent() {
        return this._fireEvent;
    }
    set fireEvent(nv) {
        this.attr(fire_event, nv);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([on, to, noblock, iff, prop, val, care_of, with_path, fire_event]);
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
            case care_of:
            case with_path:
            case fire_event:
                const key = '_' + lispToCamel(name);
                this[key] = newVal;
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
        let prevSib = this;
        while (prevSib && prevSib.tagName.startsWith('P-')) {
            prevSib = prevSib.previousElementSibling;
        }
        if (prevSib === null) {
            prevSib = this.parentElement;
        }
        return prevSib;
    }
    connectedCallback() {
        this.style.display = 'none';
        this.propUp([on, to, noblock, iff, prop, val, 'careOf', 'withPath', 'fireEvent']);
        //this.init();
    }
    init() {
        this.attchEvListnrs();
        this.doFake();
    }
    ;
    nudge(prevSib) {
        const da = prevSib.getAttribute('disabled');
        if (da !== null) {
            if (da.length === 0 || da === "1") {
                prevSib.removeAttribute('disabled');
            }
            else {
                prevSib.setAttribute('disabled', (parseInt(da) - 1).toString());
            }
        }
    }
    attchEvListnrs() {
        if (this._bndHndlEv) {
            return;
        }
        else {
            this._bndHndlEv = this._hndEv.bind(this);
        }
        const prevSib = this.getPreviousSib();
        if (!prevSib)
            return;
        prevSib.addEventListener(this._on, this._bndHndlEv);
        if (prevSib === this.parentElement && this._if) {
            prevSib.querySelectorAll(this._if).forEach(publisher => {
                this.nudge(publisher);
            });
        }
        else {
            this.nudge(prevSib);
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
            //TODO:  optimize (cache, etc)
            const thingToSplit = this._careOf || this._to;
            const toSplit = thingToSplit.split('[');
            const len = toSplit.length;
            if (len > 1) {
                const last = toSplit[len - 1].replace(']', '');
                if (last.startsWith('-') || last.startsWith('data-')) {
                    prop = lispToCamel(last.split('-').slice(1).join('-'));
                }
            }
        }
        //const targetPath = prop;
        if (target.hasAttribute('debug'))
            debugger;
        switch (typeof prop) {
            case 'symbol':
                target[prop] = val;
                break;
            default:
                if (prop.startsWith('.')) {
                    const cssClass = prop.substr(1);
                    const method = val ? 'add' : 'remove';
                    target.classList[method](cssClass);
                }
                else if (this._withPath !== undefined) {
                    const currentVal = target[prop];
                    const wrappedVal = this.wrap(val, currentVal);
                    target[prop] = (typeof (currentVal) === 'object' && currentVal !== null) ? { ...currentVal, ...wrappedVal } : wrappedVal;
                }
                else {
                    target[prop] = val;
                }
        }
        if (this._fireEvent) {
            target.dispatchEvent(new CustomEvent(this._fireEvent, { detail: { value: val }, bubbles: true }));
        }
        //(<any>target)[prop] = val;
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
