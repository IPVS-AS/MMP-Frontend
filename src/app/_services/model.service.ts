import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Model, ModelGroup} from '../_models/model';
import {ApiProviderService} from './api-provider.service';
import {Observable} from 'rxjs';
import 'rxjs-compat/add/operator/timeout';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  constructor(private http: HttpClient, private provider: ApiProviderService) {
  }

  getAllModels(): Observable<Model[]> {
    return this.http.get<Model[]>(this.provider.buildModelUrl(null, null));
  }

  getAllModelsInProject(projectId: string): Observable<Model[]> {
    return this.http.get<Model[]>(this.provider.buildModelUrl(projectId, null));
  }

  getAllModelGroupsInProject(projectId: string): Observable<ModelGroup[]> {
    return this.http.get<ModelGroup[]>(this.provider.buildModelGroupUrl(projectId));
  }

  getModelsForProjectAndModelGroupIdentifier(projectId: string, modelGroupIdentifier: string) {
    return this.http.get<Model[]>(this.provider.buildSingleModelGroupUrl(projectId, modelGroupIdentifier));
  }

  deleteAllModelsInProject(projectId: string): Observable<{}> {
    return this.http.delete(this.provider.buildModelUrl(projectId, null));
  }

  getModelInProject(projectId: string, modelId: string): Observable<Model> {
    return this.http.get<Model>(this.provider.buildModelUrl(projectId, modelId));
  }

  addModelToProject(projectId: string, model: Model): Observable<Model> {
    return this.http.post<Model>(this.provider.buildModelUrl(projectId, null), model, httpOptions);
  }

  updateModelInProject(projectId: string, model: Model): Observable<Model> {
    return this.http.put<Model>(this.provider.buildModelUrl(projectId, model.id), model, httpOptions);
  }

  deleteModelFromProject(projectId: string, modelId: string): Observable<{}> {
    return this.http.delete(this.provider.buildModelUrl(projectId, modelId));
  }
}
