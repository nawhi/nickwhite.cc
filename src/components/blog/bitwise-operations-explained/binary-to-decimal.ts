import { html, render } from 'lit-html';

export class BinaryToDecimal extends HTMLElement {
  connectedCallback(): void {
    this.renderComponent();
  }

  private showCalculation(binary: string) {
    const digits: number[] = [];

    // Row 1: Binary digits
    const row1 = Array.from(binary).map((digit) => {
      const className = digit === '0'
        ? 'h-full text-th-tertiary'
        : 'h-full text-th-primary font-bold';
      return html`<div class="${className}">${digit}</div>`;
    });

    // Row 2: Powers of 2
    const row2 = Array.from(binary).map((_, i) => {
      const powerOfTwo = binary.length - (i + 1);
      const className = binary[i] === '0'
        ? 'text-sm pt-4 text-th-tertiary'
        : 'text-sm pt-4 text-th-primary font-bold';
      return html`<div class="${className}">2<sup>${powerOfTwo}</sup></div>`;
    });

    // Row 3: Decimal values
    const row3 = Array.from(binary).map((_, i) => {
      const powerOfTwo = binary.length - (i + 1);
      const className = binary[i] === '0'
        ? 'text-sm pt-4 text-th-tertiary'
        : 'text-sm pt-4 text-th-primary font-bold';
      return html`<div class="${className}">${Math.pow(2, powerOfTwo)}</div>`;
    });

    // Calculate decimal digits for summary
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] !== '0') {
        const powerOfTwo = binary.length - (i + 1);
        digits.push(Math.pow(2, powerOfTwo));
      }
    }

    const summaryContent = digits.length
      ? html`0b${binary} = ${digits.join(' + ')} =&nbsp;<strong>${digits.reduce((a, b) => a + b, 0)}</strong>`
      : html`0b${binary} = 0`;

    return html`
      <div>
        <div
          class="font-mono text-3xl grid gap-4 justify-items-start"
          style="grid-template-rows: repeat(3, minmax(0, 1fr)); grid-template-columns: repeat(${binary.length}, minmax(0, 1fr))">
          ${row1}
          ${row2}
          ${row3}
        </div>
        <div class="font-mono text-th-primary pt-10">
          ${summaryContent}
        </div>
      </div>
    `;
  }

  private renderComponent(): void {
    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const binary = formData.get('number1') as string;

      let content;
      if (/[^01]/.test(binary)) {
        content = html`
          <div class="py-4">
            <div class="text-th-error font-semibold">
              Please enter a binary number, consisting only of digits 0 and 1
            </div>
          </div>
        `;
      } else if (binary.length > 12) {
        content = html`
          <div class="py-4">
            <div class="text-th-error font-semibold">
              Please enter no more than twelve digits
            </div>
          </div>
        `;
      } else {
        content = html`
          <div class="py-4">
            ${this.showCalculation(binary)}
          </div>
        `;
      }

      render(content, this.querySelector('#result-container') as HTMLElement);
    };

    const template = html`
      <form class="p-1 flex flex-wrap items-center gap-4" @submit=${handleSubmit}>
        <input
          class="py-2 px-3 leading-tight shadow appearance-none focus:outline-none border rounded border-th-subtle dark:bg-th-subtle placeholder-th-tertiary dark:placeholder-th-secondary text-th-primary"
          required
          name="number1"
          placeholder="Enter a binary number"
          inputmode="numeric"
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

customElements.define('binary-to-decimal', BinaryToDecimal);
