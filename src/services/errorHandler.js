/**
 * Centralized Firebase Error Handler
 * Location: src/services/errorHandler.js
 * 
 * Provides consistent error handling, logging, and user-friendly messages
 * for all Firebase operations across the application.
 */

/**
 * Firebase error code to user-friendly message mapping
 */
const ERROR_MESSAGES = {
    // Authentication errors
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/requires-recent-login': 'Please log in again to complete this action.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign-in operations.',
    
    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This item already exists.',
    'resource-exhausted': 'Quota exceeded. Please try again later.',
    'failed-precondition': 'Operation failed. Please check your data and try again.',
    'aborted': 'Operation was aborted. Please try again.',
    'out-of-range': 'Invalid argument provided.',
    'unimplemented': 'This feature is not yet implemented.',
    'internal': 'An internal error occurred. Please try again later.',
    'unavailable': 'Service temporarily unavailable. Please try again later.',
    'data-loss': 'Data loss detected. Please contact support immediately.',
    'unauthenticated': 'You must be logged in to perform this action.',
    
    // Storage errors
    'storage/object-not-found': 'The requested file was not found.',
    'storage/bucket-not-found': 'Storage bucket not configured properly.',
    'storage/project-not-found': 'Project not found. Please check your configuration.',
    'storage/quota-exceeded': 'Storage quota exceeded. Please contact support.',
    'storage/unauthenticated': 'Please log in to access storage.',
    'storage/unauthorized': 'You do not have permission to access this file.',
    'storage/retry-limit-exceeded': 'Maximum retry attempts exceeded. Please try again.',
    'storage/invalid-checksum': 'File upload failed due to integrity check. Please try again.',
    'storage/canceled': 'Upload was cancelled.',
    'storage/invalid-event-name': 'Invalid storage event.',
    'storage/invalid-url': 'Invalid storage URL.',
    'storage/invalid-argument': 'Invalid argument provided to storage operation.',
    'storage/no-default-bucket': 'No default storage bucket configured.',
    'storage/cannot-slice-blob': 'Cannot slice blob for upload.',
    'storage/server-file-wrong-size': 'Server file size mismatch.'
};

/**
 * Default error messages by category
 */
const DEFAULT_MESSAGES = {
    auth: 'Authentication failed. Please try again.',
    firestore: 'Database operation failed. Please try again.',
    storage: 'File operation failed. Please try again.',
    network: 'Network error. Please check your connection.',
    unknown: 'An unexpected error occurred. Please try again.'
};

/**
 * Get user-friendly error message from Firebase error
 * @param {Error|Object} error - Firebase error object
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
    if (!error) return DEFAULT_MESSAGES.unknown;
    
    // Handle Firebase error objects
    const errorCode = error.code || error.errorCode;
    if (errorCode && ERROR_MESSAGES[errorCode]) {
        return ERROR_MESSAGES[errorCode];
    }
    
    // Handle error messages that contain error codes
    if (error.message) {
        for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
            if (error.message.includes(code)) {
                return message;
            }
        }
        // Return the error message if no mapping found
        return error.message;
    }
    
    // Categorize by error type
    if (error.name === 'FirebaseError') {
        const service = errorCode?.split('/')?.[0];
        return DEFAULT_MESSAGES[service] || DEFAULT_MESSAGES.unknown;
    }
    
    return DEFAULT_MESSAGES.unknown;
}

/**
 * Get error category for handling logic
 * @param {Error|Object} error - Firebase error object
 * @returns {string} Error category (auth, firestore, storage, network, unknown)
 */
export function getErrorCategory(error) {
    if (!error) return 'unknown';
    
    const errorCode = error.code || error.errorCode || '';
    
    if (errorCode.startsWith('auth/')) return 'auth';
    if (errorCode.startsWith('storage/')) return 'storage';
    if (['permission-denied', 'not-found', 'already-exists', 'unauthenticated'].includes(errorCode)) {
        return 'firestore';
    }
    if (error.name === 'TypeError' && error.message?.includes('network')) {
        return 'network';
    }
    if (errorCode === 'auth/network-request-failed') {
        return 'network';
    }
    
    return 'unknown';
}

/**
 * Check if error is retryable
 * @param {Error|Object} error - Firebase error object
 * @returns {boolean} Whether the operation should be retried
 */
export function isRetryableError(error) {
    if (!error) return false;
    
    const errorCode = error.code || error.errorCode;
    const retryableCodes = [
        'auth/network-request-failed',
        'resource-exhausted',
        'unavailable',
        'aborted',
        'storage/retry-limit-exceeded',
        'storage/server-file-wrong-size'
    ];
    
    return retryableCodes.includes(errorCode) || error.name === 'TypeError';
}

/**
 * Log error to console with consistent formatting
 * @param {string} context - Where the error occurred
 * @param {Error|Object} error - The error object
 * @param {Object} extraData - Additional data to log
 */
export function logError(context, error, extraData = {}) {
    const timestamp = new Date().toISOString();
    const category = getErrorCategory(error);
    const errorCode = error?.code || error?.errorCode || 'N/A';
    
    console.group(`[Error] ${context} (${timestamp})`);
    console.error('Category:', category);
    console.error('Code:', errorCode);
    console.error('Message:', error?.message || 'No message');
    console.error('Stack:', error?.stack || 'No stack trace');
    if (Object.keys(extraData).length > 0) {
        console.error('Extra Data:', extraData);
    }
    console.groupEnd();
    
    // Could also send to error tracking service here
    // e.g., Sentry, LogRocket, etc.
}

/**
 * Handle Firebase error with full context
 * @param {string} context - Operation context (e.g., 'signIn', 'createProduct')
 * @param {Error|Object} error - Firebase error object
 * @param {Object} options - Handler options
 * @param {boolean} options.log - Whether to log the error (default: true)
 * @param {boolean} options.notify - Whether to show user notification (default: true)
 * @param {Function} options.onError - Callback for error handling
 * @returns {Object} Standardized error result
 */
export function handleFirebaseError(context, error, options = {}) {
    const { log = true, notify = true, onError = null } = options;
    
    const result = {
        success: false,
        error: error,
        code: error?.code || error?.errorCode || 'unknown',
        category: getErrorCategory(error),
        message: getErrorMessage(error),
        retryable: isRetryableError(error),
        timestamp: new Date().toISOString()
    };
    
    // Log error
    if (log) {
        logError(context, error, { context, notify });
    }
    
    // Show user notification if available
    if (notify && typeof window !== 'undefined') {
        // Dispatch custom event for UI to handle
        window.dispatchEvent(new CustomEvent('firebase-error', {
            detail: {
                context,
                message: result.message,
                category: result.category,
                code: result.code
            }
        }));
    }
    
    // Execute callback if provided
    if (onError && typeof onError === 'function') {
        onError(result);
    }
    
    return result;
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Operation context
 * @param {Object} options - Error handler options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context, options = {}) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            return handleFirebaseError(context, error, options);
        }
    };
}

/**
 * Create a retry wrapper for Firebase operations
 * @param {Function} operation - Operation to retry
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise} Operation result
 */
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (!isRetryableError(error) || attempt === maxRetries - 1) {
                throw error;
            }
            
            // Wait before retrying with exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
    }
    
    throw lastError;
}

// Default export
export default {
    getErrorMessage,
    getErrorCategory,
    isRetryableError,
    logError,
    handleFirebaseError,
    withErrorHandling,
    withRetry
};
