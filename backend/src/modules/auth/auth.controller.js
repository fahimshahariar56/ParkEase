import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;
    const result = await authService.registerCustomer({ fullName, email, password, phone });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginCustomer({ email, password });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function loginCustomer(req, res, next) {
  try {
    res.locals.operation = 'auth.loginCustomer';
    const { email, password } = req.body;
    const result = await authService.loginCustomer({ email, password });

    res.status(200).json({
      success: true,
      message: 'Customer signed in successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin({ email, password });

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}
