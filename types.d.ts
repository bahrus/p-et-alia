export interface PProps{
    on: string;
    to: string;
    careOf: string;
    noblock: boolean;
    if: string;
    prop: string | symbol;
    val: string;
    fireEvent: string;
}

export interface PDProps extends PProps{
    from: string;
    m: number;
}

export interface IPixin  extends HTMLElement{
    connectedCallback?(): void;
}