import {GridsterItem} from 'angular-gridster2';
import {ModelStatus} from '../model';

export interface GridsterItemExtended extends GridsterItem {
  status: ModelStatus;
  type: CellType;
  content: any[];
}

export enum CellType {
  INTERACT = 'interact',
  PROCESS = 'process',
  ORGUNIT = 'orgunit',
  MODELS = 'models'
}
