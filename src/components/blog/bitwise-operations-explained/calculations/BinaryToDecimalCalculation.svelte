<script lang="ts">
  import NumberGrid from '../common/NumberGrid.svelte';

  export let binary: string;

  let powersOfTwoReversed: number[],
    decimalDigitsReversed: number[],
    result: number;

  const descendingSeq = (limit: number): number[] =>
    [...Array(limit).keys()].reverse();

  $: {
    powersOfTwoReversed = [...Array(binary.length).keys()].reverse();
    decimalDigitsReversed = descendingSeq(binary.length)
      .filter((_, ix) => binary[ix] !== '0')
      .map((powerOfTwo) => Math.pow(2, powerOfTwo));

    result = decimalDigitsReversed.reduce((a, b) => a + b, 0);
  }
</script>

<NumberGrid rows={3} cols={binary.length}>
  {#each binary as digit, i}
    <div
      class="h-full {digit === '0'
        ? 'text-th-tertiary'
        : 'text-th-primary font-bold'}"
    >
      {digit}
    </div>
  {/each}
  {#each powersOfTwoReversed as powerOfTwo, ix}
    <div
      class="text-sm pt-4 {binary[ix] === '0'
        ? 'text-th-tertiary'
        : 'text-th-primary font-bold'}"
    >
      2<sup>{powerOfTwo}</sup>
    </div>
  {/each}
  {#each powersOfTwoReversed as powerOfTwo, ix}
    <div
      class="text-sm pt-4 {binary[ix] === '0'
        ? 'text-th-tertiary'
        : 'text-th-primary font-bold'}"
    >
      {Math.pow(2, powerOfTwo)}
    </div>
  {/each}
</NumberGrid>
<div class="font-mono text-th-primary pt-10">
  {#if decimalDigitsReversed.length}
    0b{binary} = {decimalDigitsReversed.join(' + ')} =&nbsp;<strong>{result}</strong>
  {:else}
    0b{binary} = 0
  {/if}
</div>
