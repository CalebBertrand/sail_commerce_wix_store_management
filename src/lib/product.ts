export enum ProductOptionTypes {
    Number = "Number",
    Select = "Select"
}

type ProductOptionBase = {
    order: number;
    name: string;
}

export type NumberProductOption = ProductOptionBase & {
    type: ProductOptionTypes.Number;
    min?: number;
    max?: number;
    integer?: boolean;
}

export type SelectProductOption = ProductOptionBase & {
    type: ProductOptionTypes.Select,
    values: Array<string>;
}

export type ProductOption = NumberProductOption | SelectProductOption;

export type Product = {
    guid: string;
    name: string;
    options: Array<ProductOption>;
    priceFormula: string;
}

export function isProductOptionSelect(option: ProductOption): option is SelectProductOption {
    return option.type === ProductOptionTypes.Select;
}

export function isProductOptionNumber(option: ProductOption): option is NumberProductOption {
    return option.type === ProductOptionTypes.Number;
}