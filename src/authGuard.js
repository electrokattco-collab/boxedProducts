/**
 * Auth Guard - Backward Compatibility Layer
 * Location: src/authGuard.js
 * 
 * ⚠️ DEPRECATED: This file exists for backward compatibility.
 * Use src/auth/authGuard.js for new code.
 */

// Re-export from new location
export { AuthGuard, authGuard } from './auth/authGuard.js';

// Legacy default export for old code
import { authGuard } from './auth/authGuard.js';
export default authGuard;
