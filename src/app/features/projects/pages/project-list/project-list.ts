import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../services/project.service';
import { ProjectCard } from '../../components/project-card/project-card';
import { LoadState, withLoadState } from '../../../../shared/load-state';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  imports: [
    RouterLink, ProjectCard, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList {
  private projectService = inject(ProjectService);

  // What the user typed in the search box
  readonly search = signal('');

  readonly initial: LoadState<Project[]> = { status: 'loading' };

  // Same idea as car-details in WS3: turn the signal into an observable and use switchMap.
  // debounceTime waits until the user stops typing for 300ms so we don't send a request
  // on every key press, and switchMap cancels the old request if a new search starts.
  state = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => withLoadState(this.projectService.getProjects(term))),
    ),
    { initialValue: this.initial },
  );

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
