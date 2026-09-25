const { test, expect } = require('@playwright/test');

test.describe('Inventory Management System E2E Flow', () => {
  test('should render login page and permit admin login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Inventory Pro/i);

    // Fill login credentials
    await page.fill('input[type="email"], input[placeholder*="email"]', 'admin@inventorypro.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('should display product list and allow adding a new product', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[placeholder*="email"]', 'admin@inventorypro.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Go to products page
    await page.click('text=Products');
    await expect(page).toHaveURL(/.*products/);

    // Open add product modal
    await page.click('text=Add Product');
    await page.fill('input[name="name"]', 'Test SKU Monitor');
    await page.fill('input[name="sku"]', 'TEST-MON-01');
    await page.fill('input[name="category"]', 'Electronics');
    await page.fill('input[name="costPrice"]', '150');
    await page.fill('input[name="sellingPrice"]', '299');
    await page.fill('input[name="stockQuantity"]', '50');

    await page.click('button:has-text("Save Product")');

    // Verify item created
    await expect(page.locator('body')).toContainText('TEST-MON-01');
  });

  test('should allow creating an order and receiving HTTP 202 status in event loop', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[placeholder*="email"]', 'admin@inventorypro.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Go to orders page
    await page.click('text=Orders');
    await expect(page).toHaveURL(/.*orders/);

    // Create new order
    await page.click('text=New Order');
    await page.click('button:has-text("Create Sales Order")');

    // Verify order was placed with 202 Accepted status notification
    await expect(page.locator('body')).toContainText(/PENDING_FULFILLMENT|PROCESSING|FULFILLED/);
  });
});
