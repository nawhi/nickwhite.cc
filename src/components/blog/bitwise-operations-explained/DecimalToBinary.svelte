<script lang="ts">
  import InlineForm from './common/InlineForm.svelte';
  import Calculation from './calculations/DecimalToBinaryCalculation.svelte';

  let number: number;
  let ready = false;
</script>

<InlineForm
  on:submit={(e) => {
    ready = true;
    number = parseInt(e.detail.get('number1'));
  }}
>
  <input
    type="number"
    id="num1"
    name="number1"
    required
    placeholder="Enter an integer"
    min="0"
    step="1"
  />
</InlineForm>
{#if ready}
  {#if number > 2048}
    <div class="text-th-error font-semibold">
      Please enter a number between 0 and 2048
    </div>
  {:else}
    <Calculation {number} />
  {/if}
{/if}
