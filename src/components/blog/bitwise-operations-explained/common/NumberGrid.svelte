<script lang="ts">
  export let rows: number, cols: number;
</script>

<!-- grid-rows-{rows} doesn't work in this context... don't know why -->
<div
  class="font-mono text-3xl grid gap-4 justify-items-start"
  style="
   /*  */
    grid-template-rows: repeat({rows}, minmax(0, 1fr));
    grid-template-columns: repeat({cols}, minmax(0, 1fr));"
>
  <slot />
</div>
