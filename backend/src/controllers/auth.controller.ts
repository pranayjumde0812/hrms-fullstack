import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { authService } from '../services';
import { asyncHandler } from '../utils/http';
import { extractRequestMetadata } from '../utils/requestMetadata';
export const loginUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, latitude, longitude } = req.body as {
    email: string;
    password: string;
    latitude?: number;
    longitude?: number;
  };
  const metadata = extractRequestMetadata(req);
  const result = await authService.login(email, password, {
    ...metadata,
    latitude,
    longitude,
  });

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, message: 'Logged in successfully', data: result });
});

export const logoutUser = (req: AuthRequest, res: Response) => {
  res.clearCookie('accessToken');
  res.json({ success: true, message: 'Logged out successfully', data: null });
};

export const getAuthenticatedUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getAuthenticatedUser(req.user?.id);
  res.json({ success: true, message: 'Authenticated user', data: user });
});
