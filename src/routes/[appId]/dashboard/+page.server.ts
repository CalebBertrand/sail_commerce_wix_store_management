import { ProductOptionTypes, type Product } from "$lib/product";
import { ProductContainerName, database } from "$lib/server/db";
import { sanitizeString } from "$lib/utils";

export async function load({ params }): Promise<{ products: Array<Product> }> {
    const appId = sanitizeString(params.appId);
    // const productsQuery = await database
    //     .container(ProductContainerName)
    //     .items
    //     .query(`SELECT * FROM ${ProductContainerName} AS p WHERE p.appId = '${appId}'`)
    //     .fetchAll();

    return {
        // products: 
        products: [
            {
                guid: crypto.randomUUID(),
                appId: 'testId',
                name: 'Test Product',
                options: [
                    {
                        type: ProductOptionTypes.Number,
                        order: 1,
                        name: 'Test Number',
                        min: 1,
                        max: 10,
                        integer: true,
                        guid: crypto.randomUUID()
                    },
                    {
                        type: ProductOptionTypes.Select,
                        order: 1,
                        name: 'Test Select',
                        values: ['option a', 'option b', 'option c'],
                        guid: crypto.randomUUID()
                    }
                ],
                priceFormula: "1 + 1",
            }
        ]
    };
}
