export interface Admission {
  id?: number;
  patientId: number;
  dateEntree?: string;
  motif: string;
  histoireMaladie?: string;
  cardiovasculaire?: string;
  examengeneral?: string;
  cardiogramme?: string;
  conclusion?: string;
  decision?: string;
  patientNom?: string;
  lit?: string;
  facteursRisque?: string[];
  ta?: string;
  fc?: number;
  fr?: number;
  spo2?: number;
}
