export type LabStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export interface LabRequest {
  id?: number;
  patientId: number;
  admissionId?: number | null;
  requestedBy?: string;
  tests: string;
  status?: LabStatus;
  resultText?: string | null;
  resultValuesJson?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
