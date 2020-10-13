const debounce = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};

/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    var _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                /**
                 * Tracks how many times each event type was called.
                 */
                this.__evCount = {};
                /**
                 * @private
                 */
                this.self = this;
                this._xlConnected = false;
                this.__propActionQueue = new Set();
            }
            /**
             * @private
             */
            static get evalPath() {
                return lispToCamel(this.is);
            }
            /**
             * @private
             */
            static get observedAttributes() {
                const props = this.props;
                return [...props.bool, ...props.num, ...props.str, ...props.jsonProp].map(s => camelToLisp(s));
            }
            static get props() {
                if (this.is === undefined)
                    return {};
                if (this[this.evalPath] === undefined) {
                    const args = deconstruct(this.attributeProps);
                    const arg = {};
                    args.forEach(token => {
                        arg[token] = token;
                    });
                    this[this.evalPath] = this.attributeProps(arg);
                    const ep = this[this.evalPath];
                    propCategories.forEach(propCat => {
                        ep[propCat] = ep[propCat] || [];
                    });
                }
                let props = this[this.evalPath];
                const superProps = Object.getPrototypeOf(this).props;
                if (superProps !== undefined)
                    props = mergeProps(props, superProps);
                return props;
            }
            /**
             * Turn number into string with even and odd values easy to query via css.
             * @param n
             */
            __to$(n) {
                const mod = n % 2;
                return (n - mod) / 2 + '-' + mod;
            }
            /**
             * Increment event count
             * @param name
             */
            __incAttr(name) {
                const ec = this.__evCount;
                if (name in ec) {
                    ec[name]++;
                }
                else {
                    ec[name] = 0;
                }
                this.attr('data-' + name, this.__to$(ec[name]));
            }
            onPropsChange(name) {
                let isAsync = false;
                const propInfoLookup = this.constructor[propInfoSym];
                if (Array.isArray(name)) {
                    name.forEach(subName => {
                        this.__propActionQueue.add(subName);
                        const propInfo = propInfoLookup[subName];
                        if (propInfo !== undefined && propInfo.async)
                            isAsync = true;
                    });
                }
                else {
                    this.__propActionQueue.add(name);
                    const propInfo = propInfoLookup[name];
                    if (propInfo !== undefined && propInfo.async)
                        isAsync = true;
                }
                if (this.disabled || !this._xlConnected) {
                    return;
                }
                if (!this.disabled) {
                    if (isAsync) {
                        this.__processActionDebouncer();
                    }
                    else {
                        this.__processActionQueue();
                    }
                }
            }
            attributeChangedCallback(n, ov, nv) {
                this[atrInit] = true; // track each attribute?
                const ik = this[ignoreAttrKey];
                if (ik !== undefined && ik[n] === true) {
                    delete ik[n];
                    return;
                }
                const propName = lispToCamel(n);
                const privatePropName = '_' + propName;
                //TODO:  Do we need this?
                // if((<any>this)[ignorePropKey] === undefined) (<any>this)[ignorePropKey] = {};
                // (<any>this)[ignorePropKey][propName] = true;
                const anyT = this;
                const ep = this.constructor.props;
                if (ep.str.includes(propName)) {
                    anyT[privatePropName] = nv;
                }
                else if (ep.bool.includes(propName)) {
                    anyT[privatePropName] = nv !== null;
                }
                else if (ep.num.includes(propName)) {
                    anyT[privatePropName] = parseFloat(nv);
                }
                else if (ep.jsonProp.includes(propName)) {
                    try {
                        anyT[privatePropName] = JSON.parse(nv);
                    }
                    catch (e) {
                        anyT[privatePropName] = nv;
                    }
                }
                this.onPropsChange(propName);
            }
            connectedCallback() {
                super.connectedCallback();
                this._xlConnected = true;
                this.__processActionDebouncer();
                this.onPropsChange('');
            }
            /**
             * Dispatch Custom Event
             * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
             * @param detail Information to be passed with the event
             * @param asIs If true, don't append event name with '-changed'
             * @private
             */
            [de](name, detail, asIs = false) {
                if (this.disabled)
                    return;
                const eventName = name + (asIs ? '' : '-changed');
                let bubbles = false;
                let composed = false;
                let cancelable = false;
                if (this.eventScopes !== undefined) {
                    const eventScope = this.eventScopes.find(x => (x[0] === undefined) || x[0].startsWith(eventName));
                    if (eventScope !== undefined) {
                        bubbles = eventScope[1] === 'bubbles';
                        cancelable = eventScope[2] === 'cancelable';
                        composed = eventScope[3] === 'composed';
                    }
                }
                const newEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: bubbles,
                    composed: composed,
                    cancelable: cancelable,
                });
                this.dispatchEvent(newEvent);
                this.__incAttr(eventName);
                return newEvent;
            }
            get __processActionDebouncer() {
                if (this.___processActionDebouncer === undefined) {
                    this.___processActionDebouncer = debounce((getNew = false) => {
                        this.__processActionQueue();
                    }, 16);
                }
                return this.___processActionDebouncer;
            }
            __processActionQueue() {
                if (this.propActions === undefined)
                    return;
                const queue = this.__propActionQueue;
                this.__propActionQueue = new Set();
                this.propActions.forEach(propAction => {
                    const dependencies = deconstruct(propAction);
                    const dependencySet = new Set(dependencies);
                    if (intersection(queue, dependencySet).size > 0) {
                        propAction(this);
                    }
                });
            }
        },
        /**
         * @private
         * @param param0
         */
        _a.attributeProps = ({ disabled }) => ({
            bool: [disabled],
        }),
        _a;
}
//utility fns
//const ignorePropKey = Symbol();
const ignoreAttrKey = Symbol();
const propInfoSym = Symbol('propInfo');
const atrInit = Symbol('atrInit');
function define(MyElementClass) {
    const tagName = MyElementClass.is;
    let n = 0;
    let foundIt = false;
    let isNew = false;
    let name = tagName;
    do {
        if (n > 0)
            name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if (test !== undefined) {
            if (test === MyElementClass) {
                foundIt = true; //all good;
                MyElementClass.isReally = name;
            }
        }
        else {
            isNew = true;
            MyElementClass.isReally = name;
            foundIt = true;
        }
        n++;
    } while (!foundIt);
    if (!isNew)
        return;
    const props = MyElementClass.props;
    const proto = MyElementClass.prototype;
    const flatProps = [...props.bool, ...props.num, ...props.str, ...props.obj];
    const existingProps = Object.getOwnPropertyNames(proto);
    MyElementClass[propInfoSym] = {};
    flatProps.forEach(prop => {
        if (existingProps.includes(prop))
            return;
        const privateKey = '_' + prop;
        const propInfo = {};
        propCategories.forEach(cat => {
            propInfo[cat] = props[cat].includes(prop);
        });
        MyElementClass[propInfoSym][prop] = propInfo;
        //TODO:  make this a bound function?
        Object.defineProperty(proto, prop, {
            get() {
                return this[privateKey];
            },
            set(nv) {
                const propInfo = MyElementClass[propInfoSym][prop];
                if (propInfo.dry) {
                    if (nv === this[privateKey])
                        return;
                }
                const c2l = camelToLisp(prop);
                if (propInfo.reflect) {
                    //experimental line -- we want the attribute to take precedence over default value.
                    if (this[atrInit] === undefined && this.hasAttribute(c2l))
                        return;
                    if (this[ignoreAttrKey] === undefined)
                        this[ignoreAttrKey] = {};
                    this[ignoreAttrKey][c2l] = true;
                    if (propInfo.bool) {
                        if ((nv && !this.hasAttribute(c2l)) || nv === false) {
                            this.attr(c2l, nv, '');
                        }
                        else {
                            this[ignoreAttrKey][c2l] = false;
                        }
                    }
                    else if (propInfo.str) {
                        this.attr(c2l, nv);
                    }
                    else if (propInfo.num) {
                        this.attr(c2l, nv.toString());
                    }
                    else if (propInfo.obj) {
                        this.attr(c2l, JSON.stringify(nv));
                    }
                }
                this[privateKey] = nv;
                if (propInfo.log) {
                    console.log(propInfo, nv);
                }
                if (propInfo.debug)
                    debugger;
                this.onPropsChange(prop);
                if (propInfo.notify) {
                    this[de](c2l, { value: nv });
                }
            },
            enumerable: true,
            configurable: true
        });
    });
    customElements.define(name, MyElementClass);
}
const de = Symbol.for('1f462044-3fe5-4fa8-9d26-c4165be15551');
function mergeProps(props1, props2) {
    const returnObj = {};
    propCategories.forEach(propCat => {
        returnObj[propCat] = (props1[propCat] || []).concat(props2[propCat] || []);
    });
    return returnObj;
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
const ltcRe = /(\-\w)/g;
function lispToCamel(s) {
    return s.replace(ltcRe, function (m) { return m[1].toUpperCase(); });
}
const ctlRe = /[\w]([A-Z])/g;
function camelToLisp(s) {
    return s.replace(ctlRe, function (m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}
const propCategories = ['bool', 'str', 'num', 'reflect', 'notify', 'obj', 'jsonProp', 'dry', 'log', 'debug', 'async'];
const argList = Symbol('argList');
function deconstruct(fn) {
    if (fn[argList] === undefined) {
        const fnString = fn.toString().trim();
        if (fnString.startsWith('({')) {
            const iPos = fnString.indexOf('})', 2);
            fn[argList] = fnString.substring(2, iPos).split(',').map(s => s.trim());
        }
        else {
            fn[argList] = [];
        }
    }
    return fn[argList];
}

//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
function hydrate(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         * @private
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}

function createNestedProp(target, pathTokens, val, clone) {
    const firstToken = pathTokens.shift();
    const tft = target[firstToken];
    const returnObj = { [firstToken]: tft ? tft : {} };
    let tc = returnObj[firstToken]; //targetContext
    const lastToken = pathTokens.pop();
    pathTokens.forEach(token => {
        let newContext = tc[token];
        if (!newContext) {
            newContext = tc[token] = {};
        }
        tc = newContext;
    });
    if (tc[lastToken] && typeof (val) === 'object') {
        Object.assign(tc[lastToken], val);
    }
    else {
        if (lastToken === undefined) {
            returnObj[firstToken] = val;
        }
        else {
            tc[lastToken] = val;
        }
    }
    //this controversial line is to force the target to see new properties, even though we are updating nested properties.
    //In some scenarios, this will fail (like if updating element.dataset), but hopefully it's okay to ignore such failures 
    if (clone)
        try {
            Object.assign(target, returnObj);
        }
        catch (e) { }
}

/**
 * Custom Element mixin that allows a property to be namespaced
 * @param superClass
 */
function WithPath(superClass) {
    return class extends superClass {
        wrap(obj, target = {}) {
            if (this.withPath) {
                createNestedProp(target, this.withPath.split('.'), obj, true);
                return target;
            }
            else {
                return obj;
            }
        }
    };
}

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
class P extends WithPath(XtallatX(hydrate(HTMLElement))) {
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
        let realTarget = target;
        if (this.proxyId) {
            const sym = Symbol.for(this.proxyId);
            if (realTarget[sym] === undefined) {
                realTarget[sym] = {};
            }
            realTarget = realTarget[sym];
        }
        this.setVal(realTarget, valx, attr, prop);
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

class NavDown {
    constructor(seed, match, careOf, notify, max, ignore = null, mutDebounce = 50) {
        this.seed = seed;
        this.match = match;
        this.careOf = careOf;
        this.notify = notify;
        this.max = max;
        this.ignore = ignore;
        this.mutDebounce = mutDebounce;
        this._inMutLoop = false;
    }
    init() {
        this.addMutObs(this.seed.parentElement);
        this.sync();
        this.notify(this);
    }
    addMutObs(elToObs) {
        if (elToObs === null)
            return;
        const nodes = [];
        this._mutObs = new MutationObserver((m) => {
            this._inMutLoop = true;
            m.forEach(mr => {
                mr.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const el = node;
                        el.dataset.__pdWIP = '1';
                        nodes.push(el);
                    }
                });
            });
            nodes.forEach(node => delete node.dataset.__pdWIP);
            this.sync();
            this._inMutLoop = false;
            this.notify(this);
        });
        this._mutObs.observe(elToObs, { childList: true });
    }
    sibCheck(sib, c) { }
    sync(c = 0) {
        const isF = typeof this.match === 'function';
        this.matches = [];
        let ns = this._sis ? this.seed : this.seed.nextElementSibling;
        while (ns !== null) {
            if (this.ignore === null || !ns.matches(this.ignore)) {
                let isG = isF ? this.match(ns) : ns.matches(this.match);
                if (isG) {
                    const matchedElements = (this.careOf !== undefined) ? Array.from(ns.querySelectorAll(this.careOf)) : [ns];
                    if (matchedElements !== null) {
                        this.matches = this.matches.concat(matchedElements);
                        c++;
                        if (c >= this.max) {
                            return;
                        }
                    }
                }
                this.sibCheck(ns, c);
            }
            ns = ns.nextElementSibling;
        }
    }
    disconnect() {
        this._mutObs.disconnect();
    }
}

/**
 * Pass data from one element down the DOM tree to other elements
 * @element p-d
 *
 */
class PD extends P {
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
PD.attributeProps = ({ disabled, on, to, careOf, noblock, val, prop, ifTargetMatches, m, from, observe, fireEvent, skipInit, debug, log, withPath, async, propFromEvent, capture, parseValAs, proxyId }) => {
    const bool = [disabled, noblock, skipInit, debug, log, async, capture];
    const num = [m];
    const str = [on, to, careOf, val, prop, ifTargetMatches, from, observe, fireEvent, withPath, propFromEvent, parseValAs, proxyId];
    const reflect = [...bool, ...num, ...str];
    return {
        bool,
        num,
        str,
        reflect
    };
};
define(PD);

function define$1(superClass) {
    const tagName = superClass.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, superClass);
}

const p_d_if = 'p-d-if';
class PDNavDown extends NavDown {
    constructor() {
        super(...arguments);
        this.children = [];
    }
    sibCheck(sib, c) {
        //if ((<any>sib).__aMO) return;
        const attr = sib.getAttribute(p_d_if);
        if (attr === null) {
            sib.__aMO = true;
            return;
        }
        const fec = sib.firstElementChild;
        if (fec === null) {
            setTimeout(() => this.sibCheck(sib, c), 50);
            return;
        }
        if (this.root.matches(attr)) {
            const pdnd = new PDNavDown(fec, this.match, this.careOf, this.notify, this.max, null, this.mutDebounce);
            pdnd.root = this.root;
            this.children.push(pdnd);
            pdnd._sis = true;
            pdnd.init();
            //(<any>sib).__aMO = true;
        }
    }
    getMatches() {
        let ret = this.matches;
        this.children.forEach(child => {
            ret = ret.concat(child.getMatches());
        });
        return ret;
    }
}

/**
 * Pass data from one element down the DOM tree to other elements, including children, recursively.
 * Only drills into children if p-d-if matches css of p-d-r element.
 * @element p-d-r
 */
class PDR extends PD {
    getMatches(pd) {
        return pd.getMatches();
    }
    newNavDown() {
        const bndApply = this.applyProps.bind(this);
        const pdnd = new PDNavDown(this, this.to, this.careOf, bndApply, this.m);
        pdnd.root = this;
        return pdnd;
    }
}
PDR.is = 'p-d-r';
PDR.attributeProps = ({}) => PD.props;
define$1(PDR);

const regLookup = {};
/**
 * Extends element p-d with experimental features.
 * @element p-d-x
 */
class PDX extends PD {
    constructor() {
        super(...arguments);
        this.del = false;
    }
    commit(target, val, e) {
        if (val === undefined) {
            super.commit(target, val, e);
            return;
        }
        if (this.val === '.' && this.prop === '.') {
            Object.assign(target, val);
            return;
        }
        super.commit(target, val, e);
    }
    static extend(params) {
        const nameDefined = params.name !== undefined;
        let name;
        const pdxPrefix = 'p-d-x-';
        if (nameDefined) {
            name = pdxPrefix + params.name;
        }
        else {
            const fnSig = '' + params?.valFromEvent?.toString() + params?.chkIf?.toString();
            const prevName = regLookup[fnSig];
            if (prevName !== undefined) {
                name = prevName;
            }
            else {
                name = pdxPrefix + (new Date()).valueOf().toString();
                regLookup[fnSig] = name;
            }
        }
        if (!customElements.get(name)) {
            class Extension extends PDX {
                constructor() {
                    super();
                    this._valBind = params?.valFromEvent?.bind(this);
                    this._chkIf = params?.chkIf?.bind(this);
                }
                valFromEvent(e) {
                    if (this._valBind !== undefined)
                        return this._valBind(e);
                    return super.valFromEvent(e);
                }
                filterEvent(e) {
                    if (this._chkIf !== undefined)
                        return this._chkIf(e);
                    return super.filterEvent(e);
                }
            }
            Extension.is = name;
            define(Extension);
        }
        if (params.insertAfter !== undefined) {
            const newElement = document.createElement(name);
            //params.insertAfter.after(newEl); //Safari doesn't support yet
            params.insertAfter.insertAdjacentElement('afterend', newElement);
            return newElement;
        }
        else {
            return name;
        }
    }
}
PDX.is = 'p-d-x';
PDX.attributeProps = ({ del, guid }) => ({
    bool: [del],
    str: [guid],
    reflect: [del, guid]
});
define(PDX);

/**
 * Pass data from one element to a targeted DOM element elsewhere
 * @element p-u
 *
 */
class PU extends P {
    pass(e) {
        let targetElement;
        const cssSel = this.to;
        if (cssSel !== undefined) {
            const split = cssSel.split('/');
            const id = split[split.length - 1];
            if (cssSel.startsWith('/')) {
                targetElement = self[cssSel.substr(1)];
            }
            else {
                const len = cssSel.startsWith('./') ? 0 : split.length;
                const host = this.getHost(this, len);
                if (host !== undefined) {
                    targetElement = host.querySelector('#' + id);
                }
                else {
                    throw 'Target Element Not found';
                }
            }
        }
        else {
            const closest = this.toClosest;
            if (closest !== undefined)
                targetElement = this.closest(closest);
        }
        if (targetElement)
            this.injectVal(e, targetElement);
    }
    getHost(el, maxLevel) {
        let parent = el.getRootNode();
        if (maxLevel === 0)
            return parent;
        if (parent.host)
            return this.getHost(parent.host, maxLevel - 1);
        return undefined;
    }
    connectedCallback() {
        super.connectedCallback();
        this.init();
    }
}
PU.is = 'p-u';
PU.attributeProps = ({ disabled, on, to, careOf, noblock, val, prop, ifTargetMatches, observe, fireEvent, withPath, async, capture, parseValAs, toClosest }) => {
    const bool = [disabled, noblock, async, capture];
    const str = [on, to, careOf, val, prop, ifTargetMatches, observe, fireEvent, withPath, parseValAs, toClosest];
    const reflect = [...bool, ...str];
    return {
        bool,
        str,
        reflect
    };
};
define(PU);

const debounce$1 = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};

const ltcRe$1 = /(\-\w)/g;
function lispToCamel$1(s) {
    return s.replace(ltcRe$1, function (m) { return m[1].toUpperCase(); });
}
const ctlRe$1 = /[\w]([A-Z])/g;
function camelToLisp$1(s) {
    return s.replace(ctlRe$1, function (m) {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}
const propCategories$1 = ['bool', 'str', 'num', 'reflect', 'notify', 'obj', 'jsonProp', 'dry', 'log', 'debug', 'async'];
const argList$1 = Symbol('argList');
function deconstruct$1(fn) {
    if (fn[argList$1] === undefined) {
        const fnString = fn.toString().trim();
        if (fnString.startsWith('({')) {
            const iPos = fnString.indexOf('})', 2);
            fn[argList$1] = fnString.substring(2, iPos).split(',').map(s => s.trim());
        }
        else {
            fn[argList$1] = [];
        }
    }
    return fn[argList$1];
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function intersection$1(setA, setB) {
    let _intersection = new Set();
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}
const ignorePropKey = Symbol();
const ignoreAttrKey$1 = Symbol();
const propInfoSym$1 = Symbol('propInfo');
const atrInit$1 = Symbol('atrInit');
function define$2(MyElementClass) {
    const props = MyElementClass.props;
    const proto = MyElementClass.prototype;
    const flatProps = [...props.bool, ...props.num, ...props.str, ...props.obj];
    const existingProps = Object.getOwnPropertyNames(proto);
    MyElementClass[propInfoSym$1] = {};
    flatProps.forEach(prop => {
        if (existingProps.includes(prop))
            return;
        const sym = Symbol(prop);
        const propInfo = {};
        propCategories$1.forEach(cat => {
            propInfo[cat] = props[cat].includes(prop);
        });
        MyElementClass[propInfoSym$1][prop] = propInfo;
        Object.defineProperty(proto, prop, {
            get() {
                return this[sym];
            },
            set(nv) {
                const ik = this[ignorePropKey];
                if (ik !== undefined && ik[prop] === true) {
                    delete ik[prop];
                    this[sym] = nv;
                    return;
                }
                const propInfo = MyElementClass[propInfoSym$1][prop];
                if (propInfo.dry) {
                    if (nv === this[sym])
                        return;
                }
                const c2l = camelToLisp$1(prop);
                if (propInfo.reflect) {
                    //experimental line -- we want the attribute to take precedence over default value.
                    if (this[atrInit$1] === undefined && this.hasAttribute(c2l))
                        return;
                    if (this[ignoreAttrKey$1] === undefined)
                        this[ignoreAttrKey$1] = {};
                    this[ignoreAttrKey$1][c2l] = true;
                    if (propInfo.bool) {
                        this.attr(c2l, nv, '');
                    }
                    else if (propInfo.str) {
                        this.attr(c2l, nv);
                    }
                    else if (propInfo.num) {
                        this.attr(c2l, nv.toString());
                    }
                    else if (propInfo.obj) {
                        this.attr(c2l, JSON.stringify(nv));
                    }
                }
                this[sym] = nv;
                if (propInfo.log) {
                    console.log(propInfo, nv);
                }
                if (propInfo.debug)
                    debugger;
                this.onPropsChange(prop);
                if (propInfo.notify) {
                    this[de$1](c2l, { value: nv });
                }
            },
        });
    });
    const tagName = MyElementClass.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, MyElementClass);
}
const de$1 = Symbol.for('1f462044-3fe5-4fa8-9d26-c4165be15551');
/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX$1(superClass) {
    var _a;
    return _a = class extends superClass {
            constructor() {
                super(...arguments);
                /**
                 * Tracks how many times each event type was called.
                 */
                this.__evCount = {};
                this.self = this;
                this._xlConnected = false;
                this.__propActionQueue = new Set();
            }
            static get evalPath() {
                return lispToCamel$1(this.is);
            }
            static get observedAttributes() {
                const props = this.props;
                return [...props.bool, ...props.num, ...props.str, ...props.jsonProp].map(s => camelToLisp$1(s));
            }
            static get props() {
                if (this[this.evalPath] === undefined) {
                    const args = deconstruct$1(this.attributeProps);
                    const arg = {};
                    args.forEach(token => {
                        arg[token] = token;
                    });
                    this[this.evalPath] = this.attributeProps(arg);
                    const ep = this[this.evalPath];
                    propCategories$1.forEach(propCat => {
                        ep[propCat] = ep[propCat] || [];
                    });
                }
                return this[this.evalPath];
            }
            /**
             * Turn number into string with even and odd values easy to query via css.
             * @param n
             */
            __to$(n) {
                const mod = n % 2;
                return (n - mod) / 2 + '-' + mod;
            }
            /**
             * Increment event count
             * @param name
             */
            __incAttr(name) {
                const ec = this.__evCount;
                if (name in ec) {
                    ec[name]++;
                }
                else {
                    ec[name] = 0;
                }
                this.attr('data-' + name, this.__to$(ec[name]));
            }
            onPropsChange(name) {
                let isAsync = false;
                const propInfoLookup = this.constructor[propInfoSym$1];
                if (Array.isArray(name)) {
                    name.forEach(subName => {
                        this.__propActionQueue.add(subName);
                        const propInfo = propInfoLookup[subName];
                        if (propInfo !== undefined && propInfo.async)
                            isAsync = true;
                    });
                }
                else {
                    this.__propActionQueue.add(name);
                    const propInfo = propInfoLookup[name];
                    if (propInfo !== undefined && propInfo.async)
                        isAsync = true;
                }
                if (this.disabled || !this._xlConnected) {
                    return;
                }
                if (isAsync) {
                    this.__processActionDebouncer();
                }
                else {
                    this.__processActionQueue();
                }
            }
            attributeChangedCallback(n, ov, nv) {
                this[atrInit$1] = true; // track each attribute?
                const ik = this[ignoreAttrKey$1];
                if (ik !== undefined && ik[n] === true) {
                    delete ik[n];
                    return;
                }
                const propName = lispToCamel$1(n);
                if (this[ignorePropKey] === undefined)
                    this[ignorePropKey] = {};
                this[ignorePropKey][propName] = true;
                const anyT = this;
                const ep = this.constructor.props;
                if (ep.str.includes(propName)) {
                    anyT[propName] = nv;
                }
                else if (ep.bool.includes(propName)) {
                    anyT[propName] = nv !== null;
                }
                else if (ep.num.includes(propName)) {
                    anyT[propName] = parseFloat(nv);
                }
                else if (ep.jsonProp.includes(propName)) {
                    try {
                        anyT[propName] = JSON.parse(nv);
                    }
                    catch (e) {
                        anyT[propName] = nv;
                    }
                }
                this.onPropsChange(propName);
            }
            connectedCallback() {
                super.connectedCallback();
                this._xlConnected = true;
                this.__processActionDebouncer();
                this.onPropsChange('');
            }
            /**
             * Dispatch Custom Event
             * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
             * @param detail Information to be passed with the event
             * @param asIs If true, don't append event name with '-changed'
             */
            [de$1](name, detail, asIs = false, bubbles = false) {
                if (this.disabled)
                    return;
                const eventName = name + (asIs ? '' : '-changed');
                const newEvent = new CustomEvent(eventName, {
                    detail: detail,
                    bubbles: bubbles,
                    composed: false,
                    cancelable: true,
                });
                this.dispatchEvent(newEvent);
                this.__incAttr(eventName);
                return newEvent;
            }
            get __processActionDebouncer() {
                if (this.___processActionDebouncer === undefined) {
                    this.___processActionDebouncer = debounce$1((getNew = false) => {
                        this.__processActionQueue();
                    }, 16);
                }
                return this.___processActionDebouncer;
            }
            __processActionQueue() {
                if (this.propActions === undefined)
                    return;
                const queue = this.__propActionQueue;
                this.__propActionQueue = new Set();
                this.propActions.forEach(propAction => {
                    const dependencies = deconstruct$1(propAction);
                    const dependencySet = new Set(dependencies);
                    if (intersection$1(queue, dependencySet).size > 0) {
                        propAction(this);
                    }
                });
            }
        },
        _a.attributeProps = ({ disabled }) => ({
            bool: [disabled],
        }),
        _a;
}

//export const propUp: unique symbol = Symbol.for('8646ccd5-3ffd-447a-a4df-0022ca3a8155');
//export const attribQueue: unique symbol = Symbol.for('02ca2c80-68e0-488f-b4b4-6859284848fb');
/**
 * Base mixin for many xtal- components
 * @param superClass
 */
function hydrate$1(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this.__conn = false;
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            if (val === undefined)
                return this.getAttribute(name);
            if (!this.__conn) {
                if (this.__attribQueue === undefined)
                    this.__attribQueue = [];
                this.__attribQueue.push({
                    name, val, trueVal
                });
                return;
            }
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        __propUp(props) {
            const defaultValues = this.constructor['defaultValues'];
            props.forEach(prop => {
                let value = this[prop];
                if (value === undefined && defaultValues !== undefined) {
                    value = defaultValues[prop];
                }
                if (this.hasOwnProperty(prop)) {
                    delete this[prop];
                }
                if (value !== undefined)
                    this[prop] = value;
            });
        }
        connectedCallback() {
            this.__conn = true;
            const ep = this.constructor.props;
            this.__propUp([...ep.bool, ...ep.str, ...ep.num, ...ep.obj]);
            if (this.__attribQueue !== undefined) {
                this.__attribQueue.forEach(attribQItem => {
                    this.attr(attribQItem.name, attribQItem.val, attribQItem.trueVal);
                });
                this.__attribQueue = undefined;
            }
        }
    };
}

const subscriber_count = Symbol('sc');
class StoreKeeper {
    constructor(guid) {
        this.guid = guid;
        if (!self[guid]) {
            const ifr = document.createElement('iframe');
            ifr[subscriber_count] = 1;
            ifr.id = guid;
            ifr.addEventListener('load', () => {
                ifr.setAttribute('loaded', '');
            });
            ifr.src = 'blank.html';
            ifr.style.display = 'none';
            document.head.appendChild(ifr);
            this.ifr = ifr;
        }
        else {
            this.ifr = self[guid];
            this.ifr[subscriber_count]++;
        }
    }
    getContextWindow() {
        return new Promise((resolve, reject) => {
            this.waitForLoad(resolve);
        });
    }
    forget() {
        this.ifr[subscriber_count]--;
        if (this.ifr[subscriber_count] <= 0) {
            this.ifr.remove();
        }
    }
    waitForLoad(resolve) {
        if (!this.ifr.hasAttribute('loaded') || !this.ifr.contentWindow) {
            setTimeout(() => {
                this.waitForLoad(resolve);
            }, 50);
            return;
        }
        resolve(this.ifr.contentWindow);
    }
}

class XtalStateBase extends XtallatX$1(hydrate$1(HTMLElement)) {
    constructor() {
        super(...arguments);
        this.propActions = [
            ({ guid, self }) => {
                if (guid !== undefined) {
                    self._storeKeeper = new StoreKeeper(guid);
                }
            }
        ];
    }
    disconnectedCallback() {
        if (this._storeKeeper)
            this._storeKeeper.forget();
    }
    connectedCallback() {
        super.connectedCallback();
        this.onPropsChange('disabled');
    }
}

/**
 * Deep merge two objects.
 * Inspired by Stackoverflow.com/questions/27936772/deep-object-merging-in-es6-es7
 * @param target
 * @param source
 *
 */
function mergeDeep(target, source) {
    if (typeof target !== 'object')
        return;
    if (typeof source !== 'object')
        return;
    for (const key in source) {
        processKey(key, target, source);
    }
    Object.getOwnPropertySymbols(source).forEach(sym => {
        processKey(sym, target, source);
    });
    //TODO:  support symbols
    return target;
}
function processKey(key, target, source) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (sourceVal === null || sourceVal === undefined)
        return; //TODO:  null out property?
    if (!targetVal) {
        target[key] = sourceVal;
        return;
    }
    switch (typeof sourceVal) {
        case 'object':
            switch (typeof targetVal) {
                case 'object':
                    mergeDeep(targetVal, sourceVal);
                    break;
                default:
                    //console.log(key);
                    target[key] = sourceVal;
                    break;
            }
            break;
        default:
            target[key] = sourceVal;
    }
}

const xtalStateInfoSym = Symbol('xsis');
const history_state_update = 'history-state-update';
function init(win = window) {
    if (win[xtalStateInfoSym])
        return;
    win[xtalStateInfoSym] = {
        startedAsNull: win.history.state === null,
    };
    const originalPushState = win.history.pushState;
    const boundPushState = originalPushState.bind(win.history);
    win.history.pushState = function (newState, title, URL) {
        const oldState = win.history.state;
        boundPushState(newState, title, URL);
        de$2(oldState, win, title);
    };
    const originalReplaceState = win.history.replaceState;
    const boundReplaceState = originalReplaceState.bind(win.history);
    win.history.replaceState = function (newState, title, URL) {
        const oldState = win.history.state;
        boundReplaceState(newState, title, URL);
        de$2(oldState, win, title);
    };
}
init();
function de$2(oldState, win, title) {
    const detail = {
        oldState: oldState,
        newState: win.history.state,
        initVal: false,
        title: title
    };
    const historyInfo = win[xtalStateInfoSym];
    if (!historyInfo.hasStarted) {
        historyInfo.hasStarted = true;
        if (historyInfo.startedAsNull) {
            detail.initVal = true;
        }
    }
    const newEvent = new CustomEvent(history_state_update, {
        detail: detail,
        bubbles: true,
        composed: true,
    });
    win.dispatchEvent(newEvent);
}
function setState(state, title = '', url = null, win = window) {
    return doState(state, 'replace', title, url, win);
}
function pushState(state, title = '', url, win = window) {
    return doState(state, 'push', title, url, win);
}
function doState(newState, verb, title = '', url = null, win = window) {
    return new Promise((resolve, reject) => {
        window.requestAnimationFrame(() => {
            let oldState = win.history.state;
            const oldStateIsObj = (oldState !== null && typeof oldState === 'object');
            if (oldStateIsObj)
                oldState = { ...oldState };
            const merged = (oldStateIsObj && (typeof (newState) === 'object')) ? mergeDeep(oldState, newState) : newState;
            window.requestAnimationFrame(() => {
                win.history[verb + 'State'](merged, title, url === null ? win.location.href : url);
                resolve();
            });
        });
    });
}

/**
 * Watch for history.state changes
 * @element xtal-state-watch
 * @event history-changed
 */
let XtalStateWatch = /** @class */ (() => {
    class XtalStateWatch extends XtalStateBase {
        constructor() {
            super(...arguments);
            this._addedEventHandlers = false;
            this.propActions = this.propActions.concat([
                ({ disabled, self }) => {
                    if (!self._addedEventHandlers) {
                        self._addedEventHandlers = true;
                        if (self._storeKeeper) {
                            self._storeKeeper.getContextWindow().then(win => {
                                self._win = win;
                                self.addEventHandlers(win);
                            });
                        }
                        else {
                            self._win = window;
                            self.addEventHandlers(window);
                        }
                    }
                }
            ]);
            this._initialEvent = true;
        }
        get history() {
            if (this._win === undefined)
                return undefined;
            return this._win.history;
        }
        onPropsChange(name) {
            super.onPropsChange(name);
        }
        stateChangeHandler(e) {
            const detail = e.detail;
            let isPopstate = false;
            if (detail.initVal) {
                //win.__xtalStateInfo.hasStarted;
                this.dataset.historyInit = "true";
                this.dataset.popstate = "true";
                isPopstate = true;
            }
            else {
                delete this.dataset.popstate;
                delete this.dataset.historyInit;
            }
            this.notify(isPopstate);
        }
        popStateHandler(e) {
            this.dataset.popstate = "true";
            this.notify(true);
        }
        addEventHandlers(win) {
            const info = init(win);
            this._stateChangeHandler = this.stateChangeHandler.bind(this);
            win.addEventListener(history_state_update, this._stateChangeHandler);
            this._popStateHandler = this.popStateHandler.bind(this);
            win.addEventListener("popstate", this._popStateHandler);
            if (win.history.state !== null) {
                this.notify(false);
            }
        }
        disconnectedCallback() {
            if (this._win) {
                if (this._stateChangeHandler) {
                    this._win.removeEventListener(history_state_update, this._stateChangeHandler);
                }
                if (this._popStateHandler) {
                    this._win.removeEventListener('popstate', this._popStateHandler);
                }
            }
        }
        notify(isPopstate) {
            if (this.disabled || !this._xlConnected)
                return;
            if (this._initialEvent) {
                this.dataset.initialEvent = "true";
            }
            else {
                delete this.dataset.initialEvent;
            }
            this[de$1]("history", {
                value: this.history.state,
                isInitialEvent: this._initialEvent,
                isPopstate: isPopstate,
            });
            this._initialEvent = false;
        }
    }
    XtalStateWatch.is = "xtal-state-watch";
    return XtalStateWatch;
})();
define$2(XtalStateWatch);

const doNotCCEventToState = 'dncc';
/**
 * Pass history to downstream elements
 * @element p-h-d
 */
class PhD extends PDX {
    getDetail(val) {
        return {
            value: val,
            [doNotCCEventToState]: true
        };
    }
    connectedCallback() {
        super.connectedCallback();
        const xtalWatch = document.createElement(XtalStateWatch.is);
        xtalWatch.guid = this.guid;
        if (this.val === undefined) {
            const path = this.fromPath === undefined ? '' : '.' + this.fromPath;
            this.val = 'target.history.state' + path;
        }
        xtalWatch.addEventListener('history-changed', e => {
            const cei = e;
            if (this.initAndPopStateOnly && !cei.detail.isInitialEvent && !cei.detail.isPopstate)
                return;
            this.pass(e);
        });
        this.appendChild(xtalWatch);
    }
}
PhD.is = 'p-h-d';
PhD.attributeProps = ({ initAndPopStateOnly, fromPath }) => ({
    bool: [initAndPopStateOnly],
    str: [fromPath],
    reflect: [fromPath, initAndPopStateOnly]
});
define(PhD);

function getHost(el) {
    let parent = el;
    while (parent = (parent.parentNode)) {
        if (parent.nodeType === 11) {
            return parent['host'];
        }
        else if (parent.tagName.indexOf('-') > -1) {
            return parent;
        }
        else if (parent.tagName === 'BODY') {
            return null;
        }
    }
    return null;
}

/**
 * Dispatch event when previous non p-element triggers prescribed event
 * @element p-unt
 */
class PUnt extends PDX {
    connectedCallback() {
        super.connectedCallback();
        this.init();
    }
    pass(e) {
        if (this.dispatch) {
            const detail = {};
            detail.target = e.target;
            this.injectVal(e, detail);
            const customEventInit = new CustomEvent(this.to, {
                bubbles: this.bubbles,
                composed: this.composed,
                cancelable: this.cancelable,
                detail: detail,
            });
            const host = getHost(this);
            if (host !== null) {
                setTimeout(() => host.dispatchEvent(customEventInit));
                if (host.incAttr)
                    host.incAttr(this.to);
            }
            else {
                setTimeout(() => this.dispatchEvent(customEventInit));
                this.__incAttr(this.to);
            }
        }
        super.pass(e);
    }
}
PUnt.is = 'p-unt';
PUnt.attributeProps = ({ bubbles, cancelable, composed, dispatch }) => ({
    bool: [bubbles, cancelable, composed, dispatch],
    reflect: [bubbles, cancelable, composed, dispatch],
});
define(PUnt);

/**
 * "planted weirwood" -- passes data down just like p-d, but also updates history.state
 * @element p-w
 */
class PW extends PUnt {
    constructor() {
        super(...arguments);
        this._addedState = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.addState();
    }
    async addState() {
        if ((!this.replace && !this.push) || this._addedState) {
            return;
        }
        this._addedState = true;
        const { XtalStateUpdate } = await import('./xtal-state-update-e02af891.min.js');
        const xtalUpdate = document.createElement(XtalStateUpdate.is);
        xtalUpdate.rewrite = this.replace;
        xtalUpdate.make = this.push;
        xtalUpdate.withPath = this.statePath;
        xtalUpdate.guid = this.guid;
        this.appendChild(xtalUpdate);
        this._xtalUpdate = xtalUpdate;
        if (this._tempVal !== undefined) {
            xtalUpdate.history = this._tempVal;
            delete this._tempVal;
        }
    }
    commit(target, val, e) {
        super.commit(target, val, e);
        if ((e.detail && e.detail[doNotCCEventToState]))
            return;
        window.requestAnimationFrame(() => {
            if (this._xtalUpdate !== undefined) {
                this._xtalUpdate.history = val;
            }
            else {
                this._tempVal = val;
            }
        });
    }
}
PW.is = 'p-w';
PW.attributeProps = ({ statePath, replace, push }) => ({
    bool: [replace, push],
    str: [statePath],
    reflect: [replace, push, statePath],
});
define(PW);

export { XtalStateBase as X, debounce$1 as a, de$1 as b, define$2 as d, pushState as p, setState as s };
