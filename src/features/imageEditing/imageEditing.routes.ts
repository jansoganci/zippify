import { Router } from 'express';
import { editImageController } from './imageEditing.controller';

// Create router instance
const router = Router();

// Define routes
router.post('/edit-image', editImageController);

// Export the router
export const imageEditingRouter = router;
