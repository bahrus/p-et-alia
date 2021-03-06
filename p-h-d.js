import { PDX } from './p-d-x.js';
import { define } from 'xtal-element/xtal-latx.js';
import { XtalStateWatch } from 'xtal-state/xtal-state-watch.js';
export const doNotCCEventToState = 'dncc';
/**
 * Pass history to downstream elements
 * @element p-h-d
 */
export class PhD extends PDX {
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
