import {OpcuaMetadata, OpcuaObjectNode, OpcuaPropertyNode, OpcuaVariableNode} from './opcua-information-model';

export interface TreeNode {
  name: string;
  nodeType: TreeNodeType;
  level: number;
  value?: string;
  dataType?: string;
  children?: Array<TreeNode>;
}

export enum TreeNodeType {
  OpcuaMachineNode = 'machine',
  OpcuaSensorNode = 'sensor',
  OpcuaComponentNode = 'component',
  OpcuaVariableNode = 'variable',
  OpcuaPropertyNode = 'property'
}

export class OpcuaTreeView {

  root: TreeNode;
  private maxLevel = 0;

  constructor(modelName: string, metadata: OpcuaMetadata[]) {
    this.root = this.createOpcuaTree(modelName, metadata) as TreeNode;
    this.createGhostChildNodes(this.root.children);
  }

  createGhostChildNodes(nodeChildren: TreeNode[]) {
    if (nodeChildren) {
      nodeChildren.forEach(childNode => {
        this.createGhostChildNode(childNode);
        this.createGhostChildNodes(childNode.children);
      });
    }
  }

  createGhostChildNode(node: TreeNode) {
    if (node.children && node.children.length === 0) {
      if (node.level < this.maxLevel) {
        const child = {level: node.level + 1, children: []} as TreeNode;
        node.children = [child];
        this.createGhostChildNode(child);
      }
    }
  }

  createOpcuaTree(rootName: string, metadata: OpcuaMetadata[]) {
    const rootLevel = 0;
    const rootNode = {name: rootName, level: rootLevel, children: []} as TreeNode;
    metadata.forEach(data => {
      const machine = data.machine;
      let machineNode;
      if (machine) {
        machineNode = this.createObjectNode(machine, TreeNodeType.OpcuaMachineNode, rootLevel);
      } else {
        machineNode = this.createObjectNode(new OpcuaObjectNode(), TreeNodeType.OpcuaMachineNode, rootLevel);
      }
      if (data.sensors) {
        const sensors = this.createSensors(data.sensors, rootLevel + 1);
        sensors.forEach(sensorNode => machineNode.children.push(sensorNode));
      }
      rootNode.children.push(machineNode);
    });

    return rootNode;
  }

  createObjectNode(node: any, type: TreeNodeType, parentLevel: number) {
    const nodeChildren: TreeNode[] = [];
    const treeNode = {nodeType: type, level: parentLevel + 1} as TreeNode;
    if (treeNode.level > this.maxLevel) {
      this.maxLevel = treeNode.level;
    }

    if (node.components) {
      this.createComponents(node.components, treeNode.level).forEach(item => nodeChildren.push(item));
    }
    if (node.variables) {
      this.createVariables(node.variables, treeNode.level).forEach(item => nodeChildren.push(item));
    }
    if (node.properties) {
      this.createProperties(node.properties, treeNode.level).forEach(item => nodeChildren.push(item));
    }
    let name = node.displayName;
    if (!name) {
      name = '(Undefined ' + type + ')';
    }

    if (type === TreeNodeType.OpcuaVariableNode) {
      name = node.displayName + ': ' + node.dataType;
      treeNode.dataType = node.dataType;
      treeNode.value = node.value;
    } else if (type === TreeNodeType.OpcuaPropertyNode) {
      name = node.displayName + ': ' + node.value;
      treeNode.dataType = node.dataType;
      treeNode.value = node.value;
    }
    treeNode.name = name;

    treeNode.children = nodeChildren;
    return treeNode;
  }

  createVariableNode(node: OpcuaVariableNode, parentLevel: number) {
    return this.createObjectNode(node, TreeNodeType.OpcuaVariableNode, parentLevel);
  }
  createPropertyNode(node: OpcuaPropertyNode, parentLevel: number) {
    return this.createObjectNode(node, TreeNodeType.OpcuaPropertyNode, parentLevel);
  }

  createComponents(components: OpcuaObjectNode[], parentLevel: number) {
    const sensorNodes: TreeNode[] = [];
    for (const component of components) {
      sensorNodes.push(this.createObjectNode(component, TreeNodeType.OpcuaComponentNode, parentLevel));
    }
    return sensorNodes;
  }

  createSensors(sensors: OpcuaObjectNode[], parentLevel: number) {
    const sensorNodes: TreeNode[] = [];
    for (const sensor of sensors) {
      sensorNodes.push(this.createObjectNode(sensor, TreeNodeType.OpcuaSensorNode, parentLevel));
    }
    return sensorNodes;
  }

  createVariables(variables: OpcuaVariableNode[], parentLevel: number) {
    const variableNodes: TreeNode[] = [];
    for (const property of variables) {
      variableNodes.push(this.createVariableNode(property, parentLevel));
    }
    return variableNodes;
  }
  createProperties(properties: OpcuaPropertyNode[], parentLevel: number) {
    const propertyNodes: TreeNode[] = [];
    for (const property of properties) {
      propertyNodes.push(this.createPropertyNode(property, parentLevel));
    }
    return propertyNodes;
  }

}


