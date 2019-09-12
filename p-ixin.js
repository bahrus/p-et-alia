/**
 * Base class for many xtal- components
 * @param superClass
 */
export function Pixin(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this._pds = [];
        }
        connectedCallback() {
            if (super.connectedCallback)
                super.connectedCallback();
            this.pdReg();
        }
        async pdReg() {
            const pd = this.getAttribute('p-d');
            if (pd !== null) {
                const { PD } = await import('./p-d.js');
                const pds = JSON.parse(pd);
                this.pdDis(pds);
                pds.forEach(pd => {
                    const pdForReal = new PD();
                    Object.assign(pdForReal, pd);
                    //pdForReal.init(this);
                    pdForReal.connectedCallback(this);
                });
            }
        }
        pdDis(props) {
            const attr = this.getAttribute('disabled');
            const attrC = attr !== null ? parseInt(attr) : 0;
            let currentCount = isNaN(attrC) ? 0 : attrC;
            this.setAttribute('disabled', (currentCount + props.length).toString());
        }
    };
}
