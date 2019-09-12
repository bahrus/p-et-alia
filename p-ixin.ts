import {IPixin, PProps, PDProps} from './types.d.js';
type Constructor<T = {}> = new (...args: any[]) => T;
/**
 * Base class for many xtal- components
 * @param superClass
 */
export function Pixin<TBase extends Constructor<IPixin>>(superClass: TBase) {
    return class extends superClass implements IPixin {
        connectedCallback(){
            this.pdReg().then(() =>{
                if(super.connectedCallback) super.connectedCallback();
            })
        }
        _pds : PDProps[] = [];
        async pdReg(){
            const pd = this.getAttribute('p-d');
            if(pd !== null){
                const {PD} = await import('./p-d.js');
                const pds = JSON.parse(pd) as PDProps[];
                pds.forEach(pd => {
                    const pdForReal = new PD();
                    Object.assign(pdForReal, pd);
                })
            }
        }
    }
}