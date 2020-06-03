import {Component, OnInit} from '@angular/core';
import {Model} from '../../_models/model';
import {ModelService} from '../../_services/model.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ProjectService} from '../../_services/project.service';
import {Project} from '../../_models/project';


@Component({
  selector: 'app-model',
  templateUrl: './model.component.html'
})
export class ModelComponent implements OnInit {

  public model: Model;
  projectID: string;
  modelID: string;
  project: Project;

  constructor(
    private modelService: ModelService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private location: Location
  ) {
  }

  ngOnInit() {
    this.getModel();
    this.getProjectDetails(this.projectID);
  }

  getModel(): void {
    this.projectID = this.route.snapshot.paramMap.get('projectId');
    this.modelID = this.route.snapshot.paramMap.get('modelId');
    this.modelService.getModelInProject(this.projectID, this.modelID).subscribe(model => this.model = model);
  }

  getProjectDetails(id: string) {
    this.projectService.getProjectById(id).subscribe(project => this.project = project);
  }
}
