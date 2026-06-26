import { test, expect } from '@playwright/test';

test.describe('Page navigation', () => {
  test('home page loads with correct content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    await expect(page.getByText('Featured card').first()).toBeVisible();
    await expect(page.getByText('Info card')).toBeVisible();
  });

  test('about page is accessible directly via URL', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
  });

  test('"About" nav link navigates to the about page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About', exact: true }).click();

    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
  });

  test('"Home" nav link navigates back to the home page', async ({ page }) => {
    await page.goto('/about');

    await page.getByRole('link', { name: 'Home' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
  });

  test('"About (fade)" nav link navigates to the about page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About (fade)' }).click();

    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
  });

  test('nav links are present on every page', async ({ page }) => {
    for (const url of ['/', '/about']) {
      await page.goto(url);
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'About (fade)' })).toBeVisible();
    }
  });
});
