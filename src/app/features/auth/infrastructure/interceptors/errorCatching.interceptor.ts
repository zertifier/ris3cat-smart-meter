// import {HttpInterceptorFn} from '@angular/common/http';
// import {AuthStoreService} from "../services/auth-store.service";
// import {inject} from "@angular/core";

// export const SKIP_AUTH_INTERCEPTOR = 'X-Skip-Interceptor';

// /**
//  * Takes very http request and adds the corresponding auth token
//  * @param req
//  * @param next
//  */
// export const errorCatchingInterceptor: HttpInterceptorFn = (req, next) => {
 
//   if (req.headers.has(SKIP_AUTH_INTERCEPTOR)) {
//     return next(req);
//   }

//   // const authStore = inject(AuthStoreService);
//   // const authToken = authStore.snapshotOnly(state => state.accessToken);
//   // const headers = req.headers.set('Authorization', `Bearer ${authToken}`);
  
//   const newRequest = req.clone({headers});

//   return next(newRequest);
// };

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from "rxjs/operators";
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import swal from "sweetalert2";

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {

    constructor(private toastr: ToastrService) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        //console.log(request);
        return next.handle(request)
            .pipe(
                map((res: HttpEvent<any>) => {
                    return res;
                }),
                catchError((e: HttpErrorResponse) => {
                    let errorMsg = '';
                    if(e.error.msg){
                      swal.fire('Error',e.error.msg,'error');
                      errorMsg = e.error.msg;
                    }else if(e.error.message.msg){
                      swal.fire('Error',e.error.message.msg,'error');
                      errorMsg = e.error.message.msg;
                    }else{
                      swal.fire('Error',e.statusText,'error');
                      errorMsg = e.statusText;
                    }

                    swal.fire('Error',errorMsg,'error')
                    /*if (error.error instanceof ErrorEvent) {
                        errorMsg = `Error: ${error.error.message}`;
                        this.toastr.error('Server comunication error', errorMsg);
                    } else {
                        //this.toastr.error(`Server comunication error :${error.message}`);
                       swal.fire('Error',error.error.msg.message,'error');
                    }*/
                    throw new Error(errorMsg);
                })
            )
    }
}