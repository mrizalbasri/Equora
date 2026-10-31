import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

test('reveals content on scroll and animates navigation without blocking controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveAttribute('data-motion-state', 'visible');
  const workflow = page.locator('#alur .section-intro');
  await expect(workflow).toHaveAttribute('data-motion-state', 'waiting');
  await workflow.scrollIntoViewIfNeeded();
  await expect(workflow).toHaveAttribute('data-motion-state', 'visible');

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.click();
  const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
  await expect(nav).toHaveCSS('animation-name', /mobile-nav-enter$/);
  await page.keyboard.press('Escape');
  await expect(nav).not.toBeVisible();
  await menu.click();
  await nav.getByRole('link', { name: 'Tentang', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('.about > h1')).not.toHaveAttribute('data-motion-state');
  expect(errors).toEqual([]);
});

test('landing scroll progress responds while hero links provide direct access', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('.landing-hero');
  await expect.poll(() => hero.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--landing-progress')))).toBe(0);
  await expect(page.getByRole('tablist', { name: 'Pratinjau Equora' })).toHaveCount(0);
  await expect(page.getByText('Ilustrasi fasilitas pendidikan', { exact: true })).toHaveCount(0);
  await expect(page.locator('.school-illustration')).toHaveAttribute('alt', /Ilustrasi sekolah/);
  await expect(page.locator('.hero-actions').getByRole('link', { name: 'Pendidikan di Daerah Saya' })).toHaveAttribute('href', '/daerah');
  await expect(page.locator('.hero-actions').getByRole('link', { name: 'Telusuri data pendidikan' })).toHaveAttribute('href', '/explore');
  await page.locator('#sumber').scrollIntoViewIfNeeded();
  await expect.poll(() => hero.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--landing-progress')))).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('workspace content stays still after leaving the landing page', async ({ page }) => {
  await mockWorkspace(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.hero-actions').getByRole('link', { name: 'Telusuri data pendidikan', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.locator('.workspace-heading')).toBeVisible();
  await expect(page.locator('.workspace [data-motion-state]')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.id.startsWith('equora-')).length)).toBe(0);
  const link = page.locator('.sidebar-link').first();
  await link.hover();
  await expect(link).toHaveCSS('translate', 'none');
});

test('reduced motion disables movement and keeps content and menus usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
  await expect(nav).toHaveCSS('animation-name', 'none');
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
  await page.locator('#alur').scrollIntoViewIfNeeded();
  await expect(page.locator('#workflow-title')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('changing motion preference cancels active reveal animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveAttribute('data-motion-state', 'visible');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await expect(page.locator('#hero-title')).toBeVisible();
});
