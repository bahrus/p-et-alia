import { PDX } from './p-d-x.js';
import { define } from 'trans-render/define.js';
export class PDState extends PDX {
    static get is() { return 'p-d-state'; }
}
define(PDState);
