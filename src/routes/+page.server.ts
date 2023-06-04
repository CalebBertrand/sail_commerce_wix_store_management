import type { Product } from "$lib/product";

export async function load(): Promise<{ products: Array<Product> }> {
    return {
        products: [
            { guid: crypto.randomUUID(), name: 'Product 1', options: {} },
            { guid: crypto.randomUUID(), name: 'Product 2', options: {} },
            { guid: crypto.randomUUID(), name: 'Product 3', options: {} }
        ]
    };
}