import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories';
import { AppError } from '../utils/http';

export const login = async (email: string, password: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || user.password !== password) {
    throw new AppError(401, 'Invalid credentials');
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] },
  );

  const { password: _password, ...safeUser } = user;

  return { user: safeUser, accessToken };
};

export const getAuthenticatedUser = async (userId?: number) => {
  if (!userId) {
    throw new AppError(401, 'Authentication required');
  }

  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};
