<script lang="ts">
	import {
		Button,
		TooltipDefinition,
		TextInput,
		Modal,
		TextArea,
		NumberInput,
		Toggle,
	} from "carbon-components-svelte";
	import { getContext, onMount } from "svelte";
	import {
		Add,
		ChevronLeft,
		Close,
		DragVertical,
		Save,
		TrashCan,
	} from "carbon-icons-svelte";
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
		ProductOptionTypes,
	} from "$lib/product";
	import Sortable from "sortablejs";
	import { delay, fromEvent, throttleTime } from "rxjs";
	import { parsePriceFormula } from "$lib/price-formula-parser/price-formula-parser";
	import { fade } from "svelte/transition";

	let appState = getContext("state") as Writable<AppState>;
	if (!$appState.selectedProduct) {
		goto(`/${$appState.appId}/dashboard`);
	}
	let product = $appState.selectedProduct as Product;
	let errors: {
		priceFormula: string;
		name: string;
		options: {
			[guid: string]: {
				values?: string;
				name?: string;
				min?: string;
				max?: string;
			};
		};
	} = {
		priceFormula: "",
		name: "",
		options: {},
	};

	let confirmNoSaveModalShown = false;
	let confirmedNoSave = false; // for if the user tries to navigate away with invalid data
	let valueInputsByOptionGuid: Record<string, string> = {};

	function createOption(type: ProductOptionTypes): void {
		const order = product.options.length + 1;
		const newOption =
			type === ProductOptionTypes.Number
				? { name: "", order, type, guid: crypto.randomUUID() }
				: { name: "", order, type, values: [], guid: crypto.randomUUID() };
		product.options = [...product.options, newOption];
	}
	function deleteOption(option: ProductOption): void {
		product.options = product.options.filter((o) => o.guid !== option.guid);
	}

	// Svelte doesn't yet support type guards :( so just have to be careful to only call this on options that are selects
	function removeValueFromSelect(option: ProductOption, value: string): void {
		const cast = option as SelectProductOption;
		cast.values = cast.values.filter((v) => v !== value);
		const optionIndex = product.options.findIndex((o) => o === option);

		// trigger refresh on the option and it's values
		product.options[optionIndex] = {
			...cast,
		};

		// to be sure there are not 0 values
		validateOption(product.options[optionIndex]);
	}
	function addValueToSelect(option: ProductOption): void {
		const value = valueInputsByOptionGuid[option.guid];
		const cast = option as SelectProductOption;
		if (!value || cast.values.some((v) => v === value)) {
			validateOption(option);
			return;
		}

		cast.values = [...cast.values, value];
		const optionIndex = product.options.findIndex((o) => o === option);

		// trigger refresh on the option and it's values
		product.options[optionIndex] = {
			...cast,
		};

		// clear the input
		valueInputsByOptionGuid[option.guid] = "";
	}

	function validateName(): void {
		errors.name = isNilOrWhitespace(product.name) ? "Cannot be empty." : "";
	}
	function validatePriceFormula(): void {
		if (!product.priceFormula) {
			errors.priceFormula = "Cannot be empty.";
		} else {
			const expression = parsePriceFormula(
				product.priceFormula,
				product.options
			);
			if (typeof expression === "string") {
				errors.priceFormula = expression;
			} else {
				errors.priceFormula = "";
			}
		}
	}
	function validateOption(option: ProductOption): void {
		errors.options[option.guid] = {};
		if (isNilOrWhitespace(option.name)) {
			errors.options[option.guid].name = "Cannot be empty.";
		} else if (
			product.options.some(
				(optn) => optn.guid !== option.guid && optn.name === option.name
			)
		) {
			errors.options[option.guid].name = "Cannot have duplicate option names.";
		}

		if (isProductOptionSelect(option)) {
			if (!option.values.length)
				errors.options[option.guid].values = "Must have at least one value.";
		} else if (isProductOptionNumber(option)) {
			if (option.min && option.min < 0)
				errors.options[option.guid].min = "Must be greater than or equal to 0.";
			if (option.max && option.min && option.max <= option.min)
				errors.options[option.guid].max = "Max must be greater than min.";
		}

		validatePriceFormula();
	}

	function anyInvalidFields(): boolean {
		return (
			!!errors.name ||
			!!errors.priceFormula ||
			Object.values(errors.options).some((optionErrors) => {
				return (
					!!optionErrors.name ||
					!!optionErrors.values ||
					!!optionErrors.min ||
					!!optionErrors.max
				);
			})
		);
	}

	function confirmNoSave(): void {
		confirmedNoSave = true;
		goto(`/${$appState.appId}/dashboard`);
	}

	function handleSort(event: Sortable.SortableEvent): void {
		const oldOrder = event.oldIndex! + 1;
		const newOrder = event.newIndex! + 1;
		product.options.forEach((option) => {
			if (option.order === oldOrder) option.order = newOrder;
			else if (option.order > oldOrder && option.order <= newOrder)
				option.order--;
			else if (option.order < oldOrder && option.order >= newOrder)
				option.order++;
		});
	}

	beforeNavigate((navigation) => {
		if (product && !confirmedNoSave && anyInvalidFields()) {
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
			onSort: handleSort,
		});

		const nameInput = document.getElementById("product-name") as HTMLElement;
		fromEvent(nameInput, "input")
			.pipe(delay(1), throttleTime(100))
			.subscribe(validateName);

		const priceFormulaInput = document.getElementById(
			"price-formula-input"
		) as HTMLElement;
		fromEvent(priceFormulaInput, "input")
			.pipe(delay(1), throttleTime(100))
			.subscribe(validatePriceFormula);
	});
</script>

<div class="mb-6">
	<div class="flex">
		<TooltipDefinition tooltipText="Back" class="flex-shrink mx-2">
			<Button
				kind="ghost"
				class="h-full mr-2"
				on:click={() => goto(`/${$appState.appId}/dashboard`)}
			>
				<ChevronLeft size={32} class="text-white" />
			</Button>
		</TooltipDefinition>

		<TextInput
			id="product-name"
			class="flex-grow header-input input-transparent-background"
			hideLabel
			labelText="Product Name"
			placeholder="Enter Product Name..."
			size="xl"
			invalid={!!errors.name}
			invalidText={errors.name}
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
	<div class="mb-3">
		<h5 class="mb-3 float-left">Product Options</h5>

		<TooltipDefinition
			class="float-right m-1"
			tooltipText="Number options allow shoppers to select a decimal or integer."
		>
			<Button
				kind="tertiary"
				size="small"
				icon={Add}
				on:click={() => createOption(ProductOptionTypes.Number)}
				>New Number Option</Button
			>
		</TooltipDefinition>
		<TooltipDefinition
			class="float-right m-1"
			tooltipText="Select options allow shoppers to select one of multiple options."
		>
			<Button
				kind="tertiary"
				size="small"
				icon={Add}
				on:click={() => createOption(ProductOptionTypes.Select)}
				>New Select Option</Button
			>
		</TooltipDefinition>

		<div class="clear-both" />
	</div>

	<div id="options-list">
		{#each product.options.sort((option) => option.order) as option (option.guid)}
			{@const optionErrors = errors.options[option.guid] ?? {}}
			<div class="mb-5 p-4 box-shadow bg-ui-01-color hoverable flex gap-4">
				<div class="grow-0 flex items-center">
					<DragVertical
						size={24}
						class="options-drag-handle active:cursor-grabbing cursor-grab"
					/>
				</div>
				<div class="w-full">
					<div class="w-full">
						<span class="font-normal text-base block float-left"
							>Type: <strong>{option.type}</strong></span
						>

						<Button
							kind="danger-tertiary"
							icon={TrashCan}
							size="small"
							iconDescription="Delete option."
							class="float-right"
							on:click={() => deleteOption(option)}
						/>

						<div class="clear-both" />
					</div>

					<hr class="mb-4" />
					<div class="grow flex gap-3 flex-wrap">
						<div class="w-1/3 min-w-max">
							<TextInput
								labelText="Name"
								placeholder="Enter name..."
								bind:value={option.name}
								on:input={() => validateOption(option)}
								invalid={!!optionErrors.name}
								invalidText={optionErrors.name}
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
									invalid={!!optionErrors.min}
									invalidText={optionErrors.min}
									bind:value={option.min}
									on:input={() => validateOption(option)}
								/>
							</div>
							<div>
								<NumberInput
									allowEmpty
									hideSteppers
									label="Max"
									helperText="Leave blank for no max requirement."
									min={option.min ?? 0}
									invalid={!!optionErrors.max}
									invalidText={optionErrors.max}
									bind:value={option.max}
									on:input={() => validateOption(option)}
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
							<div>
								<div class="w-full">
									<span class="small-label">Values</span>
								</div>
								<div>
									<div class="large-tag mt-0">
										<TooltipDefinition
											tooltipText="Type a new selectable value, and click the plus to add."
										>
											<TextInput
												size="sm"
												placeholder="New selectable name..."
												class="input-transparent-background ml-3"
												bind:value={valueInputsByOptionGuid[option.guid]}
												on:blur={() => validateOption(option)}
											/>
										</TooltipDefinition>

										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<div
											class="w-fit h-fit rounded-full mt-1 ml-2 hover:cursor-pointer hover:scale-125 transition-transform"
											on:click={() => addValueToSelect(option)}
										>
											<Add size={24} />
										</div>
									</div>

									{#each option.values as value}
										<div in:fade={{ duration: 150 }} class="large-tag mt-0">
											{value}

											<!-- svelte-ignore a11y-click-events-have-key-events -->
											<div
												class="w-fit h-fit rounded-full mt-1 ml-2 hover:cursor-pointer hover:scale-125 transition-transform"
												on:click={() => removeValueFromSelect(option, value)}
											>
												<Close size={24} />
											</div>
										</div>
									{/each}
								</div>
								{#if option.values.some((v) => v === valueInputsByOptionGuid[option.guid])}
									<div class="w-full">
										<span class="invalid-text"
											>Selectable value already exisits.</span
										>
									</div>
								{:else if optionErrors.values}
									<div class="w-full">
										<span class="invalid-text">{optionErrors.values}</span>
									</div>
								{/if}
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
		id="price-formula-input"
		hideLabel
		placeholder="Enter formula here..."
		rows={3}
		class="mb-2 text-lg"
		bind:value={product.priceFormula}
		invalid={!!errors.priceFormula}
		invalidText={errors.priceFormula}
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
		modalHeading={`You have invalid changes, are you sure you want to leave? Your changes will not be saved.`}
		primaryButtonText="Leave"
		secondaryButtonText="Stay"
		on:click:button--secondary={() => (confirmNoSaveModalShown = false)}
		on:open
		on:close
		on:submit={() => confirmNoSave()}
	>
		<p>
			{#if errors.name}
				Product Name: {errors.name}<br />
				<br />
			{/if}

			{#if errors.priceFormula}
				Price Formula: {errors.priceFormula}<br />
				<br />
			{/if}

			{#each product.options as option}
				{@const optionErrors = errors.options[option.guid] ?? {}}
				{#if optionErrors.name}
					{option.name || "Option"} Name: {optionErrors.name}
					<br />
				{/if}

				{#if optionErrors.values}
					{option.name || "Option"} Selectable Values: {optionErrors.values}
					<br />
				{/if}

				{#if optionErrors.min}
					{option.name || "Option"} Min: {optionErrors.min}
					<br />
				{/if}

				{#if optionErrors.max}
					{option.name || "Option"} Max: {optionErrors.max}
					<br />
				{/if}
			{/each}
		</p>
	</Modal>
{/if}
