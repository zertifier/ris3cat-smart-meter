import { Component,inject, Input} from '@angular/core';
import {LOAD_WASM,  NgxScannerQrcodeModule} from "ngx-scanner-qrcode";
import {AsyncPipe, JsonPipe, NgClass, NgIf} from "@angular/common";
import {QRCodeModule} from "angularx-qrcode";
import {TranslocoPipe} from "@jsverse/transloco";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {QrScannerModalComponent} from "@shared/infrastructure/components/qr-scanner-modal/qr-scanner-modal.component";

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
export class QrScannerComponent{
  public modalService = inject(NgbModal);
  scannedResult: string | undefined;


  @Input() btnPxWidth?: string;
  @Input() btnClasses?: string;
  @Input() modalSize: 'xl' | 'lg' | 'md' | 'sm' = 'md';

  openQrModal() {
    this.modalService.open(QrScannerModalComponent, { size: this.modalSize})
  }
}
