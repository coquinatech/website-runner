import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dylanwatt.com/');
  await page.getByRole('link', { name: 'Home' }).click();
});