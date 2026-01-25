import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api } from '../core/api/http';

export type Status = 'DEMANDEE' | 'EN_COURS' | 'TERMINEE';
export type Urgence = 'NORMAL' | 'URGENT';

export interface ExplorationRequestDto {
  id: number;
  admissionId: number;
  patientNom?: string;
  explorations: string[];
  urgence: Urgence;
  note?: string;
  status: Status;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ExplorationAgentService {
  // ✅ si tu utilises proxy => laisse /api
  //private base = '/api/explorations';

  private a = api();

  constructor(private http: HttpClient) {}

  list(status?: Status): Observable<ExplorationRequestDto[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<ExplorationRequestDto[]>(`${this.a.base}/explorations/requests${q}`);
  }

  get(id: number): Observable<ExplorationRequestDto> {
    return this.http.get<ExplorationRequestDto>(`${this.a.base}/explorations/requests/${id}`);
  }
}
