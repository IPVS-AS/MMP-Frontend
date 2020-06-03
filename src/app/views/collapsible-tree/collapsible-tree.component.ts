// independent chart
import {Component, ElementRef, HostListener, OnChanges, SimpleChanges, ViewEncapsulation} from '@angular/core';
import * as D3 from 'd3';
import {TreeNode} from '../../_models/opcua-tree-view';

@Component({
  selector: 'app-collapsible-tree',
  templateUrl: './collapsible-tree.component.html',
  styleUrls: ['./collapsible-tree.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CollapsibleTreeComponent implements OnChanges {

  private margin: any;
  private width: number;
  private height: number;
  private maxTextLength = 1;
  private maxModelNameLength = 1;
  private approximateCharSize = 6.5;

  private root: any;
  private treemap: any;
  private svg: any;
  private _treeData: TreeNode;

  private duration: number;
  private i: number;

  private childrenWidth = 0;
  private leavesSize = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.root) {
      this.update(this.root);
    }
  }

  constructor(private myElement: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.root) {
      this.update(this.root);
    }
  }

  set treeData(data: TreeNode) {
    this._treeData = data;
    this.calculateSize(data);
    this.drawTree();
  }

  get treeData(): TreeNode {
    return this._treeData;
  }

  private calculateSize(data: TreeNode) {
    if (data == null) {
      return;
    }

    let maxLevelWidth = 1;
    let maxTextLength = 1;
    let modelNameLength = 1;
    let leavesSize = 0;

    const childCount = function (level, n) {
      if (n != null) {
        if (n.name != null && n.level != null && n.level === 0) {
          modelNameLength = n.name.length;
        } else if (n.name != null && n.name.length > maxTextLength) {
          maxTextLength = n.name.length;
        }

        if (n.level != null && n.level > maxLevelWidth) {
          maxLevelWidth = n.level;
        } else if (n.data != null && n.data.nodeType != null) {
          if (n.depth != null && n.depth > maxLevelWidth) {
            maxLevelWidth = n.depth;
          }
        }

        if (n.children && n.children.length > 0) {
          n.children.forEach(function (d) {
            childCount(level + 1, d);
          });
        } else {
          leavesSize++;
        }
      }
    };

    childCount(0, data);

    this.childrenWidth = maxLevelWidth;
    this.leavesSize = leavesSize;

    if (maxTextLength > this.maxTextLength) {
      this.maxTextLength = maxTextLength;
    }

    if (modelNameLength > this.maxModelNameLength) {
      this.maxModelNameLength = modelNameLength;
    }

    this.setSize();
  }

  private setSize() {
    const previousHeight = this.height;
    const previousWidth = this.width;

    const height = (50 * this.leavesSize);

    // 50 should be width of a node.
    // 180 should be the distance between parent and children nodes.
    // Show also text at the end of a node.
    const width = (this.approximateCharSize * this.maxModelNameLength) + (50 * this.childrenWidth) + 50 + (180 * this.childrenWidth)
      + (this.approximateCharSize * this.maxTextLength);

    this.margin = {top: 20, right: 180, bottom: 20, left: (50 + (this.approximateCharSize * this.maxModelNameLength))};
    this.width = width - this.margin.right - this.margin.left;
    this.height = height - this.margin.top - this.margin.bottom;

    // adjust tree and svg size
    if (this.treemap && previousHeight && previousWidth) {
      if (previousHeight > this.height || previousWidth > this.width) {
        setTimeout(() => {
          this.updateSvg();
        }, this.duration * 0.8);
      } else {
        this.updateSvg();
      }
      this.treemap.size([this.height, this.width]);
    }

  }

  private updateSvg() {
    D3.select('[id="tree-container"] svg')
      .attr('width', this.width + this.margin.right + this.margin.left)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
  }

  private drawTree() {
    D3.select('[id="tree-container"]').select('svg').remove();

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    this.svg = D3.select('[id="tree-container"]').append('svg')
      .attr('width', this.width + this.margin.right + this.margin.left)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.i = 0;
    this.duration = 750;

    // declares a tree layout and assigns the size
    this.treemap = D3.tree()
      .separation(function (a, b) {
        return a.parent === b.parent ? 1 : 1.25;
      })
      .size([this.height, this.width]);

    // Assigns parent, children, height, depth
    this.root = D3.hierarchy(this._treeData, function (d) {
      return d.children;
    });
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;

    this.update(this.root);
  }

  // Toggle children on click.
  private onNodeClick(data): void {
    if (data.children) {
      data._children = data.children;
      data.children = null;
    } else {
      data.children = data._children;
      data._children = null;
    }

    this.calculateSize(this.root);
    this.update(data);
  }

  private update(source: any): void {
    // Assigns the x and y position for the root
    const treeData = this.treemap(this.root);

    // Compute the new tree layout.
    const nodes = treeData.descendants();
    const links = nodes.slice(1);

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * 180;
    });

    // ===> Nodes section <===

    // Update the root...
    const node = this.svg.selectAll('g.node')
      .data(nodes, (d) => {
        return d.id || (d.id = ++this.i);
      });

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', (data) => {
        if (data._children || data.children && data.children.length > 0 && data.children[0].data.nodeType) {
          this.onNodeClick(data);
        }
      });

    // Add Circle for the root
    nodeEnter.append('circle')
      .attr('class', (d) => {
        const ghost = d.data.nodeType || d.data.level < 1 ? '' : ' ghost';
        return 'node ' + d.data.nodeType + ghost;
      })
      .attr('r', 1e-6)
      .style('fill', (d) => {
        if (d.data.nodeType || d.data.level < 1) {
          return d._children ? '#c2cca7' : '#fff';
        }
        return 'none';
      });

    // Add labels for the root
    nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => {
        return !d.data.dataType && (d.children || d._children) ? -15 : 15;
      })
      .attr('text-anchor', (d) => {
        return !d.data.dataType && (d.children || d._children) ? 'end' : 'start';
      })
      .text((d) => {
        return d.data.name;
      });

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(this.duration)
      .attr('transform', (d) => {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style('fill', (d) => {
        if (d.data.nodeType || d.data.level < 1) {
          return d._children ? '#c2cca7' : '#fff';
        }
      })
      .attr('cursor', 'pointer');


    // Remove any exiting root
    const nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr('transform', (d) => {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    this.updateLinks(source, links);

    // Store the old positions for transition.
    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // ****************** links section ***************************
  private updateLinks(source: any, links: any) {
    // Update the links...
    const link = this.svg.selectAll('path.link')
      .data(links, (d) => {
        return d.id;
      });

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', (d) => {
        return !d.data.nodeType ? 'link ghost' : 'link';
      })
      .attr('d', (d) => {
        const o = {x: source.x0, y: source.y0};
        return this.diagonal(o, o);
      });

    // UPDATE
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
      .duration(this.duration)
      .attr('d', (d) => {
        return this.diagonal(d, d.parent);
      });

    // Remove any exiting links
    const linkExit = link.exit().transition()
      .duration(this.duration)
      .attr('d', (d) => {
        const o = {x: source.x, y: source.y};
        return this.diagonal(o, o);
      })
      .remove();

  }

  private diagonal(s, d): any {
    const path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path;
  }
}
