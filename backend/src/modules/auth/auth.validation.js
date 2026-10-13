/**
 * Authentication input validation and role-tampering prevention
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, res, next) {
  const { fullName, email, password, phone, role } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required and must be at least 2 characters.',
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 8 characters.',
    });
  }

  // Security Rule: Public registration MUST NEVER create an admin account
  if (role && role.toUpperCase() === 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Public registration for ADMIN role is strictly forbidden.',
    });
  }

  // Sanitize and normalize body
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.role = 'CUSTOMER'; // Force customer role
  req.body.phone = phone ? String(phone).trim() : null;

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required.',
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}
