import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bed } from '../models/bed.model';
import { api } from '../core/api/http';

@Injectable({ providedIn: 'root' })
export class BedService {
  private a = api();

  dashboard(): Observable<Bed[]> {
    return this.a.http.get<Bed[]>(`${this.a.base}/beds/dashboard`);
  }
}
