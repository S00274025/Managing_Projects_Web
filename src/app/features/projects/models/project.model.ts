import { User } from '../../users/models/user.model';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User | null; 
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  members?: string[];
}

export interface UpdateProjectDto {
  name: string;
  description?: string;
  members?: string[];
}

export function projectPeople(project: Project): User[] {
  const people = project.owner ? [project.owner] : [];
  for (const member of project.members) {
    if (!people.some((p) => p._id === member._id)) people.push(member);
  }
  return people;
}
