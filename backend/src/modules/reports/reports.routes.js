/**
 * Reports Router — Day 22
 * Admin-protected reporting endpoints with query validation and role-based access.
 */

import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import { validateReportFilters } from './reports.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRole.js';

export const reportsRouter = Router();

// All reporting routes strictly require authenticated ADMIN role
reportsRouter.use(authenticate);
reportsRouter.use(authorizeRoles('ADMIN'));

// 1. Overview summary across all report domains
reportsRouter.get('/summary', reportsController.getSummaryReport);

// 2. Parking occupancy report (slots, available, occupied, reserved, lot & type breakdown)
reportsRouter.get('/occupancy', validateReportFilters, reportsController.getOccupancyReport);

// 3. Reservations report (counts by status, timeline trends, lot breakdown, cancellations)
reportsRouter.get('/reservations', validateReportFilters, reportsController.getReservationsReport);

// 4. Parking sessions report (entry/exit logs, durations, recorded fees, trends)
reportsRouter.get('/sessions', validateReportFilters, reportsController.getSessionsReport);

// 5. Demo payments report (simulated payments, success sums, method breakdown)
reportsRouter.get('/payments', validateReportFilters, reportsController.getPaymentsReport);
