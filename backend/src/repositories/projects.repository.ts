import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export type ProjectData = {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
};

const projectInclude = Prisma.validator<Prisma.ProjectInclude>()({
  projectAssignments: {
    where: { isActive: true },
    orderBy: { assignedAt: 'asc' },
    select: {
      assignedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  },
});

type ProjectId = NonNullable<Prisma.ProjectWhereUniqueInput['id']>;
type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;
type ProjectWithAssignments = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

const mapProjectUsers = (project: ProjectWithAssignments) => ({
  ...project,
  users: project.projectAssignments.map((assignment) => ({
    ...assignment.user,
    assignedAt: assignment.assignedAt,
  })),
});

export const listAllProjects = () => {
  return prisma.project.findMany({ include: projectInclude }).then((projects) => projects.map(mapProjectUsers));
};

export const listProjectsForUser = (userId: UserId) => {
  return prisma.project.findMany({
    where: { projectAssignments: { some: { userId, isActive: true } } },
    include: projectInclude,
  }).then((projects) => projects.map(mapProjectUsers));
};

export const createProject = (data: ProjectData) => {
  return prisma.project.create({ data, include: projectInclude }).then(mapProjectUsers);
};

export const assignUsersToProject = (projectId: ProjectId, userIds: UserId[]) => {
  return prisma.$transaction(async (tx) => {
    if (userIds.length > 0) {
      await tx.userProjectAssignment.createMany({
        data: userIds.map((userId) => ({
          userId,
          projectId,
          isActive: true,
        })),
        skipDuplicates: true,
      });
    }

    const project = await tx.project.update({
      where: { id: projectId },
      data: {},
      include: projectInclude,
    });

    return mapProjectUsers(project);
  });
};

export const updateProject = (id: ProjectId, data: ProjectData) => {
  return prisma.project.update({
    where: { id },
    data,
    include: projectInclude,
  }).then(mapProjectUsers);
};

export const deleteProject = (id: ProjectId) => {
  return prisma.project.delete({ where: { id } });
};
