<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<style lang="postcss">
  :global(.form-with-styled-inputs > input) {
    @apply py-2 px-3 leading-tight;
    @apply shadow appearance-none focus:outline-none border rounded;
    @apply border-th-subtle dark:bg-th-subtle placeholder-th-tertiary text-th-primary;
  }

  :global(.form-with-styled-inputs > button) {
    @apply py-2 px-4 rounded font-bold focus:outline-none;
    @apply bg-th-action hover:bg-th-action-focus transition-all text-th-background dark:text-th-primary;
  }
</style>

<form
  class="form-with-styled-inputs p-1 flex flex-wrap items-center gap-4"
  on:submit|preventDefault={(e) => {
    dispatch('submit', new FormData(e.target));
  }}
>
  <slot />
  <button type="submit">Go</button>
</form>
