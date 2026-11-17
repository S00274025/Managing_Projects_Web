import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="page">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <a matButton="filled" routerLink="/projects">Back to projects</a>
    </section>
  `,
})
export class NotFound {}
