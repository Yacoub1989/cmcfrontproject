import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Admission } from '../models/admission.model';
import { api } from '../core/api/http';

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private a = api();

  list(): Observable<Admission[]> {
    return this.a.http.get<Admission[]>(`${this.a.base}/admissions`);
  }

  get(id: number): Observable<Admission> {
    return this.a.http.get<Admission>(`${this.a.base}/admissions/${id}`);
  }

  create(adm: Admission): Observable<Admission> {
    return this.a.http.post<Admission>(`${this.a.base}/admissions`, adm);
  }

  update(id: number, adm: Admission): Observable<Admission> {
    return this.a.http.put<Admission>(`${this.a.base}/admissions/${id}`, adm);
  }

labState(admissionId: number) {
  return this.a.http.get<any>(`${this.a.base}/admissions/${admissionId}/lab-state`);
}

requestLab(admissionId: number) {
  return this.a.http.post(`${this.a.base}/admissions/${admissionId}/request-lab`, {});
}
}
