export class ModelFile {
  id: number;
  dbFile: DbFile;
  fileSize: number;
}

export class DbFile {
  id: number;
  fileName: string;
  fileType: string;
}
