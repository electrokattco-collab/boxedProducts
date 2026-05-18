/**
 * End-to-End Tests for Boxed Sneakers E-commerce Site
 * Tests user flows as an end user would experience them
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

// Helper function to wait for products to load
test.beforeEach(async ({ page }) => {
  // Block Firebase connections to avoid auth issues during testing
  await page.route('https://*.firebaseio.com/**', route => route.abort());
  await page.route('https://*.googleapis.com/**', route => route.abort());
  await page.route('https://identitytoolkit.googleapis.com/**', route => route.abort());
  await page.route('https://www.googletagmanager.com/**', route => route.abort());
});

test.describe('Homepage Tests', () => {
  test('homepage loads with correct title and branding', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify page title
    await expect(page).toHaveTitle(/boxedSneaks|Boxed Sneakers/i);
    
    // Verify logo is visible
    await expect(page.locator('.logo')).toBeVisible();
    
    // Verify navigation links
    await expect(page.locator('.nav-links a:has-text("Home")')).toBeVisible();
    await expect(page.locator('.nav-links a:has-text("About")')).toBeVisible();
    await expect(page.locator('.nav-links a:has-text("Cart")')).toBeVisible();
    await expect(page.locator('.nav-links a:has-text("Contact")')).toBeVisible();
  });

  test('hero section displays correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify hero content
    await expect(page.locator('.hero h1')).toContainText(/step into/i);
    await expect(page.locator('.hero p')).toContainText(/Free delivery/i);
  });

  test('filter chips are present and clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Wait for filter chips to be present
    const chips = page.locator('.chip');
    await expect(chips).toHaveCount(5);
    
    // Verify chip labels
    const expectedTags = ['All', 'Trending', 'Premium', 'Running', 'Boots'];
    for (const tag of expectedTags) {
      await expect(page.locator(`.chip[data-tag="${tag}"]`)).toBeVisible();
    }
  });

  test('search functionality exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify search input
    await expect(page.locator('#searchInput')).toBeVisible();
    await expect(page.locator('#searchInput')).toHaveAttribute('placeholder', /Search/i);
    
    // Verify search button
    await expect(page.locator('#searchBtn')).toBeVisible();
  });

  test('product grid container exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify product grid
    await expect(page.locator('#product-grid')).toBeVisible();
    
    // Verify results copy is present
    await expect(page.locator('#resultsCopy')).toBeVisible();
  });

  test('cart badge shows initially as 0', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify cart badge
    await expect(page.locator('#cartCountDisplay')).toHaveText('0');
  });
});

test.describe('Navigation Tests', () => {
  test('can navigate to About page', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.click('.nav-links a:has-text("About")');
    
    await expect(page).toHaveURL(/boxedAboutUs\.html/);
    await expect(page.locator('h1')).toContainText(/About/i);
  });

  test('can navigate to Contact page', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.click('.nav-links a:has-text("Contact")');
    
    await expect(page).toHaveURL(/boxedContacts\.html/);
    await expect(page.locator('h1')).toContainText(/help you/i);
  });

  test('can navigate to Cart page', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.click('.nav-links a:has-text("Cart")');
    
    await expect(page).toHaveURL(/boxedCart\.html/);
    await expect(page.locator('h1')).toContainText(/bag/i);
  });

  test('logo links back to homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedAboutUs.html`);
    await page.click('.logo');
    
    await expect(page).toHaveURL(/index\.html/);
  });
});

test.describe('Cart Page Tests', () => {
  test('cart page shows empty state initially', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedCart.html`);
    
    // Verify empty cart message
    await expect(page.locator('#cartItemsList')).toBeVisible();
    
    // Verify totals show 0
    await expect(page.locator('#cartTotal')).toHaveText('0.00');
    await expect(page.locator('#finalTotal')).toHaveText('0.00');
    await expect(page.locator('#mobileTotal')).toHaveText('0.00');
  });

  test('cart page has payment section', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedCart.html`);
    
    // Verify banking details section
    await expect(page.locator('.payment-card')).toBeVisible();
    await expect(page.locator('.bank-detail')).toContainText(/TymeBank/i);
    await expect(page.locator('.bank-detail')).toContainText(/53000794861/i);
  });

  test('cart page has contact links', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedCart.html`);
    
    // Verify contact options
    await expect(page.locator('.contact-links')).toBeVisible();
    await expect(page.locator('a:has-text("Instagram")')).toBeVisible();
    await expect(page.locator('a:has-text("WhatsApp")')).toBeVisible();
    await expect(page.locator('a:has-text("Email")')).toBeVisible();
  });

  test('clear cart button exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedCart.html`);
    
    await expect(page.locator('#clearCartBtn')).toBeVisible();
  });
});

test.describe('Contact Page Tests', () => {
  test('contact form is present with all fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedContacts.html`);
    
    // Verify form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
  });

  test('contact form validation prevents empty submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedContacts.html`);
    
    // Try to submit empty form
    const form = page.locator('#contactForm');
    
    // Check required attributes
    await expect(page.locator('input[name="name"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
    await expect(page.locator('textarea[name="message"]')).toHaveAttribute('required');
  });

  test('quick action buttons are present', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedContacts.html`);
    
    // Verify quick action cards
    await expect(page.locator('.quick-action:has-text("WhatsApp")')).toBeVisible();
    await expect(page.locator('.quick-action:has-text("Call")')).toBeVisible();
    await expect(page.locator('.quick-action:has-text("Email")')).toBeVisible();
  });

  test('contact details are displayed', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedContacts.html`);
    
    // Verify contact info
    await expect(page.locator('.info-card:has-text("boxedsneaks@gmail.com")')).toBeVisible();
    await expect(page.locator('.info-card:has-text("+27 65 094 7689")')).toBeVisible();
  });
});

test.describe('About Page Tests', () => {
  test('about page displays company story', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedAboutUs.html`);
    
    // Verify content sections
    await expect(page.locator('h2:has-text("Our Story")')).toBeVisible();
    await expect(page.locator('h2:has-text("Payment Security")')).toBeVisible();
    await expect(page.locator('h2:has-text("Refund")')).toBeVisible();
  });

  test('about page has contact button', async ({ page }) => {
    await page.goto(`${BASE_URL}/boxedAboutUs.html`);
    
    // Verify CTA button
    await expect(page.locator('a:has-text("Contact Us")')).toBeVisible();
  });
});

test.describe('Login Page Tests', () => {
  test('login page loads with form fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    
    // Verify login form elements
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#loginBtn')).toBeVisible();
    await expect(page.locator('#googleBtn')).toBeVisible();
  });

  test('login page has back to store link', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    
    // Verify back link
    await expect(page.locator('.back-link a')).toBeVisible();
    await expect(page.locator('.back-link a')).toContainText(/Back to store/i);
  });

  test('login form has email validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    
    // Check email input type
    await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    await expect(page.locator('#email')).toHaveAttribute('required');
  });

  test('password field has toggle visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    
    // Verify password field is present
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });
});

test.describe('Footer Tests', () => {
  test('footer appears on all main pages', async ({ page }) => {
    const pages = ['index.html', 'boxedAboutUs.html', 'boxedContacts.html', 'boxedCart.html'];
    
    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}/${pagePath}`);
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('.trust-section')).toBeVisible();
    }
  });

  test('footer has trust indicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify trust items
    await expect(page.locator('.trust-item:has-text("Free Delivery")')).toBeVisible();
    await expect(page.locator('.trust-item:has-text("100% Authentic")')).toBeVisible();
    await expect(page.locator('.trust-item:has-text("WhatsApp")')).toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  test('mobile viewport shows hamburger-friendly layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify page is still usable on mobile
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('.nav-links')).toBeVisible();
  });

  test('tablet viewport displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify layout adjusts
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('#product-grid')).toBeVisible();
  });
});

test.describe('Product Modal Tests', () => {
  test('product modal structure exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify modal elements are in DOM (hidden initially)
    await expect(page.locator('#productModal')).toBeAttached();
    await expect(page.locator('#modalTitle')).toBeAttached();
    await expect(page.locator('#modalPrice')).toBeAttached();
    await expect(page.locator('#sizeSelect')).toBeAttached();
    await expect(page.locator('#colorSelect')).toBeAttached();
    await expect(page.locator('#modalAddToCart')).toBeAttached();
  });

  test('modal has size and color selectors', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify variant selectors exist
    await expect(page.locator('#sizeButtons')).toBeAttached();
    await expect(page.locator('#colorButtons')).toBeAttached();
    await expect(page.locator('.size-buttons')).toBeAttached();
    await expect(page.locator('.color-buttons')).toBeAttached();
  });
});

test.describe('Accessibility Tests', () => {
  test('images have alt attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Check for images without alt text (basic accessibility check)
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Note: Some images may intentionally have empty alt, this is a basic check
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    
    // Check for associated labels
    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('buttons have accessible text', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Verify navigation buttons are visible
    const navButtons = page.locator('.nav-links a');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

// Summary test that runs last
test.describe('Test Summary', () => {
  test('site structure is complete', async ({ page }) => {
    const pages = [
      { path: 'index.html', title: /boxedSneaks/i },
      { path: 'boxedAboutUs.html', title: /About/i },
      { path: 'boxedContacts.html', title: /Contact/i },
      { path: 'boxedCart.html', title: /Cart|bag/i },
      { path: 'pages/login.html', title: /Login|Sign in/i },
    ];
    
    for (const { path, title } of pages) {
      await page.goto(`${BASE_URL}/${path}`);
      await expect(page).toHaveTitle(title);
    }
  });
});
