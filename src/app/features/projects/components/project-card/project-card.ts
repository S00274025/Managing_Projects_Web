import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="project-card">
      <mat-card-header>
        <mat-icon mat-card-avatar aria-hidden="true">folder</mat-icon>
        <mat-card-title><h3>{{ project().name }}</h3></mat-card-title>
        <mat-card-subtitle>Owner: {{ project().owner?.name ?? 'Unknown' }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p class="description">{{ project().description || 'No description' }}</p>
        <p class="meta">Created {{ project().createdAt | date: 'mediumDate' }}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <a matButton [routerLink]="['/projects', project()._id]"
           [attr.aria-label]="'View project ' + project().name">View</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .project-card { height: 100%; display: flex; flex-direction: column; }
    mat-card-content { flex: 1; }
    h3 { margin: 0; font: var(--mat-sys-title-medium); }
    mat-icon[mat-card-avatar] { color: var(--mat-sys-primary); font-size: 40px; width: 40px; height: 40px; }
    .description { display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-small); }
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
