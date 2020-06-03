import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ModelService} from '../../_services/model.service';
import {Model, PMMLMetadata} from '../../_models/model';
import {ProjectService} from '../../_services/project.service';
import {Project} from '../../_models/project';
import Utils from '../../_utils/Utils';

@Component({
  selector: 'app-versioning',
  templateUrl: './versioning.component.html',
  styleUrls: ['./versioning.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VersioningComponent implements OnInit {

  projectId: string;
  modelId: string;
  model: Model;
  project: Project;

  models: Model[];
  diffModels: Model[];
  sortedDiffModels: Model[];

  badge1: any;
  badge2: any;

  constructor(private router: ActivatedRoute, private projectService: ProjectService,
              private modelService: ModelService) {
    this.models = [];
    this.diffModels = [];
    this.badge1 = null;
    this.badge2 = null;
  }

  ngOnInit() {
    this.projectId = this.router.snapshot.paramMap.get('projectId');
    this.modelId = this.router.snapshot.paramMap.get('modelId');

    this.projectService.getProjectById(this.projectId).subscribe(project => this.project = project);
    this.modelService.getModelInProject(this.projectId, this.modelId).subscribe(model => {
      this.model = model;
      this.modelService.getModelsForProjectAndModelGroupIdentifier(this.projectId, this.model.modelMetadata.modelGroup.id)
        .subscribe(models => {
          this.models = models;
          this.models.sort((modelA, modelB) => Utils.CompareStrings(modelB.modelMetadata.version, modelA.modelMetadata.version));
        });
    });
  }

  clickLabel(e, model: Model) {
    if (this.models.length < 2) {
      return false;
    }

    const index = this.diffModels.indexOf(model);
    const length = this.diffModels.length;
    if (index >= 0) {
      this.diffModels.splice(index, 1);
      this.changeBadgePrimary(e, true);
      if (e === this.badge1) {
        this.badge1 = this.badge2;
      } else {
        this.badge2 = this.badge1;
      }
    } else if (length >= 2 && index < 0) {
      this.diffModels[0] = this.diffModels[1];
      this.diffModels[1] = model;
      this.changeBadgePrimary(e, false);
      this.changeBadgePrimary(this.badge2, true);
      this.badge2 = this.badge1;
      this.badge1 = e;
    } else if (length < 2 && index < 0) {
      this.diffModels.push(model);
      this.changeBadgePrimary(e, false);
      this.badge2 = this.badge1;
      this.badge1 = e;
    }
    this.sortedDiffModels = this.diffModels.map(x => Object.assign({}, x));
    this.sortedDiffModels.sort((modelA, modelB) => Utils.CompareStrings(modelA.modelMetadata.version, modelB.modelMetadata.version));
  }

  changeBadgePrimary(e, toPrimary: boolean) {
    if (toPrimary) {
      e.classList.remove('badge-success');
      e.classList.add('badge-primary');
    } else {
      e.classList.remove('badge-primary');
      e.classList.add('badge-success');
    }
  }

  notEmptyOrNull(list) {
    return Utils.notEmptyOrNull(list);
  }

  stringifyInputOutputList(list) {
    let string = '';
    list.forEach(e => {
      string += e.name + ', ';
    });
    return string.slice(0, string.length - 2);
  }

  stringifyAnnotations(list) {
    let string = '';
    list.forEach(e => {
      string += e + ', ';
    });
    return string.slice(0, string.length - 2);
  }

  clear() {
    this.diffModels = [];
    if (this.badge1) {
      this.changeBadgePrimary(this.badge1, true);
      this.badge1 = null;
    }
    if (this.badge2) {
      this.changeBadgePrimary(this.badge2, true);
      this.badge2 = null;
    }
  }

  openModal(modal) {
    const pmmlMetadata1 = this.sortedDiffModels[0].modelMetadata.pmmlMetadata;
    const pmmlMetadata2 = this.sortedDiffModels[1].modelMetadata.pmmlMetadata;
    this.diff(pmmlMetadata1, pmmlMetadata2);

    modal.show();
  }

  diff(p1: PMMLMetadata, p2: PMMLMetadata) {
    if (p1 === null && p2 !== null) {
      this.addAll(p2);
    } else if (p1 !== null && p2 === null) {
      this.deleteAll(p1);
    } else if (p1 !== null && p2 !== null) {
      if (p1.pmmlVersion !== p2.pmmlVersion) {
        if (!p1.pmmlVersion && p2.pmmlVersion) {
          this.add('diffPmmlVersion');
        } else if (p1.pmmlVersion && !p2.pmmlVersion) {
          this.delete('diffPmmlVersion');
        } else {
          this.missMatch('diffPmmlVersion');
        }
      }
      if (p1.applicationName + ' ' + p1.applicationVersion !== p2.applicationName + ' ' + p2.applicationVersion) {
        if (!p1.applicationName && !p1.applicationVersion && (p2.description || p2.applicationVersion)) {
          this.add('diffAppName');
        } else if ((p1.applicationName && p1.applicationVersion) && !p2.description && !p2.applicationVersion) {
          this.delete('diffAppName');
        } else {
          this.missMatch('diffAppName');
        }
      }
      if (p1.timestamp !== p2.timestamp) {
        if (!p1.timestamp && p2.timestamp) {
          this.add('diffTimeStamp');
        } else if (p1.timestamp && !p2.timestamp) {
          this.delete('diffTimeStamp');
        } else {
          this.missMatch('diffTimeStamp');
        }
      }
      if (p1.modelVersion !== p2.modelVersion) {
        if (!p1.modelVersion && p2.modelVersion) {
          this.add('diffModelVersion');
        } else if (p1.modelVersion && !p2.modelVersion) {
          this.delete('diffModelVersion');
        } else {
          this.missMatch('diffModelVersion');
        }
      }
      if (p1.description !== p2.description) {
        if (!p1.description && p2.description) {
          this.add('diffDescription');
        } else if (p1.description && !p2.description) {
          this.delete('diffDescription');
        } else {
          this.missMatch('diffDescription');
        }
      }
      if (p1.miningFunction !== p2.miningFunction) {
        if (!p1.miningFunction && p2.miningFunction) {
          this.add('diffMiningFunction');
        } else if (p1.miningFunction && !p2.miningFunction) {
          this.delete('diffMiningFunction');
        } else {
          this.missMatch('diffMiningFunction');
        }
      }
      if (p1.algorithmName !== p2.algorithmName) {
        if (!p1.algorithmName && p2.algorithmName) {
          this.add('diffAlgoName');
        } else if (p1.algorithmName && !p2.algorithmName) {
          this.delete('diffAlgoName');
        } else {
          this.missMatch('diffAlgoName');
        }
      }
      const inStr1 = this.stringifyInputOutputList(p1.inputAttributes);
      const inStr2 = this.stringifyInputOutputList(p2.inputAttributes);
      if (inStr1 !== inStr2) {
        if (!inStr1 && inStr2) {
          this.add('diffInputs');
        } else if (inStr1 && !inStr2) {
          this.delete('diffInputs');
        } else {
          this.missMatch('diffInputs');
        }
      }
      const outStr1 = this.stringifyInputOutputList(p1.outputAttributes);
      const outStr2 = this.stringifyInputOutputList(p2.outputAttributes);
      if (outStr1 !== outStr2) {
        if (!outStr1 && outStr2) {
          this.add('diffOutputs');
        } else if (outStr1 && !outStr2) {
          this.delete('diffOutputs');
        } else {
          this.missMatch('diffOutputs');
        }
      }
      const annoStr1 = this.stringifyAnnotations(p1.pmmlAnnotations);
      const annoStr2 = this.stringifyAnnotations(p2.pmmlAnnotations);
      if (annoStr1 !== annoStr2) {
        if (!annoStr1 && annoStr2) {
          this.add('diffAnnotations');
        } else if (annoStr1 && !annoStr2) {
          this.delete('diffAnnotations');
        } else {
          this.missMatch('diffAnnotations');
        }
      }
    }
  }

  missMatch(id) {
    document.getElementById(id + '0').classList.remove('alert-success');
    document.getElementById(id + '1').classList.remove('alert-success');
    document.getElementById(id + '0').classList.remove('alert-danger');
    document.getElementById(id + '1').classList.remove('alert-danger');
    document.getElementById(id + '0').classList.add('alert-info');
    document.getElementById(id + '1').classList.add('alert-info');
  }

  delete(id) {
    document.getElementById(id + '1').classList.remove('alert-info');
    document.getElementById(id + '1').classList.remove('alert-success');
    document.getElementById(id + '1').classList.add('alert-danger');
  }

  deleteAll(p: PMMLMetadata) {
    if (p.pmmlVersion) {
      this.delete('diffPmmlVersion');
    }
    if (p.applicationName || p.applicationVersion) {
      this.delete('diffAppName');
    }
    if (p.timestamp) {
      this.delete('diffTimeStamp');
    }
    if (p.modelVersion) {
      this.delete('diffModelVersion');
    }
    if (p.description) {
      this.delete('diffDescription');
    }
    if (p.miningFunction) {
      this.delete('diffMiningFunction');
    }
    if (p.algorithmName) {
      this.delete('diffAlgoName');
    }
    if (p.inputAttributes) {
      this.delete('diffInputs');
    }
    if (p.outputAttributes) {
      this.delete('diffOutputs');
    }
    if (p.pmmlAnnotations && p.pmmlAnnotations.length > 0) {
      this.delete('diffAnnotations');
    }
  }

  add(id) {
    document.getElementById(id + '1').classList.remove('alert-info');
    document.getElementById(id + '1').classList.remove('alert-danger');
    document.getElementById(id + '1').classList.add('alert-success');
  }

  addAll(p: PMMLMetadata) {
    if (p.pmmlVersion) {
      this.add('diffPmmlVersion');
    }
    if (p.applicationName || p.applicationVersion) {
      this.add('diffAppName');
    }
    if (p.timestamp) {
      this.add('diffTimeStamp');
    }
    if (p.modelVersion) {
      this.add('diffModelVersion');
    }
    if (p.description) {
      this.add('diffDescription');
    }
    if (p.miningFunction) {
      this.add('diffMiningFunction');
    }
    if (p.algorithmName) {
      this.add('diffAlgoName');
    }
    if (p.inputAttributes) {
      this.add('diffInputs');
    }
    if (p.outputAttributes) {
      this.add('diffOutputs');
    }
    if (p.pmmlAnnotations && p.pmmlAnnotations.length > 0) {
      this.add('diffAnnotations');
    }
  }
}
