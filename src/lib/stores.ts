import { writable, type Writable } from "svelte/store";
import type { Product } from "./product";

export type AppState = {
    selectedProduct: Product | undefined
}

export function appStateFactory(): Writable<AppState> {
    return writable<AppState>({ selectedProduct: undefined });
}