import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {LOAD_WASM, NgxScannerQrcodeModule} from "ngx-scanner-qrcode";
import {AsyncPipe, JsonPipe, NgClass, NgIf} from "@angular/common";
import {QRCodeModule} from "angularx-qrcode";
import {TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {QrScannerModalComponent} from "@shared/infrastructure/components/qr-scanner-modal/qr-scanner-modal.component";
import Swal from "sweetalert2";

// Necessary to solve the problem of losing internet connection
LOAD_WASM().subscribe();

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [
    NgxScannerQrcodeModule,
    JsonPipe,
    AsyncPipe,
    NgIf,
    QRCodeModule,
    TranslocoPipe,
    NgClass,
    NgxScannerQrcodeModule
  ],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.scss'
})
export class QrScannerComponent {
  public modalService = inject(NgbModal);
  public translocoService = inject(TranslocoService);
  @Output() scanResult = new EventEmitter<string>();


  @Input() btnPxWidth?: string;
  @Input() btnClasses?: string;
  @Input() modalSize: 'xl' | 'lg' | 'md' | 'sm' = 'md';

  defaultClasses = 'bg-white border-secondary border-2 border-start-0 shadow-none rounded-end-3'
  openQrModal() {
    const qrModal = this.modalService.open(QrScannerModalComponent, {size: this.modalSize})
    qrModal.closed.subscribe((qrResult) => {
      this.manageResult(qrResult)
    })
  }

  manageResult(result: string){
    if (result && result.length == 42 && result.startsWith('0x')){
      Swal.fire({
        icon: "success",
        text: this.translocoService.translate('QR.import.swal.success'),
        confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
      })
      this.scanResult.emit(result)
    }else{
      Swal.fire({
        icon: "error",
        text: this.translocoService.translate('QR.import.swal.error'),
        confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
      })
    }
  }
}
