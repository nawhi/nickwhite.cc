<script lang="ts">
  import Calculation from './calculations/BitwiseOperationCalculation.svelte';
  import InlineForm from './common/InlineForm.svelte';

  let number1: number, number2: number;
  let ready = false;
</script>

<InlineForm
  on:submit={(e) => {
    ready = true;
    number1 = parseInt(e.detail.get('number1'));
    number2 = parseInt(e.detail.get('number2'));
  }}
>
  <input
    class="w-1/4 sm:w-auto"
    type="number"
    id="num1"
    name="number1"
    required
    placeholder="Int 1"
    min="0"
    step="1"
  />
  <div class="font-mono text-th-primary sm:px-2">&amp;</div>
  <input
    class="w-1/4 sm:w-auto"
    type="number"
    id="num2"
    name="number2"
    required
    placeholder="Int 2"
    min="0"
    step="1"
  />
</InlineForm>
{#if ready}
  {#if number1 > 2048 || number2 > 2048}
    <div class="font-semibold text-th-error">Please enter two numbers between 0 and 2048</div>
  {:else}
    <div class="py-4">
      <Calculation {number1} {number2} />
    </div>
  {/if}
{/if}
