# Managing Projects – Angular client

Angular 21 + Angular Material front end for the Managing Projects Express API
(separate repository).

## Run it

1. Start the Express API first (port 3000). Its `.env` needs `MONGODB_URI`, `JWT_SECRET`
   and optionally `CLIENT_URL=http://localhost:4200`.
2. In this folder:

```bash
npm install
ng serve --open
```

The app runs on http://localhost:4200. The API URL is in `src/environments/`.

## Features

- Register / log in (JWT stored in localStorage, added to requests by an HTTP interceptor)
- Route guard – every page except login/register needs a logged in user
- Projects: list with search, details, create, edit, delete (Material confirm dialog)
- Tasks: create, edit, delete, quick status change, filter all tasks by status
- Reactive forms with validation that matches the Zod schemas on the server
  (custom `notBlank` validator, cross-field `passwordsMatch` validator, datepicker min date)
- Loading / error / loaded states with `withLoadState`, errors handled in one error interceptor
- Responsive layout (BreakpointObserver menu on phones), skip link, page titles, aria labels

## Structure

```
src/app/
  core/        auth service, guard, interceptors, title strategy
  shared/      load-state, validators, confirm dialog, not-found page
  features/
    auth/      login, register
    projects/  models, service, list/details/form pages, project-card
    tasks/     models, service, list/form pages, task-item
    users/     model, service (for the "Assigned to" drop down)
```

## Tests

`ng test` runs the unit tests for the custom validators.
