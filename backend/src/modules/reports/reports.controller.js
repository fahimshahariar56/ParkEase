/**
 * Reports Controller — Day 22
 * Admin-authorized endpoints for operational reports and analytics.
 */

import * as reportsService from './reports.service.js';

export async function getSummaryReport(req, res, next) {
  try {
    const data = await reportsService.getDashboardSummaryReport();
    res.status(200).json({
      success: true,
      message: 'Dashboard reports summary retrieved.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOccupancyReport(req, res, next) {
  try {
    const filters = req.validatedQuery || {};
    const data = await reportsService.getOccupancyReport(filters);
    res.status(200).json({
      success: true,
      message: 'Parking occupancy report retrieved.',
      filters: {
        lotId: filters.lotId || null,
      },
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReservationsReport(req, res, next) {
  try {
    const filters = req.validatedQuery || {};
    const data = await reportsService.getReservationsReport(filters);
    res.status(200).json({
      success: true,
      message: 'Reservation report retrieved.',
      filters: {
        startDate: filters.rawStartDate || null,
        endDate: filters.rawEndDate || null,
        lotId: filters.lotId || null,
        status: filters.status || null,
      },
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionsReport(req, res, next) {
  try {
    const filters = req.validatedQuery || {};
    const data = await reportsService.getSessionsReport(filters);
    res.status(200).json({
      success: true,
      message: 'Parking sessions report retrieved.',
      filters: {
        startDate: filters.rawStartDate || null,
        endDate: filters.rawEndDate || null,
        lotId: filters.lotId || null,
        status: filters.status || null,
      },
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentsReport(req, res, next) {
  try {
    const filters = req.validatedQuery || {};
    const data = await reportsService.getDemoPaymentsReport(filters);
    res.status(200).json({
      success: true,
      message: 'Demo payments report retrieved.',
      isDemoTransaction: true,
      filters: {
        startDate: filters.rawStartDate || null,
        endDate: filters.rawEndDate || null,
        lotId: filters.lotId || null,
        demoMethod: filters.demoMethod || null,
        status: filters.status || null,
      },
      data,
    });
  } catch (err) {
    next(err);
  }
}
