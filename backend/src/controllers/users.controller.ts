import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { usersService } from '../services';
import { asyncHandler } from '../utils/http';

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await usersService.listUsers();
  res.json({ success: true, message: 'Users retrieved', data: users });
});

export const createUserHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await usersService.createUser(req.body);
  res.json({ success: true, message: 'User created', data: user });
});

export const getUserByIdHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const user = await usersService.getUserById(id, req.user!);
  res.json({ success: true, message: 'User retrieved', data: user });
});

export const updateUserHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const user = await usersService.updateUser(id, req.body);
  res.json({ success: true, message: 'User updated', data: user });
});

export const deleteUserHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await usersService.deleteUser(id, req.user!.id);
  res.json({ success: true, message: 'User deleted', data: null });
});
