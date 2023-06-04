export enum ProductOptionTypes {
    Number,
    Select
}

export type ProductOption = {
    type: ProductOptionTypes.Number;
    min?: number;
    max?: number;
} | {
    type: ProductOptionTypes.Select
}

export type Product = {
    guid: string;
    name: string;
    options: {
        [name: string]: ProductOption
    }
}