import Swal from 'sweetalert2';

export interface ConfirmableProperties {
  confirmButton: string,
  cancelButton: string
}

/**
 * Ask user for a confirmation before execute the method
 *
 * @param message
 * @param properties
 * @constructor
 */
export function Confirmable(message: string | (() => string), properties: ConfirmableProperties | (() => ConfirmableProperties)) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let confirmMessage = '';
    let cancelMessage = '';
    let endProperties: ConfirmableProperties;

    if (typeof properties === "function") {
      endProperties = properties();
    } else if (typeof properties === "object") {
      endProperties = properties;
    }

    confirmMessage = endProperties!.confirmButton
    cancelMessage = endProperties!.cancelButton

    const originalFunction = descriptor.value;
    let endMessage: string;
    if (typeof message === "string") {
      endMessage = message;
    } else {
      endMessage = message()
    }

    descriptor.value = function (...args: any[]) {
      Swal.fire({
        text: endMessage,
        icon: 'question',
        confirmButtonText: confirmMessage,
        cancelButtonText: cancelMessage,
        showCancelButton: true
      }).then(result => {
        if (result.isConfirmed) {
          originalFunction.apply(this, args)
        }
      });
    }
    return descriptor;
  }
}
