import { Pixin } from '../p-ixin.js';
import { XtalJSONMerge } from '../node_modules/xtal-json-merge/xtal-json-merge.js';
import { define } from 'trans-render/define.js';
export class XtalJsonMergePD extends Pixin(XtalJSONMerge) {
    static get is() { return 'xtal-json-merge-pd'; }
}
define(XtalJsonMergePD);
