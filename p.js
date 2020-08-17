import { XtallatX, lispToCamel } from 'xtal-element/xtal-latx.js';
import { hydrate } from 'trans-render/hydrate.js';
import { WithPath } from 'xtal-element/with-path.js';
function getProp(val, pathTokens, src) {
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if (context && token !== '') {
            if (first && token === 'target' && context['target'] === null) {
                context = src._trigger;
            }
            else {
                switch (typeof token) {
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
export class P extends WithPath(XtallatX(hydrate(HTMLElement))) {
    constructor() {
        super(...arguments);
        this._s = null; // split prop using '.' as delimiter
        this.propActions = [
            ({ val, self }) => {
                if (val !== null) {
                    self._s = self.getSplit(val);
                }
            }
        ];
        this._lastEvent = null;
    }
    getSplit(newVal) {
        if (newVal === '.') {
            return [];
        }
        else {
            return newVal.split('.');
        }
    }
    /**
     * get previous sibling
     */
    getPreviousSib() {
        const obs = this.observe;
        let prevSib = this;
        while (prevSib && ((obs != undefined && !prevSib.matches(obs)) || prevSib.hasAttribute('on'))) {
            prevSib = prevSib.previousElementSibling;
            if (prevSib === null) {
                prevSib = this.parentElement;
            }
        }
        return prevSib;
    }
    connectedCallback() {
        this.style.display = 'none';
        super.connectedCallback();
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
        const prevSib = this._trigger === undefined ? this.getPreviousSib() : this._trigger;
        if (!prevSib)
            return;
        this._trigger = prevSib;
        prevSib.addEventListener(this.on, this._bndHndlEv, { capture: this.capture });
        if (prevSib === this.parentElement && this.ifTargetMatches) {
            prevSib.querySelectorAll(this.ifTargetMatches).forEach(publisher => {
                this.nudge(publisher);
            });
        }
        else {
            this.nudge(prevSib);
        }
    }
    doFake() {
        if (!this.ifTargetMatches && !this.skipInit) {
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
    filterEvent(e) {
        if (this.ifTargetMatches === undefined)
            return true;
        return e.target.matches(this.ifTargetMatches);
    }
    _hndEv(e) {
        if (this.log) {
            console.log('handlingEvent', this, e);
        }
        if (this.debug)
            debugger;
        if (!e)
            return;
        if (!this.filterEvent(e))
            return;
        if (e.stopPropagation && !this.noblock)
            e.stopPropagation();
        this._lastEvent = e;
        if (this.async) {
            setTimeout(() => {
                Object.assign(e, { isFake: true, target: this.getPreviousSib() });
                this.pass(e);
            });
        }
        else {
            this.pass(e);
        }
    }
    valFromEvent(e) {
        let val = this._s !== null ? getProp(e, this._s, this) : getProp(e, ['target', 'value'], this);
        if (val === undefined && (typeof (this.val) === 'string') && e.target.hasAttribute(this.val)) {
            val = e.target.getAttribute(this.val);
        }
        switch (this.parseValAs) {
            case 'bool':
                val = val === 'true';
                break;
            case 'int':
                val = parseInt(val);
                break;
            case 'float':
                val = parseFloat(val);
                break;
            case 'date':
                val = new Date(val);
                break;
            case 'truthy':
                val = !!val;
                break;
            case 'falsy':
                val = !val;
                break;
        }
        return val;
    }
    injectVal(e, target) {
        this.commit(target, this.valFromEvent(e), e);
    }
    setVal(target, valx, attr, prop) {
        switch (typeof prop) {
            case 'symbol':
                this.setProp(target, prop, valx);
                break;
            default:
                if (prop.startsWith('.')) {
                    const cssClass = prop.substr(1);
                    const method = (valx === undefined && valx === null) ? 'remove' : 'add';
                    target.classList[method](cssClass);
                }
                else if (this.withPath !== undefined) {
                    const currentVal = target[prop];
                    const wrappedVal = this.wrap(valx, {});
                    target[prop] = (typeof (currentVal) === 'object' && currentVal !== null) ? { ...currentVal, ...wrappedVal } : wrappedVal;
                }
                else if (attr !== undefined && this.hasAttribute('as-attr')) {
                    this.setAttr(target, attr, valx);
                }
                else {
                    this.setProp(target, prop, valx);
                }
        }
    }
    setAttr(target, attr, valx) {
        target.setAttribute(attr, valx.toString());
    }
    setProp(target, prop, valx) {
        target[prop] = valx;
    }
    commit(target, valx, e) {
        if (valx === undefined)
            return;
        let prop = this.prop;
        let attr;
        if (prop === undefined) {
            //TODO:  optimize (cache, etc)
            if (this.propFromEvent !== undefined) {
                prop = getProp(e, this.propFromEvent.split('.'), target);
            }
            else {
                const thingToSplit = this.careOf || this.to;
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
        }
        if (target.hasAttribute !== undefined && target.hasAttribute('debug'))
            debugger;
        this.setVal(target, valx, attr, prop);
        if (this.fireEvent) {
            target.dispatchEvent(new CustomEvent(this.fireEvent, {
                detail: this.getDetail(valx),
                bubbles: true
            }));
        }
    }
    getDetail(val) {
        return { value: val };
    }
    detach(pS) {
        pS.removeEventListener(this.on, this._bndHndlEv);
    }
    disconnectedCallback() {
        const pS = this.getPreviousSib();
        if (pS && this._bndHndlEv)
            this.detach(pS);
    }
}
