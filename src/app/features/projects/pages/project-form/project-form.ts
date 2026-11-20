import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../services/project.service';
import { CreateProjectDto } from '../../models/project.model';
import { notBlank } from '../../../../shared/validators/not-blank.validator';
import { UserService } from '../../../users/services/user.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { withLoadState } from '../../../../shared/load-state';

@Component({
  selector: 'app-project-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule,
  ],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);
  private auth = inject(AuthService);

  readonly id = input<string>();

  private readonly allUsers = toSignal(withLoadState(this.userService.getUsers()), { requireSync: true });
  readonly users = computed(() => {
    const state = this.allUsers();
    if (state.status !== 'loaded') return state;
    const myId = this.auth.user()?.id;
    return { ...state, data: state.data.filter((u) => u._id !== myId) };
  });

  saving = signal(false);
  notOwner = signal(false);
  saveError = signal<string | null>(null);
  loadError = signal<string | null>(null);

  readonly nameMax = 100;
  readonly descriptionMax = 1000;

  projectForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(this.nameMax), notBlank]],
    description: ['', Validators.maxLength(this.descriptionMax)],
    members: this.formBuilder.nonNullable.control<string[]>([]),
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        if (project.owner?._id !== this.auth.user()?.id) {
          this.loadError.set('Only the project owner can edit this project.');
          this.notOwner.set(true);
          this.projectForm.disable();
          return;
        }
        this.projectForm.patchValue({
          name: project.name,
          description: project.description ?? '',
          members: project.members.map((m) => m._id),
        });
      },
      error: (err: Error) => this.loadError.set(err.message),
    });
  }

  onSubmit(): void {
    if (this.notOwner()) return;
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const { name, description, members } = this.projectForm.getRawValue();
    const project: CreateProjectDto = { name: name.trim(), description: description.trim(), members };

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

  readonly cancelLink = computed(() => {
    const id = this.id();
    return id ? ['/projects', id] : ['/projects'];
  });
}
