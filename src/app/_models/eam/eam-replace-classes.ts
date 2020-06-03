// GridItemWrapper
import {OrganisationUnit} from './organisation-unit';
import {BusinessProcess} from './business-process';
// ModelKeepWrapper
import {Model} from '../model';

export class GridItemWrapper {
  x: number;
  y: number;
  modelAction: ModelKeepWrapper[];
  orga: OrganisationUnit[];
  proc: BusinessProcess[];

  constructor(x: number, y: number, modelAction: ModelKeepWrapper[], orga: OrganisationUnit[], proc: BusinessProcess[]) {
    this.x = x;
    this.y = y;
    this.modelAction = modelAction;
    this.orga = orga;
    this.proc = proc;
  }
}

export class ModelKeepWrapper {
  model: Model;
  keep: boolean;
}

export function compareX(item1: { cell: GridItemWrapper, addedModel: ModelKeepWrapper },
                         item2: { cell: GridItemWrapper, addedModel: ModelKeepWrapper }, colThenRow?: boolean) {
  const result = item1.cell.x - item2.cell.x;
  if (result !== 0) {
    return result;
  } else {
    return colThenRow ? 0 : compareY(item1, item2, colThenRow);
  }
}

export function compareY(item1: { cell: GridItemWrapper, addedModel: ModelKeepWrapper },
                         item2: { cell: GridItemWrapper, addedModel: ModelKeepWrapper }, colThenRow?: boolean) {
  const result = item1.cell.y - item2.cell.y;
  if (result !== 0) {
    return result;
  } else {
    return colThenRow ? compareX(item1, item2, colThenRow) : 0;
  }
}

export function replace(item: { cell: GridItemWrapper, addedModel: ModelKeepWrapper }) {
  item.cell.modelAction.forEach(model => {
    model.keep = false;
  });
  item.addedModel.keep = true;
}

export function keep(item: { cell: GridItemWrapper, addedModel: ModelKeepWrapper }) {
  item.cell.modelAction.forEach(model => {
    model.keep = true;
  });
  item.addedModel.keep = false;
}
