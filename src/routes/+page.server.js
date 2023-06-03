/** @type {import('./$types').PageServerLoad} */
export async function load() {
    return {
        products: [
            { guid: crypto.randomUUID(), name: 'Product 1', options: { w: 5, h: 20 } },
            { guid: crypto.randomUUID(), name: 'Product 2', options: { w: 50, h: 10 } },
            { guid: crypto.randomUUID(), name: 'Product 3', options: { w: 5, h: 25 } }
        ]
    };
}