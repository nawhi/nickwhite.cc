import { test, expect } from '@playwright/test';

test.describe('Decimal to Binary Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/decimal-to-binary');
    await page.waitForLoadState('networkidle');

    // Wait for the input to be visible (means component has hydrated)
    await page
      .locator('input[name="number1"][placeholder="Enter an integer"]')
      .waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should display input field with correct attributes', async ({
    page,
  }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'number');
    await expect(input).toHaveAttribute('required');
    await expect(input).toHaveAttribute('min', '0');
    await expect(input).toHaveAttribute('step', '1');
  });

  test('should show calculation steps when valid number submitted', async ({
    page,
  }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('10');
    await submitButton.click();

    // Should show calculation steps with STOP marker
    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    // Should show final result grid
    await expect(page.locator('[class*="grid"]').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should reject numbers greater than 2048', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('2049');
    await submitButton.click();

    await expect(
      page.locator('text=/Please enter a number between 0 and 2048/i'),
    ).toBeVisible();
  });

  test('should accept 2048 as valid input', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('2048');
    await submitButton.click();

    // Should show calculation steps, not error
    await expect(page.locator('text=/STOP/i')).toBeVisible();
    await expect(
      page.locator('text=/Please enter a number between 0 and 2048/i'),
    ).not.toBeVisible();
  });

  test('visual regression: initial state', async ({ page }) => {
    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-initial.png');
  });

  test('visual regression: typical calculation', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('42');
    await submitButton.click();

    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-calculation.png');
  });

  test('visual regression: power of 2', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('8');
    await submitButton.click();

    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-powerof2.png');
  });

  test('visual regression: zero', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('0');
    await submitButton.click();

    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-zero.png');
  });

  test('visual regression: floor division with remainder', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('5');
    await submitButton.click();

    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-remainder.png');
  });

  test('visual regression: large number', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('2048');
    await submitButton.click();

    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-large.png');
  });

  test('visual regression: error state', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('3000');
    await submitButton.click();

    await expect(
      page.locator('text=/Please enter a number between 0 and 2048/i'),
    ).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-error.png');
  });

  test('visual regression: small number result', async ({ page }) => {
    const input = page.locator(
      'input[name="number1"][placeholder="Enter an integer"]',
    );
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('3');
    await submitButton.click();

    await expect(page.locator('text=/STOP/i')).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('decimal-to-binary-small.png');
  });
});
