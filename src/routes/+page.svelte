<script>
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<h1>Welcome to SvelteKit</h1>
<ul>
    {#each data.products as product}
        <li>{product.name}</li>
    {/each}
</ul>
