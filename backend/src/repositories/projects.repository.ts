import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export type ProjectData = {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
};

const projectInclude = {
  users: { select: { id: true, firstName: true, lastName: true } },
} as const;

type ProjectId = NonNullable<Prisma.ProjectWhereUniqueInput['id']>;
type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

export const listAllProjects = () => {
  return prisma.project.findMany({ include: projectInclude });
};

export const listProjectsForUser = (userId: UserId) => {
  return prisma.project.findMany({
    where: { users: { some: { id: userId } } },
  });
};

export const createProject = (data: ProjectData) => {
  return prisma.project.create({ data });
};

export const assignUsersToProject = (projectId: ProjectId, userIds: UserId[]) => {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      users: {
        connect: userIds.map((id) => ({ id })),
      },
    },
    include: projectInclude,
  });
};

export const updateProject = (id: ProjectId, data: ProjectData) => {
  return prisma.project.update({
    where: { id },
    data,
    include: projectInclude,
  });
};

export const deleteProject = (id: ProjectId) => {
  return prisma.project.delete({ where: { id } });
};
