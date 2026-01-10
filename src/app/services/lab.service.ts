import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LabRequest } from '../models/lab-request.model';

@Injectable({ providedIn: 'root' })
export class LabService {
  private API = 'http://localhost:7777/api/lab';

  constructor(private http: HttpClient) {}

  create(req: { patientId: number; admissionId?: number | null; tests: string }) {
    return this.http.post<LabRequest>(`${this.API}/requests`, req);
  }

  list(status?: string, mine?: boolean) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (mine) params = params.set('mine', 'true');
    return this.http.get<LabRequest[]>(`${this.API}/requests`, { params });
  }

  get(id: number) {
    return this.http.get<LabRequest>(`${this.API}/requests/${id}`);
  }

  start(id: number) {
    return this.http.put<LabRequest>(`${this.API}/requests/${id}/start`, {});
  }

  done(id: number, body: { resultText?: string; resultValuesJson?: string }) {
    return this.http.put<LabRequest>(`${this.API}/requests/${id}/done`, body);
  }
}
