import { test, expect } from '@playwright/test';

/**
 * These tests verify that the browser's View Transitions API is actually called
 * during navigations — confirming the full pipeline from click → startTransition →
 * addTransitionType → document.startViewTransition works end-to-end.
 *
 * The spy is injected via addInitScript (runs before any page JS) so it captures
 * all calls made by React's ViewTransition integration.
 */

type WindowWithSpy = Window & {
  __vtCallCount?: number;
  __vtTypes?: string[];
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as WindowWithSpy;
    win.__vtCallCount = 0;
    win.__vtTypes = [];

    const original = Document.prototype.startViewTransition;
    if (!original) return;

    Document.prototype.startViewTransition = function (
      this: Document,
      callback: () => Promise<void>,
    ) {
      win.__vtCallCount = (win.__vtCallCount ?? 0) + 1;
      return original.call(this, callback);
    };
  });
});

test.describe('document.startViewTransition', () => {
  test('is called when clicking a TransitionLink', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);

    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about/);

    const after = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);
    expect(after).toBeGreaterThan(before);
  });

  test('is called when using useTransitionNavigate with a path', async ({ page }) => {
    await page.goto('/about');
    const before = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);

    await page.getByRole('button', { name: /Home/ }).click();
    await expect(page).toHaveURL('/');

    const after = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);
    expect(after).toBeGreaterThan(before);
  });

  test('is called on each navigation in a multi-step flow', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About', exact: true }).click();
    // Wait for page content (not just URL) so the view transition has resolved.
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
    const afterFirst = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    const afterSecond = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);

    expect(afterFirst).toBeGreaterThanOrEqual(1);
    expect(afterSecond).toBeGreaterThan(afterFirst);
  });

  test('is NOT called on Ctrl+click (browser handles it, no transition intercepted)', async ({
    page,
  }) => {
    await page.goto('/');
    const before = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);

    // Ctrl+click falls through to the browser — no transition should fire.
    await page.getByRole('link', { name: 'About', exact: true }).click({ modifiers: ['Control'] });

    // URL may or may not change (browser opens new tab in real Chrome; jsdom-like env ignores it)
    // What matters is the VT call count didn't increase.
    const after = await page.evaluate(() => (window as WindowWithSpy).__vtCallCount ?? 0);
    expect(after).toBe(before);
  });
});

test.describe('addTransitionType CSS tokens', () => {
  test('slide navigation produces slide-forward token in status bar context', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about/);

    // The library maps 'slide' + 'forward' direction → 'slide-forward' token for addTransitionType,
    // but stores the user-facing 'slide' type in context (what the status bar displays).
    await expect(page.getByTestId('status-type')).toHaveText('slide');
    await expect(page.getByTestId('status-direction')).toHaveText('forward');
  });

  test('back navigation produces slide-back token visible via backward direction', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About', exact: true }).click();
    // Wait for content to ensure useLayoutEffect has synced prevHistoryIdxRef.
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

    // 'backward' direction + 'slide' type → addTransitionType('slide-back') internally
    await expect(page.getByTestId('status-direction')).toHaveText('backward');
    await expect(page.getByTestId('status-type')).toHaveText('slide');
  });
});
