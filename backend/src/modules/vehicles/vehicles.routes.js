import { Router } from 'express';
import * as vehiclesController from './vehicles.controller.js';
import {
  validateCreateVehicle,
  validateUpdateVehicle,
} from './vehicles.validation.js';
import { authenticate } from '../../middleware/authenticate.js';

export const vehiclesRouter = Router();

// All vehicle endpoints require authentication
vehiclesRouter.use(authenticate);

vehiclesRouter.get('/', vehiclesController.getMyVehicles);
vehiclesRouter.post('/', validateCreateVehicle, vehiclesController.createVehicle);
vehiclesRouter.get('/:id', vehiclesController.getVehicleById);
vehiclesRouter.patch('/:id', validateUpdateVehicle, vehiclesController.updateVehicle);
vehiclesRouter.delete('/:id', vehiclesController.deleteVehicle);
