# Boxed Products - Test Suite

This directory contains the comprehensive test suite for the Boxed Products e-commerce application.

## Test Structure

```
tests/
├── README.md                 # This file
├── setup.js                  # Jest setup and global mocks
├── mocks/                    # Mock data and utilities
│   ├── firebase.js          # Firebase auth mocks
│   └── products.js          # Product data mocks
├── unit/                     # Unit tests
│   ├── auth/                # Authentication tests
│   │   ├── login.test.js
│   │   └── authGuard.test.js
│   ├── product/             # Product-related tests
│   │   └── productRenderer.test.js
│   ├── ui/                  # UI component tests
│   │   └── passwordToggle.test.js
│   └── utils/               # Utility function tests
│       └── sanitize.test.js
└── integration/              # Integration tests
    └── auth-flow.test.js
```

## Running Tests

### Install dependencies
```bash
npm install
```

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Auth module tests
npm run test:auth

# Product module tests
npm run test:product

# UI component tests
npm run test:ui
```

## Test Categories

### Unit Tests

#### Auth Tests (`tests/unit/auth/`)
- **login.test.js**: Tests for email/password authentication, validation, error handling, and redirects
- **authGuard.test.js**: Tests for route protection, authentication state, and access control

#### Product Tests (`tests/unit/product/`)
- **productRenderer.test.js**: Tests for product card rendering, price formatting, and XSS protection

#### UI Tests (`tests/unit/ui/`)
- **passwordToggle.test.js**: Tests for password visibility toggle functionality

#### Utility Tests (`tests/unit/utils/`)
- **sanitize.test.js**: Tests for input sanitization, validation, and security functions

### Integration Tests (`tests/integration/`)
- **auth-flow.test.js**: End-to-end authentication workflow tests

## Mock Data

### Firebase Mocks (`tests/mocks/firebase.js`)
Provides mock implementations for:
- Firebase Authentication
- User objects (regular and admin)
- Auth state observers
- Token management

### Product Mocks (`tests/mocks/products.js`)
Provides sample product data for testing:
- Various product types (in stock, low stock, out of stock)
- Product categories and attributes
- Helper functions for filtering

## Writing New Tests

### Basic Test Structure
```javascript
import { jest } from '@jest/globals';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  test('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Mocking Modules
```javascript
const mockFunction = jest.fn();

jest.unstable_mockModule('path/to/module', () => ({
  functionName: mockFunction
}));

const { moduleUnderTest } = await import('path/to/module');
```

### Testing Async Code
```javascript
test('async operation', async () => {
  mockFunction.mockResolvedValue({ data: 'value' });
  
  const result = await asyncFunction();
  
  expect(result.data).toBe('value');
});
```

## Coverage Goals

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

View coverage report after running `npm run test:coverage`:
- Terminal summary
- HTML report: `coverage/lcov-report/index.html`

## Best Practices

1. **Test one thing per test**: Keep tests focused and independent
2. **Use descriptive names**: Test names should explain the behavior
3. **Mock external dependencies**: Don't test Firebase, mock it
4. **Test edge cases**: Empty inputs, null values, extreme values
5. **Keep tests fast**: Avoid real network calls or timeouts
6. **Use setup and teardown**: Clean state between tests

## Troubleshooting

### Tests failing with module errors
Make sure all imports use the correct relative paths:
- From `tests/unit/auth/`: `../../../src/auth/login.js`
- From `tests/mocks/`: `../../src/...` (if needed)

### Firebase mock not working
Ensure you're using `jest.unstable_mockModule()` before dynamic imports:
```javascript
jest.unstable_mockModule('path', () => ({ ... }));
const { module } = await import('path');
```

### DOM-related errors
Tests run in jsdom environment by default. For pure logic tests, you may not need DOM access.

## Contributing

When adding new features:
1. Write tests before or alongside your code
2. Ensure all tests pass before committing
3. Maintain or improve code coverage
4. Add mock data if needed for new features
5. Update this README if you add new test categories
