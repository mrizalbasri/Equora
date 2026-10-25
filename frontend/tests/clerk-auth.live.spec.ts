import { test, expect } from '@playwright/test';
import { createClerkClient } from '@clerk/backend';
import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';

test.use({ screenshot: 'only-on-failure' });
test.describe('Clerk development integration', () => {
  test.skip(process.env.EQUORA_CLERK_LIVE !== '1', 'Opt in with development Clerk keys only');
  test('sign-up, verified account, reload, sign-out and sign-in', async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const publishableKey = process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    expect(publishableKey?.startsWith('pk_test_')).toBeTruthy();
    expect(secretKey?.startsWith('sk_test_')).toBeTruthy();
    const client = createClerkClient({ publishableKey, secretKey });
    const email = `equora-${Date.now()}+clerk_test@example.com`;
    const password = `Synthetic-Only-${crypto.randomUUID()}`;
    await clerkSetup({ publishableKey });
    await setupClerkTestingToken({ page });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('/account');
      await expect(page).toHaveURL(/\/sign-in/);
      await expect(page.getByLabel('Email address', { exact: true })).toBeVisible({ timeout: 30_000 });
      await page.screenshot({ path: testInfo.outputPath('clerk-sign-in-desktop.png'), fullPage: true });
      await page.goto('/sign-up');
      await page.getByLabel('Email address', { exact: true }).fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      const code = page.getByRole('textbox', { name: 'Enter verification code', exact: true });
      await expect(code).toBeVisible({ timeout: 30_000 });
      await code.fill('424242');
      await page.waitForURL('**/account', { timeout: 30_000 });
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Akun saya', exact: true })).toBeVisible();
      console.log('PASS real Clerk sign-up, email verification, account SSR and reload');
      await page.getByRole('button', { name: 'Keluar', exact: true }).click();
      await expect(page).toHaveURL('/');
      await page.goto('/account');
      await expect(page).toHaveURL(/\/sign-in/);
      await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
      await page.getByLabel('Email address', { exact: true }).fill(email);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.waitForURL('**/account', { timeout: 30_000 });
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Keluar', exact: true }).click();
      await expect(page).toHaveURL('/');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/sign-in');
      await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await page.screenshot({ path: testInfo.outputPath('clerk-sign-in-mobile.png'), fullPage: true });
      expect(errors).toEqual([]);
    } finally {
      const users = await client.users.getUserList({ emailAddress: [email] });
      for (const user of users.data) await client.users.deleteUser(user.id);
    }
  });
});
