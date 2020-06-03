import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ScoringService} from '../../../_services/scoring.service';
import {InputAttribute, Model} from '../../../_models/model';
import {ScoringInput, ScoringOutput} from '../../../_models/scoring';
import {ModelService} from '../../../_services/model.service';
import {ToastManagerService} from '../../../_services/toast-manager.service';
import {Project} from '../../../_models/project';
import {ProjectService} from '../../../_services/project.service';
import {TimeoutComponent} from '../../../timeout/timeout.component';

@Component({
  selector: 'app-scoring',
  templateUrl: './scoring.component.html',
})
export class ScoringComponent extends TimeoutComponent implements OnInit {

  projectId: string;
  modelId: string;
  model: Model;
  inputs: ScoringInput[];
  supInputs: ScoringInput[];
  outputs: ScoringOutput[];
  error: string;

  projectIDExists: boolean;
  modelIDExists: boolean;
  project: Project;

  constructor(private router: ActivatedRoute, private modelService: ModelService, private scoringService: ScoringService,
              private toastManagerService: ToastManagerService, private projectService: ProjectService) {
    super();
    this.inputs = [];
    this.supInputs = [];
  }

  ngOnInit() {
    this.projectIDExists = false;
    this.modelIDExists = false;
    this.projectId = this.router.snapshot.paramMap.get('projectId');
    this.modelId = this.router.snapshot.paramMap.get('modelId');

    const subscription = this.projectService.getProjectById(this.projectId).subscribe((project: Project) => {
      this.projectIDExists = project != null;
      this.cancelTimeout();
      const modelSubscription = this.modelService.getModelInProject(this.projectId, this.modelId).subscribe(model => {
        this.model = model;
        this.modelIDExists = this.model != null;
        this.cancelTimeout();
        this.getInputs();
      });
      this.waitForTimeOut(modelSubscription);
    });
    this.waitForTimeOut(subscription);
  }

  getInputs() {
    const modelInputs = this.model.modelMetadata.pmmlMetadata.inputAttributes;

    for (const input of modelInputs) {
      const scoringInput = new ScoringInput();
      scoringInput.name = input.name;
      scoringInput.value = '';
      scoringInput.usageType = input.usageType;
      scoringInput.dataType = this.getDataType(input);
      scoringInput.interval = this.getInterval(input);
      scoringInput.possibleValues = input.possibleValues;
      if (scoringInput.usageType === 'active') {
        this.inputs.push(scoringInput);
      } else {
        this.supInputs.push(scoringInput);
      }
    }
  }

  getDataType(input: InputAttribute) {
    switch (input.dataType) {
      case 'integer':
        return input.dataType;
      case 'float':
      case 'double':
        return 'number';
      case 'boolean':
        return 'checkbox';
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'dateTime':
        return 'datetime-local';
      default:
        return 'text';
    }
  }

  getInterval(input: InputAttribute) {
    if (input.intervals === null || input.intervals.length === 0) {
      return null;
    } else {
      return input.intervals[0];
    }
  }

  scoreModel() {
    this.error = null;
    this.scoringService.scoreModel(this.projectId, this.model.id, this.inputs.concat(this.supInputs)).subscribe(outputs => {
      this.outputs = outputs;
      this.outputs.forEach(output => {
        const val = parseFloat(output.value);
        if (!isNaN(val)) {
          output.value = val.toFixed(2);
        }
      });
    }, error => {
      this.toastManagerService.openErrorToast(error.error);
    });
  }

  reset() {
    this.error = null;
    this.outputs = null;
    this.inputs = [];
    this.supInputs = [];
    this.getInputs();
  }

  keyPressNumberValidator(e, datatype) {
    if (!(e.target.getAttribute('type') === 'number')) {
      return true;
    }

    const charCode = e.which ? e.which : e.keyCode;

    // permit dot
    if (datatype === 'integer') {
      return !(charCode > 31 && (charCode < 48 || charCode > 57));
    }

    return !(charCode > 31 && (charCode < 48 || charCode > 57)) || (charCode === 46);
  }

  parseInt(e: String) {
    return Number(e);
  }

}

