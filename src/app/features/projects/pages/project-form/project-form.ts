import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { CreateProjectDto } from '../../models/project.model';
import { notBlank } from '../../../../shared/validators/not-blank.validator';

// One form for both adding and editing, like the car form in WS5.
// /projects/new        -> id is undefined -> add
// /projects/:id/edit   -> id has a value  -> load the project and edit
@Component({
  selector: 'app-project-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule,
  ],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly id = input<string>(); // optional

  saving = signal(false);
  saveError = signal<string | null>(null);
  loadError = signal<string | null>(null);

  // Limits match the Zod schema on the server (name max 100, description max 1000)
  readonly nameMax = 100;
  readonly descriptionMax = 1000;

  projectForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(this.nameMax), notBlank]],
    description: ['', Validators.maxLength(this.descriptionMax)],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return; // adding a new project, nothing to load
    this.projectService.getProjectById(id).subscribe({
      next: (project) =>
        this.projectForm.patchValue({ name: project.name, description: project.description ?? '' }),
      // A separate loadError (WS5 note) so it does not look like a save error
      error: (err: Error) => this.loadError.set(err.message),
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const { name, description } = this.projectForm.getRawValue();
    // Trim here so " Website " is saved as "Website"
    const project: CreateProjectDto = { name: name.trim(), description: description.trim() };

    this.saving.set(true);
    this.saveError.set(null);
    this.projectForm.disable();

    const id = this.id();
    const request = id
      ? this.projectService.updateProject(id, project)
      : this.projectService.addProject(project);

    request.subscribe({
      next: (saved) => {
        this.snackBar.open(`${saved.name} saved`, 'Close', { duration: 5000 });
        this.router.navigate(['/projects', saved._id]);
      },
      error: (err: Error) => {
        this.saveError.set(err.message);
        this.saving.set(false);
        this.projectForm.enable();
      },
    });
  }

  // Cancel goes back to where the user came from (WS5 question):
  // editing -> back to that project's details, adding -> back to the list
  readonly cancelLink = computed(() => {
    const id = this.id();
    return id ? ['/projects', id] : ['/projects'];
  });
}
