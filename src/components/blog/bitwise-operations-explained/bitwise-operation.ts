export class BitwiseOperation extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  createNumberGrid(rows, cols) {
    const grid = document.createElement('div');
    grid.className = 'font-mono text-3xl grid gap-4 justify-items-start';
    grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    return grid;
  }

  showCalculation(number1, number2) {
    const bin1 = number1.toString(2);
    const bin2 = number2.toString(2);
    const digits = Math.max(bin1.length, bin2.length);
    const bin1Padded = bin1.padStart(digits, '0');
    const bin2Padded = bin2.padStart(digits, '0');
    const resultBase10 = number1 & number2;
    const resultBin = resultBase10.toString(2);
    const resultBinPadded = resultBin.padStart(digits, '0');

    const container = document.createElement('div');
    container.className =
      'text-4xl text-th-primary font-mono flex flex-col overflow-x-auto gap-8';

    const grid = this.createNumberGrid(4, digits);

    // Row 1: Powers of 2
    for (let i = 0; i < digits; i++) {
      const cell = document.createElement('div');
      cell.className = 'text-sm text-th-secondary pt-2.5';
      cell.innerHTML = `2<sup>${digits - (i + 1)}</sup>`;
      grid.appendChild(cell);
    }

    // Row 2: First binary number
    for (let i = 0; i < digits; i++) {
      const cell = document.createElement('div');
      const char = bin1Padded[i];
      cell.className =
        char === '1' && bin2Padded[i] === '1'
          ? 'font-bold text-th-primary'
          : 'font-normal text-th-tertiary';
      cell.textContent = char;
      grid.appendChild(cell);
    }

    // Row 3: Second binary number
    for (let i = 0; i < digits; i++) {
      const cell = document.createElement('div');
      const char = bin2Padded[i];
      cell.className =
        char === '1' && bin1Padded[i] === '1'
          ? 'font-bold text-th-primary'
          : 'font-normal text-th-tertiary';
      cell.textContent = char;
      grid.appendChild(cell);
    }

    // Row 4: Result
    for (let i = 0; i < digits; i++) {
      const cell = document.createElement('div');
      const char = resultBinPadded[i];
      cell.className =
        char === '0' ? 'text-th-tertiary' : 'font-bold text-th-primary';
      cell.textContent = char;
      grid.appendChild(cell);
    }

    container.appendChild(grid);

    const summary = document.createElement('div');
    summary.className = 'pt-4 text-xl';
    const strong = document.createElement('strong');
    strong.textContent = String(resultBase10);
    summary.append(
      `${number1}\u00A0&\u00A0${number2} =\u00A00b${bin1}\u00A0&\u00A00b${bin2} =\u00A00b${resultBin} =\u00A0`,
      strong,
    );
    container.appendChild(summary);

    return container;
  }

  render() {
    const form = document.createElement('form');
    form.className = 'p-1 flex flex-wrap items-center gap-4';

    const input1 = document.createElement('input');
    input1.className =
      'w-1/4 sm:w-auto py-2 px-3 leading-tight shadow appearance-none focus:outline-none border rounded border-th-subtle dark:bg-th-subtle placeholder-th-tertiary dark:placeholder-th-secondary text-th-primary';
    input1.type = 'number';
    input1.id = 'num1';
    input1.name = 'number1';
    input1.required = true;
    input1.placeholder = 'Int 1';
    input1.min = '0';
    input1.step = '1';

    const separator = document.createElement('div');
    separator.className = 'font-mono text-th-primary sm:px-2';
    separator.textContent = '&';

    const input2 = document.createElement('input');
    input2.className =
      'w-1/4 sm:w-auto py-2 px-3 leading-tight shadow appearance-none focus:outline-none border rounded border-th-subtle dark:bg-th-subtle placeholder-th-tertiary dark:placeholder-th-secondary text-th-primary';
    input2.type = 'number';
    input2.id = 'num2';
    input2.name = 'number2';
    input2.required = true;
    input2.placeholder = 'Int 2';
    input2.min = '0';
    input2.step = '1';

    const button = document.createElement('button');
    button.type = 'submit';
    button.className =
      'py-2 px-4 rounded font-bold focus:outline-none bg-th-action hover:bg-th-action-focus transition-all text-th-background dark:text-th-primary';
    button.textContent = 'Go';

    form.appendChild(input1);
    form.appendChild(separator);
    form.appendChild(input2);
    form.appendChild(button);

    const resultContainer = document.createElement('div');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const number1 = parseInt(input1.value);
      const number2 = parseInt(input2.value);

      resultContainer.innerHTML = '';

      if (number1 > 2048 || number2 > 2048) {
        const error = document.createElement('div');
        error.className = 'font-semibold text-th-error';
        error.textContent = 'Please enter two numbers between 0 and 2048';
        resultContainer.appendChild(error);
      } else {
        const wrapper = document.createElement('div');
        wrapper.className = 'py-4';
        wrapper.appendChild(this.showCalculation(number1, number2));
        resultContainer.appendChild(wrapper);
      }
    });

    this.appendChild(form);
    this.appendChild(resultContainer);
  }
}

customElements.define('bitwise-operation', BitwiseOperation);
