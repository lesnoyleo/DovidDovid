import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createPortBody } from '../interface/createPort';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  constructor(private http: HttpClient) {}

  public createPort(body: createPortBody): Observable<any> {
    const url =
      'https://api.asocks.com/v2/proxy/create-port?apiKey=Tf04WostRnBLjKxOqoF2XXGS69KcCEyW';
    return this.http.post(url, body);
  }
}
