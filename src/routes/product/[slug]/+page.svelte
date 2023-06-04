<script lang="ts">
	import type { AppState } from "$lib/stores";
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";

	let appState = getContext("state") as Writable<AppState>;
</script>

<div class="mb-6">
	<h1>{$appState.selectedProduct?.name}</h1>
</div>
