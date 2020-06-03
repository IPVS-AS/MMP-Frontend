import {Injectable} from '@angular/core';
import {ApiProviderService} from './api-provider.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Project} from '../_models/project';
import {Observable} from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json', 'crossdomain': 'true'})
};

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient, private provider: ApiProviderService) {
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.provider.buildProjectUrl(null));
  }

  deleteAllProjects(): Observable<{}> {
    return this.http.delete(this.provider.buildProjectUrl(null));
  }

  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(this.provider.buildProjectUrl(projectId));
  }

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.provider.buildProjectUrl(project.id), project, httpOptions);
  }

  updateProject(project: Project): Observable<Project> {
    return this.http.put<Project>(this.provider.buildProjectUrl(project.id), project, httpOptions);
  }

  deleteProject(projectId: string): Observable<{}> {
    return this.http.delete(this.provider.buildProjectUrl(projectId));
  }
}
