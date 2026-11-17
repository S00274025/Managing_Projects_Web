import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateProjectDto, Project, UpdateProjectDto } from '../models/project.model';

// Error handling is not done here - it is all in the error interceptor (WS3 task 8)
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  // search is optional - it uses the ?search= filter I added to the API
  getProjects(search = ''): Observable<Project[]> {
    const params = search.trim() ? new HttpParams().set('search', search.trim()) : undefined;
    return this.http.get<Project[]>(this.apiUrl, { params });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  addProject(project: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: string, changes: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, changes);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
