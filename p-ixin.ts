import {IPixin, PProps, PDProps} from './types.d.js';
type Constructor<T = {}> = new (...args: any[]) => T;
/**
 * Base class for many xtal- components
 * @param superClass
 */
export function Pixin<TBase extends Constructor<IPixin>>(superClass: TBase) {
    return class extends superClass implements IPixin {
        connectedCallback(){
            if(super.connectedCallback) super.connectedCallback();
            this.pdReg();
        }
        _pds : PDProps[] = [];
        async pdReg(){
            const pd = this.getAttribute('p-d');
            if(pd !== null){
                const {PD} = await import('./p-d.js');
                const pds = JSON.parse(pd) as PDProps[];
                this.pdDis(pds);
                pds.forEach(pd => {
                    const pdForReal = new PD();
                    Object.assign(pdForReal, pd);
                    //pdForReal.init(this);
                    pdForReal.connectedCallback(this);
                })
            }
        }
        pdDis(props: PDProps[]){
            const attr = this.getAttribute('disabled');
            const attrC = attr !== null ? parseInt(attr) : 0;
            let currentCount = isNaN(attrC) ? 0 : attrC;
            this.setAttribute('disabled', (currentCount + props.length).toString());

        }
    }
}