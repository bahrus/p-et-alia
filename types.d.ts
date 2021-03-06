import { init } from "../xtal-state/xtal-state-api";
export interface PProps extends HTMLElement{
    on?: string;
    to?: string;
    careOf?: string;
    noblock?: boolean;
    ifTargetMatches?: string;
    prop?: string | symbol;
    val?: string;
    fireEvent?: string;
}

export interface PDProps extends PProps{
    from?: string;
    m?: number;
}

export interface IPixin  extends HTMLElement{
    connectedCallback?(): void;
}

export interface ExtensionParams{
    name?: string;
    insertAfter?: HTMLElement;
    valFromEvent?: ((e: Event) => any) | undefined;
    chkIf?: ((e: Event) => boolean) | undefined;
}

