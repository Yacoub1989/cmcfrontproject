import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api } from '../core/api/http';

export type Status = 'DEMANDEE' | 'EN_COURS' | 'TERMINEE';
export type Urgence = 'NORMAL' | 'URGENT';

export interface ExplorationView {
  id: number;
  admissionId: number;
  patientNom?: string;
  explorations: string[];
  urgence: Urgence;
  note?: string;
  status: Status;
  createdAt?: string;

  // résultat (peut être null)
  resultText?: string;
  videoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ExplorationDoctorService {
 // private base = '/api/explorations';

    private a = api();

  constructor(private http: HttpClient) {}

  listByAdmission(admissionId: number): Observable<ExplorationView[]> {
    return this.http.get<ExplorationView[]>(
      `${this.a.base}/explorations/requests/by-admission/${admissionId}`
    );
  }
}
