import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { TASK_STATUSES, Task, TaskStatus } from '../../models/task.model';
import { LoadState, withLoadState } from '../../../../shared/load-state';
import { TaskItem } from '../../components/task-item/task-item';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog';

type StatusFilter = TaskStatus | 'all';

// All tasks across every project, filtered by status using GET /api/tasks?status=
@Component({
  selector: 'app-task-list',
  imports: [TaskItem, MatButtonToggleModule, MatProgressSpinnerModule],
  templateUrl: './task-list.html',
  styles: `
    .filters { margin-bottom: 1rem; max-width: 100%; overflow-x: auto; }
    .task-list { display: flex; flex-direction: column; gap: 0.75rem; }
  `,
})
export class TaskList {
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly statuses = TASK_STATUSES;
  readonly filter = signal<{ status: StatusFilter }>({ status: 'all' });
  readonly busyTaskId = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

  readonly initial: LoadState<Task[]> = { status: 'loading' };

  // filter is an object, so even choosing the same status again creates a new value
  // and the list reloads - this is also used to refresh after a change.
  state = toSignal(
    toObservable(this.filter).pipe(
      switchMap(({ status }) =>
        withLoadState(this.taskService.getTasks(status === 'all' ? {} : { status })),
      ),
    ),
    { initialValue: this.initial },
  );

  setStatusFilter(status: StatusFilter): void {
    this.filter.set({ status });
  }

  private reload(): void {
    this.filter.set({ ...this.filter() });
  }

  changeStatus(task: Task, status: TaskStatus): void {
    this.busyTaskId.set(task._id);
    this.actionError.set(null);
    this.taskService.updateTask(task._id, { status }).subscribe({
      next: () => {
        this.busyTaskId.set(null);
        this.reload();
      },
      error: (err: Error) => {
        this.busyTaskId.set(null);
        this.actionError.set(err.message);
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
        this.taskService.deleteTask(task._id).subscribe({
          next: () => {
            this.busyTaskId.set(null);
            this.snackBar.open('Task deleted', 'Close', { duration: 4000 });
            this.reload();
          },
          error: (err: Error) => {
            this.busyTaskId.set(null);
            this.actionError.set(err.message);
          },
        });
      });
  }
}
