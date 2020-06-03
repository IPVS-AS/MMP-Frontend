import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Project} from '../_models/project';
import {Model} from '../_models/model';

@Injectable({
  providedIn: 'root'
})
export class SidebarNotifierService {

  public notifierProject: Subject<Project>;
  public notifierModel: Subject<Model>;
  public notifierDeleteModel: Subject<boolean>;
  public notifierDeleteProject: Subject<boolean>;

  constructor() {
    this.notifierProject = new Subject<Project>();
    this.notifierModel = new Subject<Model>();
    this.notifierDeleteModel = new Subject<boolean>();
    this.notifierDeleteProject = new Subject<boolean>();
  }

  public notifyProject(project: any) {
    this.notifierProject.next(project);
  }

  public notifyModel(model: any) {
    this.notifierModel.next(model);
  }

  public notifyProjectAndModel(project: any, model: any) {
    this.notifierProject.next(project);
    this.notifierModel.next(model);
  }

  public notifyDeleteModel(deleted: boolean) {
    this.notifierDeleteModel.next(deleted);
  }

  public notifyDeleteProject(deleted: boolean) {
    this.notifierDeleteProject.next(deleted);
  }
}
