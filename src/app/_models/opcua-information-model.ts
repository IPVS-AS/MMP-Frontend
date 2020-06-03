import {DbFile} from './modelFile';
import {DataSource} from './data-source';

export class OpcuaInformationModel extends DataSource {
  id: string;
  fileName: string;
  dbFile: DbFile;
  opcuaMetadata: OpcuaMetadata;
}

export class OpcuaMetadata {
  machine: OpcuaObjectNode;
  sensors: OpcuaObjectNode[];
}

export class OpcuaObjectNode {
  displayName: string;
  properties: OpcuaPropertyNode[];
  components: OpcuaObjectNode[];
  variables: OpcuaVariableNode[];
}

export class OpcuaVariableNode extends OpcuaObjectNode {
  dataType: string;
  value: String;
}

export class OpcuaPropertyNode extends OpcuaVariableNode {
}
