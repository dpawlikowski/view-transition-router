import { test, expect } from '@playwright/test';

/**
 * These tests verify that the transition context (direction + type) is updated
 * correctly after every navigation. The status bar reads from useTransitionContext()
 * and is the observable proxy for what the library sets internally.
 */

test.describe('Transition context — TransitionLink', () => {
  test('slide link sets direction:forward and type:slide', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about/);

    await expect(page.getByTestId('status-direction')).toHaveText('forward');
    await expect(page.getByTestId('status-type')).toHaveText('slide');
  });

  test('fade link sets direction:forward and type:fade', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About (fade)' }).click();
    await expect(page).toHaveURL(/\/about/);

    await expect(page.getByTestId('status-direction')).toHaveText('forward');
    await expect(page.getByTestId('status-type')).toHaveText('fade');
  });

  test('consecutive navigations each update direction and type', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About (fade)' }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByTestId('status-type')).toHaveText('fade');

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('status-direction')).toHaveText('forward');
    await expect(page.getByTestId('status-type')).toHaveText('slide');
  });
});

test.describe('Transition context — browser back/forward', () => {
  test('browser back button sets direction:backward', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About', exact: true }).click();
    // Wait for page content, not just URL — _advanceHistoryRef is called after navigate(),
    // which happens inside the click handler synchronously before this assertion resolves.
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

    await expect(page.getByTestId('status-direction')).toHaveText('backward');
    // popstate falls back to defaultTransition ('slide')
    await expect(page.getByTestId('status-type')).toHaveText('slide');
  });

  test('browser forward button sets direction:forward', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

    await page.goForward();
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    await expect(page.getByTestId('status-direction')).toHaveText('forward');
  });
});

test.describe('Transition context — useTransitionNavigate', () => {
  test('"← Back (slide)" sets direction:backward and type:slide', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    await page.getByRole('button', { name: /Back/ }).click();

    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    await expect(page.getByTestId('status-direction')).toHaveText('backward');
    await expect(page.getByTestId('status-type')).toHaveText('slide');
  });

  test('"Home (fade)" button sets direction:forward and type:fade', async ({ page }) => {
    await page.goto('/about');

    await page.getByRole('button', { name: /Home/ }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('status-direction')).toHaveText('forward');
    await expect(page.getByTestId('status-type')).toHaveText('fade');
  });
});
