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
    /**
     * The event name to monitor for, from previous non p-* element.
     * @attr
     */
    set on(val) {
        this.attr(on, val);
    }
    get to() {
        return this._to;
    }
    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    set to(val) {
        this.attr(to, val);
    }
    get careOf() {
        return this._careOf;
    }
    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     *
     */
    set careOf(nv) {
        this.attr(care_of, nv);
    }
    get noblock() {
        return this._noblock;
    }
    /**
     * Don't block event propagation.
     * @attr
     */
    set noblock(val) {
        this.attr(noblock, val, '');
    }
    get if() { return this._if; }
    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    set if(val) {
        this.attr(iff, val);
    }
    get prop() { return this._prop; }
    /**
     * Name of property to set on matching downstream siblings.
     * @attr
     */
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
    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    set val(nv) {
        this.attr(val, nv);
    }
    get fireEvent() {
        return this._fireEvent;
    }
    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
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
        //this._trigger = trigger;
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
        const prevSib = this._trigger === undefined ? this.getPreviousSib() : this._trigger;
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
        if (this._if && !e.target.matches(this._if))
            return;
        if (e.stopPropagation && !this._noblock)
            e.stopPropagation();
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
        let val = this._s !== null ? getProp(e, this._s) : this.$N(getProp(e, ['detail', 'value']), getProp(e, ['target', 'value']));
        if (val === undefined && (typeof (this.val) === 'string') && e.target.hasAttribute(this.val)) {
            val = e.target.getAttribute(this.val);
        }
        return val;
    }
    setVal(e, target) {
        this.commit(target, this.valFromEvent(e), e);
    }
    commit(target, valx, e) {
        if (valx === undefined)
            return;
        let prop = this._prop;
        let attr;
        if (prop === undefined) {
            //TODO:  optimize (cache, etc)
            const thingToSplit = this._careOf || this._to;
            const toSplit = thingToSplit.split('[');
            const len = toSplit.length;
            if (len > 1) {
                const last = toSplit[len - 1].replace(']', '');
                if (last.startsWith('-') || last.startsWith('data-')) {
                    attr = last.split('-').slice(1).join('-');
                    prop = lispToCamel(attr);
                }
            }
        }
        //const targetPath = prop;
        if (target.hasAttribute !== undefined && target.hasAttribute('debug'))
            debugger;
        switch (typeof prop) {
            case 'symbol':
                target[prop] = valx;
                break;
            default:
                if (prop.startsWith('.')) {
                    const cssClass = prop.substr(1);
                    const method = (valx === undefined && valx === null) ? 'remove' : 'add';
                    target.classList[method](cssClass);
                }
                else if (this._withPath !== undefined) {
                    const currentVal = target[prop];
                    const wrappedVal = this.wrap(valx, {});
                    target[prop] = (typeof (currentVal) === 'object' && currentVal !== null) ? { ...currentVal, ...wrappedVal } : wrappedVal;
                }
                else if (attr !== undefined && this.hasAttribute('set-attr')) {
                    target.setAttribute(attr, valx.toString());
                }
                else {
                    target[prop] = valx;
                }
        }
        if (this._fireEvent) {
            target.dispatchEvent(new CustomEvent(this._fireEvent, {
                detail: this.getDetail(valx),
                bubbles: true
            }));
        }
        //(<any>target)[prop] = val;
    }
    getDetail(val) {
        return { value: val };
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
