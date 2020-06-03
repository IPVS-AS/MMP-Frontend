import {User} from './user';
import {ModelFile} from './modelFile';
import {RelationalDBInformation} from './data-source';
import {OpcuaInformationModel} from './opcua-information-model';
import {Scoring} from './scoring';

export class Model {
  id: string;
  projectId: number;
  modelMetadata: ModelMetadata;
  relationalDBInformation: RelationalDBInformation;
  modelFile: ModelFile;
  pmmlMetadata: PMMLMetadata;
  opcuaInformationModels: OpcuaInformationModel[];
  scoring: Scoring[];
}

export class ModelMetadata {
  id: string;
  modelGroup: ModelGroup;
  version: string;
  name: string;
  status: ModelStatus;
  author: User;
  lastModified: string;
  dateOfCreation: string;
  hyperparameters: Hyperparameter[];
  algorithm: string;
  customFields: CustomField[];
  modelDescription: string;
  trainingRuns: TrainingRun[];
  transformations: Transformation[];
  predictionMetadata: PredictionMetadata;
  pmmlMetadata: PMMLMetadata;
}

export class ModelGroup {
  modelGroupName: string;
  id: string;
}

export class PMMLMetadata {
  pmmlVersion: string;
  applicationName: string;
  applicationVersion: string;
  timestamp: string;
  modelVersion: string;
  description: string;
  algorithmName: string;
  miningFunction: string;
  inputAttributes: InputAttribute[];
  outputAttributes: OutputAttribute[];
  pmmlAnnotations: string[];
}

export class InputAttribute {
  name: string;
  invalidValueReplacement: string;
  missingValueReplacement: string;
  usageType: string;
  dataType: string;
  intervals: Interval[];
  possibleValues: string[];
}

export class Interval {
  startRange: number;
  endRange: number;
  closure: Closure;
}

export class OutputAttribute {
  name: string;
  resultFeature: string;
}

export enum Closure {
  OPENCLOSED = 'openClosed',
  OPENOPEN = 'openOpen',
  CLOSEDOPEN = 'closedOpen',
  CLOSEDCLOSED = 'closedClosed'
}

export enum ModelStatus {
  PLANNED = 'PLANNED',
  EXPERIMENTAL = 'EXPERIMENTAL',
  OPERATION = 'OPERATION',
  MAINTENANCE = 'MAINTENANCE',
  ARCHIVED = 'ARCHIVED'
}

export class CustomField {
  fieldName: string;
  fieldContent: string;
}

export class Hyperparameter {
  name: string;
  value: string;
}

export class TrainingRun {
  startTime: string;
  endTime: string;
  currentScore: Score;
  annotations: string[];
}

export class Score {
  metricName: string;
  value: number;
}

export class Transformation {
  name: string;
  fromFramework: string;
  input: Dataset;
  output: Dataset;
  parameters: string[];
}

export class Dataset {
  type: string;
  source: string;
  version: string;
  annotations: string[];
  attributes: string[];
}

export class PredictionMetadata {
  annotation: string;
  evaluation: Evaluation;
}

export class Evaluation {
  name: string;
  scores: Score[];
}
