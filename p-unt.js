import { P } from './p.js';
import { define } from 'trans-render/define.js';
import { getHost } from 'xtal-element/getHost.js';
const bubbles = 'bubbles';
const composed = 'composed';
const dispatch = 'dispatch';
/**
 * Dispatch event when previous non p-element triggers prescribed event
 * @element p-unt
 */
export class PUnt extends P {
    static get is() { return 'p-unt'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([bubbles, composed, dispatch]);
    }
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case bubbles:
            case composed:
            case dispatch:
                this['_' + name] = newVal !== null;
                break;
            default:
                super.attributeChangedCallback(name, oldVal, newVal);
        }
    }
    connectedCallback() {
        this.propUp([bubbles, composed, dispatch]);
        super.connectedCallback();
        this.init();
    }
    pass(e) {
        const detail = {};
        this.setVal(e, detail);
        const customEventInit = new CustomEvent(this.to, {
            bubbles: this._bubbles,
            composed: this._composed,
            detail: detail,
        });
        const host = getHost(this);
        if (host !== null) {
            host.dispatchEvent(customEventInit);
            if (host.incAttr)
                host.incAttr(this.to);
        }
        else {
            this.dispatchEvent(customEventInit);
            this.incAttr(this.to);
        }
    }
    get bubbles() {
        return this._bubbles;
    }
    /**
     * event should bubble up
     * @attr
     */
    set bubbles(val) {
        this.attr(bubbles, val, '');
    }
    get composed() {
        return this._composed;
    }
    /**
     * Event bubbling should pierce shadow dom
     */
    set composed(val) {
        this.attr(composed, val, '');
    }
    get dispatch() {
        return this._dispatch;
    }
    /**
     * dispatch event
     */
    set dispatch(val) {
        this.attr(dispatch, val, '');
    }
}
define(PUnt);
