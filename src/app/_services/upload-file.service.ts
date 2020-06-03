import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OpcuaInformationModel} from '../_models/opcua-information-model';
import {environment} from '../../environments/environment';
import {Model} from '../_models/model';
import {ModelFile} from '../_models/modelFile';


@Injectable()
export class UploadFileService {

  constructor(private http: HttpClient) {
  }

  uploadOpcuaFiles(file: File, projectID: string, modelID: string,
                   machineTypeId: string, sensorTypeId: string): Observable<OpcuaInformationModel> {
    const formData = new FormData();
    formData.append('file', file);

    if (machineTypeId != null) {
      formData.append('machineTypeId', machineTypeId);
    }
    if (sensorTypeId != null) {
      formData.append('sensorTypeId', sensorTypeId);
    }

    return this.http.post<OpcuaInformationModel>(environment.apiUrl
      + '/projects/' + projectID + '/models/' + modelID + '/opcuainformationmodel/', formData);

  }

  deleteOpcuaFile(opcuaInformationModelId: string, projectID: string, modelID: string) {
    return this.http.delete(environment.apiUrl
      + '/projects/' + projectID + '/models/' + modelID + '/opcuainformationmodel/' + opcuaInformationModelId);
  }

  parseOpcuaInformationModel(file: File, projectID: string,
                             machineTypeId: string, sensorTypeId: string): Observable<OpcuaInformationModel> {
    const formData = new FormData();
    formData.append('file', file);

    if (machineTypeId != null) {
      formData.append('machineTypeId', machineTypeId);
    }

    if (sensorTypeId != null) {
      formData.append('sensorTypeId', sensorTypeId);
    }

    return this.http.post<OpcuaInformationModel>(environment.apiUrl
      + '/projects/' + projectID + '/models/opcuainformationmodel/parse', formData);
  }

  getOpcuaInformationModel(opcuaInformationModelId: string, projectID: string, modelID: string): Observable<OpcuaInformationModel> {
    return this.http.get<OpcuaInformationModel>(environment.apiUrl
      + '/projects/' + projectID + '/models/' + modelID + '/opcuainformationmodel/' + opcuaInformationModelId);
  }

  getAllOpcuaInformationModels(projectId: string, modelId: string): Observable<OpcuaInformationModel[]> {
    return this.http.get<OpcuaInformationModel[]>(environment.apiUrl
      + '/projects/' + projectId + '/models/' + modelId + '/opcuainformationmodel/');
  }

  getOpcuaInformationModelRaw(opcuaInformationModelId: string, projectID: string, modelID: string): Observable<Blob> {
    return this.http.get(environment.apiUrl
      + '/projects/' + projectID + '/models/' + modelID + '/opcuainformationmodel/' + opcuaInformationModelId + '/raw',
      {responseType: 'blob'});
  }

  // file from event.target.files[0]
  uploadPMMLFile(file: File, projectID: string, modelID: string): Observable<ModelFile> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ModelFile>(environment.apiUrl + '/projects/' + projectID + '/models/' + modelID + '/file/', formData);
  }

  parsePMMLFileInModel(file: File, projectID: string, model: Model): Observable<Model> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', JSON.stringify(model));
    return this.http.post<Model>(environment.apiUrl + '/projects/' + projectID + '/models/file/parse', formData);
  }

  getModelFile(modelFileId: string, projectID: string, modelID: string): Observable<ModelFile> {
    return this.http.get<ModelFile>(environment.apiUrl + '/projects/' + projectID + '/models/' + modelID + '/file/' + modelFileId);
  }

  getModelFileRaw(modelFileId: string, projectID: string, modelID: string): Observable<Blob> {
    return this.http.get(environment.apiUrl
      + '/projects/' + projectID + '/models/' + modelID + '/file/' + modelFileId + '/raw',
      {responseType: 'blob'});
  }

  deleteModelFile(modelFileId: string, projectID: string, modelID: string) {
    return this.http.delete(environment.apiUrl
      + '/projects/' + projectID + '/models/' + modelID + '/file/' + modelFileId);
  }

}
