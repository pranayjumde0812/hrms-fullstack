import prisma from '../utils/prisma';

export const countUsers = async () => prisma.user.count();

export const countProjects = async () => prisma.project.count();

export const countDepartments = async () => prisma.department.count();
