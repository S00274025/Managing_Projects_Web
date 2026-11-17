import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../../users/services/user.service';
import { ProjectService } from '../../../projects/services/project.service';
import {
  CreateTaskDto, TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus, UpdateTaskDto,
} from '../../models/task.model';
import { withLoadState } from '../../../../shared/load-state';
import { notBlank } from '../../../../shared/validators/not-blank.validator';

// Add:  /projects/:projectId/tasks/new  -> projectId has a value
// Edit: /tasks/:id/edit                 -> id has a value
@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatProgressBarModule,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly id = input<string>();
  readonly projectId = input<string>();

  // When editing we only know the project after the task has loaded
  private readonly loadedProjectId = signal<string | null>(null);
  readonly ownerProjectId = computed(() => this.projectId() ?? this.loadedProjectId());
  readonly projectName = signal<string | null>(null);

  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;

  // Users for the "Assigned to" drop down
  readonly users = toSignal(withLoadState(this.userService.getUsers()), { requireSync: true });

  // New tasks cannot be due in the past. When editing an old task this is not enforced,
  // otherwise an overdue task could never be saved again.
  readonly minDate = computed(() => (this.id() ? null : startOfToday()));

  saving = signal(false);
  saveError = signal<string | null>(null);
  loadError = signal<string | null>(null);

  readonly titleMax = 200;
  readonly descriptionMax = 2000;

  // Limits match createTaskSchema (Zod) on the server
  taskForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(this.titleMax), notBlank]],
    description: ['', Validators.maxLength(this.descriptionMax)],
    status: this.formBuilder.nonNullable.control<TaskStatus>('todo', Validators.required),
    priority: this.formBuilder.nonNullable.control<TaskPriority>('medium', Validators.required),
    assignedTo: this.formBuilder.control<string | null>(null),
    dueDate: this.formBuilder.control<Date | null>(null),
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.taskService.getTaskById(id).subscribe({
        next: (task) => {
          this.loadedProjectId.set(task.project?._id ?? null);
          this.projectName.set(task.project?.name ?? null);
          this.taskForm.patchValue({
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo?._id ?? null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
          });
        },
        error: (err: Error) => this.loadError.set(err.message),
      });
      return;
    }

    // Adding: show which project the task is being added to
    const projectId = this.projectId();
    if (projectId) {
      this.projectService.getProjectById(projectId).subscribe({
        next: (project) => this.projectName.set(project.name),
        error: (err: Error) => this.loadError.set(err.message),
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const { title, description, status, priority, assignedTo, dueDate } = this.taskForm.getRawValue();

    this.saving.set(true);
    this.saveError.set(null);
    this.taskForm.disable();

    const id = this.id();
    let request;
    if (id) {
      // PATCH: null tells the API to clear assignedTo / dueDate
      const changes: UpdateTaskDto = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo ?? null,
        dueDate: dueDate ? toIsoDate(dueDate) : null,
      };
      request = this.taskService.updateTask(id, changes);
    } else {
      const newTask: CreateTaskDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        project: this.projectId() ?? '',
        assignedTo: assignedTo ?? undefined,
        dueDate: dueDate ? toIsoDate(dueDate) : undefined,
      };
      request = this.taskService.addTask(newTask);
    }

    request.subscribe({
      next: (saved) => {
        this.snackBar.open(`Task "${saved.title}" saved`, 'Close', { duration: 5000 });
        const projectId = this.ownerProjectId();
        this.router.navigate(projectId ? ['/projects', projectId] : ['/tasks']);
      },
      error: (err: Error) => {
        this.saveError.set(err.message);
        this.saving.set(false);
        this.taskForm.enable();
      },
    });
  }
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// The datepicker gives local midnight. Converting that straight to UTC can move it to
// the day before (e.g. Irish summer time is UTC+1). Using midday UTC keeps the same date.
function toIsoDate(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)).toISOString();
}
