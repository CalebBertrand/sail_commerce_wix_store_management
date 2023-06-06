import type { Product } from "$lib/product";
import { ProductContainerName, database } from "$lib/server/db";
import { sanitizeString } from "$lib/utils";

export async function load({ params }): Promise<{ products: Array<Product> }> {
    const appId = sanitizeString(params.appId);
    const productsQuery = await database
        .container(ProductContainerName)
        .items
        .query(`SELECT * FROM ${ProductContainerName} AS p WHERE p.appId = '${appId}'`)
        .fetchAll();

    return {
        products: productsQuery.resources
    };
}
