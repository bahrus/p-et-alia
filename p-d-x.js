import { PD } from './p-d.js';
import { define, mergeProps } from 'xtal-element/xtal-latx.js';
const regLookup = {};
/**
 * Extends element p-d with experimental features.
 * @element p-d-x
 */
let PDX = /** @class */ (() => {
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
                let Extension = /** @class */ (() => {
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
                    return Extension;
                })();
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
    PDX.attributeProps = ({ del, guid }) => {
        const ap = {
            bool: [del],
            str: [guid],
            reflect: [del, guid]
        };
        return mergeProps(ap, PD.props);
    };
    return PDX;
})();
export { PDX };
define(PDX);
export const extend = PDX.extend;
