import type { Product } from "./product";
import { writable } from "svelte/store";

export type AppState = {
    selectedProduct: Product | undefined
}
export const appState = writable<AppState>({ selectedProduct: undefined });