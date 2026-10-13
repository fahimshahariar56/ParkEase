/**
 * User Profile input validation
 */

const PHONE_REGEX = /^[+0-9()\s-]{7,20}$/;

export function validateUpdateProfile(req, res, next) {
  const { fullName, phone, role, email } = req.body;

  // Security Rule: Prevent tampering with immutable fields
  if (role !== undefined) {
    return res.status(403).json({
      success: false,
      message: 'Modifying role via profile update is strictly forbidden.',
    });
  }

  if (email !== undefined) {
    return res.status(400).json({
      success: false,
      message: 'Email address cannot be changed via profile update.',
    });
  }

  if (fullName !== undefined) {
    if (typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.',
      });
    }
    if (fullName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot exceed 100 characters.',
      });
    }
    req.body.fullName = fullName.trim();
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    const trimmedPhone = String(phone).trim();
    if (!PHONE_REGEX.test(trimmedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Provide 7-20 digits and optional formatting (+, -, spaces).',
      });
    }
    req.body.phone = trimmedPhone;
  } else if (phone === '' || phone === null) {
    req.body.phone = null;
  }

  if (fullName === undefined && phone === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (fullName or phone) must be provided to update profile.',
    });
  }

  next();
}
