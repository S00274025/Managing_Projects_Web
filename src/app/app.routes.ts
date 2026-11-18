import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },

  {
    path: 'login',
    title: 'Log in',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/register/register').then((m) => m.Register),
  },


  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'projects',
        title: 'Projects',
        loadComponent: () =>
          import('./features/projects/pages/project-list/project-list').then((m) => m.ProjectList),
      },
      {
        path: 'projects/new',
        title: 'New project',
        loadComponent: () =>
          import('./features/projects/pages/project-form/project-form').then((m) => m.ProjectForm),
      },
      {
        path: 'projects/:id',
        title: 'Project details',
        loadComponent: () =>
          import('./features/projects/pages/project-details/project-details').then((m) => m.ProjectDetails),
      },
      {
        path: 'projects/:id/edit',
        title: 'Edit project',
        loadComponent: () =>
          import('./features/projects/pages/project-form/project-form').then((m) => m.ProjectForm),
      },
      {
        path: 'projects/:projectId/tasks/new',
        title: 'New task',
        loadComponent: () => import('./features/tasks/pages/task-form/task-form').then((m) => m.TaskForm),
      },
      {
        path: 'tasks',
        title: 'All tasks',
        loadComponent: () => import('./features/tasks/pages/task-list/task-list').then((m) => m.TaskList),
      },
      {
        path: 'tasks/:id/edit',
        title: 'Edit task',
        loadComponent: () => import('./features/tasks/pages/task-form/task-form').then((m) => m.TaskForm),
      },
    ],
  },

  {
    path: '**',
    title: 'Not found',
    loadComponent: () => import('./shared/components/not-found/not-found').then((m) => m.NotFound),
  },
];
