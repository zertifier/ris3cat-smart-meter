import {HttpInterceptorFn} from '@angular/common/http';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import swal from "sweetalert2";

export const errorCatchingInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    map((res: any) => {
      return res;
    }),
    catchError((e: HttpErrorResponse) => {
      let errorMsg = '';
      if (e.error.msg) {
        swal.fire('Error', e.error.msg, 'error');
        errorMsg = e.error.msg;
      } else if (e.error.message && e.error.message.msg) {
        swal.fire('Error', e.error.message.msg, 'error');
        errorMsg = e.error.message.msg;
      } else {
        swal.fire('Error', e.statusText, 'error');
        errorMsg = e.statusText;
      }
      console.log("interceptor error ", errorMsg)
      return throwError(() => new Error(errorMsg));
    })
  );
};