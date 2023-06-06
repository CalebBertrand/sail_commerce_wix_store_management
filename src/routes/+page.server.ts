import { ProductOptionTypes, type Product } from "$lib/product";

export async function load(): Promise<{ products: Array<Product> }> {
    return {
        products: [
            { guid: crypto.randomUUID(), name: 'Product 1', options: [], priceFormula: '' },
            {
                guid: crypto.randomUUID(),
                name: 'Product 2',
                options: [
                    {
                        type: ProductOptionTypes.Select,
                        values: ["Wood", "Steel", "Netherite Idk"],
                        order: 1,
                        name: "Material"
                    },
                    {
                        type: ProductOptionTypes.Number,
                        order: 2,
                        name: "Width"
                    },
                    {
                        type: ProductOptionTypes.Number,
                        order: 3,
                        name: "Height"
                    }
                ],
                priceFormula: ''
            },
            { guid: crypto.randomUUID(), name: 'Product 3', options: [], priceFormula: '' }
        ]
    };
}