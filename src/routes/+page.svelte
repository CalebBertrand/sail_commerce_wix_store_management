<script lang="ts">
	import { ClickableTile, Button, Search, Modal } from "carbon-components-svelte";
	import { getContext, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { TrashCan } from "carbon-icons-svelte";
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types";
	import type { Writable } from "svelte/store";
	import type { Product } from "$lib/product";
  import type { AppState } from "$lib/stores";

	export let data: PageData;

	let searchValue = "";
	let listShown = false;
	let deleteModalShown = false;

	let appState: Writable<AppState> = getContext("state");
	onMount(() => {
		listShown = true;
	});

	/**
	 * Returns true if the target string contains the search value, irrespective of case.
	 */
	function caseInsensitiveContains(
		target: string,
		searchValue: string
	): boolean {
		return (
			!searchValue || target.toLowerCase().includes(searchValue.toLowerCase())
		);
	}
	$: filteredProducts = data.products.filter((product) =>
		caseInsensitiveContains(product.name, searchValue)
	);

	function gotoProductDetail(product: Product): void {
		appState.update(state => ({ ...state, selectedProduct: product }));
		console.log($appState);
		goto(`product/${product.guid}`);
	}
	function confirmDeleteProduct(product: Product): void {
		appState.update(state => ({ ...state, selectedProduct: product }));
		deleteModalShown = true;
	}
	function deleteSelectedProduct(): void {
		data.products = data.products.filter(product => product.guid !== $appState.selectedProduct?.guid);
		deleteModalShown = false;
	}
</script>

<div class="mb-6">
	<h1 class="float-left mb-3 md:mb-0">Products</h1>

	<div class="float-right w-full md:w-1/3">
		<Search bind:value={searchValue} />
	</div>

	<div class="clear-both" />
</div>

<!-- To trigger the transition as these are prerendered -->
{#if listShown}
	{#each filteredProducts as product, index}
		<div in:fade={{ delay: index * 75, duration: 200 }}>
			<ClickableTile class="mb-3 cursor-auto">
				<h4 class="float-left">{product.name}</h4>
				<div class="float-right">
					<Button
						class="uppercase tracking-widest"
						kind="primary"
						on:click={() => gotoProductDetail(product)}
					>
						Edit
					</Button>
					<Button
						kind="danger-tertiary"
						iconDescription="Delete"
						icon={TrashCan}
						on:click={() => confirmDeleteProduct(product)}
					/>
				</div>

				<div class="clear-both" />
			</ClickableTile>
		</div>
	{/each}
{/if}


<Modal
  danger
  bind:open={deleteModalShown}
  modalHeading={`Delete ${$appState.selectedProduct?.name}`}
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (deleteModalShown = false)}
  on:open
  on:close
  on:submit={() => deleteSelectedProduct()}
>
  <p>This is a permanent action and cannot be undone.</p>
</Modal>