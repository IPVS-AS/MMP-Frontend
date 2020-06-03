import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Model, ModelGroup, ModelStatus} from '../../../_models/model';
import {ModelService} from '../../../_services/model.service';
import {ProjectService} from '../../../_services/project.service';
import {Project} from '../../../_models/project';
import {User} from '../../../_models/user';
import Utils from '../../../_utils/Utils';
import {SidebarNotifierService} from '../../../_services/sidebar-notifier.service';
import {TimeoutComponent} from '../../../timeout/timeout.component';

@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.css']
})
export class ModelListComponent extends TimeoutComponent implements OnInit, AfterViewInit {

  public models: Model[];
  public editedModels: Model[];
  public filter: string;
  projectID: string;
  project: Project;
  selectedModel: Model;
  selectedRow: Function;
  selectedGroup: Function;
  sortedBy: string;
  ascending: boolean;
  instance: ModelListComponent;
  modelGroups: ModelGroup[] = [];
  editedModelGroups: ModelGroup[] = [];
  modelGroupsKV: { [id: string]: boolean } = {};
  isCollapsed: boolean;
  isGroupsCollapsed: boolean;
  infoText: string;
  selectedStatus: ModelStatus[] =
    [ModelStatus.PLANNED, ModelStatus.ARCHIVED, ModelStatus.EXPERIMENTAL, ModelStatus.MAINTENANCE, ModelStatus.OPERATION];

  projectIDExists: boolean;

  constructor(
    private modelService: ModelService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private sidebarNotifierService: SidebarNotifierService
  ) {
    super();
    this.instance = this;
    this.isCollapsed = true;
    this.isGroupsCollapsed = false;
    this.infoText = 'Show Project Information';
    this.sidebarNotifierService.notifierDeleteModel.subscribe((bool) => {
      if (bool) {
        this.getModels();
      }
    });
  }

  ngOnInit() {
    this.getModels();
    this.getProjectDetails(this.projectID);
    this.ascending = true;
  }

  ngAfterViewInit() {
    this.getModels();
  }

  select(index, groupIndex, model: Model) {
    this.selectedModel = model;
    this.sidebarNotifierService.notifyProjectAndModel(this.project, model);
    this.selectedRow = index;
    this.selectedGroup = groupIndex;
  }

  getModels(): void {
    this.projectID = this.route.snapshot.paramMap.get('projectId');
    this.projectIDExists = false;
    const subscription = this.modelService.getAllModelsInProject(this.projectID).subscribe(models => {
      this.projectIDExists = true;
      this.cancelTimeout();
      this.models = models;
      this.editedModels = models;
      this.isCollapsed = models.length > 0;
      const groupIDs = this.modelGroups.map(group => group.id);
      models.forEach(model => {
        if (!groupIDs.includes(model.modelMetadata.modelGroup.id)) {
          // set false to show all modelGroup tabs opened on start, set true to collapse them
          this.modelGroupsKV[model.modelMetadata.modelGroup.id] = false;
          this.modelGroups.push(model.modelMetadata.modelGroup);
          this.editedModelGroups.push(model.modelMetadata.modelGroup);
          groupIDs.push(model.modelMetadata.modelGroup.id);
        }
      });
      if (this.editedModels != null) {
        this.sortByVersion(false);
      }
    });
    this.waitForTimeOut(subscription);
  }

  getProjectDetails(id: string) {
    this.projectService.getProjectById(id).subscribe(project => {
      this.project = project;
      this.sidebarNotifierService.notifyProject(this.project);
    });
  }

  sortByName(invert: boolean = true) {
    if (this.sortedBy !== 'name') {
      this.sortedBy = 'name';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedModels = this.editedModels.sort((a, b) => {
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

    this.editedModels = this.editedModels.sort((a, b) => {
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

  sortByVersion(toggle: boolean = true) {
    if (this.sortedBy !== 'Version') {
      this.sortedBy = 'Version';
    }
    if (toggle) {
      this.ascending = !this.ascending;
    } else {
      // list most recent version first
      this.ascending = false;
    }

    this.editedModels = this.editedModels.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        if (entryA.modelMetadata.modelGroup.id === entryB.modelMetadata.modelGroup.id) {
          return Utils.CompareNumbers(entryA.modelMetadata.version, entryB.modelMetadata.version);
        }
        return Utils.CompareNumbers(entryA.modelMetadata.modelGroup.id,
          entryB.modelMetadata.modelGroup.id);
      } else {
        if (entryB.modelMetadata.modelGroup.id === entryA.modelMetadata.modelGroup.id) {
          return Utils.CompareNumbers(entryB.modelMetadata.version, entryA.modelMetadata.version);
        }
        return Utils.CompareNumbers(entryB.modelMetadata.modelGroup.id,
          entryA.modelMetadata.modelGroup.id);
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

    this.editedModels = this.editedModels.sort((a, b) => {
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

    this.editedModels = this.editedModels.sort((a, b) => {
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

    this.editedModels = this.editedModels.sort((a, b) => {
      const entryA = a as Model;
      const entryB = b as Model;

      if (this.ascending) {
        return Utils.CompareDate(entryA.modelMetadata.lastModified, entryB.modelMetadata.lastModified);
      } else {
        return Utils.CompareDate(entryB.modelMetadata.lastModified, entryA.modelMetadata.lastModified);
      }
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.infoText = 'Show Project Information';
    } else {
      this.infoText = 'Hide Project Information';
    }
  }

  toggleCollapseGroup(id: string) {
    this.modelGroupsKV[id] = !this.modelGroupsKV[id];
    if (this.modelGroupsKV[id] === false) {
      this.select(undefined, id, this.getMostRecentModel(id));
      this.sortByVersion(false);
    }
  }

  filterTable() {
    this.editedModels = this.models.filter(project => {
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

  getMatchingModels(groupID: string) {
    const matchingModels: Model[] = [];
    this.editedModels.forEach(model => {
      if (model.modelMetadata.modelGroup.id === groupID && this.statusContains(model.modelMetadata.status)) {
        matchingModels.push(model);
      }
    });
    return matchingModels;
  }

  modelStates() {
    return Object.keys(ModelStatus).filter((entry) => {
      return isNaN(Number(entry));
    });
  }

  statusContains(status: ModelStatus) {
    return this.selectedStatus.indexOf(status) > -1;
  }

  clickStatus(event) {
    if (event.attributes.name.value === 'ALL') {
      if (this.selectedStatus.length < 5) {
        this.selectedStatus =
          [ModelStatus.PLANNED, ModelStatus.ARCHIVED, ModelStatus.EXPERIMENTAL, ModelStatus.MAINTENANCE, ModelStatus.OPERATION];
      } else {
        this.selectedStatus = [];
      }
    } else {
      if (this.statusContains(event.attributes.name.value)) {
        const indexToRemove = this.selectedStatus.indexOf(event.attributes.name.value);
        this.selectedStatus.splice(indexToRemove, 1);
      } else {
        this.selectedStatus.push(event.attributes.name.value);
      }
    }
  }

  getMostRecentModel(groupID: string) {
    if (this.getMatchingModels(groupID).length > 0) {
      let mostRecent = this.getMatchingModels(groupID)[0];
      this.getMatchingModels(groupID).forEach(model => {
        if (model.modelMetadata.version > mostRecent.modelMetadata.version) {
          mostRecent = model;
        }
      });
      return mostRecent;
    }
    return null;
  }

  toggleColllapseAllGroups() {
    this.isGroupsCollapsed = !this.isGroupsCollapsed;
    this.modelGroups.forEach(group => {
      const groupID = group.id;
      this.modelGroupsKV[groupID] = this.modelGroupsKV[groupID] = this.isGroupsCollapsed;
    });
  }
}
