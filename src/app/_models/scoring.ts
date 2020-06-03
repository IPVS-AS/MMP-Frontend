import {Interval} from './model';

export class Scoring {
  id: string;
  inputs: ScoringInput[];
  outputs: ScoringOutput[];
}

export class ScoringInput {
  id: string;
  name: string;
  value: string;
  usageType: string;
  dataType: string;
  interval: Interval;
  possibleValues: string[];
}

export class ScoringOutput {
  id: string;
  name: string;
  value: string;
}
