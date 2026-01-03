import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { api } from '../core/api/http';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private a = api();

  list(): Observable<Patient[]> {
    return this.a.http.get<Patient[]>(`${this.a.base}/patients`);
  }

  get(id: number): Observable<Patient> {
    return this.a.http.get<Patient>(`${this.a.base}/patients/${id}`);
  }

  create(p: Patient): Observable<Patient> {
    return this.a.http.post<Patient>(`${this.a.base}/patients`, p);
  }

  update(id: number, p: Patient): Observable<Patient> {
    return this.a.http.put<Patient>(`${this.a.base}/patients/${id}`, p);
  }

  verifyNNI(nni: string) {
    // endpoint futur: /patients/verify-nni?nni=...
    return this.a.http.get<any>(`${this.a.base}/patients/verify-nni`, { params: { nni } });
  }
}
