import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiProviderService {
  projectsUrl: string;
  usersUrl: string;
  allModelsUrl: string;
  organisationUnitUrl: string;
  businessProcessUrl: string;
  eamContainerUrl: string;

  constructor() {
    this.projectsUrl = environment.apiUrl + '/projects';
    this.usersUrl = environment.apiUrl + '/users';
    this.allModelsUrl = environment.apiUrl + '/models';
    this.organisationUnitUrl = environment.apiUrl + '/organisationUnits';
    this.businessProcessUrl = environment.apiUrl + '/businessprocesses';
    this.eamContainerUrl = environment.apiUrl + '/eam';
  }

  buildProjectUrl(projectId: string) {
    if (projectId == null) {
      return this.projectsUrl;
    } else {
      return this.projectsUrl + '/' + projectId;
    }
  }

  buildModelUrl(projectId: string, modelId: string) {
    if (projectId == null) {
      return this.allModelsUrl;
    } else {
      if (modelId == null) {
        return this.buildProjectUrl(projectId) + '/models';
      } else {
        return this.buildProjectUrl(projectId) + '/models/' + modelId;
      }
    }
  }

  buildModelGroupUrl(projectId: string) {
    return this.buildProjectUrl(projectId) + '/models/modelGroups';
  }

  buildSingleModelGroupUrl(projectId: string, modelGroupidentifier: string) {
    return this.buildProjectUrl(projectId) + '/models/modelGroups/' + modelGroupidentifier;
  }

  buildUserUrl(userId: string) {
    if (userId == null) {
      return this.usersUrl;
    } else {
      return this.usersUrl + '/' + userId;
    }
  }

  buildOrganisationUnitUrl(organisationUnitId: string): string {
    if (organisationUnitId == null) {
      return this.organisationUnitUrl;
    } else {
      return this.organisationUnitUrl + '/' + organisationUnitId;
    }
  }

  buildBusinessProcessUrl(businessProcessId: string): string {
    if (businessProcessId == null) {
      return this.businessProcessUrl;
    } else {
      return this.businessProcessUrl + '/' + businessProcessId;
    }
  }

  buildEamContainerUrl(eamContainerId: string, modelId): string {
    if (eamContainerId == null && modelId == null) {
      return this.eamContainerUrl;
    } else if (modelId != null) {
      return this.eamContainerUrl + '/models/' + modelId;
    } else {
      return this.eamContainerUrl + '/' + eamContainerId;
    }
  }

  buildScoringUrl(projectId: string, modelId: string) {
    return this.buildModelUrl(projectId, modelId) + '/scoring';
  }
}

