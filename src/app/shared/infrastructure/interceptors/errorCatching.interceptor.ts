import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import swal from "sweetalert2";

export const errorCatchingInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    map((res: any) => {
      return res;
    }),
    catchError((e: HttpErrorResponse) => {
      let errorMsg = '';
      
      let ignore = [
        'https://api-smart-meter-dev-ris3cat.zertifier.com/monitoring/powerflow/',
        'https://zertirpc.zertifier.com/100/rpc'
      ]

      if (!ignore.includes(request.url)) {

        if (e.error.msg) {
          errorMsg = e.error.msg;
        } else if (e.error.message && e.error.message.msg) {
          errorMsg = e.error.message.msg;
        } else {
          errorMsg = e.statusText;
        }
        swal.fire('Error', e.error.msg, 'error');
        console.log("angular http interceptor error ", request.url, errorMsg)

      } else {
        console.log("Angular interceptor ignored error", request.url)
      }

      return throwError(() => new Error(errorMsg));

    })
  );
};