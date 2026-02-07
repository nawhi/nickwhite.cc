# E2E Tests for Bitwise Operations Components

This directory contains end-to-end tests for the interactive bitwise operations components using Playwright.

## Test Coverage

The tests are designed to be **implementation-agnostic** - they do not rely on Svelte-specific selectors or implementation details, so they will continue to work when the components are rewritten in vanilla JavaScript.

### Components Tested

1. **Binary to Decimal Converter** (`binary-to-decimal.spec.ts`)
   - Input validation (binary digits only, max 12 digits)
   - Correct decimal conversion
   - Display of powers of 2 breakdown
   - Visual highlighting of active bits
   - Edge cases (all zeros, single digit, etc.)

2. **Decimal to Binary Converter** (`decimal-to-binary.spec.ts`)
   - Input validation (0-2048 range)
   - Step-by-step conversion display
   - Floor division and modulo operations
   - Final binary result grid
   - Edge cases (zero, powers of 2, etc.)

3. **Bitwise AND Operation** (`bitwise-operation.spec.ts`)
   - Two number inputs validation (0-2048 range)
   - Correct bitwise AND calculation
   - Binary padding for different length numbers
   - Visual grid display with powers of 2
   - Bit highlighting (matching vs non-matching)
   - Edge cases (zero, same number, etc.)

## Test Types

Each component has:

1. **Behavioral Tests**: Test the functionality and user interactions
   - Form submission
   - Input validation
   - Calculation accuracy
   - Error messages

2. **Visual Regression Tests**: Compare screenshots to detect UI changes
   - Initial state
   - Valid result display
   - Error states
   - Edge cases

## Running the Tests

### Prerequisites

Install Playwright browsers (first time only):

```bash
pnpm exec playwright install
```

### Run All Tests

```bash
pnpm test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
pnpm test:e2e:ui
```

### Run Tests in Headed Mode (Watch browser)

```bash
pnpm test:e2e:headed
```

### Update Visual Regression Snapshots

After intentional UI changes, update the baseline screenshots:

```bash
pnpm test:e2e:update-snapshots
```

### Run Specific Test File

```bash
pnpm exec playwright test binary-to-decimal
```

### Run Tests on Specific Browser

```bash
pnpm exec playwright test --project=firefox
```

## Test Strategy

### Implementation Independence

The tests use semantic selectors based on:
- Input attributes (`name`, `placeholder`, `type`)
- Text content (calculation results, error messages)
- ARIA roles and accessible elements
- CSS classes that describe layout (e.g., `.blog-widget`)

The tests **avoid**:
- Svelte-specific selectors (e.g., `[data-svelte-*]`)
- Component-specific class names
- Implementation-specific DOM structure

### Visual Regression

Screenshots are taken of:
- The entire widget container (`.blog-widget`)
- Different states (initial, result, error)
- Various input combinations

This ensures that visual changes (styling, layout, spacing) are caught even when behavior remains correct.

## CI/CD Integration

The tests are configured to run in CI environments with:
- 2 retries on failure
- Single worker (to avoid conflicts)
- Automatic server startup
- Screenshot and trace on failure

## Debugging Failed Tests

### View Test Report

```bash
pnpm exec playwright show-report
```

### Debug Specific Test

```bash
pnpm exec playwright test --debug binary-to-decimal
```

### View Screenshots/Traces

Failed test artifacts are saved in `test-results/` directory.

## Updating Tests for Vanilla JS Migration

When migrating components from Svelte to vanilla JavaScript:

1. Keep the same HTML structure and attributes where possible
2. Maintain the same class names (`.blog-widget`, etc.)
3. Ensure form submissions work the same way
4. Keep input attributes consistent
5. Run tests to verify behavior is preserved
6. Update snapshots if visual changes are intentional

The tests should require minimal or no changes during the migration.
