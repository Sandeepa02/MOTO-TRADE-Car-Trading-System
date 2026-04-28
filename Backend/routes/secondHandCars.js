import express from 'express';
import {
  createSecondHandCar,
  getMySecondHandCars,
  getSecondHandCarById,
  getSecondHandCars,
  updateSecondHandCar
} from '../controllers/secondHandCarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/mine', protect, getMySecondHandCars);

router
  .route('/')
  .get(getSecondHandCars)
  .post(protect, createSecondHandCar);

router
  .route('/:id')
  .get(getSecondHandCarById)
  .put(protect, updateSecondHandCar);

export default router;
