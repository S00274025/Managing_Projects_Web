import { User } from '../../users/models/user.model';

// What the API returns. owner and members are populated by Mongoose (.populate)
// so they arrive as objects, not just ids.
export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User | null; 
  members: User[];
  createdAt: string;
  updatedAt: string;
}

// Sent when creating. No _id, and no owner - the API uses the logged in user.
export interface CreateProjectDto {
  name: string;
  description?: string;
}

// The API uses PATCH for projects, so only these fields can be changed
export interface UpdateProjectDto {
  name: string;
  description?: string;
}
