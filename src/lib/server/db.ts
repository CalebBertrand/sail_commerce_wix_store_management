import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT as string;

const cosmosClient = new CosmosClient({
    endpoint: endpoint,
    aadCredentials: new DefaultAzureCredential()
});

export const database = cosmosClient.database('main');

export const ProductContainerName = 'products';