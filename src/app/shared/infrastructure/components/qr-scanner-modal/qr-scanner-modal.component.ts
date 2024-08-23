import {AfterViewInit, Component, EventEmitter, inject, Output, ViewChild} from '@angular/core';
import {NgxScannerQrcodeComponent, NgxScannerQrcodeModule} from "ngx-scanner-qrcode";
import {TranslocoPipe} from "@jsverse/transloco";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-qr-scanner-modal',
  standalone: true,
  imports: [
    NgxScannerQrcodeModule,
    TranslocoPipe,
  ],
  providers: [NgbActiveModal],
  templateUrl: './qr-scanner-modal.component.html',
  styleUrl: './qr-scanner-modal.component.scss'
})
export class QrScannerModalComponent  implements AfterViewInit{
  activeModal = inject(NgbActiveModal);
  @ViewChild('scanner') scanner: NgxScannerQrcodeComponent | undefined;

  @Output() scanResult = new EventEmitter<string>();


  ngAfterViewInit() {
    this.scanner?.isReady.subscribe((isReady) => {
      if (isReady)
        this.scanner!.start().subscribe((result: string) => {
          this.scanResult.emit(result);
          this.scanner?.stop()
          this.activeModal.dismiss()
        });
    })
  }

}
