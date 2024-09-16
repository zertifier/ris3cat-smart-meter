import Swal from 'sweetalert2';

/**
 * Ask user for a confirmation before execute the method
 *
 * @param message
 * @param properties
 * @constructor
 */
export function Confirmable(message: string, properties?: { confirmButton?: string, cancelButton?: string }) {
  let confirmMessage = '';
  let cancelMessage = '';

  confirmMessage = properties?.confirmButton || 'Ok'
  cancelMessage = properties?.cancelButton || 'Cancel'

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunction = descriptor.value;
    descriptor.value = function (...args: any[]) {
      Swal.fire({
        text: message,
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
