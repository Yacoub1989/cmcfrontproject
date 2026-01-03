import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

export function api() {
  const http = inject(HttpClient);
  return { http, base: API_BASE_URL };
}
