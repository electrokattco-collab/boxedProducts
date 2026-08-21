/**
 * Input Validation Utilities
 * Location: src/utils/validation.js
 * 
 * Provides comprehensive input validation for forms, user inputs,
 * and data processing across the application.
 */

// ========== CONSTANTS ==========

const VALIDATION_RULES = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxLength: 254,
        message: 'Please enter a valid email address'
    },
    password: {
        minLength: 6,
        maxLength: 128,
        message: 'Password must be at least 6 characters'
    },
    displayName: {
        minLength: 0,
        maxLength: 100,
        pattern: /^[\w\s\-\.]*$/,
        message: 'Name can only contain letters, numbers, spaces, hyphens, and periods'
    },
    productName: {
        minLength: 1,
        maxLength: 200,
        pattern: /^[\w\s\-\.'"!?&()]+$/,  // Relaxed for products
        message: 'Product name contains invalid characters'
    },
    price: {
        min: 0,
        max: 999999999,
        decimals: 2,
        message: 'Price must be between 0 and 999,999,999'
    },
    quantity: {
        min: 0,
        max: 999999,
        message: 'Quantity must be between 0 and 999,999'
    },
    url: {
        pattern: /^https?:\/\/.+/,
        maxLength: 2048,
        message: 'Please enter a valid URL starting with http:// or https://'
    },
    phone: {
        pattern: /^[\+]?[\d\s\-\(\)]{10,20}$/,
        message: 'Please enter a valid phone number'
    },
    id: {
        pattern: /^[a-zA-Z0-9\-_]+$/,
        minLength: 1,
        maxLength: 100,
        message: 'ID can only contain letters, numbers, hyphens, and underscores'
    }
};

const CATEGORIES = ['shoes', 'electronics', 'digital', 'furniture', 'clothing', 'accessories'];
const INVENTORY_STATUSES = ['inStock', 'lowStock', 'outOfStock', 'discontinued'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

// ========== BASIC VALIDATORS ==========

/**
 * Check if value is a non-empty string
 * @param {*} value 
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a valid number
 * @param {*} value 
 * @returns {boolean}
 */
export function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a positive integer
 * @param {*} value 
 * @returns {boolean}
 */
export function isPositiveInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

/**
 * Validate email address
 * @param {string} email 
 * @returns {object} Validation result { isValid, message }
 */
export function validateEmail(email) {
    if (!isNonEmptyString(email)) {
        return { isValid: false, message: 'Email is required' };
    }
    
    if (email.length > VALIDATION_RULES.email.maxLength) {
        return { isValid: false, message: `Email must be less than ${VALIDATION_RULES.email.maxLength} characters` };
    }
    
    if (!VALIDATION_RULES.email.pattern.test(email)) {
        return { isValid: false, message: VALIDATION_RULES.email.message };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate password
 * @param {string} password 
 * @param {object} options 
 * @returns {object} Validation result
 */
export function validatePassword(password, options = {}) {
    const { requireStrong = false } = options;
    
    if (!isNonEmptyString(password)) {
        return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < VALIDATION_RULES.password.minLength) {
        return { isValid: false, message: VALIDATION_RULES.password.message };
    }
    
    if (password.length > VALIDATION_RULES.password.maxLength) {
        return { isValid: false, message: `Password must be less than ${VALIDATION_RULES.password.maxLength} characters` };
    }
    
    if (requireStrong) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return { 
                isValid: false, 
                message: 'Password must contain uppercase, lowercase, and numbers' 
            };
        }
        
        if (!hasSpecial) {
            return {
                isValid: false,
                message: 'Password must contain at least one special character'
            };
        }
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate display name
 * @param {string} name 
 * @returns {object} Validation result
 */
export function validateDisplayName(name) {
    if (!isNonEmptyString(name)) {
        return { isValid: true, message: '' };  // Optional field
    }
    
    const rules = VALIDATION_RULES.displayName;
    
    if (name.length > rules.maxLength) {
        return { isValid: false, message: `Name must be less than ${rules.maxLength} characters` };
    }
    
    if (!rules.pattern.test(name)) {
        return { isValid: false, message: rules.message };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate product name
 * @param {string} name 
 * @returns {object} Validation result
 */
export function validateProductName(name) {
    if (!isNonEmptyString(name)) {
        return { isValid: false, message: 'Product name is required' };
    }
    
    const rules = VALIDATION_RULES.productName;
    
    if (name.length < rules.minLength) {
        return { isValid: false, message: `Product name must be at least ${rules.minLength} characters` };
    }
    
    if (name.length > rules.maxLength) {
        return { isValid: false, message: `Product name must be less than ${rules.maxLength} characters` };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate price
 * @param {number} price 
 * @returns {object} Validation result
 */
export function validatePrice(price) {
    if (!isValidNumber(price)) {
        return { isValid: false, message: 'Price must be a valid number' };
    }
    
    const rules = VALIDATION_RULES.price;
    
    if (price < rules.min || price > rules.max) {
        return { isValid: false, message: rules.message };
    }
    
    // Check decimal places
    const decimalStr = price.toString().split('.')[1];
    if (decimalStr && decimalStr.length > rules.decimals) {
        return { isValid: false, message: `Price can have at most ${rules.decimals} decimal places` };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate quantity
 * @param {number} quantity 
 * @returns {object} Validation result
 */
export function validateQuantity(quantity) {
    if (!isPositiveInteger(quantity)) {
        return { isValid: false, message: 'Quantity must be a non-negative integer' };
    }
    
    if (quantity > VALIDATION_RULES.quantity.max) {
        return { isValid: false, message: VALIDATION_RULES.quantity.message };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate URL
 * @param {string} url 
 * @returns {object} Validation result
 */
export function validateUrl(url) {
    if (!isNonEmptyString(url)) {
        return { isValid: true, message: '' };  // Optional
    }
    
    const rules = VALIDATION_RULES.url;
    
    if (url.length > rules.maxLength) {
        return { isValid: false, message: `URL must be less than ${rules.maxLength} characters` };
    }
    
    if (!rules.pattern.test(url)) {
        return { isValid: false, message: rules.message };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate phone number
 * @param {string} phone 
 * @returns {object} Validation result
 */
export function validatePhone(phone) {
    if (!isNonEmptyString(phone)) {
        return { isValid: true, message: '' };  // Optional
    }
    
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
        return { isValid: false, message: VALIDATION_RULES.phone.message };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate category
 * @param {string} category 
 * @returns {object} Validation result
 */
export function validateCategory(category) {
    if (!CATEGORIES.includes(category)) {
        return { 
            isValid: false, 
            message: `Category must be one of: ${CATEGORIES.join(', ')}` 
        };
    }
    return { isValid: true, message: '' };
}

/**
 * Validate inventory status
 * @param {string} status 
 * @returns {object} Validation result
 */
export function validateInventoryStatus(status) {
    if (!INVENTORY_STATUSES.includes(status)) {
        return { 
            isValid: false, 
            message: `Status must be one of: ${INVENTORY_STATUSES.join(', ')}` 
        };
    }
    return { isValid: true, message: '' };
}

// ========== COMPLEX VALIDATORS ==========

/**
 * Validate complete product object
 * @param {object} product 
 * @returns {object} Validation result with errors array
 */
export function validateProduct(product) {
    const errors = [];
    
    // Required fields
    if (!isNonEmptyString(product.name)) {
        errors.push({ field: 'name', message: 'Product name is required' });
    } else {
        const nameValidation = validateProductName(product.name);
        if (!nameValidation.isValid) {
            errors.push({ field: 'name', message: nameValidation.message });
        }
    }
    
    if (!isValidNumber(product.price)) {
        errors.push({ field: 'price', message: 'Valid price is required' });
    } else {
        const priceValidation = validatePrice(product.price);
        if (!priceValidation.isValid) {
            errors.push({ field: 'price', message: priceValidation.message });
        }
    }
    
    if (!validateCategory(product.category).isValid) {
        errors.push({ field: 'category', message: 'Valid category is required' });
    }
    
    // Optional fields
    if (product.stockQuantity !== undefined) {
        const qtyValidation = validateQuantity(product.stockQuantity);
        if (!qtyValidation.isValid) {
            errors.push({ field: 'stockQuantity', message: qtyValidation.message });
        }
    }
    
    if (product.inventoryStatus !== undefined) {
        const statusValidation = validateInventoryStatus(product.inventoryStatus);
        if (!statusValidation.isValid) {
            errors.push({ field: 'inventoryStatus', message: statusValidation.message });
        }
    }
    
    // Validate images array if provided
    if (product.images !== undefined) {
        if (!Array.isArray(product.images)) {
            errors.push({ field: 'images', message: 'Images must be an array' });
        } else {
            product.images.forEach((img, index) => {
                const urlValidation = validateUrl(img);
                if (!urlValidation.isValid) {
                    errors.push({ field: `images[${index}]`, message: urlValidation.message });
                }
            });
        }
    }
    
    // Validate description length
    if (product.description && product.description.length > 2000) {
        errors.push({ field: 'description', message: 'Description must be less than 2000 characters' });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate user profile data
 * @param {object} profile 
 * @returns {object} Validation result
 */
export function validateUserProfile(profile) {
    const errors = [];
    
    if (profile.displayName !== undefined) {
        const nameValidation = validateDisplayName(profile.displayName);
        if (!nameValidation.isValid) {
            errors.push({ field: 'displayName', message: nameValidation.message });
        }
    }
    
    if (profile.photoURL !== undefined) {
        const urlValidation = validateUrl(profile.photoURL);
        if (!urlValidation.isValid) {
            errors.push({ field: 'photoURL', message: urlValidation.message });
        }
    }
    
    if (profile.phoneNumber !== undefined) {
        const phoneValidation = validatePhone(profile.phoneNumber);
        if (!phoneValidation.isValid) {
            errors.push({ field: 'phoneNumber', message: phoneValidation.message });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate order data
 * @param {object} order 
 * @returns {object} Validation result
 */
export function validateOrder(order) {
    const errors = [];
    
    if (!Array.isArray(order.items) || order.items.length === 0) {
        errors.push({ field: 'items', message: 'Order must have at least one item' });
    } else if (order.items.length > 100) {
        errors.push({ field: 'items', message: 'Order cannot have more than 100 items' });
    }
    
    order.items?.forEach((item, index) => {
        if (!item.productId) {
            errors.push({ field: `items[${index}].productId`, message: 'Product ID is required' });
        }
        if (!validateQuantity(item.quantity).isValid) {
            errors.push({ field: `items[${index}].quantity`, message: 'Valid quantity is required' };
        }
        if (!validatePrice(item.price).isValid) {
            errors.push({ field: `items[${index}].price`, message: 'Valid price is required' });
        }
    });
    
    if (!validatePrice(order.total).isValid) {
        errors.push({ field: 'total', message: 'Valid total is required' });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// ========== SANITIZATION ==========

/**
 * Sanitize string for safe display
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
        .replace(/[<>]/g, '')  // Remove < and > to prevent HTML injection
        .trim()
        .substring(0, 10000);  // Limit length
}

/**
 * Sanitize email (lowercase and trim)
 * @param {string} email 
 * @returns {string}
 */
export function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
}

/**
 * Sanitize number to ensure it's valid
 * @param {*} value 
 * @param {number} defaultValue 
 * @returns {number}
 */
export function sanitizeNumber(value, defaultValue = 0) {
    const num = Number(value);
    return isValidNumber(num) ? num : defaultValue;
}

// ========== FORM VALIDATION ==========

/**
 * Validate form data against a schema
 * @param {object} data - Form data
 * @param {object} schema - Validation schema
 * @returns {object} Validation result
 */
export function validateForm(data, schema) {
    const errors = {};
    let isValid = true;
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        const fieldErrors = [];
        
        // Required check
        if (rules.required && !isNonEmptyString(value) && value !== 0 && value !== false) {
            fieldErrors.push(rules.requiredMessage || `${field} is required`);
        }
        
        // Type validation
        if (value !== undefined && value !== null) {
            if (rules.type === 'email') {
                const result = validateEmail(value);
                if (!result.isValid) fieldErrors.push(result.message);
            }
            
            if (rules.type === 'number') {
                if (!isValidNumber(value)) {
                    fieldErrors.push(`${field} must be a valid number`);
                } else {
                    if (rules.min !== undefined && value < rules.min) {
                        fieldErrors.push(`${field} must be at least ${rules.min}`);
                    }
                    if (rules.max !== undefined && value > rules.max) {
                        fieldErrors.push(`${field} must be at most ${rules.max}`);
                    }
                }
            }
            
            if (rules.minLength !== undefined && String(value).length < rules.minLength) {
                fieldErrors.push(`${field} must be at least ${rules.minLength} characters`);
            }
            
            if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
                fieldErrors.push(`${field} must be at most ${rules.maxLength} characters`);
            }
            
            if (rules.pattern && !rules.pattern.test(String(value))) {
                fieldErrors.push(rules.patternMessage || `${field} format is invalid`);
            }
            
            if (rules.enum && !rules.enum.includes(value)) {
                fieldErrors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
        }
        
        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
            isValid = false;
        }
    }
    
    return { isValid, errors };
}

// ========== EXPORT ALL ==========

export default {
    validateEmail,
    validatePassword,
    validateDisplayName,
    validateProductName,
    validatePrice,
    validateQuantity,
    validateUrl,
    validatePhone,
    validateCategory,
    validateInventoryStatus,
    validateProduct,
    validateUserProfile,
    validateOrder,
    validateForm,
    sanitizeString,
    sanitizeEmail,
    sanitizeNumber,
    isNonEmptyString,
    isValidNumber,
    isPositiveInteger
};
