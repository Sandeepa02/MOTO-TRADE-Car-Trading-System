import express from 'express';
import {
  getModifications,
  getModificationById,
  createModification,
  updateModification,
  deleteModification,
  searchModifications
} from '../controllers/modificationController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.route('/search').get(searchModifications);

router.route('/')
  .get(getModifications)
  .post(protect, requireAdmin, createModification);

router.route('/:id')
  .get(getModificationById)
  .put(protect, requireAdmin, updateModification)
  .delete(protect, requireAdmin, deleteModification);

export default router;
