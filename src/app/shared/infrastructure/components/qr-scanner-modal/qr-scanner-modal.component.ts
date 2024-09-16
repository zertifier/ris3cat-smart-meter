import {AfterViewInit, Component, inject, OnDestroy, ViewChild} from '@angular/core';
import {NgxScannerQrcodeComponent, NgxScannerQrcodeModule} from "ngx-scanner-qrcode";
import {TranslocoPipe} from "@jsverse/transloco";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-qr-scanner-modal',
  standalone: true,
  imports: [
    NgxScannerQrcodeModule,
    TranslocoPipe,
  ],
  templateUrl: './qr-scanner-modal.component.html',
  styleUrl: './qr-scanner-modal.component.scss'
})
export class QrScannerModalComponent implements AfterViewInit, OnDestroy {
  activeModal = inject(NgbActiveModal);
  @ViewChild('scanner') scanner: NgxScannerQrcodeComponent | undefined;


  subscriptions: Subscription[] = []

  ngAfterViewInit() {
    if (this.scanner)
      this.subscriptions.push(
        this.scanner.isReady.subscribe((isReady) => {
          if (isReady)
            this.subscriptions.push(
              this.scanner!.start().subscribe(() => {
                this.subscriptions.push(
                  this.scanner!.event.subscribe((qrResult) => {
                    if (qrResult) {
                      this.scanner?.stop()
                      this.activeModal.close(qrResult[0].value)
                    }
                  })
                )
              })
            )
        })
      )

  }


  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }
}
