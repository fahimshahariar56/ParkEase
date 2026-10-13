import * as usersService from './users.service.js';

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's profile.
 */
export async function getMyProfile(req, res, next) {
  try {
    const user = await usersService.getUserProfile(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me
 * Updates the authenticated user's full_name and phone.
 */
export async function updateMyProfile(req, res, next) {
  try {
    const { fullName, phone } = req.body;
    const user = await usersService.updateUserProfile(req.user.id, { fullName, phone });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/users/:id
 * Returns user profile by ID (authorized owner or admin).
 */
export async function getUserById(req, res, next) {
  try {
    const user = await usersService.getUserProfile(req.params.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}