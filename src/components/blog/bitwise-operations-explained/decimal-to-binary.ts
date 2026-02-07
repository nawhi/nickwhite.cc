import { html, render } from 'lit-html';

interface Step {
  val: number;
  stop: boolean;
}

export class DecimalToBinary extends HTMLElement {
  connectedCallback(): void {
    this.renderComponent();
  }

  private generateSteps(target: number): Step[] {
    const steps: Step[] = [];
    let i = 1;
    for (; target / i >= 1; i *= 2) {
      steps.push({ val: i, stop: false });
    }
    steps.push({ val: i, stop: true });
    return steps;
  }

  private showCalculation(number: number) {
    const steps = this.generateSteps(number);
    const binaryStr = number.toString(2);

    // Create steps grid
    const stepsRows = steps.map(({ val, stop }, i) => {
      const floorResult = Math.floor(number / val);
      const calcContent = stop
        ? html`⌊${number} ÷ 2<sup>${i}</sup>⌋&nbsp;= ${floorResult}<br />
            <span class="font-normal text-th-primary">(<strong>STOP:</strong> ${floorResult} &lt; 1)</span>`
        : html`⌊${number} ÷ 2<sup>${i}</sup>⌋&nbsp;= ${floorResult}<br />
            ${floorResult}&nbsp;%&nbsp;2&nbsp;=&nbsp;${floorResult % 2}`;

      return html`
        <div>2<sup>${i}</sup>:</div>
        <div class="col-span-3">${calcContent}</div>
        <div class="font-bold text-xl text-th-primary">
          ${stop ? '' : floorResult % 2}
        </div>
      `;
    });

    // Row 1: Powers of 2
    const row1 = Array.from(binaryStr).map((_, i) => {
      const power = binaryStr.length - (i + 1);
      return html`<div class="h-full text-sm py-2">2<sup>${power}</sup></div>`;
    });

    // Row 2: Binary digits
    const row2 = Array.from(binaryStr).map((char) => {
      return html`<div class="h-full">${char}</div>`;
    });

    return html`
      <div class="text-th-primary font-mono">
        <div
          class="text-th-secondary md:max-w-[50%] py-4 grid items-center text-center gap-3"
          style="grid-template-rows: repeat(${steps.length - 1}, minmax(0, 1fr)); grid-template-columns: repeat(5, minmax(0, 1fr))">
          ${stepsRows}
        </div>
        <div class="text-sm">Re-order the bits to give the result:</div>
        <div class="py-4">
          <div
            class="font-mono text-3xl grid gap-4 justify-items-start"
            style="grid-template-rows: repeat(2, minmax(0, 1fr)); grid-template-columns: repeat(${binaryStr.length}, minmax(0, 1fr))">
            ${row1}
            ${row2}
          </div>
        </div>
      </div>
    `;
  }

  private renderComponent(): void {
    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const number = parseInt(formData.get('number1') as string, 10);

      let content;
      if (number > 2048) {
        content = html`
          <div class="text-th-error font-semibold">
            Please enter a number between 0 and 2048
          </div>
        `;
      } else {
        content = this.showCalculation(number);
      }

      render(content, this.querySelector('#result-container') as HTMLElement);
    };

    const template = html`
      <form class="p-1 flex flex-wrap items-center gap-4" @submit=${handleSubmit}>
        <input
          class="py-2 px-3 leading-tight shadow appearance-none focus:outline-none border rounded border-th-subtle dark:bg-th-subtle placeholder-th-tertiary dark:placeholder-th-secondary text-th-primary"
          type="number"
          id="num1"
          name="number1"
          required
          placeholder="Enter an integer"
          min="0"
          step="1"
        />
        <button
          type="submit"
          class="py-2 px-4 rounded font-bold focus:outline-none bg-th-action hover:bg-th-action-focus transition-all text-th-background dark:text-th-primary"
        >
          Go
        </button>
      </form>
      <div id="result-container"></div>
    `;

    render(template, this);
  }
}

customElements.define('decimal-to-binary', DecimalToBinary);
