import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../../tasks/services/task.service';
import { Project } from '../../models/project.model';
import { Task, TaskStatus } from '../../../tasks/models/task.model';
import { LoadState, withLoadState } from '../../../../shared/load-state';
import { TaskItem } from '../../../tasks/components/task-item/task-item';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-project-details',
  imports: [
    DatePipe, RouterLink, TaskItem, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatProgressBarModule,
  ],
  templateUrl: './project-details.html',
  styleUrl: './project-details.scss',
})
export class ProjectDetails {
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly id = input.required<string>();

  private readonly refreshTasks = signal(0);

  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);
  readonly taskError = signal<string | null>(null);
  readonly busyTaskId = signal<string | null>(null);

  readonly initialProject: LoadState<Project> = { status: 'loading' };
  readonly initialTasks: LoadState<Task[]> = { status: 'loading' };

  state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => withLoadState(this.projectService.getProjectById(id))),
    ),
    { initialValue: this.initialProject },
  );

  private readonly taskQuery = computed(() => ({ project: this.id(), refresh: this.refreshTasks() }));

  tasksState = toSignal(
    toObservable(this.taskQuery).pipe(
      filter((q) => !!q.project),
      switchMap((q) => withLoadState(this.taskService.getTasks({ project: q.project }))),
    ),
    { initialValue: this.initialTasks },
  );

  private auth = inject(AuthService);

  readonly isOwner = computed(() => {
    const s = this.state();
    return s.status === 'loaded' && s.data.owner?._id === this.auth.user()?.id;
  });

  readonly progress = computed(() => {
    const t = this.tasksState();
    if (t.status !== 'loaded' || t.data.length === 0) return null;
    const done = t.data.filter((task) => task.status === 'done').length;
    return { done, total: t.data.length, percent: Math.round((done / t.data.length) * 100) };
  });

  deleteProject(project: Project): void {
    const data: ConfirmDialogData = {
      title: 'Delete project?',
      message: `"${project.name}" and all of its tasks will be deleted. This cannot be undone.`,
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.deleting.set(true);
        this.deleteError.set(null);
        this.projectService.deleteProject(project._id).subscribe({
          next: () => {
            this.snackBar.open(`${project.name} deleted`, 'Close', { duration: 5000 });
            this.router.navigate(['/projects']);
          },
          error: (err: Error) => {
            this.deleteError.set(err.message);
            this.deleting.set(false);
          },
        });
      });
  }

  changeStatus(task: Task, status: TaskStatus): void {
    this.busyTaskId.set(task._id);
    this.taskError.set(null);
    this.taskService.updateTask(task._id, { status }).subscribe({
      next: () => {
        this.busyTaskId.set(null);
        this.refreshTasks.update((n) => n + 1);
      },
      error: (err: Error) => {
        this.busyTaskId.set(null);
        this.taskError.set(err.message);
      },
    });
  }

  deleteTask(task: Task): void {
    const data: ConfirmDialogData = { title: 'Delete task?', message: `Delete "${task.title}"?` };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.busyTaskId.set(task._id);
        this.taskError.set(null);
        this.taskService.deleteTask(task._id).subscribe({
          next: () => {
            this.busyTaskId.set(null);
            this.snackBar.open('Task deleted', 'Close', { duration: 4000 });
            this.refreshTasks.update((n) => n + 1);
          },
          error: (err: Error) => {
            this.busyTaskId.set(null);
            this.taskError.set(err.message);
          },
        });
      });
  }
}
