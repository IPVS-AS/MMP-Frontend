import {Component, OnInit} from '@angular/core';
import {Model} from '../../_models/model';
import {Project} from '../../_models/project';
import Utils from '../../_utils/Utils';
import {User} from '../../_models/user';
import {SearchDto} from '../../_models/search-dto';
import {SearchService} from '../../_services/search.service';
import {FilterDto} from '../../_models/filter-dto';
import {ModelService} from '../../_services/model.service';
import {ProjectService} from '../../_services/project.service';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';

@Component({
  selector: 'app-advsearch',
  templateUrl: './advsearch.component.html',
  styles: ['.table tr.active { background-color:lightgray !important; color: black; }']
})
export class AdvSearchComponent implements OnInit {

  public models: Model[];
  public filter: string;
  projectID: number;
  project: Project;
  selectedModel: Model;
  selectedRow: Function;
  sortedBy: string;
  ascending: boolean;
  searchDto: SearchDto;
  filterDto: FilterDto;
  projects: Project[];

  searchTerms: string[];
  selectedAlgorithm: string;
  selectedMachine: string;
  selectedSensor: string;

  constructor(
    private searchService: SearchService,
    private modelService: ModelService,
    private projectService: ProjectService,
    private sidebarNotifierService: SidebarNotifierService
  ) {
    this.sidebarNotifierService.notifyProjectAndModel(null, null);
  }

  ngOnInit() {
    this.searchDto = new SearchDto();
    this.filterDto = new FilterDto();
    this.updatePossibleFilters();
    this.ascending = true;

    this.selectedAlgorithm = null;
    this.selectedSensor = null;
    this.selectedMachine = null;
  }

  updatePossibleFilters() {
    this.searchService.collectPossibleFilters().subscribe(filterDto => {
      this.filterDto = filterDto;

      this.filterDto.possibleAlgorithmsToFilter.sort(this.sortStrings);
      this.filterDto.possibleMachineNamesToFilter.sort(this.sortStrings);
      this.filterDto.possibleSensorNamesToFilter.sort(this.sortStrings);
    });
  }

  sortStrings(a: string, b: string) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : (a < b ? -1 : 0);
  }

  algorithmChangeHandler(event: any) {
    if (event === null) {
      this.selectedAlgorithm = null;
    } else {
      this.selectedAlgorithm = event;
    }
  }

  clearAlgorithm() {
    this.selectedAlgorithm = null;
  }

  machineChangeHandler(event: any) {
    this.selectedMachine = event;
  }

  clearMachine() {
    this.selectedMachine = null;
  }

  sensorChangeHandler(event: any) {
    this.selectedSensor = event;
  }

  clearSensor() {
    this.selectedSensor = null;
  }

  refreshFilters() {
    if (this.selectedSensor === null && this.selectedMachine === null && this.selectedAlgorithm === null
      && (!this.searchTerms || this.searchTerms.length === 0)) {
      this.modelService.getAllModels().subscribe(models => this.models = models);
    } else {
      this.searchService.filterModels(this.selectedAlgorithm, this.selectedMachine, this.selectedSensor, this.searchTerms).subscribe(
        filteredModels => {
          this.models = filteredModels;
        });
    }
  }

  select(index, model: Model) {
    this.selectedModel = model;
    this.projectService.getProjectById(String(model.projectId)).subscribe(project => this.project = project);
    this.selectedRow = index;
    this.projectService.getProjectById(String(model.projectId)).subscribe(project => {
      this.project = project;
      this.sidebarNotifierService.notifyProjectAndModel(this.project, this.selectedModel);
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

  updateModelList(removedModel: Model) {
    if (removedModel && this.models) {
      this.models = this.models.filter(model => model.id !== removedModel.id);
      this.updatePossibleFilters();
    }

    if (this.models && this.models.length === 0) {
      this.models = null;
    }
  }

}
