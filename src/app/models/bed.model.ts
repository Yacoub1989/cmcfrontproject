export type BedStatus = 'DISPONIBLE' | 'OCCUPE' | 'RESERVE' | 'HORS_SERVICE';

export interface Bed {
  id: number;
  code: string;     // ex: LIT-01
  service?: string; // ex: USIC
  status: BedStatus;

  // si occupé (facultatif)
  patientNom?: string;
  patientPrenom?: string;
  admissionId?: number;
  dateSortieEstimee?: string;
}
