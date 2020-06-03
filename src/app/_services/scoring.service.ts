import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ApiProviderService} from './api-provider.service';
import {Observable} from 'rxjs';
import {ScoringInput, ScoringOutput} from '../_models/scoring';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  constructor(private http: HttpClient, private provider: ApiProviderService) {
  }

  scoreModel(projectId: string, modelId: string, inputs: ScoringInput[]): Observable<ScoringOutput[]> {
    return this.http.post<ScoringOutput[]>(this.provider.buildScoringUrl(projectId, modelId), inputs, httpOptions);
  }

}
