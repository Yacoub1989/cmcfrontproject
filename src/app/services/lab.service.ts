import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api } from '../core/api/http';



export type LabOrder = {
  id: number;
  admissionId: number;
  status: 'PENDING' | 'DONE';
  createdAt?: string;
};

export type LabOrderDetails = {
  id: number;
  admissionId: number;
  status: 'PENDING' | 'DONE';
  createdAt?: string;
  params: string[];
  values: Record<string, number | null>;
};




@Injectable({ providedIn: 'root' })
export class LabService {
  //private api = 'http://localhost:7777/api/lab';

  private a = api();

  constructor(private http: HttpClient) {}

  get(admissionId: number) {
    return this.http.get<any>(`${this.a.base}/lab/results/${admissionId}`);
  }

  save(dto: any) {
    return this.http.post<any>(`${this.a.base}/lab/results`, dto);
  }

queue(status: 'PENDING' | 'DONE' = 'PENDING') {
  return this.http.get<any[]>(`${this.a.base}/lab/queue`, { params: { status } });
}

labState(admissionId: number) {
  return this.http.get<any>(`${this.a.base}/admissions/${admissionId}/lab-state`);
}

requestLab(admissionId: number) {
  return this.http.post(`${this.a.base}/admissions/${admissionId}/request-lab`, {});
}



  listOrders(status: 'PENDING' | 'DONE' = 'PENDING') {
    return this.http.get<LabOrder[]>(`${this.a.base}/lab/orders`, { params: { status } });
  }

  getOrder(orderId: number) {
    return this.http.get<LabOrderDetails>(`${this.a.base}/lab/orders/${orderId}`);
  }

  saveResults(orderId: number, values: Record<string, number | null>) {
    return this.http.post(`${this.a.base}/lab/results`, { orderId, values });
  }


ordersSummary(admissionId: number) {
  return this.http.get<any[]>(`${this.a.base}/lab/admissions/${admissionId}/orders-summary`);
}


}
