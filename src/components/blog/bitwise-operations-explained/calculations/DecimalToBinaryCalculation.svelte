<script lang="ts">
  import NumberGrid from '../common/NumberGrid.svelte';

  export let number: number;
  const generateSteps = (target: number): { val: number; stop: boolean }[] => {
    const steps = [];
    let i = 1;
    for (; target / i >= 1; i *= 2) {
      steps.push({ val: i, stop: false });
    }
    steps.push({ val: i, stop: true });
    return steps;
  };

  $: steps = generateSteps(number);
</script>

<div class="text-th-primary font-mono">
  <div
    class="text-th-secondary md:max-w-[50%] py-4 grid grid-rows-{steps.length -
      1} grid-cols-5 items-center text-center gap-3"
  >
    {#each steps as { val, stop }, i}
      <div>
        2<sup>{i}</sup>:
      </div>
      <div class="col-span-3">
        &LeftFloor;{number} &div; 2<sup>{i}</sup>&RightFloor;&nbsp;= {Math.floor(
          number / val,
        )}
        <br />
        {#if stop}
          <span class="font-normal text-th-primary"
            >(<strong>STOP:</strong> {Math.floor(number / val)} &lt; 1)</span
          >
        {:else}
          {Math.floor(
            number / val,
          )}&nbsp;&percnt;&nbsp;2&nbsp;=&nbsp;{Math.floor(number / val) % 2}
        {/if}
      </div>
      <div class="font-bold text-xl text-th-primary">
        {#if !stop}
          {Math.floor(number / val) % 2}
        {/if}
      </div>
    {/each}
  </div>
  <div class="text-sm">Re-order the bits to give the result:</div>
  <div class="py-4">
    <NumberGrid rows={2} cols={number.toString(2).length}>
      {#each number.toString(2) as _, i}
        <div class="h-full text-sm py-2">
          2<sup>{number.toString(2).length - (i + 1)}</sup>
        </div>
      {/each}
      {#each number.toString(2) as digit}
        <div class="h-full">{digit}</div>
      {/each}
    </NumberGrid>
  </div>
</div>
