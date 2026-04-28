import express from 'express';
import {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  searchSpareParts
} from '../controllers/sparePartController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.route('/search').get(searchSpareParts);

router.route('/')
  .get(getSpareParts)
  .post(protect, requireAdmin, createSparePart);

router.route('/:id')
  .get(getSparePartById)
  .put(protect, requireAdmin, updateSparePart)
  .delete(protect, requireAdmin, deleteSparePart);

export default router;
