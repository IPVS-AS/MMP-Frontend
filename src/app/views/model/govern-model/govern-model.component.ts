import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {DatePipe, Location} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {FileItem, FileUploader} from 'ng2-file-upload';
import {ModelService} from '../../../_services/model.service';
import {CustomField, Model, ModelGroup, ModelMetadata, ModelStatus, PMMLMetadata} from '../../../_models/model';
import {Project} from '../../../_models/project';
import {ProjectService} from '../../../_services/project.service';
import {UploadFileService} from '../../../_services/upload-file.service';
import {User} from '../../../_models/user';
import {UserService} from '../../../_services/user.service';
import {DataSource, RelationalDBInformation} from '../../../_models/data-source';
import Utils from '../../../_utils/Utils';
import {forkJoin} from 'rxjs';
import {DataSourceType} from '../../../_models/data-source-type';
import {ModelFileDetailsComponent} from '../model-file-details/model-file-details.component';
import {OpcuaInformationModel} from '../../../_models/opcua-information-model';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TimeoutComponent} from '../../../timeout/timeout.component';

@Component({selector: 'app-govern-model', templateUrl: './govern-model.component.html'})
export class GovernModelComponent extends TimeoutComponent implements AfterViewInit {
  @ViewChild('modelFileDetails') modelFileDetails: ModelFileDetailsComponent;
  @ViewChild('uploadPMML') uploadPMMLRef: ElementRef;

  public projectIDExists: boolean;
  modelIDExists: boolean;

  projectID: string;
  modelID: string;
  model: Model = new Model();
  oldOpcuaInformationModelIds: string[] = [];
  uploadService: UploadFileService;
  form: FormGroup;
  date: string;
  project: Project = new Project();
  opcuaFiles: File[] = [];
  oldModelFileId: string;
  pmmlFile: File;
  pmmlMetadata: PMMLMetadata;
  showPmml: boolean;
  pmmlUploader: FileUploader = new FileUploader({});
  opcuaUploader: FileUploader = new FileUploader({});
  hasPmmlDropZoneOver: false;
  hasOpcuaDropZoneOver: false;
  dataSource: DataSource = new DataSource();
  isAdd: boolean;
  isArchived = false;
  users: User[];
  dataSources: DataSourceType[] = [DataSourceType.Opcua, DataSourceType.RelationalDataBase];
  opcuaInformationModels: OpcuaInformationModel[] = [];
  descriptionMaxLength = 1000;
  inputMaxLength = 255;
  modelGroups: ModelGroup[];
  PMML_FILE_TYPE = 'PMML';
  OPCUA_FILE_TYPE = 'OPCUA';
  SAVE_OPERATION = this.toastManagerService.SAVE_OPERATION;
  MODEL_ENTITY = this.toastManagerService.MODEL_ENTITY;

  projects: Project[];
  existsProject: boolean;

  constructor(
    protected projectService: ProjectService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected location: Location,
    protected formBuilder: FormBuilder,
    protected httpService: HttpClient,
    protected modelService: ModelService,
    protected toastManagerService: ToastManagerService,
    protected userService: UserService,
    protected datePipe: DatePipe,
    protected dialog: MatDialog) {
    super();
    this.model.modelMetadata = new ModelMetadata();
    this.model.modelMetadata.customFields = [];
    this.model.opcuaInformationModels = [];
    this.model.relationalDBInformation = new RelationalDBInformation();
    this.model.modelMetadata.modelGroup = new ModelGroup();
  }

  ngAfterViewInit() {
    // this defines what will be done, after a PMML file is added via ng2-file-selected.
    // replaces (onFileSelected) in ng2-file-select
    this.pmmlUploader.onAfterAddingFile = (item => {
      this.pmmlFileChange(item);

      // This will allow selecting same file again.
      this.uploadPMMLRef.nativeElement.value = '';
    });
  }

  get customFields() {
    return this.form.get('customFields') as FormArray;
  }

  opcuaFileChange(event) {
    const fileList: FileList = event;
    if (fileList.length > 0) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        this.uploadService.parseOpcuaInformationModel(file, this.project.id, null, null).subscribe(opcuaInformationModel => {
          this.opcuaInformationModels.push(opcuaInformationModel);
          this.opcuaFiles.push(file);
          this.showPmml = false;
          if (this.modelFileDetails != null) {
            this.modelFileDetails.showPmml = false;
          }
          this.updateOpcuaTree();
          this.toastManagerService.openFileParseSuccess(this.OPCUA_FILE_TYPE);
        }, (err) => {
          console.log(err);
          this.toastManagerService.openFileParseError(this.OPCUA_FILE_TYPE);
          this.opcuaUploader.queue.pop();
        });
      }
    }
  }

  opcuaFileUpload() {
    const opcuas = [];
    this.opcuaFiles.forEach(file => {
      opcuas.push(this.uploadService.uploadOpcuaFiles(file, this.projectID, this.model.id, null, null));
    });
    return opcuas;
  }

  pmmlFileChange(event) {
    let rawFile;
    if (event instanceof FileItem) {
      rawFile = event.file.rawFile;
    } else if (event instanceof FileList && event.length > 0) {
      rawFile = event[0];
    }

    if (rawFile) {
      const opcuaInformationModelIdsBak = this.model.opcuaInformationModels;
      this.model.opcuaInformationModels = [];
      this.uploadService.parsePMMLFileInModel(rawFile, this.project.id, this.model).subscribe(model => {
        this.model = model;
        this.model.projectId = Number(this.projectID);
        if (this.model.relationalDBInformation == null) {
          this.model.relationalDBInformation = new RelationalDBInformation();
        }
        if (this.model.opcuaInformationModels == null) {
          this.model.opcuaInformationModels = [];
        }
        if (this.pmmlUploader.queue.length > 1) {
          this.pmmlUploader.queue.reverse().pop();
        }
        this.pmmlFile = rawFile;
        this.pmmlMetadata = this.pmmlRemoveNull(model.modelMetadata.pmmlMetadata);
        this.showPmml = true;
        this.model.opcuaInformationModels = opcuaInformationModelIdsBak;
        this.toastManagerService.openFileParseSuccess(this.PMML_FILE_TYPE);
      }, (err) => {
        console.log(err);
        this.toastManagerService.openFileParseError(this.PMML_FILE_TYPE);
        this.pmmlUploader.queue.pop();
        this.model.opcuaInformationModels = opcuaInformationModelIdsBak;
      });
    }
  }

  onDataSourceClear() {
    this.model.relationalDBInformation = null;
    this.dataSource = new DataSource();
    this.model.opcuaInformationModels = [];
    this.opcuaInformationModels = [];
    this.opcuaFiles = [];
    this.opcuaUploader.clearQueue();
  }

  onDataSourceChange(event) {
    this.onDataSourceClear();
    this.dataSource.type = event;
    if (this.dataSource.type === DataSourceType.RelationalDataBase && this.model.relationalDBInformation == null) {
      this.model.relationalDBInformation = new RelationalDBInformation();
      this.model.relationalDBInformation.type = DataSourceType.RelationalDataBase;
      if (this.pmmlFile != null && this.modelFileDetails != null) {
        this.modelFileDetails.showPmml = true;
        this.showPmml = true;
      }
    }
  }

  pmmlRemoveNull(pmml) {
    return JSON.parse(JSON.stringify(pmml, (key, value) => {
      if (value !== null) {
        return value;
      }
    }));
  }

  pmmlFileUpload() {
    return this.uploadService.uploadPMMLFile(this.pmmlFile, this.project.id, this.model.id);
  }

  addCustomField() {
    this.customFields.push(this.formBuilder.group({fieldName: '', fieldContent: ''}));
  }

  deleteCustomField(name) {
    this.customFields.removeAt(name);
  }

  uploadFile() {
    if (this.opcuaFiles) {
      this.opcuaFileUpload();
    }
    if (this.pmmlFile) {
      this.pmmlFileUpload();
    }
  }

  fileOverPmml(e: any) {
    this.hasPmmlDropZoneOver = e;
  }

  fileOverOpcua(e: any) {
    this.hasOpcuaDropZoneOver = e;
  }

  removeOpcuaFile(file: FileItem) {
    file.remove();
    const index = this.opcuaFiles.indexOf(file._file, 0);
    if (index > -1) {
      this.opcuaFiles.splice(index, 1);
      this.model.opcuaInformationModels.splice(index, 1);
      this.opcuaInformationModels.splice(index, 1);
      this.updateOpcuaTree();
    }
    this.model.relationalDBInformation = null;
    if (this.opcuaInformationModels.length === 0) {
      this.showPmml = true;
      if (this.modelFileDetails != null) {
        this.modelFileDetails.showPmml = true;
      }
    }
  }

  updateOpcuaTree() {
    if (this.modelFileDetails != null) {
      this.modelFileDetails.updateOpcuaTree();
    }
  }

  removePmmlFile(file: FileItem) {
    file.remove();
    this.model.modelFile = null;
    this.pmmlFile = null;
    this.pmmlMetadata = null;
    if (this.modelFileDetails != null) {
      this.modelFileDetails.showPmml = false;
    }
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  getProjects() {
    this.projectService.getAllProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  cancel() {
    this.location.back();
  }

  submit() {
  }

  uploadFilesAndRedirect() {
    if (this.opcuaFiles && this.opcuaFiles.length > 0 && this.pmmlFile) {
      let opcuas, pmml;
      pmml = this.pmmlFileUpload();
      opcuas = this.opcuaFileUpload();
      pmml.subscribe(() => forkJoin(opcuas).subscribe(() => {
        this.redirectToModelsView();
      }));
    } else if (this.opcuaFiles && this.opcuaFiles.length > 0) {
      forkJoin(this.opcuaFileUpload()).subscribe(() => this.redirectToModelsView());
    } else if (this.pmmlFile) {
      this.pmmlFileUpload().subscribe(() => this.redirectToModelsView());
    } else {
      this.redirectToModelsView();
    }
  }

  redirectToModelsView() {
    this.location.back();
  }

  modelStates() {
    return Object.keys(ModelStatus).filter((entry) => {
      return isNaN(Number(entry));
    });
  }

  formatBytes(bytes: number) {
    return Utils.formatBytes(bytes);
  }

  isModelValid(): boolean {
    let valid = true;
    if (this.model.modelMetadata.status === 'OPERATION' && this.pmmlFile == null) {
      valid = false;
    }
    return valid;
  }

  onStateChange() {
    if (!this.isAdd && this.model.modelMetadata.status === 'ARCHIVED') {
      this.form.disable();
      this.isArchived = true;
    } else {
      this.form.enable();
      this.isArchived = false;
    }
  }

  setModelGroupIfExists(modelId: string) {
    if (this.model && this.model.modelMetadata) {
      this.model.modelMetadata.modelGroup = null;
    }
    if (modelId && this.projectID) {
      this.modelService.getModelInProject(this.projectID, modelId).subscribe(model => {
        if (model) {
          this.model.modelMetadata.modelGroup = model.modelMetadata.modelGroup;
          this.model.modelMetadata.name = model.modelMetadata.name;
          this.model.modelMetadata.author = model.modelMetadata.author;
          this.model.modelMetadata.status = model.modelMetadata.status;
          this.model.modelMetadata.algorithm = model.modelMetadata.algorithm;
          this.model.modelMetadata.dateOfCreation = model.modelMetadata.dateOfCreation;
          this.model.modelMetadata.customFields = model.modelMetadata.customFields;
          this.model.modelMetadata.modelDescription = model.modelMetadata.modelDescription;

          this.model.modelMetadata.customFields.forEach((entry) => {
            const entryData = entry as CustomField;
            this.customFields.push(this.formBuilder.group(
              {fieldName: entryData.fieldName, fieldContent: entryData.fieldContent}));
          });
        }
      });
    }
    if (this.projectID) {
      this.modelService.getAllModelGroupsInProject(this.projectID).subscribe(
        groups => {
          this.modelGroups = groups;
        },
        error => this.modelGroups = []);
    }
  }

  projectChanged(event) {
    this.project = event;
    if (this.project) {
      this.projectID = this.project.id;
      this.setModelGroupIfExists(this.model.id);
    } else if (this.model && this.model.modelMetadata) {
      this.model.modelMetadata.modelGroup = null;
    }
    this.modelGroups = [];
  }
}
