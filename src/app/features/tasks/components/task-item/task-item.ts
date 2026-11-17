import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TASK_PRIORITIES, TASK_STATUSES, Task, TaskStatus } from '../../models/task.model';

// Shows one task. It does not call the API itself - it emits events (output)
// and the parent page decides what to do. This keeps it reusable on the
// project details page and on the all-tasks page.
@Component({
  selector: 'app-task-item',
  imports: [
    DatePipe, RouterLink, MatButtonModule, MatIconModule,
    MatMenuModule, MatChipsModule, MatTooltipModule,
  ],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
})
export class TaskItem {
  readonly task = input.required<Task>();
  readonly showProject = input(false);
  readonly busy = input(false);

  readonly statusChange = output<TaskStatus>();
  readonly remove = output<Task>();

  readonly statuses = TASK_STATUSES;

  readonly statusLabel = computed(
    () => TASK_STATUSES.find((s) => s.value === this.task().status)?.label ?? this.task().status,
  );
  readonly priorityLabel = computed(
    () => TASK_PRIORITIES.find((p) => p.value === this.task().priority)?.label ?? this.task().priority,
  );

  // A task is overdue if it has a due date in the past and is not done
  readonly overdue = computed(() => {
    const t = this.task();
    if (!t.dueDate || t.status === 'done') return false;
    const due = new Date(t.dueDate);
    due.setHours(23, 59, 59, 999);
    return due.getTime() < Date.now();
  });
}
