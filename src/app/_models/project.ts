import {User} from './user';
import {Model} from './model';

export class Project {
  id: string;
  name: string;
  description: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  useCase: string;
  status: ProjectStatus;
  editors: User[];
  models: Model[];
}

export enum ProjectStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED'
}
