import {Component, inject, Input, TemplateRef} from '@angular/core';
import {QRCodeModule} from "angularx-qrcode";
import {NgClass, NgIf} from "@angular/common";
import {NgbActiveModal, NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {TranslocoPipe} from "@jsverse/transloco";

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [
    QRCodeModule,
    NgIf,
    NgClass,
    TranslocoPipe
  ],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.scss'
})
export class QrGeneratorComponent{
  public modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);

  @Input() qrText!:  string | undefined | null;
  @Input() btnPxWidth?: string;
  @Input() btnClasses?: string;
  @Input() modalSize: 'xl' | 'lg' | 'md' | 'sm' = 'md';

  qrModal!: NgbModalRef;
  constructor() {
  }

  openQrModal(content: TemplateRef<any>) {
    this.qrModal = this.modalService.open(content, { size: this.modalSize})
  }

  closeModal(){
    this.qrModal.dismiss()
  }
}
