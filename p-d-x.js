import { PD } from './p-d.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
const guid = 'guid';
const del = 'del';
const regLookup = {};
/**
 * Extends element p-d with experimental features.
 * @element p-d-x
 */
export class PDX extends PD {
    constructor() {
        super(...arguments);
        this._del = false;
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
    get guid() {
        return this._guid;
    }
    set guid(val) {
        this.attr(guid, val);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([guid, del]);
    }
    get del() {
        return this._del;
    }
    set del(nv) {
        this.attr(del, nv, '');
    }
    setAttr(target, attr, valx) {
        if (this._del) {
            target.removeAttribute(attr);
        }
        else {
            super.setAttr(target, attr, valx);
        }
    }
    setProp(target, prop, valx) {
        if (this._del) {
            delete target[prop];
        }
        else {
            super.setProp(target, prop, valx);
        }
    }
    static extend(params) {
        var _a, _b;
        const nameDefined = params.name !== undefined;
        let name;
        const pdxPrefix = 'p-d-x-';
        if (nameDefined) {
            name = pdxPrefix + params.name;
        }
        else {
            const fnSig = '' + ((_a = params === null || params === void 0 ? void 0 : params.valFromEvent) === null || _a === void 0 ? void 0 : _a.toString()) + ((_b = params === null || params === void 0 ? void 0 : params.chkIf) === null || _b === void 0 ? void 0 : _b.toString());
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
                    var _a, _b;
                    super();
                    this._valBind = (_a = params === null || params === void 0 ? void 0 : params.valFromEvent) === null || _a === void 0 ? void 0 : _a.bind(this);
                    this._chkIf = (_b = params === null || params === void 0 ? void 0 : params.chkIf) === null || _b === void 0 ? void 0 : _b.bind(this);
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
            customElements.define(name, Extension);
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
PDX.attributeProps = ({ del, guid }) => {
    const ap = {
        boolean: [del],
        string: [guid],
    };
    return mergeProps(ap, PD.props);
};
define(PDX);
export const extend = PDX.extend;
