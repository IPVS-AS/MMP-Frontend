import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../_services/project.service';
import {ModelService} from '../../_services/model.service';
import {Model, ModelStatus} from '../../_models/model';
import Utils from '../../_utils/Utils';
import {User} from '../../_models/user';
import {Project} from '../../_models/project';
import {TimeoutComponent} from '../../timeout/timeout.component';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html'
})
export class DeploymentComponent extends TimeoutComponent implements OnInit {

  models: Model[];
  projects: Project[];
  filter: string;
  sortedBy: string;
  ascending: boolean;

  constructor(private projectService: ProjectService, private modelService: ModelService,
              private sidebarNotifierService: SidebarNotifierService) {
    super();
    this.sidebarNotifierService.notifyProjectAndModel(null, null);
  }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    const subscription = this.projectService.getAllProjects().subscribe(projects => {
      this.projects = projects;
      this.getModels(projects);
      this.cancelTimeout();
    });
    this.waitForTimeOut(subscription);
  }


  getModels(projects: Project[]) {
    projects.forEach(project => {
      this.modelService.getAllModelsInProject(project.id).subscribe(models => {
        models.forEach(model => {
        if (model.modelMetadata.status === ModelStatus.OPERATION) {
          model.modelMetadata.modelDescription = project.id;
          (this.models = (this.models || [])).push(model);
        }
      });
      });
    });
  }

  sortByName(invert: boolean = true) {
    if (this.sortedBy !== 'name') {
      this.sortedBy = 'name';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.models = this.models.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.modelMetadata.name, entryB.modelMetadata.name);
      } else {
        return Utils.CompareStrings(entryB.modelMetadata.name, entryA.modelMetadata.name);
      }
    });
  }

  sortByAuthor(invert: boolean = true) {
    if (this.sortedBy !== 'Author') {
      this.sortedBy = 'Author';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.models = this.models.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      // TODO remove / fix (author null)
      if (entryA.modelMetadata.author === null) {
        entryA.modelMetadata.author = new User();
      }
      if (entryB.modelMetadata.author === null) {
        entryB.modelMetadata.author = new User();
      }

      if (this.ascending) {
        return Utils.CompareStrings(entryA.modelMetadata.author.name, entryB.modelMetadata.author.name);
      } else {
        return Utils.CompareStrings(entryB.modelMetadata.author.name, entryA.modelMetadata.author.name);
      }
    });
  }

  sortByVersion(invert: boolean = true) {
    if (this.sortedBy !== 'Version') {
      this.sortedBy = 'Version';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.models = this.models.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        return Utils.CompareNumbers(entryA.modelMetadata.version, entryB.modelMetadata.version);
      } else {
        return Utils.CompareNumbers(entryB.modelMetadata.version, entryA.modelMetadata.version);
      }
    });
  }

  sortByStatus(invert: boolean = true) {
    if (this.sortedBy !== 'Status') {
      this.sortedBy = 'Status';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.models = this.models.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.modelMetadata.status, entryB.modelMetadata.status);
      } else {
        return Utils.CompareStrings(entryB.modelMetadata.status, entryA.modelMetadata.status);
      }
    });
  }

  sortByAlgorithm(invert: boolean = true) {
    if (this.sortedBy !== 'Algorithm') {
      this.sortedBy = 'Algorithm';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.models = this.models.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.modelMetadata.algorithm, entryB.modelMetadata.algorithm);
      } else {
        return Utils.CompareStrings(entryB.modelMetadata.algorithm, entryA.modelMetadata.algorithm);
      }
    });
  }

  sortByLastModified(invert: boolean = true) {
    if (this.sortedBy !== 'Last Modified') {
      this.sortedBy = 'Last Modified';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.models = this.models.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        return Utils.CompareDate(entryA.modelMetadata.lastModified, entryB.modelMetadata.lastModified);
      } else {
        return Utils.CompareDate(entryB.modelMetadata.lastModified, entryA.modelMetadata.lastModified);
      }
    });
  }

  filterTable() {
    this.models = this.models.filter(project => {
      return Utils.searchFilterRecursive(project, this.filter, false);
    });

    if (Utils.VerifyObject(this.sortedBy) && this.sortedBy !== '') {
      switch (this.sortedBy) {
        case 'name': {
          this.sortByName(false);
          break;
        }
        case 'Author': {
          this.sortByAuthor(false);
          break;
        }
        case 'Version': {
          this.sortByVersion(false);
          break;
        }
        case 'Status': {
          this.sortByStatus(false);
          break;
        }
        case 'Algorithm': {
          this.sortByAlgorithm(false);
          break;
        }
        case 'Last Modified': {
          this.sortByLastModified(false);
          break;
        }
      }
    }
  }

  clearFilter() {
    this.filter = '';
    this.filterTable();
  }
}

class Container {
  projectId: string;
  models: Model[];
}
