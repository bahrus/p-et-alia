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
            this.pdReg().then(() => {
                if (super.connectedCallback)
                    super.connectedCallback();
            });
        }
        async pdReg() {
            const pd = this.getAttribute('p-d');
            if (pd !== null) {
                const { PD } = await import('./p-d.js');
                const pds = JSON.parse(pd);
                pds.forEach(pd => {
                    const pdForReal = new PD();
                    Object.assign(pdForReal, pd);
                });
            }
        }
    };
}
