import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { ComService } from './com.service';
import { Observable, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Payload_Response } from './payload-response';

import { HttpErrorHandler, HandleError } from './http-error-handler.service';

import { BotDirective } from './bot.directive';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable()
export class AppService {
  webchatUrl: string;
  subscription: Subscription;
  botTokenHeader: HttpHeaders;
  secretSetting: boolean;
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    private comService: ComService,
    httpErrorHandler: HttpErrorHandler
  ) {
    this.handleError = httpErrorHandler.createHandleError('AppService');
    this.subscription = comService.secretToken$.subscribe(
      response => {
        this.botTokenHeader =
          httpOptions.headers.set('Authorization', 'BotConnector ' + response.secret);
        this.webchatUrl = response.url;
        this.secretSetting = response.secretSetting;
        console.log('missions ', response)
    });
  }

  /** GET temporary token from the server api */
  public getTokenObs (): Observable<any> {
    console.log('httpOption ',)
    if (this.secretSetting) {
      return this.http.get<any>(
        this.webchatUrl, 
        { headers: this.botTokenHeader, observe: 'response' }
      )
      .pipe(
       catchError(this.handleError<any>('getTokenObs', []))
      );
    } else {
      console.log('RIGHT HERE 0000000000')
      let something = false
      return of<any>(false);
    }
  }

  makeIntentionalError() {
    return this.http.get('not/a/real/url')
      .pipe(
        catchError(this.handleError('makeIntentionalError', []))
      );
  }
}