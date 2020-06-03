import {OrganisationUnit} from '../_models/eam/organisation-unit';
import {BusinessProcess} from '../_models/eam/business-process';
import {Model, ModelStatus} from '../_models/model';
import {CellType, GridsterItemExtended} from '../_models/eam/grid-cell';

export class EamUtils {

  /**
   * Convienient function to quickly create a new GridsterItemExtended object for the eam grid for organisation units.
   * @param y as grid row
   * @param content of type OrganisationUnit
   */
  static orgUnitGridCellOf(y: number, content: OrganisationUnit) {
    return EamUtils.gridCellOf(0, y, [content], CellType.ORGUNIT);
  }

  /**
   * Convienient function to quickly create a new GridsterItemExtended object for the eam grid for business processes.
   * @param x as grid column
   * @param content of type BusinessProcess
   */
  static businessProcessGridCellOf(x: number, content: BusinessProcess) {
    return EamUtils.gridCellOf(x, 0, [content], CellType.PROCESS);
  }

  /**
   * Convienient function to quickly create a new GridsterItemExtended object for the eam grid for models.
   * @param x as grid column
   * @param y as grid row
   * @param content of type Model
   * @param status
   * @param rows as size of the grid item, default 1
   * @param cols as size of the grid item, default 1
   */
  static modelsGridCellOf(x: number, y: number, content: Model[], status: ModelStatus, rows?: number, cols?: number) {
    return EamUtils.gridCellOf(x, y, content, CellType.MODELS, status, rows, cols, true, true);
  }

  /**
   * Convienient function to quickly create a new GridsterItemExtended object for the eam grid.
   * @param x as grid column
   * @param y as grid row
   * @param content a list of any type is required
   * @param type, default CellType.INTERACT
   * @param status
   * @param rows as size of the grid item, default 1
   * @param cols as size of the grid item, default 1
   * @param dragEnabled, default false
   * @param resizeEnabled, default false
   */
  static gridCellOf(x: number, y: number, content: any, type?: CellType, status?: ModelStatus, rows?: number,
                    cols?: number, dragEnabled?: boolean, resizeEnabled?: boolean): GridsterItemExtended {
    const _rows = rows === undefined ? 1 : rows;
    const _cols = cols === undefined ? 1 : cols;
    const _type = type === undefined ? CellType.INTERACT : type;
    const _dragEnabled = dragEnabled !== undefined;
    const _resizeEnabled = resizeEnabled !== undefined;
    return {
      rows: _rows, cols: _cols, x: x, y: y, status: status,
      type: _type, content: content, dragEnabled: _dragEnabled, resizeEnabled: _resizeEnabled
    };
  }

  /**
   * Compares eam grid items by their type, then status, and then either by row or column.
   * @param item1
   * @param item2
   * @param colThenRow determines if items are first sorted by x, then y or the other way round
   */
  static compareType(item1: GridsterItemExtended, item2: GridsterItemExtended, colThenRow?: boolean) {
    if (item1.type > item2.type) {
      return 1;
    } else if (item1.type < item2.type) {
      return -1;
    } else {
      return EamUtils.compareStatus(item1, item2, colThenRow);
    }
  }

  /**
   * Compares eam grid items by their status, and then either by row or column.
   * @param item1
   * @param item2
   * @param colThenRow determines if items are first sorted by x, then y or the other way round
   */
  static compareStatus(item1: GridsterItemExtended, item2: GridsterItemExtended, colThenRow?: boolean) {
    if (item1.status > item2.status) {
      return 1;
    } else if (item1.status < item2.status) {
      return -1;
    } else {
      return colThenRow ? EamUtils.compareY(item1, item2, colThenRow) : EamUtils.compareX(item1, item2, colThenRow);
    }
  }

  /**
   * Compares eam grid items by their column and optionally by their row, if the colThenRow flag is set to false.
   * @param item1
   * @param item2
   * @param colThenRow determines if items are also sorted by their row afterwards
   */
  static compareX(item1: GridsterItemExtended, item2: GridsterItemExtended, colThenRow?: boolean) {
    const result = item1.x - item2.x;
    if (result !== 0) {
      return result;
    } else {
      return colThenRow ? 0 : EamUtils.compareY(item1, item2, colThenRow);
    }
  }

  /**
   * Compares eam grid items by their row and optionally by their column, if the colThenRow flag is set to true.
   * @param item1
   * @param item2
   * @param colThenRow determines if items are also sorted by their column afterwards
   */
  static compareY(item1: GridsterItemExtended, item2: GridsterItemExtended, colThenRow?: boolean) {
    const result = item1.y - item2.y;
    if (result !== 0) {
      return result;
    } else {
      return colThenRow ? EamUtils.compareX(item1, item2, colThenRow) : 0;
    }
  }
}
