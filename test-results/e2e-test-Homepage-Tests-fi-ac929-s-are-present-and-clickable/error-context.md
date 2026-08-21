# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-test.spec.js >> Homepage Tests >> filter chips are present and clickable
- Location: e2e-test.spec.js:44:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.chip[data-tag="All"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.chip[data-tag="All"]')

```

```yaml
- banner:
  - link " boxedSneaks":
    - /url: index.html
  - link " Home":
    - /url: index.html
  - link " About":
    - /url: boxedAboutUs.html
  - link " Cart 0":
    - /url: boxedCart.html
  - link " Contact":
    - /url: boxedContacts.html
  - link " Login":
    - /url: pages/login.html
  - textbox "Search sneakers":
    - /placeholder: Search kicks...
  - button ""
- text:  Fresh kicks updated for your next order
- heading "step into the culture." [level=1]
- paragraph: Free delivery nationwide • 100% authentic look • mobile-friendly shopping
- text: No products matched your search
- button "All"
- button "Trending"
- button "Premium"
- button "Running"
- button "Boots"
- heading "No products found" [level=3]
- paragraph: Try a different search or check back later for new arrivals!
- contentinfo:
  - text: 
  - strong: Free Delivery
  - text: Nationwide via Paxi, Uber, Aramex 
  - strong: 100% Authentic
  - text: Guaranteed genuine products 
  - strong: WhatsApp Support
  - text: +27 65 094 7689 
  - strong: South Africa
  - text: Serving nationwide
  - link "About Us":
    - /url: boxedAboutUs.html
  - text: "|"
  - link "Contact":
    - /url: boxedContacts.html
  - text: "|"
  - link "Returns & Refunds":
    - /url: "#returns"
  - paragraph: © 2025 Boxed Sneakers. Premium kicks. 
- text:  Site is currently in development. You may experience minor interruptions.
```

# Test source

```ts
  1   | /**
  2   |  * End-to-End Tests for Boxed Sneakers E-commerce Site
  3   |  * Tests user flows as an end user would experience them
  4   |  */
  5   | 
  6   | import { test, expect } from '@playwright/test';
  7   | 
  8   | const BASE_URL = 'http://localhost:8080';
  9   | 
  10  | // Helper function to wait for products to load
  11  | test.beforeEach(async ({ page }) => {
  12  |   // Block Firebase connections to avoid auth issues during testing
  13  |   await page.route('https://*.firebaseio.com/**', route => route.abort());
  14  |   await page.route('https://*.googleapis.com/**', route => route.abort());
  15  |   await page.route('https://identitytoolkit.googleapis.com/**', route => route.abort());
  16  |   await page.route('https://www.googletagmanager.com/**', route => route.abort());
  17  | });
  18  | 
  19  | test.describe('Homepage Tests', () => {
  20  |   test('homepage loads with correct title and branding', async ({ page }) => {
  21  |     await page.goto(`${BASE_URL}/index.html`);
  22  |     
  23  |     // Verify page title
  24  |     await expect(page).toHaveTitle(/boxedSneaks|Boxed Sneakers/i);
  25  |     
  26  |     // Verify logo is visible
  27  |     await expect(page.locator('.logo')).toBeVisible();
  28  |     
  29  |     // Verify navigation links
  30  |     await expect(page.locator('.nav-links a:has-text("Home")')).toBeVisible();
  31  |     await expect(page.locator('.nav-links a:has-text("About")')).toBeVisible();
  32  |     await expect(page.locator('.nav-links a:has-text("Cart")')).toBeVisible();
  33  |     await expect(page.locator('.nav-links a:has-text("Contact")')).toBeVisible();
  34  |   });
  35  | 
  36  |   test('hero section displays correctly', async ({ page }) => {
  37  |     await page.goto(`${BASE_URL}/index.html`);
  38  |     
  39  |     // Verify hero content
  40  |     await expect(page.locator('.hero h1')).toContainText(/step into/i);
  41  |     await expect(page.locator('.hero p')).toContainText(/Free delivery/i);
  42  |   });
  43  | 
  44  |   test('filter chips are present and clickable', async ({ page }) => {
  45  |     await page.goto(`${BASE_URL}/index.html`);
  46  |     
  47  |     // Wait for filter chips to be present
  48  |     const chips = page.locator('.chip');
  49  |     await expect(chips).toHaveCount(5);
  50  |     
  51  |     // Verify chip labels
  52  |     const expectedTags = ['All', 'Trending', 'Premium', 'Running', 'Boots'];
  53  |     for (const tag of expectedTags) {
> 54  |       await expect(page.locator(`.chip[data-tag="${tag}"]`)).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  55  |     }
  56  |   });
  57  | 
  58  |   test('search functionality exists', async ({ page }) => {
  59  |     await page.goto(`${BASE_URL}/index.html`);
  60  |     
  61  |     // Verify search input
  62  |     await expect(page.locator('#searchInput')).toBeVisible();
  63  |     await expect(page.locator('#searchInput')).toHaveAttribute('placeholder', /Search/i);
  64  |     
  65  |     // Verify search button
  66  |     await expect(page.locator('#searchBtn')).toBeVisible();
  67  |   });
  68  | 
  69  |   test('product grid container exists', async ({ page }) => {
  70  |     await page.goto(`${BASE_URL}/index.html`);
  71  |     
  72  |     // Verify product grid
  73  |     await expect(page.locator('#product-grid')).toBeVisible();
  74  |     
  75  |     // Verify results copy is present
  76  |     await expect(page.locator('#resultsCopy')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('cart badge shows initially as 0', async ({ page }) => {
  80  |     await page.goto(`${BASE_URL}/index.html`);
  81  |     
  82  |     // Verify cart badge
  83  |     await expect(page.locator('#cartCountDisplay')).toHaveText('0');
  84  |   });
  85  | });
  86  | 
  87  | test.describe('Navigation Tests', () => {
  88  |   test('can navigate to About page', async ({ page }) => {
  89  |     await page.goto(`${BASE_URL}/index.html`);
  90  |     await page.click('.nav-links a:has-text("About")');
  91  |     
  92  |     await expect(page).toHaveURL(/boxedAboutUs\.html/);
  93  |     await expect(page.locator('h1')).toContainText(/About/i);
  94  |   });
  95  | 
  96  |   test('can navigate to Contact page', async ({ page }) => {
  97  |     await page.goto(`${BASE_URL}/index.html`);
  98  |     await page.click('.nav-links a:has-text("Contact")');
  99  |     
  100 |     await expect(page).toHaveURL(/boxedContacts\.html/);
  101 |     await expect(page.locator('h1')).toContainText(/help you/i);
  102 |   });
  103 | 
  104 |   test('can navigate to Cart page', async ({ page }) => {
  105 |     await page.goto(`${BASE_URL}/index.html`);
  106 |     await page.click('.nav-links a:has-text("Cart")');
  107 |     
  108 |     await expect(page).toHaveURL(/boxedCart\.html/);
  109 |     await expect(page.locator('h1')).toContainText(/bag/i);
  110 |   });
  111 | 
  112 |   test('logo links back to homepage', async ({ page }) => {
  113 |     await page.goto(`${BASE_URL}/boxedAboutUs.html`);
  114 |     await page.click('.logo');
  115 |     
  116 |     await expect(page).toHaveURL(/index\.html/);
  117 |   });
  118 | });
  119 | 
  120 | test.describe('Cart Page Tests', () => {
  121 |   test('cart page shows empty state initially', async ({ page }) => {
  122 |     await page.goto(`${BASE_URL}/boxedCart.html`);
  123 |     
  124 |     // Verify empty cart message
  125 |     await expect(page.locator('#cartItemsList')).toBeVisible();
  126 |     
  127 |     // Verify totals show 0
  128 |     await expect(page.locator('#cartTotal')).toHaveText('0.00');
  129 |     await expect(page.locator('#finalTotal')).toHaveText('0.00');
  130 |     await expect(page.locator('#mobileTotal')).toHaveText('0.00');
  131 |   });
  132 | 
  133 |   test('cart page has payment section', async ({ page }) => {
  134 |     await page.goto(`${BASE_URL}/boxedCart.html`);
  135 |     
  136 |     // Verify banking details section
  137 |     await expect(page.locator('.payment-card')).toBeVisible();
  138 |     await expect(page.locator('.bank-detail')).toContainText(/TymeBank/i);
  139 |     await expect(page.locator('.bank-detail')).toContainText(/53000794861/i);
  140 |   });
  141 | 
  142 |   test('cart page has contact links', async ({ page }) => {
  143 |     await page.goto(`${BASE_URL}/boxedCart.html`);
  144 |     
  145 |     // Verify contact options
  146 |     await expect(page.locator('.contact-links')).toBeVisible();
  147 |     await expect(page.locator('a:has-text("Instagram")')).toBeVisible();
  148 |     await expect(page.locator('a:has-text("WhatsApp")')).toBeVisible();
  149 |     await expect(page.locator('a:has-text("Email")')).toBeVisible();
  150 |   });
  151 | 
  152 |   test('clear cart button exists', async ({ page }) => {
  153 |     await page.goto(`${BASE_URL}/boxedCart.html`);
  154 |     
```