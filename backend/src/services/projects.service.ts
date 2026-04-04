import { Role } from '@prisma/client';
import { projectsRepository } from '../repositories';
import { ProjectData } from '../repositories/projects.repository';

export const listProjects = (user: { id: number; role: Role }) => {
  if (['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'].includes(user.role)) {
    return projectsRepository.listAllProjects();
  }

  return projectsRepository.listProjectsForUser(user.id);
};

export const createProject = (data: ProjectData) => {
  return projectsRepository.createProject(data);
};

export const assignUsers = (projectId: number, userIds: number[]) => {
  return projectsRepository.assignUsersToProject(projectId, userIds);
};

export const updateProject = (projectId: number, data: ProjectData) => {
  return projectsRepository.updateProject(projectId, data);
};

export const deleteProject = (projectId: number) => {
  return projectsRepository.deleteProject(projectId);
};
