import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Model} from '../../../_models/model';
import {Project} from '../../../_models/project';
import {compareY, GridItemWrapper, keep, ModelKeepWrapper, replace} from '../../../_models/eam/eam-replace-classes';
import {BsModalRef} from 'ngx-bootstrap';
import {ProjectService} from '../../../_services/project.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-replacement-popup',
  templateUrl: './replacement-popup.component.html',
  styleUrls: ['./replacement-popup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ReplacementPopupComponent implements OnInit {
  addedModel: Model;
  addedProject: Project;
  candidates: GridItemWrapper[] = [];
  gridCells: Array<{ cell: GridItemWrapper, addedModel: ModelKeepWrapper }> = [];
  resultSubject: Subject<GridItemWrapper[]>;
  resultArray: GridItemWrapper[] = [];

  constructor(public bsModalRef: BsModalRef, private projectService: ProjectService) {
  }

  ngOnInit() {
    this.resultSubject = new Subject();
    this.candidates.forEach(wrapper => {
      this.gridCells.push({
        cell: wrapper,
        addedModel: {model: this.addedModel, keep: true} as ModelKeepWrapper
      });
    });
    this.gridCells.sort(compareY);
    this.projectService.getProjectById(String(this.addedModel.projectId)).subscribe(project => this.addedProject = project);
  }

  submit(): GridItemWrapper[] {
    const result: GridItemWrapper[] = [];
    this.gridCells.forEach(value => {
      value.cell.modelAction.push(value.addedModel);
      this.resultArray.push(value.cell);
    });
    this.resultSubject.next(this.resultArray);
    this.bsModalRef.hide();
    return result;
  }

  cancel(): void {
    this.resultSubject.next(null);
    this.bsModalRef.hide();
  }

  replaceAll() {
    this.gridCells.forEach(cell => {
      replace(cell);
    });
  }

  keepAll() {
    this.gridCells.forEach(cell => {
      keep(cell);
    });
  }

  keep(item: { cell: GridItemWrapper, addedModel: ModelKeepWrapper }) {
    keep(item);
  }

  replace(item: { cell: GridItemWrapper, addedModel: ModelKeepWrapper }) {
    replace(item);
  }
}
