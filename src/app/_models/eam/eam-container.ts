import {BusinessProcess} from './business-process';
import {Model} from '../model';
import {OrganisationUnit} from './organisation-unit';

export class EamContainer {
  id: string;
  model: Model;
  businessProcess: BusinessProcess;
  organisationUnit: OrganisationUnit;
}
