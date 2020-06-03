import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ApiProviderService} from './api-provider.service';
import {Observable} from 'rxjs';
import {OrganisationUnit} from '../_models/eam/organisation-unit';
import {BusinessProcess} from '../_models/eam/business-process';
import {EamContainer} from '../_models/eam/eam-container';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class EamService {

  constructor(private http: HttpClient, private provider: ApiProviderService) {
  }

  getAllOrganisationUnit(): Observable<OrganisationUnit[]> {
    return this.http.get<OrganisationUnit[]>(this.provider.buildOrganisationUnitUrl(null));
  }

  addOrganisationUnit(organisationUnit: OrganisationUnit): Observable<OrganisationUnit> {
    return this.http.post<OrganisationUnit>(this.provider.buildOrganisationUnitUrl(null), organisationUnit, httpOptions);
  }

  updateOrganisationUnit(organisationUnit: OrganisationUnit): Observable<OrganisationUnit> {
    return this.http.put<OrganisationUnit>(this.provider.buildOrganisationUnitUrl(organisationUnit.id), organisationUnit, httpOptions);
  }

  deleteOrganisationUnit(id: string): Observable<{}> {
    return this.http.delete(this.provider.buildOrganisationUnitUrl(id));
  }

  deleteAllOrganisationUnits(): Observable<{}> {
    return this.http.delete(this.provider.buildOrganisationUnitUrl(null));
  }

  getAllBusinessProcess(): Observable<BusinessProcess[]> {
    return this.http.get<BusinessProcess[]>(this.provider.buildBusinessProcessUrl(null));
  }

  addBusinessProcesses(businessProcesses: BusinessProcess[]): Observable<BusinessProcess[]> {
    return this.http.post<BusinessProcess[]>(this.provider.buildBusinessProcessUrl(null), businessProcesses, httpOptions);
  }

  updateBusinessProcess(businessProcess: BusinessProcess): Observable<BusinessProcess> {
    return this.http.put<BusinessProcess>(this.provider.buildBusinessProcessUrl(businessProcess.id), businessProcess, httpOptions);
  }

  deleteBusinessProcess(id: string): Observable<{}> {
    return this.http.delete(this.provider.buildBusinessProcessUrl(id));
  }

  deleteAllBusinessProcesses(): Observable<{}> {
    return this.http.delete(this.provider.buildBusinessProcessUrl(null));
  }

  getAllEamContainers(): Observable<EamContainer[]> {
    return this.http.get<EamContainer[]>(this.provider.buildEamContainerUrl(null, null));
  }

  getAllEamContainersByModelId(modelId: string): Observable<EamContainer[]> {
    return this.http.get<EamContainer[]>(this.provider.buildEamContainerUrl(null, modelId));
  }

  addEamContainer(eamContainer: EamContainer): Observable<EamContainer> {
    return this.http.post<EamContainer>(this.provider.buildEamContainerUrl(null, null), eamContainer, httpOptions);
  }

  addEamContainers(eamContainers: EamContainer[]): Observable<EamContainer[]> {
    return this.http.post<EamContainer[]>(this.provider.buildEamContainerUrl(null, null) + '/all',
      eamContainers, httpOptions);
  }

  updateEamContainer(eamContainer: EamContainer): Observable<EamContainer> {
    return this.http.put<EamContainer>(this.provider.buildEamContainerUrl(eamContainer.id, null), eamContainer, httpOptions);
  }

  deleteEamContainer(id: string): Observable<{}> {
    return this.http.delete(this.provider.buildEamContainerUrl(id, null));
  }

  deleteAllEamContainers(): Observable<{}> {
    return this.http.delete(this.provider.buildEamContainerUrl(null, null));
  }
}
