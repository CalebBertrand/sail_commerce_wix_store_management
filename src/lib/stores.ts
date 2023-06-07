import { writable, type Writable } from "svelte/store";
import type { Product } from "./product";

export type AppState = {
    selectedProduct: Product | undefined,
    appId: string
}

export function appStateFactory(appId: string): Writable<AppState> {
    return writable<AppState>({ selectedProduct: undefined, appId });
}