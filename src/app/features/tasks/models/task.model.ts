import { User } from '../../users/models/user.model';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

// Same values as the enums in the Mongoose Task model, with labels for the UI
export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// What the API returns. project and assignedTo are populated.
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: { _id: string; name: string };
  assignedTo?: User | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string; // project id
  assignedTo?: string; // user id
  dueDate?: string; // ISO date string
}

// PATCH body. null means "clear this field" (the API schema allows null for these)
export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string | null;
  dueDate?: string | null;
}

// Query parameters supported by GET /api/tasks
export interface TaskFilter {
  project?: string;
  status?: TaskStatus;
}
