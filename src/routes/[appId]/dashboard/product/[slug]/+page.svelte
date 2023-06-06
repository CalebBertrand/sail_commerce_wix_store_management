<script lang="ts">
	import {
		Button,
		TooltipDefinition,
		TextInput,
		Modal,
		TextArea,
		NumberInput,
		Toggle,
		Tag,
	} from "carbon-components-svelte";
	import { getContext, onMount } from "svelte";
	import { Add, ChevronLeft, DragVertical, Save } from "carbon-icons-svelte";
	import { beforeNavigate, goto } from "$app/navigation";
	import type { Writable } from "svelte/store";
	import type { AppState } from "$lib/stores";
	import { isNilOrWhitespace } from "$lib/utils";
	import {
		type Product,
		isProductOptionSelect,
		isProductOptionNumber,
		type SelectProductOption,
		type ProductOption,
	} from "$lib/product";
	import Sortable from "sortablejs";

	let appState = getContext("state") as Writable<AppState>;
	if (!$appState.selectedProduct) {
		goto("/");
	}
	let product = $appState.selectedProduct as Product;

	let confirmNoSaveModalShown = false;
	let confirmedNoSave = false; // for if the user tries to navigate away with invalid data

	// Svelte doesn't yet support type guards :( so just have to be careful to only call this on options that are selects
	function removeValueFromSelect(option: ProductOption, value: string): void {
		(option as SelectProductOption).values = (
			option as SelectProductOption
		).values.filter((v) => v !== value);
	}

	function validateChanges(): Record<string, string> {
		let errors: Record<string, string> = {};
		if (isNilOrWhitespace(product.name))
			errors["Product Name"] = "Cannot be empty.";
		return errors;
	}

	function confirmNoSave(): void {
		confirmedNoSave = true;
		goto("/");
	}

	beforeNavigate((navigation) => {
		if (
			product &&
			!confirmedNoSave &&
			Object.keys(validateChanges()).length !== 0
		) {
			confirmNoSaveModalShown = true;
			navigation.cancel();
		}
	});

	onMount(() => {
		// Options Drag n Drop setup
		var list = document.getElementById("options-list") as HTMLUListElement;
		Sortable.create(list, {
			handle: ".options-drag-handle",
			animation: 175,
			dragClass: "",
		});
	});
</script>

<div class="mb-6">
	<div class="flex">
		<TooltipDefinition tooltipText="Back" class="flex-shrink mx-2">
			<Button kind="ghost" class="h-full mr-2" on:click={() => goto("/")}>
				<ChevronLeft size={32} class="text-white" />
			</Button>
		</TooltipDefinition>

		<TextInput
			class="flex-grow text-xl header-input"
			hideLabel
			labelText="Product Name"
			placeholder="Enter Product Name..."
			size="xl"
			bind:value={product.name}
		/>

		<Button
			class="flex-shrink mx-3 uppercase tracking-widest text-base"
			kind="primary"
			iconDescription="Save Changes"
			icon={Save}>Save</Button
		>
	</div>
</div>

<!-- Options -->
<div class="p-3">
	<h5 class="mb-1">Product Options</h5>

	<div id="options-list">
		{#each product.options.sort((option) => option.order) as option}
			<div class="mb-2 p-4 box-shadow bg-ui-01-color hoverable flex gap-4">
				<div class="grow-0 flex items-center">
					<DragVertical
						size={24}
						class="options-drag-handle active:cursor-grabbing cursor-grab"
					/>
				</div>
				<div class="w-full">
					<span class="font-normal text-base block"
						>Type: <strong>{option.type}</strong></span
					>
					<hr class="mb-4" />
					<div class="grow flex gap-3 flex-wrap">
						<div class="w-1/3 min-w-max">
							<TextInput
								labelText="Name"
								placeholder="Enter name..."
								bind:value={option.name}
							/>
						</div>
						{#if isProductOptionNumber(option)}
							<div>
								<NumberInput
									allowEmpty
									hideSteppers
									label="Min"
									helperText="Leave blank for no min requirement."
									min={0}
									bind:value={option.min}
								/>
							</div>
							<div>
								<NumberInput
									allowEmpty
									hideSteppers
									label="Max"
									helperText="Leave blank for no max requirement."
									min={0}
									bind:value={option.max}
								/>
							</div>
							<div>
								<TooltipDefinition
									tooltipText="If toggled, will not allow decimal numbers."
								>
									<Toggle labelText="Integer" bind:value={option.integer} />
								</TooltipDefinition>
							</div>
						{:else if isProductOptionSelect(option)}
							<div class="whitespace-nowrap">
								<div class="inline-block">
									<TextInput
										labelText="New Option"
										placeholder="Option name..."
									/>
								</div>
								<div class="inline-block">
									<Button
										icon={Add}
										iconDescription="Add Option"
										kind="tertiary"
										class="inline-block"
									/>
								</div>
							</div>
							<div>
								{#each option.values as value}
									<Tag
										filter
										on:close={() => removeValueFromSelect(option, value)}
										>{value}</Tag
									>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Price Formula -->
<div class="p-3">
	<h5 class="mb-1">Price Formula</h5>

	<TextArea
		hideLabel
		placeholder="Enter formula here..."
		rows={6}
		class="mb-2"
		bind:value={product.priceFormula}
	/>
	<p class="leading-8">
		An Excel-like formula that will determine the price for this product.
		Available operations are <code>+</code>, <code>-</code>, <code>*</code>,
		<code>/</code>, <code>=</code> for equality checks, and
		<code
			>IF(<em>some condition</em>, <em>true value</em>,
			<em>false value</em>)</code
		>. You can get access to the user's response to the product options with
		<code>OPTIONS["Option Name"]</code>.
	</p>
</div>

{#if confirmNoSaveModalShown}
	<Modal
		danger
		bind:open={confirmNoSaveModalShown}
		modalHeading={`You have invalid changes, do you want to leave?`}
		primaryButtonText="Leave"
		secondaryButtonText="Stay"
		on:click:button--secondary={() => (confirmNoSaveModalShown = false)}
		on:open
		on:close
		on:submit={() => confirmNoSave()}
	>
		{@const errors = Object.entries(validateChanges())}
		<p>
			{#each errors as [field, errorMsg]}
				{field}: {errorMsg}
				<br />
			{/each}
		</p>
	</Modal>
{/if}
