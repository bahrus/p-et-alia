import { PD } from './p-d.js';
import { define } from 'trans-render/define.js';
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
    static get is() { return 'p-d-x'; }
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
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case guid:
                if (this._guid !== undefined)
                    return;
                this._guid = newVal;
                break;
            case del:
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
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
        const nameDefined = params.name !== undefined;
        let name;
        const pdxPrefix = 'p-d-x-';
        if (nameDefined) {
            name = pdxPrefix + params.name;
        }
        else {
            const fnSig = params.valFromEvent.toString();
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
                valFromEvent(e) {
                    return params.valFromEvent(e);
                }
            }
            customElements.define(name, Extension);
        }
        if (params.insertAfter !== undefined) {
            const newEl = document.createElement(name);
            //params.insertAfter.after(newEl); //Safari doesn't support yet
            params.insertAfter.insertAdjacentElement('afterend', newEl);
            return newEl;
        }
        else {
            return name;
        }
    }
}
define(PDX);
export const extend = PDX.extend;
