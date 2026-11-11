// Click-through of every main flow. Run with `npm run test:e2e`.
import { expect, test } from '@playwright/test';

const toast = (page) => page.getByRole('status');
const dialog = (page) => page.getByRole('dialog');
const detail = (page) => page.locator('#box-detail');
const nav = (page, name) => page.getByRole('navigation', { name: 'Locations' }).getByRole('button', { name });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Warehouse', () => {
  test('shows the items table, an expanded item and a box label with a QR code', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Warehouse' })).toBeVisible();
    await expect(page.locator('.irow')).toHaveCount(8);
    await expect(page.locator('.irow[aria-expanded=true]')).toContainText('Tote bags');
    await expect(detail(page).locator('.qid')).toHaveText('BOX-001');
    await expect(detail(page).getByRole('img', { name: 'QR code for SSF-BOX-001' })).toBeVisible();
  });

  test('take out validates, then lowers the box and confirms', async ({ page }) => {
    await detail(page).getByRole('button', { name: 'Take out' }).click();
    await dialog(page).getByRole('button', { name: 'Give out' }).click();
    await expect(dialog(page).getByRole('alert')).toHaveText('Add a purpose so the movement can be traced later.');
    await dialog(page).getByLabel('Units').fill('2');
    await expect(dialog(page)).toContainText('BOX-001 will have10 left');
    await dialog(page).getByLabel('Purpose').fill('Clubs Day');
    await dialog(page).getByRole('button', { name: 'Give out' }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(toast(page)).toHaveText('Gave out 2 Tote bags A. BOX-001 has 10 left.');
    await expect(detail(page).locator('.dstock > b')).toHaveText('10');
    await expect(detail(page).locator('.hist li').first()).toContainText('Gave out for Clubs Day');
  });

  test('receive boxes chains into labels ready and selects the new box', async ({ page }) => {
    await page.getByRole('button', { name: 'Receive boxes' }).click();
    await dialog(page).getByLabel('Number of boxes').fill('2');
    await expect(dialog(page)).toContainText('BOX-062 to BOX-063');
    await dialog(page).getByRole('button', { name: 'Save and print labels' }).click();
    await expect(dialog(page).getByRole('heading', { name: '2 labels ready' })).toBeVisible();
    await expect(dialog(page).locator('.qlabel')).toHaveCount(2);
    await dialog(page).getByRole('button', { name: 'Done' }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(detail(page).locator('.qid')).toHaveText('BOX-062');
  });

  test('a new item and variant can be received in one go', async ({ page }) => {
    await page.getByRole('button', { name: 'Receive boxes' }).click();
    await dialog(page).getByLabel('Item', { exact: true }).selectOption('__new');
    await dialog(page).getByLabel('New item name').fill('Stickers');
    await dialog(page).getByLabel('Variant name').fill('Holographic');
    await dialog(page).getByRole('button', { name: 'Save and print labels' }).click();
    await dialog(page).getByRole('button', { name: 'Done' }).click();
    await expect(page.locator('.irow[aria-expanded=true]')).toContainText('Stickers');
    await expect(detail(page)).toContainText('Holographic');
  });

  test('typing a box number in Scan opens that box', async ({ page }) => {
    await page.getByRole('button', { name: 'Scan a box' }).click();
    await dialog(page).getByLabel('Or type the box number').fill('14');
    await dialog(page).getByRole('button', { name: 'Open box' }).click();
    await expect(toast(page)).toHaveText('Opened BOX-014, Pens A.');
    await expect(detail(page).locator('.qid')).toHaveText('BOX-014');
  });

  test('a count difference raises an alert that opens the box', async ({ page }) => {
    await page.locator('.brow', { hasText: 'BOX-002' }).click();
    await detail(page).getByRole('button', { name: 'Count' }).click();
    await dialog(page).getByLabel(/How many did you count/).fill('17');
    await expect(dialog(page).locator('.preview')).toContainText('−3');
    await dialog(page).getByRole('button', { name: 'Save count' }).click();
    await expect(toast(page)).toContainText('Difference of −3');
    await page.locator('.brow', { hasText: 'BOX-003' }).click();
    await page.locator('.flag', { hasText: 'BOX-002' }).click();
    await expect(detail(page).locator('.qid')).toHaveText('BOX-002');
  });

  test('reusable items check out and come back', async ({ page }) => {
    await page.locator('.irow', { hasText: 'Decorations' }).click();
    await page.locator('.vboxes button', { hasText: 'BOX-041' }).click();
    await detail(page).getByRole('button', { name: 'Check out' }).click();
    await dialog(page).getByLabel('Event').fill('Gala');
    await dialog(page).getByLabel('Units').fill('4');
    await dialog(page).getByRole('button', { name: 'Check out' }).click();
    await expect(toast(page)).toHaveText('4 Decorations B checked out to Gala.');
    await detail(page).getByRole('button', { name: 'Return' }).click();
    await dialog(page).getByRole('button', { name: 'Save return' }).click();
    await expect(toast(page)).toHaveText('All Decorations B are back from Gala.');
  });

  test('staff do not see manager-only actions or charts', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
    await expect(page.getByText('In and out, 14 days')).toBeVisible();
    await page.getByRole('group', { name: 'Role' }).getByRole('button', { name: 'Staff' }).click();
    await expect(page.getByText('Signed in as Sam')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add item' })).toHaveCount(0);
    await expect(page.getByText('In and out, 14 days')).toHaveCount(0);
    await expect(detail(page).getByRole('button', { name: /Remove/ })).toHaveCount(0);
  });

  test('changes survive a reload and Reset demo restores the seed', async ({ page }) => {
    await page.locator('.irow', { hasText: 'Pens' }).click();
    await page.getByRole('button', { name: 'Add variant' }).click();
    await dialog(page).getByLabel('What makes it different?').fill('Green ink');
    await dialog(page).getByRole('button', { name: 'Add variant' }).click();
    await page.reload();
    await expect(page.locator('.irow', { hasText: 'Pens' })).toContainText('C');
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await dialog(page).getByRole('button', { name: 'Reset' }).click();
    await expect(toast(page)).toHaveText('Demo data reset.');
    await expect(page.locator('.irow', { hasText: 'Pens' }).locator('.vchip')).toHaveCount(2);
  });
});

test.describe('Gaming room', () => {
  test('continue audit steps through items and cancelling leaves it incomplete', async ({ page }) => {
    await nav(page, 'Gaming room').click();
    await page.getByRole('button', { name: 'Continue audit, 6 left' }).click();
    await expect(dialog(page).getByRole('heading', { name: 'Audit, 6 left' })).toBeVisible();
    await dialog(page).getByRole('button', { name: 'Save and next' }).click();
    await expect(dialog(page).getByRole('heading', { name: 'Audit, 5 left' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Continue audit, 5 left' })).toBeVisible();
  });

  test('a finding needs a note, and follow up closes it', async ({ page }) => {
    await nav(page, 'Gaming room').click();
    await page.getByRole('row', { name: /NSW-01/ }).getByRole('button', { name: 'Check' }).click();
    await dialog(page).getByText('Not found').click();
    await dialog(page).getByRole('button', { name: 'Save' }).click();
    await expect(dialog(page).getByRole('alert')).toContainText('Add a short note');
    await dialog(page).getByLabel('Note (needed for a finding)').fill('Not in the cabinet');
    await dialog(page).getByRole('button', { name: 'Save' }).click();
    const finding = page.locator('.finding', { hasText: 'NSW-01' });
    await expect(finding).toBeVisible();
    await finding.getByRole('button', { name: 'Follow up' }).click();
    await dialog(page).getByLabel('Outcome').selectOption('found');
    await dialog(page).getByRole('button', { name: 'Save' }).click();
    await expect(toast(page)).toHaveText('NSW-01 closed as found.');
    await expect(page.locator('details.closed summary')).toHaveText('Closed (1)');
  });
});

test.describe('Snack stand', () => {
  test('confirm a reading, simulate a sale and switch the sales period', async ({ page }) => {
    await nav(page, 'Snack stand').click();
    await page.getByRole('button', { name: 'Confirm 10' }).click();
    await expect(toast(page)).toHaveText('Chips A stock set to 10.');
    await page.getByRole('button', { name: 'Simulate a sale' }).click();
    await expect(toast(page)).toContainText('received from Square');
    await expect(page.locator('.pay li').first()).toContainText(/\d{2}:\d{2}/);
    await page.getByRole('group', { name: 'Sales period' }).getByRole('button', { name: 'Last 7 days' }).click();
    await expect(page.getByRole('heading', { name: 'Sales by day' })).toBeVisible();
  });

  test('count by hand fixes a blocked view', async ({ page }) => {
    await nav(page, 'Snack stand').click();
    await page.getByRole('button', { name: 'Count by hand' }).click();
    await dialog(page).getByLabel('How many are on the shelf?').fill('9');
    await dialog(page).getByRole('button', { name: 'Save count' }).click();
    await expect(toast(page)).toHaveText('Cookies C set to 9.');
    await expect(page.getByRole('button', { name: 'Count by hand' })).toHaveCount(0);
  });
});

test('the sticky box label never covers the charts below it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const lowPanel = page.locator('.panel', { hasText: 'Running low' });
  await lowPanel.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(200);
  const detailBox = await detail(page).boundingBox();
  const lowBox = await lowPanel.boundingBox();
  expect(detailBox.y + detailBox.height).toBeLessThanOrEqual(lowBox.y);
});

test('no sideways scrolling at 390px on any page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ['Warehouse', 'Gaming room', 'Snack stand']) {
    await nav(page, name).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${name} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});
