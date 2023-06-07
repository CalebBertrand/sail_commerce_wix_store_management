import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import assert from "assert";

dotenv.config();
const endpoint = process.env.COSMOS_ENDPOINT;
debugger;
assert(!!endpoint);

const cosmosClient = new CosmosClient({
    endpoint: endpoint,
    aadCredentials: new DefaultAzureCredential()
});

export const database = cosmosClient.database('main');

export const ProductContainerName = 'products';
