import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api } from '../core/api/http';

export type Urgence = 'NORMAL' | 'URGENT';

export interface CreateExplorationRequest {
  admissionId: number;
  patientNom?: string;      // optionnel si ton backend le stocke
  explorations: string[];   // ✅ plusieurs
  urgence: Urgence;
  note?: string;
}

export interface ExplorationRequestDto {
  id: number;
  admissionId: number;
  patientNom?: string;
  explorations: string[];
  urgence: Urgence;
  note?: string;
  status: 'DEMANDEE' | 'EN_COURS' | 'TERMINEE';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ExplorationService {
  // ✅ si tu as environment.apiUrl, remplace base par `${environment.apiUrl}/api/explorations`
  //private base = '/api/explorations';

  private a = api();

  constructor(private http: HttpClient) {}

  create(payload: CreateExplorationRequest): Observable<ExplorationRequestDto> {
    return this.http.post<ExplorationRequestDto>(`${this.a.base}/explorations/requests`, payload);
  }
}
