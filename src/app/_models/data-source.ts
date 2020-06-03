import {DataSourceType} from './data-source-type';

export class DataSource {
  id: string;
  type: DataSourceType;
}

export class RelationalDBInformation extends DataSource {
  url: string;
  dbUser: string;
  password: string;
}
