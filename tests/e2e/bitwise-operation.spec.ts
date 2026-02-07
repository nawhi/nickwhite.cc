import { test, expect } from '@playwright/test';

test.describe('Bitwise AND Operation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/bitwise');
    await page.waitForLoadState('networkidle');

    // Wait for the inputs to be visible (means component has hydrated)
    await page.locator('input[name="number1"][placeholder="Int 1"]').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should display two number inputs with correct attributes', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');

    await expect(input1).toBeVisible();
    await expect(input2).toBeVisible();

    await expect(input1).toHaveAttribute('type', 'number');
    await expect(input2).toHaveAttribute('type', 'number');
    await expect(input1).toHaveAttribute('required');
    await expect(input2).toHaveAttribute('required');
    await expect(input1).toHaveAttribute('min', '0');
    await expect(input2).toHaveAttribute('min', '0');
  });

  test('should display ampersand between inputs', async ({ page }) => {
    // The & symbol should be visible between the two inputs
    await expect(page.locator('text=/&/i').first()).toBeVisible();
  });

  test('should show result grid when valid numbers submitted', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('12');
    await input2.fill('10');
    await submitButton.click();

    // Should show result grid
    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });
  });


  test('should reject first number greater than 2048', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('2049');
    await input2.fill('10');
    await submitButton.click();

    await expect(page.locator('text=/Please enter two numbers between 0 and 2048/i')).toBeVisible();
  });

  test('should reject second number greater than 2048', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('10');
    await input2.fill('3000');
    await submitButton.click();

    await expect(page.locator('text=/Please enter two numbers between 0 and 2048/i')).toBeVisible();
  });

  test('should accept both numbers at maximum (2048)', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('2048');
    await input2.fill('2048');
    await submitButton.click();

    // Should show result, not error
    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Please enter two numbers between 0 and 2048/i')).not.toBeVisible();
  });

  test('visual regression: initial state', async ({ page }) => {
    await expect(page.locator('main')).toHaveScreenshot('bitwise-operation-initial.png');
  });

  test('visual regression: typical calculation', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('13');
    await input2.fill('9');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-typical.png');
  });

  test('visual regression: zero result (no matching bits)', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('8');
    await input2.fill('7');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-zero.png');
  });

  test('visual regression: both zeros', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('0');
    await input2.fill('0');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-bothzero.png');
  });

  test('visual regression: same number AND itself', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('42');
    await input2.fill('42');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-same.png');
  });

  test('visual regression: different bit lengths (padding)', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('255');
    await input2.fill('1');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-padding.png');
  });

  test('visual regression: error state', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('5000');
    await input2.fill('10');
    await submitButton.click();

    await expect(page.locator('text=/Please enter two numbers between 0 and 2048/i')).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-error.png');
  });

  test('visual regression: large numbers', async ({ page }) => {
    const input1 = page.locator('input[name="number1"][placeholder="Int 1"]');
    const input2 = page.locator('input[name="number2"][placeholder="Int 2"]');
    const submitButton = input1.locator('..').locator('button[type="submit"]');

    await input1.fill('1023');
    await input2.fill('512');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const main = page.locator('main');
    await expect(main).toHaveScreenshot('bitwise-operation-large.png');
  });
});
