import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SearchDto} from '../_models/search-dto';
import {environment} from '../../environments/environment';
import {Model} from '../_models/model';
import {FilterDto} from '../_models/filter-dto';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) {
  }

  collectPossibleFilters(): Observable<FilterDto> {
    return this.http.get<FilterDto>(environment.apiUrl + '/advsearch', httpOptions);
  }

  filterModels(algorithm: string, machineName: string, sensorName: string, searchTerms: string[]): Observable<Model[]> {
    const searchDto = new SearchDto();
    if (algorithm === null) {
      searchDto.algorithmsToFilterFor = null;
    } else {
      searchDto.algorithmsToFilterFor = [algorithm];
    }
    if (machineName === null) {
      searchDto.machineNamesToFilterFor = null;
    } else {
      searchDto.machineNamesToFilterFor = [machineName];
    }
    if (sensorName === null) {
      searchDto.sensorNamesToFilterFor = null;
    } else {
      searchDto.sensorNamesToFilterFor = [sensorName];
    }
    if (!searchTerms || searchTerms.length === 0) {
      searchDto.searchTerms = null;
    } else {
      searchDto.searchTerms = searchTerms;
    }
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json', ignoreLoadingBar: ''})};
    return this.http.post<Model[]>(environment.apiUrl + '/advsearch', searchDto, options);
  }

}
