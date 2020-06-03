import {AfterViewChecked, Component, Input, ViewChild} from '@angular/core';
import {OpcuaInformationModel} from '../../../_models/opcua-information-model';
import {ModelMetadata} from '../../../_models/model';
import {CollapsibleTreeComponent} from '../../collapsible-tree/collapsible-tree.component';
import {OpcuaTreeView} from '../../../_models/opcua-tree-view';

@Component({
  selector: 'app-model-file-details',
  templateUrl: './model-file-details.component.html',
  styleUrls: ['./model-file-details.component.css']
})
export class ModelFileDetailsComponent implements AfterViewChecked {

  @Input() modelName: string;
  public showTree: boolean;
  @Input() pmmlMetaData: ModelMetadata;
  @Input() showPmml: boolean;
  @ViewChild('collTree') collapsibleTreeComponent: CollapsibleTreeComponent;
  private tree: OpcuaTreeView;
  private afterCollapsibleTreeInitialized = false;
  public _opcuaInformationModels: OpcuaInformationModel[];

  @Input()
  set opcuaInformationModels(opcuaInformationModels: OpcuaInformationModel[]) {
    this._opcuaInformationModels = opcuaInformationModels;
    this.updateOpcuaTree();
  }

  ngAfterViewChecked() {
    if (this.afterCollapsibleTreeInitialized === false && this._opcuaInformationModels != null && this._opcuaInformationModels.length > 0) {
      this.updateOpcuaTree();
      this.afterCollapsibleTreeInitialized = true;
    }
  }

  updateOpcuaTree() {
    if (this._opcuaInformationModels != null && this._opcuaInformationModels.length > 0) {
      const opcuaMetadata = [];
      this._opcuaInformationModels.forEach(opcuaInformationModel => {
        if (opcuaInformationModel != null && opcuaInformationModel.opcuaMetadata != null) {
          opcuaMetadata.push(opcuaInformationModel.opcuaMetadata);
        }
      });
      this.tree = new OpcuaTreeView(this.modelName, opcuaMetadata);
      if (this.collapsibleTreeComponent != null) {
        this.collapsibleTreeComponent.treeData = this.tree.root;
      }
      this.showTree = true;
    } else {
      this.showTree = false;
    }
  }
}
