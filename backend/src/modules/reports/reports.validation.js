/**
 * Reports Query Filter Validation — Day 22
 * Validates date-ranges, lot IDs, statuses, and pagination parameters.
 */

const VALID_DEMO_METHODS = [
  'SIMULATED_CARD',
  'SIMULATED_MOBILE_WALLET',
  'SIMULATED_CASH',
];

const VALID_RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const VALID_SESSION_STATUSES = ['ACTIVE', 'COMPLETED'];

const VALID_PAYMENT_STATUSES = ['PAID', 'REFUNDED', 'FAILED'];

function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return false;
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime());
}

/**
 * Format string as start-of-day or end-of-day timestamp for SQL.
 * If format is YYYY-MM-DD, attaches 00:00:00 or 23:59:59.
 */
function normalizeDateBoundary(dateStr, isEnd = false) {
  const trimmed = dateStr.trim();
  // Check if purely YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isEnd ? `${trimmed} 23:59:59` : `${trimmed} 00:00:00`;
  }
  const dateObj = new Date(trimmed);
  // Return standard MySQL format 'YYYY-MM-DD HH:mm:ss' in UTC/local
  return dateObj.toISOString().slice(0, 19).replace('T', ' ');
}

export function validateReportFilters(req, res, next) {
  const {
    startDate,
    endDate,
    lotId,
    status,
    demoMethod,
    slotType,
    page = 1,
    limit = 50,
  } = req.query;

  const validated = {};

  // 1. Validate Date Range
  if (startDate !== undefined && startDate !== '') {
    if (!isValidDateString(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate format. Use YYYY-MM-DD or valid ISO 8601 timestamp.',
      });
    }
    validated.startDate = normalizeDateBoundary(startDate, false);
    validated.rawStartDate = startDate;
  }

  if (endDate !== undefined && endDate !== '') {
    if (!isValidDateString(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate format. Use YYYY-MM-DD or valid ISO 8601 timestamp.',
      });
    }
    validated.endDate = normalizeDateBoundary(endDate, true);
    validated.rawEndDate = endDate;
  }

  if (validated.startDate && validated.endDate) {
    const startMs = new Date(validated.startDate).getTime();
    const endMs = new Date(validated.endDate).getTime();
    if (startMs > endMs) {
      return res.status(400).json({
        success: false,
        message: 'startDate cannot be after endDate.',
      });
    }
  }

  // 2. Validate lotId if provided
  if (lotId !== undefined && lotId !== '') {
    const parsedLotId = Number(lotId);
    if (!Number.isInteger(parsedLotId) || parsedLotId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'lotId must be a positive integer.',
      });
    }
    validated.lotId = parsedLotId;
  }

  // 3. Validate status if provided
  if (status !== undefined && status !== '') {
    const upperStatus = String(status).trim().toUpperCase();
    validated.status = upperStatus;
  }

  // 4. Validate demoMethod if provided
  if (demoMethod !== undefined && demoMethod !== '') {
    const upperMethod = String(demoMethod).trim().toUpperCase();
    if (!VALID_DEMO_METHODS.includes(upperMethod)) {
      return res.status(400).json({
        success: false,
        message: `demoMethod must be one of: ${VALID_DEMO_METHODS.join(', ')}.`,
      });
    }
    validated.demoMethod = upperMethod;
  }

  // 5. Validate slotType if provided
  if (slotType !== undefined && slotType !== '') {
    validated.slotType = String(slotType).trim().toUpperCase();
  }

  // 6. Pagination validation
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  validated.page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  validated.limit = Number.isInteger(parsedLimit) && parsedLimit > 0 && parsedLimit <= 200
    ? parsedLimit
    : 50;
  validated.offset = (validated.page - 1) * validated.limit;

  req.validatedQuery = validated;
  next();
}
