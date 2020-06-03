export class OrganisationUnit {
  id: string;
  label: string;
  index: number;
}

export function compareOrganisationUnitsByIndex(org1: OrganisationUnit, org2: OrganisationUnit) {
  return org1.index - org2.index;
}
