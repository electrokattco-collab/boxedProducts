# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-test.spec.js >> About Page Tests >> about page displays company story
- Location: e2e-test.spec.js:202:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2:has-text("Refund")')
Expected: visible
Error: strict mode violation: locator('h2:has-text("Refund")') resolved to 2 elements:
    1) <h2>Refund and Exchange Policy</h2> aka getByRole('heading', { name: 'Refund and Exchange Policy' })
    2) <h2>Returns & Refunds</h2> aka getByRole('heading', { name: 'Returns & Refunds' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h2:has-text("Refund")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link " boxedSneaks" [ref=e3] [cursor=pointer]:
      - /url: index.html
      - generic [ref=e4]: 
      - text: boxedSneaks
    - generic [ref=e5]:
      - link " Home" [ref=e6] [cursor=pointer]:
        - /url: index.html
        - generic [ref=e7]: 
        - text: Home
      - link " About" [ref=e8] [cursor=pointer]:
        - /url: boxedAboutUs.html
        - generic [ref=e9]: 
        - text: About
      - link " Cart" [ref=e10] [cursor=pointer]:
        - /url: boxedCart.html
        - generic [ref=e11]: 
        - text: Cart
      - link " Contact" [ref=e12] [cursor=pointer]:
        - /url: boxedContacts.html
        - generic [ref=e13]: 
        - text: Contact
  - generic [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]: 
      - text: Our story and commitment
    - heading "About Boxed Sneakers" [level=1] [ref=e17]
    - paragraph [ref=e18]: Premium kicks with authentic quality, nationwide delivery, and customer-first service since 2021.
  - generic [ref=e19]:
    - heading "Our Story" [level=2] [ref=e20]
    - paragraph [ref=e21]: Welcome to Boxed Sneakers, established in 2021. We are dedicated to meeting our customers' needs by providing high-quality sneakers. Our amazing team works collaboratively to maintain high standards of quality and customer satisfaction. We use diverse courier services nationwide and provide free delivery via Paxi, Uber, and Aramex.
    - link " Contact Us" [ref=e22] [cursor=pointer]:
      - /url: boxedContacts.html
      - generic [ref=e23]: 
      - text: Contact Us
  - generic [ref=e24]:
    - heading "Payment Security" [level=2] [ref=e25]
    - paragraph [ref=e26]: All payments are recorded, and receipts will be provided. We aim to provide a secure payment system for our clients by offering tracking numbers for all orders.
  - generic [ref=e27]:
    - heading "Refund and Exchange Policy" [level=2] [ref=e28]
    - paragraph [ref=e29]: "We allow exchanges ONLY for the following reasons:"
    - list [ref=e30]:
      - listitem [ref=e31]: Incorrect sneaker shipped to you (note that we read Euro sizes instead of UK sizes, but we will ensure you receive the correct Euro size that matches the UK size).
      - listitem [ref=e32]: Sneaker does not fit you (please note that some sneakers may run small or large).
      - listitem [ref=e33]: The sneaker is damaged when received from us.
    - paragraph [ref=e34]: You can only exchange your sneaker for a different size, not for a different colorway or sneaker type, within 24 hours of receiving the sneakers. The sneaker MUST not have been worn.
    - paragraph [ref=e35]: If you are dissatisfied with your purchase due to a defect or incorrect sizing, you may return it with the tags attached, in its original packaging, within 24 hours of receiving it. The sneakers must NOT have been worn.
    - paragraph [ref=e36]: If the refund requested is not due to a damaged product or incorrect size shipped, we will charge a 15% penalty on the selling price of the sneaker. This is due to unavoidable fees incurred during the procurement of sneakers. Refunds must be requested within 24 hours of receiving the sneakers, and the sneakers must NOT have been worn.
  - generic [ref=e37]:
    - heading "Returns & Refunds" [level=2] [ref=e38]
    - paragraph [ref=e39]: "We want you to be completely satisfied with your Boxed Sneakers purchase. If you're not happy with your order, here's what you need to know:"
    - heading "Return Window" [level=3] [ref=e40]
    - paragraph [ref=e41]: You have 14 days from delivery to request a return. Items must be unworn, in original packaging, with all tags attached.
    - heading "Refund Process" [level=3] [ref=e42]
    - paragraph [ref=e43]: Once we receive your return, refunds are processed within 3-5 business days. You'll receive your money back via the original payment method.
    - heading "Conditions" [level=3] [ref=e44]
    - list [ref=e45]:
      - listitem [ref=e46]: Items must be in new, unworn condition
      - listitem [ref=e47]: Original packaging and tags must be included
      - listitem [ref=e48]: Proof of purchase required
      - listitem [ref=e49]: Return shipping costs are the customer's responsibility
    - heading "Contact Us" [level=3] [ref=e50]
    - paragraph [ref=e51]: For returns or refunds, contact us via WhatsApp at +27 65 094 7689 or email boxedsneaks@gmail.com with your order details.
  - contentinfo [ref=e52]:
    - generic [ref=e53]:
      - generic [ref=e54]:
        - generic [ref=e55]: 
        - generic [ref=e56]:
          - strong [ref=e57]: Free Delivery
          - text: Nationwide via Paxi, Uber, Aramex
      - generic [ref=e58]:
        - generic [ref=e59]: 
        - generic [ref=e60]:
          - strong [ref=e61]: 100% Authentic
          - text: Guaranteed genuine products
      - generic [ref=e62]:
        - generic [ref=e63]: 
        - generic [ref=e64]:
          - strong [ref=e65]: WhatsApp Support
          - text: +27 65 094 7689
      - generic [ref=e66]:
        - generic [ref=e67]: 
        - generic [ref=e68]:
          - strong [ref=e69]: South Africa
          - text: Serving nationwide
    - generic [ref=e70]:
      - link "About Us" [ref=e71] [cursor=pointer]:
        - /url: boxedAboutUs.html
      - text: "|"
      - link "Contact" [ref=e72] [cursor=pointer]:
        - /url: boxedContacts.html
      - text: "|"
      - link "Returns & Refunds" [ref=e73] [cursor=pointer]:
        - /url: "#returns"
    - paragraph [ref=e74]:
      - text: © 2025 Boxed Sneakers. Premium kicks.
      - generic [ref=e75]: 
  - generic [ref=e76]:
    - generic [ref=e77]: 
    - generic [ref=e78]: Site is currently in development. You may experience minor interruptions.
```

# Test source

```ts
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
  155 |     await expect(page.locator('#clearCartBtn')).toBeVisible();
  156 |   });
  157 | });
  158 | 
  159 | test.describe('Contact Page Tests', () => {
  160 |   test('contact form is present with all fields', async ({ page }) => {
  161 |     await page.goto(`${BASE_URL}/boxedContacts.html`);
  162 |     
  163 |     // Verify form fields
  164 |     await expect(page.locator('input[name="name"]')).toBeVisible();
  165 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  166 |     await expect(page.locator('input[name="phone"]')).toBeVisible();
  167 |     await expect(page.locator('textarea[name="message"]')).toBeVisible();
  168 |     await expect(page.locator('#submitBtn')).toBeVisible();
  169 |   });
  170 | 
  171 |   test('contact form validation prevents empty submission', async ({ page }) => {
  172 |     await page.goto(`${BASE_URL}/boxedContacts.html`);
  173 |     
  174 |     // Try to submit empty form
  175 |     const form = page.locator('#contactForm');
  176 |     
  177 |     // Check required attributes
  178 |     await expect(page.locator('input[name="name"]')).toHaveAttribute('required');
  179 |     await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
  180 |     await expect(page.locator('textarea[name="message"]')).toHaveAttribute('required');
  181 |   });
  182 | 
  183 |   test('quick action buttons are present', async ({ page }) => {
  184 |     await page.goto(`${BASE_URL}/boxedContacts.html`);
  185 |     
  186 |     // Verify quick action cards
  187 |     await expect(page.locator('.quick-action:has-text("WhatsApp")')).toBeVisible();
  188 |     await expect(page.locator('.quick-action:has-text("Call")')).toBeVisible();
  189 |     await expect(page.locator('.quick-action:has-text("Email")')).toBeVisible();
  190 |   });
  191 | 
  192 |   test('contact details are displayed', async ({ page }) => {
  193 |     await page.goto(`${BASE_URL}/boxedContacts.html`);
  194 |     
  195 |     // Verify contact info
  196 |     await expect(page.locator('.info-card:has-text("boxedsneaks@gmail.com")')).toBeVisible();
  197 |     await expect(page.locator('.info-card:has-text("+27 65 094 7689")')).toBeVisible();
  198 |   });
  199 | });
  200 | 
  201 | test.describe('About Page Tests', () => {
  202 |   test('about page displays company story', async ({ page }) => {
  203 |     await page.goto(`${BASE_URL}/boxedAboutUs.html`);
  204 |     
  205 |     // Verify content sections
  206 |     await expect(page.locator('h2:has-text("Our Story")')).toBeVisible();
  207 |     await expect(page.locator('h2:has-text("Payment Security")')).toBeVisible();
> 208 |     await expect(page.locator('h2:has-text("Refund")')).toBeVisible();
      |                                                         ^ Error: expect(locator).toBeVisible() failed
  209 |   });
  210 | 
  211 |   test('about page has contact button', async ({ page }) => {
  212 |     await page.goto(`${BASE_URL}/boxedAboutUs.html`);
  213 |     
  214 |     // Verify CTA button
  215 |     await expect(page.locator('a:has-text("Contact Us")')).toBeVisible();
  216 |   });
  217 | });
  218 | 
  219 | test.describe('Login Page Tests', () => {
  220 |   test('login page loads with form fields', async ({ page }) => {
  221 |     await page.goto(`${BASE_URL}/pages/login.html`);
  222 |     
  223 |     // Verify login form elements
  224 |     await expect(page.locator('#email')).toBeVisible();
  225 |     await expect(page.locator('#password')).toBeVisible();
  226 |     await expect(page.locator('#loginBtn')).toBeVisible();
  227 |     await expect(page.locator('#googleBtn')).toBeVisible();
  228 |   });
  229 | 
  230 |   test('login page has back to store link', async ({ page }) => {
  231 |     await page.goto(`${BASE_URL}/pages/login.html`);
  232 |     
  233 |     // Verify back link
  234 |     await expect(page.locator('.back-link a')).toBeVisible();
  235 |     await expect(page.locator('.back-link a')).toContainText(/Back to store/i);
  236 |   });
  237 | 
  238 |   test('login form has email validation', async ({ page }) => {
  239 |     await page.goto(`${BASE_URL}/pages/login.html`);
  240 |     
  241 |     // Check email input type
  242 |     await expect(page.locator('#email')).toHaveAttribute('type', 'email');
  243 |     await expect(page.locator('#email')).toHaveAttribute('required');
  244 |   });
  245 | 
  246 |   test('password field has toggle visibility', async ({ page }) => {
  247 |     await page.goto(`${BASE_URL}/pages/login.html`);
  248 |     
  249 |     // Verify password field is present
  250 |     await expect(page.locator('#password')).toBeVisible();
  251 |     await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  252 |   });
  253 | });
  254 | 
  255 | test.describe('Footer Tests', () => {
  256 |   test('footer appears on all main pages', async ({ page }) => {
  257 |     const pages = ['index.html', 'boxedAboutUs.html', 'boxedContacts.html', 'boxedCart.html'];
  258 |     
  259 |     for (const pagePath of pages) {
  260 |       await page.goto(`${BASE_URL}/${pagePath}`);
  261 |       await expect(page.locator('footer')).toBeVisible();
  262 |       await expect(page.locator('.trust-section')).toBeVisible();
  263 |     }
  264 |   });
  265 | 
  266 |   test('footer has trust indicators', async ({ page }) => {
  267 |     await page.goto(`${BASE_URL}/index.html`);
  268 |     
  269 |     // Verify trust items
  270 |     await expect(page.locator('.trust-item:has-text("Free Delivery")')).toBeVisible();
  271 |     await expect(page.locator('.trust-item:has-text("100% Authentic")')).toBeVisible();
  272 |     await expect(page.locator('.trust-item:has-text("WhatsApp")')).toBeVisible();
  273 |   });
  274 | });
  275 | 
  276 | test.describe('Responsive Design Tests', () => {
  277 |   test('mobile viewport shows hamburger-friendly layout', async ({ page }) => {
  278 |     await page.setViewportSize({ width: 375, height: 667 });
  279 |     await page.goto(`${BASE_URL}/index.html`);
  280 |     
  281 |     // Verify page is still usable on mobile
  282 |     await expect(page.locator('.logo')).toBeVisible();
  283 |     await expect(page.locator('.nav-links')).toBeVisible();
  284 |   });
  285 | 
  286 |   test('tablet viewport displays correctly', async ({ page }) => {
  287 |     await page.setViewportSize({ width: 768, height: 1024 });
  288 |     await page.goto(`${BASE_URL}/index.html`);
  289 |     
  290 |     // Verify layout adjusts
  291 |     await expect(page.locator('.hero')).toBeVisible();
  292 |     await expect(page.locator('#product-grid')).toBeVisible();
  293 |   });
  294 | });
  295 | 
  296 | test.describe('Product Modal Tests', () => {
  297 |   test('product modal structure exists', async ({ page }) => {
  298 |     await page.goto(`${BASE_URL}/index.html`);
  299 |     
  300 |     // Verify modal elements are in DOM (hidden initially)
  301 |     await expect(page.locator('#productModal')).toBeAttached();
  302 |     await expect(page.locator('#modalTitle')).toBeAttached();
  303 |     await expect(page.locator('#modalPrice')).toBeAttached();
  304 |     await expect(page.locator('#sizeSelect')).toBeAttached();
  305 |     await expect(page.locator('#colorSelect')).toBeAttached();
  306 |     await expect(page.locator('#modalAddToCart')).toBeAttached();
  307 |   });
  308 | 
```