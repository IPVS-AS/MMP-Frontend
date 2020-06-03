import {Component, OnInit} from '@angular/core';
import {Project} from '../../../_models/project';
import {ProjectService} from '../../../_services/project.service';
import {ActivatedRoute} from '@angular/router';
import {TimeoutComponent} from '../../../timeout/timeout.component';

@Component({
  selector: 'app-project-individual',
  templateUrl: './project-individual.component.html'
})
export class ProjectIndividualComponent extends TimeoutComponent implements OnInit {

  projectID: string;
  project: Project;
  projectIDExists: boolean;

  constructor(private projectService: ProjectService,
              private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.projectIDExists = false;
    this.projectID = this.route.snapshot.paramMap.get('projectId');
    this.getProjectById(this.projectID);
  }

  getProjectById(id: string) {
   const subscription = this.projectService.getProjectById(id).subscribe(project => {
     this.project = project;
     this.cancelTimeout();
     if (this.project !== null ) {
       this.projectIDExists = true;
     }
   });
   this.waitForTimeOut(subscription);
  }

}
