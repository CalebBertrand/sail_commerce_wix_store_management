<script>
	import {
		Header,
		Content,
		Theme,
		HeaderUtilities,
		HeaderGlobalAction,
	} from "carbon-components-svelte";
	import { Moon, Sun } from "carbon-icons-svelte";


	const darkMode = 'g90';
	const lightMode = 'white';
	let theme = darkMode; // default theme
</script>

<Theme persist persistKey="sail-commerce-theme" bind:theme />

<Header company="Sail Commerce" platformName="Product Management">
	<HeaderUtilities>
		<HeaderGlobalAction
			aria-label="Color Theme"
			icon={theme == darkMode ? Moon : Sun}
			on:click={() => {
				theme = theme == darkMode ? lightMode : darkMode;
			}}
		/>
	</HeaderUtilities>
</Header>

<Content>
	<slot />
</Content>

<style>
	@import "../app.css";
</style>
