export type IdentiteType = 'CIVILE' | 'MILITAIRE';

export type TypePatient = 'INTERNE' | 'EXTERNE';

export interface Patient {
  id?: number;
  nni: string;
  typeIdentite: IdentiteType;
  codePatient?: string; // généré côté backend
  nom: string;
  prenom: string;
  dateNaissance?: string; // ISO yyyy-mm-dd
  telephone?: string;
  typePatient: TypePatient;
}
