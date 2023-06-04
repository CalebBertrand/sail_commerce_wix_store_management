<script>
	import { ClickableTile, Button, Search } from "carbon-components-svelte";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { TrashCan } from "carbon-icons-svelte";

	/** @type {import('./$types').PageData} */
	export let data;

	let searchValue = "";
	let listShown = false;

	onMount(() => {
		listShown = true;
	});

	$: filteredProducts = data.products.filter(
		(product) =>
			!searchValue ||
			product.name.toLowerCase().includes(searchValue.toLowerCase())
	);
</script>

<div class="mb-6">
	<h1 class="float-left">Products</h1>

	<div class="float-right w-full md:w-1/3">
		<Search bind:value={searchValue} />
	</div>

	<div class="clear-both" />
</div>

<!-- To trigger the transition as these are prerendered -->
{#if listShown}
	{#each filteredProducts as product, index}
		<div transition:fade={{ delay: index * 75, duration: 200 }}>
			<ClickableTile class="mb-3">
				<h4 class="float-left">{product.name}</h4>
				<div class="float-right">
					<Button class="uppercase tracking-widest" kind="primary">Edit</Button>
					<Button
						kind="danger-tertiary"
						iconDescription="Delete"
						icon={TrashCan}
					/>
				</div>

				<div class="clear-both" />
			</ClickableTile>
		</div>
	{/each}
{/if}
