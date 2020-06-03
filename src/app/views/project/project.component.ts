import {Component, OnInit} from '@angular/core';
import {Project, ProjectStatus} from '../../_models/project';
import {ProjectService} from '../../_services/project.service';
import Utils from '../../_utils/Utils';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';
import {TimeoutComponent} from '../../timeout/timeout.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  public projects: Project[];
  public editedProjects: Project[];
  public filter: string;
  public selectedProject: Project;
  sortedBy: string;
  ascending: boolean;
  public doRoute: boolean;
  instance: ProjectComponent;
  selectedStatus: ProjectStatus[] = [ProjectStatus.NEW, ProjectStatus.IN_PROGRESS, ProjectStatus.CLOSED];
  selectedRow: Function;

  constructor(private projectService: ProjectService,
              private sidebarNotifierService: SidebarNotifierService
  ) {
    this.doRoute = true;
    this.instance = this;
    this.sidebarNotifierService.notifierDeleteProject.subscribe((bool) => {
      if (bool) {
        this.getProjects();
      }
    });
    this.sidebarNotifierService.notifyProjectAndModel(null, null);
  }

  ngOnInit() {
    this.getProjects();
  }


  getProjects(): void {
    this.projectService.getAllProjects().subscribe(projects => {
      this.projects = projects;
      this.editedProjects = projects;
    });
  }

  onClick(index, project: Project) {
    this.showDetails(project);
    this.setSidebarProject(project);
    this.selectedRow = index;
  }

  showDetails(project: Project): void {
    this.selectedProject = project;
  }

  setSidebarProject(project: Project) {
    this.sidebarNotifierService.notifyProject(project);
    this.sidebarNotifierService.notifyProjectAndModel(project, null);
  }

  sortByName(invert: boolean = true) {
    if (this.sortedBy !== 'name') {
      this.sortedBy = 'name';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedProjects = this.editedProjects.sort((a, b) => {
      const entryA = a as Project;
      const entryB = b as Project;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.name, entryB.name);
      } else {
        return Utils.CompareStrings(entryB.name, entryA.name);
      }
    });
  }

  sortByUseCase(invert: boolean = true) {
    if (this.sortedBy !== 'useCase') {
      this.sortedBy = 'useCase';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedProjects = this.editedProjects.sort((a, b) => {
      const entryA = a as Project;
      const entryB = b as Project;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.useCase, entryB.useCase);
      } else {
        return Utils.CompareStrings(entryB.useCase, entryA.useCase);
      }
    });
  }

  sortByStartDate(invert: boolean = true) {
    if (this.sortedBy !== 'startDate') {
      this.sortedBy = 'startDate';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedProjects = this.editedProjects.sort((a, b) => {
      const entryA = a as Project;
      const entryB = b as Project;

      if (this.ascending) {
        return Utils.CompareDate(entryA.startDate, entryB.startDate);
      } else {
        return Utils.CompareDate(entryB.startDate, entryA.startDate);
      }
    });
  }

  sortByEndDate(invert: boolean = true) {
    if (this.sortedBy !== 'endDate') {
      this.sortedBy = 'endDate';
    }
    if (invert) {
      this.ascending = !this.ascending;
    }

    this.editedProjects = this.editedProjects.sort((a, b) => {
      const entryA = a as Project;
      const entryB = b as Project;

      if (this.ascending) {
        return Utils.CompareDate(entryA.endDate, entryB.endDate);
      } else {
        return Utils.CompareDate(entryB.endDate, entryA.endDate);
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

    this.editedProjects = this.editedProjects.sort((a, b) => {
      const entryA = a as Project;
      const entryB = b as Project;

      if (this.ascending) {
        return Utils.CompareStrings(entryA.status, entryB.status);
      } else {
        return Utils.CompareStrings(entryB.status, entryA.status);
      }
    });
  }

  filterTable() {
    this.editedProjects = this.projects.filter(project => {
      return Utils.searchFilterRecursive(project, this.filter, false);
    });

    if (Utils.VerifyObject(this.sortedBy) && this.sortedBy !== '') {
      switch (this.sortedBy) {
        case 'name': {
          this.sortByName();
          break;
        }
        case 'Start Date': {
          this.sortByStartDate();
          break;
        }
        case 'Status': {
          this.sortByStatus();
          break;
        }
      }
    }
  }

  clearFilter() {
    this.filter = '';
    this.filterTable();
  }

  statusContains(status: ProjectStatus) {
    return this.selectedStatus.indexOf(status) > -1;
  }

  clickStatus(event) {
    console.log(event.attributes.name.value);
    if (event.attributes.name.value === 'ALL') {
      if (this.selectedStatus.length < 3) {
        this.selectedStatus = [ProjectStatus.NEW, ProjectStatus.IN_PROGRESS, ProjectStatus.CLOSED];
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

  getMatchingProjects() {
    const matchingProjects: Project[] = [];
    this.projects.forEach(project => {
      if (this.statusContains(project.status)) {
        matchingProjects.push(project);
      }
    });
    return matchingProjects;
  }
}
