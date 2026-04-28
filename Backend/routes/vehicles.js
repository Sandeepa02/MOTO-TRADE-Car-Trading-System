import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getVehicleStats
} from '../controllers/vehicleController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Re-route into other resource routes
router.route('/search').get(searchVehicles);
router.route('/stats/overview').get(getVehicleStats);

// Main vehicle routes (mutations: admin only — branded inventory via admin dashboard)
router.route('/')
  .get(getVehicles)
  .post(protect, requireAdmin, createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(protect, requireAdmin, updateVehicle)
  .delete(protect, requireAdmin, deleteVehicle);

export default router;
