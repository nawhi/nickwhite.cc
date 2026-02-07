import { html, render } from 'lit-html';

export class BitwiseOperation extends HTMLElement {
  connectedCallback(): void {
    this.renderComponent();
  }

  private showCalculation(number1: number, number2: number) {
    const bin1 = number1.toString(2);
    const bin2 = number2.toString(2);
    const digits = Math.max(bin1.length, bin2.length);
    const bin1Padded = bin1.padStart(digits, '0');
    const bin2Padded = bin2.padStart(digits, '0');
    const resultBase10 = number1 & number2;
    const resultBin = resultBase10.toString(2);
    const resultBinPadded = resultBin.padStart(digits, '0');

    // Row 1: Powers of 2
    const row1 = Array.from({ length: digits }, (_, i) => {
      const power = digits - (i + 1);
      return html`<div class="text-sm text-th-secondary pt-2.5">2<sup>${power}</sup></div>`;
    });

    // Row 2: First binary number
    const row2 = Array.from(bin1Padded).map((char, i) => {
      const className = char === '1' && bin2Padded[i] === '1'
        ? 'font-bold text-th-primary'
        : 'font-normal text-th-tertiary';
      return html`<div class="${className}">${char}</div>`;
    });

    // Row 3: Second binary number
    const row3 = Array.from(bin2Padded).map((char, i) => {
      const className = char === '1' && bin1Padded[i] === '1'
        ? 'font-bold text-th-primary'
        : 'font-normal text-th-tertiary';
      return html`<div class="${className}">${char}</div>`;
    });

    // Row 4: Result
    const row4 = Array.from(resultBinPadded).map((char) => {
      const className = char === '0' ? 'text-th-tertiary' : 'font-bold text-th-primary';
      return html`<div class="${className}">${char}</div>`;
    });

    return html`
      <div class="text-4xl text-th-primary font-mono flex flex-col overflow-x-auto gap-8">
        <div
          class="font-mono text-3xl grid gap-4 justify-items-start"
          style="grid-template-rows: repeat(4, minmax(0, 1fr)); grid-template-columns: repeat(${digits}, minmax(0, 1fr))">
          ${row1}
          ${row2}
          ${row3}
          ${row4}
        </div>
        <div class="pt-4 text-xl">
          ${number1}&nbsp;&amp;&nbsp;${number2} =&nbsp;0b${bin1}&nbsp;&amp;&nbsp;0b${bin2} =&nbsp;0b${resultBin} =&nbsp;<strong>${resultBase10}</strong>
        </div>
      </div>
    `;
  }

  private renderComponent(): void {
    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const number1 = parseInt(formData.get('number1') as string, 10);
      const number2 = parseInt(formData.get('number2') as string, 10);

      let content;
      if (number1 > 2048 || number2 > 2048) {
        content = html`
          <div class="font-semibold text-th-error">
            Please enter two numbers between 0 and 2048
          </div>
        `;
      } else {
        content = html`
          <div class="py-4">
            ${this.showCalculation(number1, number2)}
          </div>
        `;
      }

      render(content, this.querySelector('#result-container') as HTMLElement);
    };

    const template = html`
      <form class="p-1 flex flex-wrap items-center gap-4" @submit=${handleSubmit}>
        <input
          class="w-1/4 sm:w-auto py-2 px-3 leading-tight shadow appearance-none focus:outline-none border rounded border-th-subtle dark:bg-th-subtle placeholder-th-tertiary dark:placeholder-th-secondary text-th-primary"
          type="number"
          id="num1"
          name="number1"
          required
          placeholder="Int 1"
          min="0"
          step="1"
        />
        <div class="font-mono text-th-primary sm:px-2">&</div>
        <input
          class="w-1/4 sm:w-auto py-2 px-3 leading-tight shadow appearance-none focus:outline-none border rounded border-th-subtle dark:bg-th-subtle placeholder-th-tertiary dark:placeholder-th-secondary text-th-primary"
          type="number"
          id="num2"
          name="number2"
          required
          placeholder="Int 2"
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

customElements.define('bitwise-operation', BitwiseOperation);
