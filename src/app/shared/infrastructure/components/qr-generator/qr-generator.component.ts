import {AfterViewInit, Component, inject, Input, TemplateRef} from '@angular/core';
import {QRCodeModule} from "angularx-qrcode";
import {NgClass, NgIf} from "@angular/common";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
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

  @Input() qrText!:  string | undefined | null;
  @Input() btnPxWidth?: string;
  @Input() btnClasses?: string;
  @Input() modalSize: 'xl' | 'lg' | 'md' | 'sm' = 'md';

  constructor() {
  }

  openQrModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: this.modalSize})
  }
}
