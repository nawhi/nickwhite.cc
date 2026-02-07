import { test, expect } from '@playwright/test';

test.describe('Binary to Decimal Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/binary-to-decimal');
    await page.waitForLoadState('networkidle');

    // Wait for the input to be visible (means component has hydrated)
    await page.locator('input[name="number1"][placeholder="Enter a binary number"]').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should display input field with correct placeholder', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    await expect(input).toHaveAttribute('required');
  });

  test('should show calculation result when valid binary submitted', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('1010');
    await submitButton.click();

    // Check that a result grid is displayed (wait for calculation to render)
    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should reject non-binary input', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('102'); // Contains '2', not binary
    await submitButton.click();

    await expect(page.locator('text=/Please enter a binary number.*only.*digits.*0.*and.*1/i')).toBeVisible();
  });

  test('should reject binary numbers longer than 12 digits', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('1010101010101'); // 13 digits
    await submitButton.click();

    await expect(page.locator('text=/Please enter no more than twelve digits/i')).toBeVisible();
  });

  test('should accept exactly 12 binary digits', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('111111111111'); // Exactly 12 digits
    await submitButton.click();

    // Should show result, not error
    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Please enter no more than twelve digits/i')).not.toBeVisible();
  });

  test('visual regression: initial state', async ({ page }) => {
    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-initial.png');
  });

  test('visual regression: calculation with powers of 2', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('101');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-calculation.png');
  });

  test('visual regression: all zeros', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('0000');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-zeros.png');
  });

  test('visual regression: single digit', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('1');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-single.png');
  });

  test('visual regression: max length (12 digits)', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('111111111111');
    await submitButton.click();

    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 5000 });

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-maxlength.png');
  });

  test('visual regression: error state - invalid input', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('12345');
    await submitButton.click();

    await expect(page.locator('text=/Please enter a binary number/i')).toBeVisible();

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-error-invalid.png');
  });

  test('visual regression: error state - too long', async ({ page }) => {
    const input = page.locator('input[name="number1"][placeholder="Enter a binary number"]');
    const submitButton = input.locator('..').locator('button[type="submit"]');

    await input.fill('1111111111111');
    await submitButton.click();

    await expect(page.locator('text=/Please enter no more than twelve digits/i')).toBeVisible();

    const section = page.locator('main');
    await expect(section).toHaveScreenshot('binary-to-decimal-error-toolong.png');
  });
});
