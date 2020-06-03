import {Component, OnDestroy, OnInit} from '@angular/core';
import {Project} from '../../_models/project';
import {ModelService} from '../../_services/model.service';
import {ProjectService} from '../../_services/project.service';
import {ActivatedRoute} from '@angular/router';
import {CompactType, DisplayGrid, GridsterConfig, GridType} from 'angular-gridster2';
import {DragulaService} from 'ng2-dragula';
import {forkJoin, Subscription} from 'rxjs';
import {EamContainer} from '../../_models/eam/eam-container';
import {BusinessProcess} from '../../_models/eam/business-process';
import {compareOrganisationUnitsByIndex, OrganisationUnit} from '../../_models/eam/organisation-unit';
import {EamService} from '../../_services/eam.service';
import {ReplacementPopupComponent} from './replacement-popup/replacement-popup.component';
import {MatDialog} from '@angular/material';
import {Model, ModelStatus} from '../../_models/model';
import {CellType, GridsterItemExtended} from '../../_models/eam/grid-cell';
import Utils from '../../_utils/Utils';
import {ToastManagerService} from '../../_services/toast-manager.service';
import {SidebarNotifierService} from '../../_services/sidebar-notifier.service';
import {GridItemWrapper, ModelKeepWrapper} from '../../_models/eam/eam-replace-classes';
import {document} from 'ngx-bootstrap/utils/facade/browser';
import {ConfirmDialogComponent} from '../../dialog/confirm/confirm-dialog.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {EamUtils} from '../../_utils/EamUtils';

@Component({
  selector: 'app-eam',
  templateUrl: './eam.component.html',
  styleUrls: ['./eam.component.css']
})
export class EamComponent implements OnInit, OnDestroy {

  public selectedModel: Model;
  models: Model[] = [];
  modelPool: Model[] = [];
  changedModels: Model[] = [];
  options: GridsterConfig;
  processSuccessors: BusinessProcess[];
  dashboard: Array<GridsterItemExtended> = [];
  dashBoardAllModels: Array<GridsterItemExtended> = [];
  dashBoardInitialModels: Array<GridsterItemExtended> = [];
  dashBoardInitialBorders: Array<GridsterItemExtended> = [];
  cellHeight = 150;
  cellWidth = 150;
  cellMargin = 10;
  height = this.cellHeight;
  width = this.cellWidth;
  BAG = 'MODELS';
  dragula_subs = new Subscription();
  selectedStatus = ModelStatus.OPERATION;
  eamSaved: Boolean;
  modalRef: BsModalRef;
  bsModalRef: BsModalRef;
  zoomLevels = [115, 130, 150, 170, 200, 250, 300];
  rootLevelsZoom = ['75%', '87,5%', '100%', '115%', '133%', '166%', '200%'];
  currentLevel = 2;
  eamInitialModels = true;
  eamInitialBorders = true;

  constructor(
    private modelService: ModelService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private dragulaService: DragulaService,
    private eamService: EamService,
    private dialog: MatDialog,
    private toastManagerService: ToastManagerService,
    private sidebarNotifierService: SidebarNotifierService,
    private modalService: BsModalService
  ) {
    this.addDragulaDropSub(dragulaService);
    this.sidebarNotifierService.notifyProjectAndModel(null, null);
  }

  private addDragulaDropSub(dragulaService: DragulaService) {
    // subscription for model replacements on drop
    this.dragula_subs.add(dragulaService.dropModel(this.BAG)
      .subscribe(({el, target, source, sourceModel, targetModel, item}) => {
        const addedModel = item as Model;

        // new model already added when called -> verify whether existed before or not
        if (this.removeDuplicates(targetModel)) {
          this.toastManagerService.openInfoToast(
            'Model "' + addedModel.modelMetadata.name + ' v' + addedModel.modelMetadata.version + '" already in application.');
        } else {
          // not yet in list -> newly added
          // remove newly added model (already added when called)
          targetModel.filter(model => (model as Model).id === addedModel.id)
            .forEach(model => targetModel.splice(targetModel.indexOf(model), 1));

          const isGroupNewInCell = targetModel.filter(model =>
            (model as Model).modelMetadata.modelGroup.modelGroupName === addedModel.modelMetadata.modelGroup.modelGroupName).length <= 0;

          const candidates: GridItemWrapper[] = [];
          this.extractCandidates(addedModel, candidates);

          // add to target cell but hide in replacement popup
          if (isGroupNewInCell) {
            targetModel.push(addedModel);
          }

          if (candidates.length > 0) {
            this.openReplacementDialog(addedModel, candidates);
          }
        }
      })
    );
  }

  private extractCandidates(addedModel, list: GridItemWrapper[]) {
    this.getModelDashboardCells().forEach(container => {
      const x = container.x;
      const y = container.y;
      const candidates: ModelKeepWrapper[] = [];

      // Organisation mapping
      const orga: OrganisationUnit[] = [];
      this.getOrgUnitDashboardCells().forEach(value => {
        const orgCell = value as GridsterItemExtended;
        if (container.y + container.rows > orgCell.y && container.y <= orgCell.y) {
          orga.push(orgCell.content[0]);
        }
      });

      // Process mapping
      const proc: BusinessProcess[] = [];
      this.getProcessDashboardCells().forEach(value => {
        const procCell = value as GridsterItemExtended;
        if (container.x + container.cols > procCell.x && container.x <= procCell.x) {
          proc.push(procCell.content[0]);
        }
      });

      // model mapping
      container.content.forEach(model2 => {
        const model = model2 as Model;
        if ((model.modelMetadata.modelGroup.modelGroupName !== addedModel.modelMetadata.modelGroup.modelGroupName)
          || (model.modelMetadata.version === addedModel.modelMetadata.version)) {
          return;
        }
        candidates.push({model: model, keep: false});
      });

      if (candidates && candidates.length > 0) {
        list.push(new GridItemWrapper(x, y, candidates, orga, proc));
      }
    });
  }

  ngOnInit() {
    this.initOptions();
    this.reloadData();
    this.addHandlers();
  }

  ngOnDestroy() {
    this.syncDashboardModelCellsToAllModelCells();

    const updatedModels = JSON.stringify(this.dashBoardAllModels.sort(EamUtils.compareType));
    const initialModels = JSON.stringify(this.dashBoardInitialModels.sort(EamUtils.compareType));

    const updatedBorders = JSON.stringify(this.dashboard.filter(cell => cell.type !== CellType.MODELS).sort(EamUtils.compareType));
    const initialBorders = JSON.stringify(this.dashBoardInitialBorders.sort(EamUtils.compareType));

    if (initialModels !== updatedModels || updatedBorders !== initialBorders) {
      this.modalRef = this.modalService.show(ConfirmDialogComponent);
      this.modalRef.content.successMessage = 'Save';
      this.modalRef.content.title = 'Save';
      this.modalRef.content.message = 'Do you want to save the changes to the enterprise architecture management for analytics?';
      this.modalRef.content.onClose.subscribe(result => {
        if (result === true) {
          this.updateEamContainers();
          this.eamInitialModels = true;
        }
      });
    }
    this.dragula_subs.unsubscribe();
  }

  addHandlers() {
    if (!this.dragulaService.find(this.BAG)) {
      this.dragulaService.createGroup(this.BAG, {
        moves: (el, source, handle) => {
          // only move model if handle tag is being used
          return handle.className.indexOf('move-handle') > -1;
        },
        copy: (el, source) => {
          // models from the model pool will be copied otherwise they are moved
          return source.id === 'model-pool';
        },
        accepts: (el, target, source, sibling) => {
          // prevent the model from being dropped back to the model pool
          if (target.id !== 'model-pool') {
            return true;
          }
        },
        copyItem: (model: Model) => {
          return Utils.createCopy<Model>(model);
        },
        removeOnSpill: true
      });
    }
    this.options.emptyCellClickCallback = (event, item) => {
      // create new empty model container when clicking on an empty grid cell
      this.createEmptyGridItem(item);
    };
    this.options.emptyCellDragCallback = (event, item) => {
      // create new empty model container when dragging on empty grid cells
      this.createEmptyGridItem(item);
    };
  }

  createEmptyGridItem(item) {
    if (item.x > 0 && item.y > 0) {
      this.dashboard.push(EamUtils.modelsGridCellOf(item.x, item.y, [], this.selectedStatus, item.rows, item.cols));
    }
  }

  reloadData() {
    this.projectService.getAllProjects().subscribe(projects => {
      this.getModels(projects);
      this.createCells();
    });
  }

  getModels(projects: Project[]) {
    this.models = [];
    const modelRequests = [];
    projects.forEach(project => {
      modelRequests.push(this.modelService.getAllModelsInProject(project.id));
    });
    forkJoin(modelRequests).subscribe(response => {
      response.forEach(models => {
        this.models = this.models.concat(models);
      });
      this.updateModelPool();
    });
  }

  updateModelPool() {
    this.modelPool = [];
    this.models.forEach(model => {
      if (model.modelMetadata.status === this.selectedStatus) {
        this.modelPool.push(model);
      }
    });
    this.modelPool.sort(Utils.compareModels);
  }

  createCells() {
    const button = <HTMLInputElement>document.getElementById('reload');
    if (button !== null) {
      button.disabled = true;
    }
    this.eamSaved = false;
    this.dashboard = [];
    this.dashBoardAllModels = [];
    this.createInteractionCell();
    forkJoin(this.eamService.getAllBusinessProcess(), this.eamService.getAllOrganisationUnit()).subscribe((data) => {
      this.createOrgUnitCells(data.pop() as OrganisationUnit[]);
      this.processSuccessors = [];
      this.addSuccessors(data.pop() as BusinessProcess[], null);
      this.createProcessCells();
      if (this.eamInitialBorders) {
        this.eamInitialBorders = false;
        this.dashBoardInitialBorders = Utils.createCopy(this.dashboard
          .filter(cell => cell.type !== CellType.MODELS));
      }
      this.eamService.getAllEamContainers().subscribe(containers => {
        this.createModelCellsForEachStatus(containers);
        this.setModelCellsForSelectedStatus(null);
        if (button) {
          button.disabled = false;
        }
      }, () => {
        if (button) {
          button.disabled = false;
        }
      });
    }, () => {
      if (button) {
        button.disabled = false;
      }
    });
  }

  initOptions() {
    this.options = {
      gridType: GridType.HorizontalFixed,
      setGridSize: false, // fix for layouting regarding size
      compactType: CompactType.None,
      margin: this.cellMargin,
      mobileBreakpoint: 0,
      minCols: 1,
      maxCols: 1,
      minRows: 1,
      maxRows: 1,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: true,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: true,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        dropOverItems: false,
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      swap: false,
      pushItems: false,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {north: true, east: true, south: true, west: true},
      pushResizeItems: false,
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
    };
  }

  private updateGrid(): void {
    this.height = this.options.maxRows * (this.cellHeight + this.cellMargin);
    this.width = this.options.maxCols * (this.cellWidth + this.cellMargin);
    this.options.fixedColWidth = this.cellWidth;
    this.options.fixedRowHeight = this.cellHeight;
    if (this.options.api) {
      this.options.api.optionsChanged();
      this.options.api.resize();
    }
  }

  private addSuccessors(processes: BusinessProcess[], pre: BusinessProcess) {
    const succ = processes.find(p => {
      if (p.predecessor && pre) {
        return p.predecessor.id === pre.id;
      } else if (!p.predecessor && !pre) {
        return p.predecessor === pre;
      }
    });
    if (succ) {
      this.processSuccessors.push(succ);
      this.addSuccessors(processes, succ);
    }
  }

  createInteractionCell() {
    this.dashboard.push(EamUtils.gridCellOf(0, 0, []));
  }

  createProcessCells() {
    let counter = 1;
    for (const process of this.processSuccessors) {
      this.dashboard.push(EamUtils.businessProcessGridCellOf(counter, process));
      counter++;
    }
    this.options.maxCols = counter;
    this.updateGrid();
  }

  createOrgUnitCells(orgUnits: OrganisationUnit[]) {
    let counter = 1;
    for (const org of orgUnits.sort(compareOrganisationUnitsByIndex)) {
      this.dashboard.push(EamUtils.orgUnitGridCellOf(counter, org));
      counter++;
    }
    this.options.maxRows = counter;
    this.updateGrid();
  }

  createModelCellsForEachStatus(eamContainers: EamContainer[]) {
    const createdModelContainers: EamPairs[] = [];

    for (const eamContainer of eamContainers) {
      const modelStatus = eamContainer.model.modelMetadata.status;
      const orgId = eamContainer.organisationUnit.id;
      const processId = eamContainer.businessProcess.id;
      const x = this.getProcessDashboardCells().filter(cell => cell.content[0].id === processId).pop().x;
      const y = this.getOrgUnitDashboardCells().filter(cell => cell.content[0].id === orgId).pop().y;
      let exists = false;
      createdModelContainers.forEach(pair => {
        if (pair.process === processId && pair.orgunit === orgId && modelStatus === pair.status) {
          this.dashBoardAllModels.forEach(gridsterItem => {
            if (gridsterItem.x === x && gridsterItem.y === y && gridsterItem.status === modelStatus) {
              gridsterItem.content.push(eamContainer.model);
              exists = true;
              return;
            }
          });
        }
      });
      if (!exists) {
        createdModelContainers.push({orgunit: orgId, process: processId, x: x, y: y, status: modelStatus});
        const item = EamUtils.modelsGridCellOf(x, y, [eamContainer.model], modelStatus);
        this.dashBoardAllModels.push(item);
        exists = false;
      }
    }
  }

  setModelCellsForSelectedStatus(oldStatus: ModelStatus) {
    if (oldStatus) {
      this.dashBoardAllModels = this.dashBoardAllModels.filter(cell => cell.status !== oldStatus).concat(this.getModelDashboardCells());
      this.dashboard = this.dashboard.filter(cell => cell.type !== CellType.MODELS);
    }
    this.dashboard = this.dashboard.concat(this.dashBoardAllModels.filter(cell => cell.status === this.selectedStatus));
    this.mergeCellsAndUpdateGrid();
  }

  mergeCellsAndUpdateGrid() {
    this.syncDashboardModelCellsToAllModelCells();
    this.splitCells();
    this.mergeRows();
    this.mergeColumns();
    this.syncAllModelCellsToDashboardModelCells();
    this.updateGrid();
  }

  mergeRows() {
    // get cells gridCellOf models sorted by x and y values
    const dashboardCells = this.getAllModelDashboardCells();
    let previousCell = null;
    let length = dashboardCells.length;
    for (let index = 0; index < length; index++) {
      const currentCell = dashboardCells[index];
      if (index > 0) {
        // store the last cell to check the content against
        if (previousCell === null) {
          previousCell = dashboardCells[index - 1];
        }
        // since we work in a list we need to explicitly check if the previous cell and the current cell are in the same column,
        // span across the same cols and are in the following row, since there could be empty rows in between
        if (previousCell.x === currentCell.x &&
          previousCell.cols === currentCell.cols &&
          previousCell.y + previousCell.rows === currentCell.y &&
          previousCell.status === currentCell.status) {
          // content is being check for equality by using the ids of the models
          if (currentCell.content.map(v => v.id).sort().join() === previousCell.content.map(v => v.id).sort().join()) {
            dashboardCells.splice(index, 1);
            index--;
            length--;
            previousCell.rows++;
          } else {
            previousCell = null;
          }
        } else {
          previousCell = null;
        }
      }
    }
  }

  mergeColumns() {
    // get cells gridCellOf models sorted by x and y values
    const dashboardCells = this.getAllModelDashboardCells(true);
    let previousCell = null;
    let length = dashboardCells.length;
    for (let index = 0; index < length; index++) {
      const currentCell = dashboardCells[index];
      if (index > 0) {
        // store the last cell to check the content against
        if (previousCell === null) {
          previousCell = dashboardCells[index - 1];
        }
        // since we work in a list we need to explicitly check if the previous cell and the current cell are in the same row,
        // span across the same rows and are in the following column, since there could be empty columns in between
        if (previousCell.y === currentCell.y &&
          previousCell.rows === currentCell.rows &&
          previousCell.x + previousCell.cols === currentCell.x &&
          previousCell.status === currentCell.status) {
          // content is being check for equality by using the ids of the models
          if (currentCell.content.map(v => v.id).sort().join() === previousCell.content.map(v => v.id).sort().join()) {
            dashboardCells.splice(index, 1);
            index--;
            length--;
            previousCell.cols++;
          } else {
            previousCell = null;
          }
        } else {
          previousCell = null;
        }
      }
    }
  }

  splitCellsAndUpdateGrid() {
    this.syncDashboardModelCellsToAllModelCells();
    this.splitCells();
    this.syncAllModelCellsToDashboardModelCells();
    this.updateGrid();
  }

  saveChangedModels() {
    this.changedModels.forEach(model => {
      this.modelService.updateModelInProject(String(model.projectId), model).subscribe();
    });
    this.changedModels = [];
  }

  syncDashboardModelCellsToAllModelCells() {
    this.dashBoardAllModels = this.dashBoardAllModels
      .filter(cell => cell.status !== this.selectedStatus)
      .concat(this.getModelDashboardCells());
  }

  syncAllModelCellsToDashboardModelCells() {
    this.dashboard = this.dashboard
      .filter(cell => cell.type !== CellType.MODELS)
      .concat(this.dashBoardAllModels.filter(cell => cell.status === this.selectedStatus));
    if (this.eamInitialModels) {
      this.eamInitialModels = false;
      this.dashBoardInitialModels = Utils.createCopy(this.dashboard
        .filter(cell => cell.type !== CellType.MODELS)
        .concat(this.dashBoardAllModels).filter(cell => cell.type === CellType.MODELS));
    }
  }

  splitCells() {
    this.getAllModelDashboardCells().filter(c => c.rows > 1).forEach(spannedCell => {
      const spannedRows = spannedCell.rows;
      for (let rows = spannedRows; rows > 1; rows--) {
        const x = spannedCell.x;
        const y = spannedCell.y + spannedRows - rows + 1;
        const contentCopy = Utils.createCopy<Model[]>(spannedCell.content);
        const singleCell = EamUtils.modelsGridCellOf(x, y, contentCopy, spannedCell.status, 1, spannedCell.cols);
        spannedCell.rows--;
        this.dashBoardAllModels.push(singleCell);
      }
    });
    this.getAllModelDashboardCells().filter(c => c.cols > 1).forEach(spannedCell => {
      const spannedCols = spannedCell.cols;
      for (let cols = spannedCols; cols > 1; cols--) {
        const x = spannedCell.x + spannedCols - cols + 1;
        const y = spannedCell.y;
        const contentCopy = Utils.createCopy<Model[]>(spannedCell.content);
        const singleCell = EamUtils.modelsGridCellOf(x, y, contentCopy, spannedCell.status);
        spannedCell.cols--;
        this.dashBoardAllModels.push(singleCell);
      }
    });
  }

  updateEamContainers() {
    this.saveChangedModels();
    this.syncDashboardModelCellsToAllModelCells();
    // clear the backend
    this.eamService.deleteAllEamContainers().subscribe(() => {
      forkJoin(this.eamService.deleteAllOrganisationUnits(), this.eamService.deleteAllBusinessProcesses()).subscribe(() => {
        const businessProcesses = this.getProcessesFromDashboard();
        businessProcesses.map(p => p.id = null);

        this.eamService.addBusinessProcesses(businessProcesses).subscribe(processes => {
          // ids gridCellOf saved business processes need to be mapped back to the processes in the cell items
          businessProcesses.forEach(bp => bp.id = processes.filter(process => process.label === bp.label)[0].id);
          const orgUnits = this.getOrgUnitsFromDashboard();

          const orgUnitQueue = [];
          for (let index = 0; index < orgUnits.length; index++) {
            const orgUnit: OrganisationUnit = orgUnits[index];
            orgUnit.index = index;
            orgUnitQueue.push(this.eamService.addOrganisationUnit(orgUnit));
          }
          forkJoin(orgUnitQueue).subscribe((orgs) => {

            // ids gridCellOf saved organisation units need to be mapped back to the organisation units in the cell items
            orgUnits.forEach(org => org.id = orgs.filter(orga => orga.label === org.label)[0].id);
            // create eam containers based on the x and y coordinates gridCellOf the model cells
            const eamContainers = [];

            this.getAllModelDashboardCells().forEach(gridItem => {
              gridItem.content.filter(model => model !== null).forEach(model => {

                for (let processIndex = gridItem.x; processIndex < gridItem.x + gridItem.cols; processIndex++) {
                  const process = businessProcesses[processIndex - 1];
                  for (let orgIndex = gridItem.y; orgIndex < gridItem.y + gridItem.rows; orgIndex++) {
                    const org = orgUnits[orgIndex - 1];
                    const eamContainer = {model: model, businessProcess: process, organisationUnit: org} as EamContainer;
                    eamContainers.push(eamContainer);
                  }
                }
              });
            });

            let successfullSave = true;
            eamContainers.forEach(container => {
                container.model.opcuaInformationModels = [];
              }
            );
            this.eamService.addEamContainers(eamContainers).subscribe(() => {
              this.toastManagerService.openStandardSuccess(this.toastManagerService.EAM_CONTAINER,
                this.toastManagerService.SAVE_OPERATION);
              this.eamSaved = true;
              this.dashBoardInitialBorders = Utils.createCopy(this.dashboard
                .filter(cell => cell.type !== CellType.MODELS));
              this.dashBoardInitialModels = Utils.createCopy(this.dashboard
                .filter(cell => cell.type !== CellType.MODELS)
                .concat(this.dashBoardAllModels).filter(cell => cell.type === CellType.MODELS));
            }, () => {
              this.toastManagerService.openStandardError(this.toastManagerService.EAM_CONTAINER,
                this.toastManagerService.SAVE_OPERATION);
              successfullSave = false;
            });
          });
        });
      });
    }, () => {
      this.toastManagerService.openStandardError(this.toastManagerService.EAM_CONTAINER,
        this.toastManagerService.DELETE_OPERATION);
    });
  }

  zoom(adjustZoom: number) {
    const newZoomLevel = this.currentLevel + adjustZoom;
    if (newZoomLevel >= 0 && newZoomLevel < this.zoomLevels.length) {
      this.cellHeight = this.zoomLevels[newZoomLevel];
      this.cellWidth = this.zoomLevels[newZoomLevel];
      this.currentLevel = newZoomLevel;
      this.updateGrid();
    }
  }

  moveProcessLeft(cell: any) {
    this.syncDashboardModelCellsToAllModelCells();
    this.splitCellsAndUpdateGrid();
    this.dashboard.sort(EamUtils.compareType);
    const index = this.dashboard.indexOf(cell);
    if (this.dashboard[index].x > 1) {
      this.moveColumn(this.dashboard[index].x, -1);
      this.dashboard[index - 1].x++;
      this.dashboard[index].x--;
    }
    this.mergeCellsAndUpdateGrid();
    this.syncAllModelCellsToDashboardModelCells();
  }

  moveProcessRight(cell: any) {
    this.syncDashboardModelCellsToAllModelCells();
    this.splitCellsAndUpdateGrid();
    this.dashboard.sort(EamUtils.compareType);
    const index = this.dashboard.indexOf(cell);
    if (this.dashboard[index].x < this.options.maxCols - 1) {
      this.moveColumn(this.dashboard[index].x, 1);
      this.dashboard[index + 1].x--;
      this.dashboard[index].x++;
    }
    this.mergeCellsAndUpdateGrid();
    this.syncAllModelCellsToDashboardModelCells();
  }

  moveColumn(col: number, direction: number) {
    this.getAllModelDashboardCells().forEach(modelCell => {
      if (modelCell.x === col) {
        modelCell.x = modelCell.x + direction;
      } else if (modelCell.x === col + direction) {
        modelCell.x = modelCell.x - direction;
      }
    });
  }

  moveOrgUnitUp(cell: any) {
    this.syncDashboardModelCellsToAllModelCells();
    this.splitCellsAndUpdateGrid();
    this.dashboard.sort(EamUtils.compareType);
    const index = this.dashboard.indexOf(cell);
    if (this.dashboard[index].y > 1) {
      this.moveRow(this.dashboard[index].y, -1);
      this.dashboard[index - 1].y++;
      this.dashboard[index].y--;
    }
    this.mergeCellsAndUpdateGrid();
    this.syncAllModelCellsToDashboardModelCells();
  }

  moveOrgUnitDown(cell: any) {
    this.syncDashboardModelCellsToAllModelCells();
    this.splitCellsAndUpdateGrid();
    this.dashboard.sort(EamUtils.compareType);
    const index = this.dashboard.indexOf(cell);
    if (this.dashboard[index].y < this.options.maxRows - 1) {
      this.moveRow(this.dashboard[index].y, 1);
      this.dashboard[index + 1].y--;
      this.dashboard[index].y++;
    }
    this.mergeCellsAndUpdateGrid();
    this.syncAllModelCellsToDashboardModelCells();
  }

  moveRow(col: number, direction: number) {
    this.getAllModelDashboardCells().forEach(modelCell => {
      if (modelCell.y === col) {
        modelCell.y = modelCell.y + direction;
      } else if (modelCell.y === col + direction) {
        modelCell.y = modelCell.y - direction;
      }
    });
  }

  openAddOrganisationUnitDialog(): void {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.successMessage = 'Submit';
    this.modalRef.content.title = 'Add Organisation Unit';
    this.modalRef.content.needsInputField = true;
    this.modalRef.content.onClose.subscribe(result => {
      if (result === true) {
        this.modalRef.content.returnValue.subscribe(value => {
          const organisationUnit = new OrganisationUnit();
          organisationUnit.label = value;
          this.dashboard.push(EamUtils.orgUnitGridCellOf(this.options.maxRows, organisationUnit));
          this.options.maxRows++;
          this.updateGrid();
        });
      }
    });
  }

  openAddBusinessProcessDialog(): void {
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.successMessage = 'Submit';
    this.modalRef.content.title = 'Add Business Process';
    this.modalRef.content.needsInputField = true;
    this.modalRef.content.onClose.subscribe(result => {
      if (result === true) {
        this.modalRef.content.returnValue.subscribe(value => {
          const businessProcess = new BusinessProcess();
          businessProcess.label = value;
          this.dashboard.push(EamUtils.businessProcessGridCellOf(this.options.maxCols, businessProcess));
          this.options.maxCols++;
          this.updateGrid();
        });
      }
    });
  }

  openEditOrganisationUnitDialog(orgUnitCell: GridsterItemExtended): void {
    const organisationUnit = {...orgUnitCell.content[0]};
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.successMessage = 'Submit';
    this.modalRef.content.title = 'Edit Organisation Unit';
    this.modalRef.content.needsInputField = true;
    this.modalRef.content.value = organisationUnit.label;
    this.modalRef.content.onClose.subscribe(result => {
      if (result === true) {
        this.modalRef.content.returnValue.subscribe(value => {
          organisationUnit.label = value;
          orgUnitCell.content = [organisationUnit];
          this.updateGrid();
        });
      }
    });
  }

  openEditBusinessProcessDialog(processCell: GridsterItemExtended): void {
    const businessProcess = {...processCell.content[0]};
    this.modalRef = this.modalService.show(ConfirmDialogComponent);
    this.modalRef.content.successMessage = 'Submit';
    this.modalRef.content.title = 'Edit Business Process';
    this.modalRef.content.needsInputField = true;
    this.modalRef.content.value = businessProcess.label;
    this.modalRef.content.onClose.subscribe(result => {
      if (result === true) {
        this.modalRef.content.returnValue.subscribe(value => {
          businessProcess.label = value;
          processCell.content = [businessProcess];
          this.updateGrid();
        });
      }
    });
  }

  private openReplacementDialog(addedModel: Model, candidates: GridItemWrapper[]): void {
    const initialState = {addedModel: addedModel, candidates: candidates};
    this.bsModalRef = this.modalService.show(ReplacementPopupComponent, {initialState});
    this.bsModalRef.content.resultSubject.subscribe(result => {
      const containerList = result as GridItemWrapper[];
      if (!containerList || containerList.length <= 0) {
        return;
      }

      const archiveCandidates: Model[] = [];
      containerList.forEach(container => {
        const gridCell = this.getModelDashboardCells().filter(cell => cell.x === container.x && cell.y === container.y)[0];
        const modelList = container.modelAction;

        modelList.forEach(modelActionWrapper => {
          const modelAction = modelActionWrapper;
          if (modelAction.keep) {
            // add only if not already in list
            if (gridCell.content.indexOf(addedModel) <= 0) {
              gridCell.content.push(addedModel);
            }

            if (this.removeDuplicates(gridCell.content)) {
              this.toastManagerService.openInfoToast(
                'Duplicates after replacement found and removed.');
            }
          } else {
            gridCell.content.filter(model => (model as Model).id === modelAction.model.id)
              .forEach(model => {
                gridCell.content.splice(gridCell.content.indexOf(model), 1);
                if (archiveCandidates.indexOf(model) < 0) {
                  archiveCandidates.push(model);
                }
              });
          }
        });
        this.toastManagerService.openSuccessToast('Model replacements finished');
      });

      this.removeDuplicates(archiveCandidates);
      // update models and remove from pool
      archiveCandidates.forEach(model => {
        const containers = this.getContainersWithModel(model);
        if (containers.length <= 0) {
          model.modelMetadata.status = ModelStatus.ARCHIVED;
          if (this.changedModels.findIndex(entry => entry.id === model.id) < 0) {
            this.changedModels.push(model);
          }
          let index = this.models.findIndex((value) => value.id === model.id);
          if (index >= 0) {
            this.models.splice(index, 1);
          }
          index = this.modelPool.findIndex((value) => value.id === model.id);
          if (index >= 0) {
            this.modelPool.splice(index, 1);
          }
        }
      });

      this.toastManagerService.openSuccessToast('Model replacements finished');
    });
  }

  getContainersWithModel(model: Model): GridsterItemExtended[] {
    const containers = [];
    this.getModelDashboardCells().forEach(cell => {
      if (cell.content.findIndex(value => value.id === model.id) >= 0) {
        containers.push(cell);
      }
    });
    return containers;
  }

  deleteBusinessProcessGrid(processCell: GridsterItemExtended) {
    if (this.dashBoardAllModels.filter(cell => cell.x <= processCell.x && cell.x + cell.cols > processCell.x).length > 0) {
      this.toastManagerService.openErrorToast('Business process can not be deleted because one or more models are still mapped to it.');
      return;
    }
    this.dashboard.splice(this.dashboard.indexOf(processCell), 1);
    this.dashboard.forEach(container => {
      if (container.x >= processCell.x) {
        container.x--;
      }
    });
    this.options.maxCols--;
    this.updateGrid();
  }

  deleteOrganisationUnitCell(orgUnitCell: any) {
    if (this.dashBoardAllModels.filter(cell => cell.y <= orgUnitCell.y && cell.y + cell.rows > orgUnitCell.y).length > 0) {
      this.toastManagerService.openErrorToast('Organisation Unit can not be deleted because one or more models are still mapped to it.');
      return;
    }
    this.dashboard.splice(this.dashboard.indexOf(orgUnitCell), 1);
    this.dashboard.forEach(container => {
      if (container.y >= orgUnitCell.y) {
        container.y--;
      }
    });
    this.options.maxRows--;
    this.updateGrid();
  }

  deleteGridContainer(cell: GridsterItemExtended) {
    if (cell.content.length > 0) {
      this.modalRef = this.modalService.show(ConfirmDialogComponent);
      this.modalRef.content.successMessage = 'Confirm';
      this.modalRef.content.needsInputField = false;
      this.modalRef.content.message = 'There are still models belonging to this business process in this organisation unit.' +
        '\n\nDo you still want to delete this model container?';
      this.modalRef.content.onClose.subscribe(result => {
        if (result === true) {
          this.dashboard.splice(this.dashboard.indexOf(cell), 1);
          this.updateGrid();
        }
      });
    } else {
      this.dashboard.splice(this.dashboard.indexOf(cell), 1);
      this.updateGrid();
    }
  }

  selectModel(model: Model, modal: any) {
    this.selectedModel = model;
    this.projectService.getProjectById(model.projectId.toString())
      .subscribe(project => this.sidebarNotifierService.notifyProjectAndModel(project, model));
    modal.show();
  }

  getProcessesFromDashboard() {
    return this.getProcessDashboardCells().map(cell => cell.content[0]);
  }

  getProcessDashboardCells() {
    return this.dashboard.filter(cell => cell.type === CellType.PROCESS).sort(EamUtils.compareType);
  }

  getOrgUnitsFromDashboard() {
    return this.getOrgUnitDashboardCells().map(cell => cell.content[0]);
  }

  getOrgUnitDashboardCells() {
    return this.dashboard.filter(cell => cell.type === CellType.ORGUNIT).sort(EamUtils.compareType);
  }

  getModelDashboardCells() {
    return this.dashboard.filter(cell => cell.type === CellType.MODELS).sort(EamUtils.compareType);
  }

  getAllModelDashboardCells(sortedByColFirst?: boolean) {
    return this.dashBoardAllModels.sort((item1, item2) => EamUtils.compareType(item1, item2, sortedByColFirst));
  }

  private removeDuplicates(modelList: Model[]): boolean {
    // find duplicates
    const toDelete: Model[] = [];
    modelList.forEach((value, index1, array) => {
      if (index1 !== array.findIndex(list => list.id === value.id)) {
        toDelete.push(value);
      }
    });

    // remove duplicates
    toDelete.forEach(value => {
      const index = modelList.findIndex(list => list.id === value.id);
      modelList.splice(index, 1);
    });

    // true: duplicates existed; false: no duplicates removed
    return toDelete.length > 0;
  }

  updateViewForModelStatus(status: string) {
    if (this.selectedStatus !== status) {
      const oldStatus = this.selectedStatus;
      this.selectedStatus = status as ModelStatus;
      this.updateModelPool();
      this.setModelCellsForSelectedStatus(oldStatus);
    }
  }

  onDeleteEAMContainer(beforeDeletion: boolean, detailsModal) {
    if (beforeDeletion) {
      this.eamSaved = false;
      this.updateEamContainers();
      detailsModal.hide();
    } else {
      this.projectService.getAllProjects().subscribe(projects => {
        this.getModels(projects);
        this.createCells();
      });
    }
  }
}

export interface EamPairs {
  process: string;
  orgunit: string;
  x: number;
  y: number;
  status: ModelStatus;
}

