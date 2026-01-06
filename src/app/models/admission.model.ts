export interface Admission {
  id?: number;
  patientId: number;
  dateEntree?: string; // ISO
  motif: string;       // 1 des 8 pathologies (liste côté UI pour l’instant)
  histoireMaladie?: string;
  patientNom?: string;
  lit?: string;
}
