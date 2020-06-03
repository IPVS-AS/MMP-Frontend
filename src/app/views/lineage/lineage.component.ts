import {Component, OnInit, ViewChild} from '@angular/core';
import {Model} from '../../_models/model';
import {ActivatedRoute} from '@angular/router';
import {ModelService} from '../../_services/model.service';
import {ProjectService} from '../../_services/project.service';
import {OpcuaInformationModel, OpcuaMetadata} from '../../_models/opcua-information-model';
import {OpcuaTreeView} from '../../_models/opcua-tree-view';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';
import {Project} from '../../_models/project';
import {CollapsibleTreeComponent} from '../collapsible-tree/collapsible-tree.component';
import {HttpClient} from '@angular/common/http';
import {UploadFileService} from '../../_services/upload-file.service';
import {TimeoutComponent} from '../../timeout/timeout.component';

@Component({
  templateUrl: './lineage.component.html',
  styleUrls: ['./lineage.component.css'],
})
export class LineageComponent extends TimeoutComponent implements OnInit {

  @ViewChild('collTree') collapsibleTreeComponent: CollapsibleTreeComponent;

  projectId: string;
  project: Project;
  modelId: string;
  selectedModel: Model;
  tree: OpcuaTreeView;
  modelName: string;
  opcuaMetadata: OpcuaMetadata[];
  opcuaInformationModels: OpcuaInformationModel[];
  projectName: string;
  uploadService: UploadFileService;
  projectIDExists: boolean;
  modelIDExists: boolean;

  constructor(
    protected httpService: HttpClient,
    private modelService: ModelService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private sidebarNotifierService: SidebarNotifierService
  ) {
    super();
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    this.modelId = this.route.snapshot.paramMap.get('modelId');
    this.uploadService = new UploadFileService(this.httpService);
    this.opcuaMetadata = [];

    this.getProject();
  }

  getProject() {
    this.projectIDExists = false;
    const subscription = this.projectService.getProjectById(this.projectId).subscribe(project => {
      this.project = project;
      this.projectName = project.name;
      this.projectIDExists = this.project != null;
      this.cancelTimeout();
      this.sidebarNotifierService.notifyProject(this.project);
      this.modelIDExists = false;
      const modelSubscription = this.modelService.getModelInProject(this.projectId, this.modelId)
        .subscribe(model => {
          if (model != null && model.opcuaInformationModels != null) {
            this.cancelTimeout();
            this.modelIDExists = true;
            const opcuaSubscription = this.uploadService.getAllOpcuaInformationModels(this.projectId, this.modelId).subscribe(
              opcuaInformationModels => {
                this.opcuaInformationModels = opcuaInformationModels;
                this.cancelTimeout();
                if (opcuaInformationModels != null && opcuaInformationModels.length > 0) {
                  opcuaInformationModels.forEach(opcuaInformationModel =>
                    this.opcuaMetadata.push(opcuaInformationModel.opcuaMetadata));
                }
                this.tree = new OpcuaTreeView(model.modelMetadata.name, this.opcuaMetadata);
                this.collapsibleTreeComponent.treeData = this.tree.root;
              }
            );
            this.waitForTimeOut(opcuaSubscription);
          }
          this.selectedModel = model;
          this.modelName = model.modelMetadata.name;
          this.sidebarNotifierService.notifyModel(this.selectedModel);
        });
      this.waitForTimeOut(modelSubscription);
    });
    this.waitForTimeOut(subscription);
  }

}
