/**
 * Proxy module that re-exports from the backend
 * This allows frontend code to continue using the same import paths
 * while the actual implementation has moved to the backend
 */
export { optimizePattern } from '../../../backend/src/services/workflow/optimizePattern';
