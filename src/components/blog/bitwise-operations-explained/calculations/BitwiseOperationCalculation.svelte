<script lang="ts">
  import NumberGrid from '../common/NumberGrid.svelte';

  export let number1: number, number2: number;

  let bin1: string,
    bin2: string,
    digits: number,
    bin1Padded: string,
    bin2Padded: string,
    resultBase10: number,
    resultBin: string,
    resultBinPadded: string;
  $: {
    bin1 = number1.toString(2);
    bin2 = number2.toString(2);

    digits = Math.max(bin1.length, bin2.length);

    bin1Padded = bin1.padStart(digits, '0');
    bin2Padded = bin2.padStart(digits, '0');

    resultBase10 = number1 & number2;
    resultBin = resultBase10.toString(2);
    resultBinPadded = resultBin.padStart(digits, '0');
  }
</script>

<div class="text-4xl text-th-primary font-mono flex flex-col overflow-x-auto gap-8">
  <NumberGrid rows={4} cols={digits}>
    {#each bin1Padded as _, i}
      <div class="text-sm text-th-secondary pt-2.5">2<sup>{bin1Padded.length - (i + 1)}</sup></div>
    {/each}
    {#each bin1Padded as char, i}
      <div
        class={char === '1' && bin2Padded[i] === '1' ? 'font-bold text-th-primary' : 'font-normal text-th-tertiary'}
      >
        {char}
      </div>
    {/each}
    {#each bin2Padded as char, i}
      <div
        class={char === '1' && bin1Padded[i] === '1' ? 'font-bold text-th-primary' : 'font-normal text-th-tertiary'}
      >
        {char}
      </div>
    {/each}
    {#each resultBinPadded as char}
      {#if char === '0'}
        <div class="text-th-tertiary">0</div>
      {:else}
        <div class="font-bold text-th-primary">1</div>
      {/if}
    {/each}
  </NumberGrid>
  <div class="pt-4 text-xl">
    {number1}&nbsp;&amp;&nbsp;{number2} =&nbsp;0b{bin1}&nbsp;&amp;&nbsp;0b{bin2} =&nbsp;0b{resultBin}
    =&nbsp;<strong>{resultBase10}</strong>
  </div>
</div>
