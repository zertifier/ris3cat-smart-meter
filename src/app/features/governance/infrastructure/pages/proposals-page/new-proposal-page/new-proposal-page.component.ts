import {Component, OnDestroy} from '@angular/core';
import {ProposalOption, ProposalsService, SaveProposal} from "../../../services/proposals.service";
import {FormsModule} from "@angular/forms";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import Swal from "sweetalert2";
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {CalendarModule} from "primeng/calendar";
import dayjs from "@shared/utils/dayjs";
import {ProposalStatus} from "../../../../domain/ProposalStatus";
import {ProposalTypes} from "../../../../domain/ProposalTypes";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {EditorComponent, TINYMCE_SCRIPT_SRC} from "@tinymce/tinymce-angular";
import {Editor} from "tinymce";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-new-proposal-page',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    AsyncPipe,
    CalendarModule,
    NgForOf,
    NgbTooltip,
    RouterLink,
    RouterLinkActive,
    QuestionBadgeComponent,
    EditorComponent,

  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ],
  templateUrl: './new-proposal-page.component.html',
  styleUrl: './new-proposal-page.component.scss'
})
export class NewProposalPageComponent implements OnDestroy{

  proposal!: string;
  proposalDescription!: string;
  loading: boolean = false
  userId!: number;
  communityId!: number;
  userRole!: string;
  status: ProposalStatus = 'active';
  type: ProposalTypes = 'weighted';
  minVotes: number = 0;
  transparentStatus: boolean = false;
  date: Date = dayjs().add(1, 'day').toDate();
  minDate: Date = dayjs().add(1, 'day').toDate();
  options: any = [  {option: 'Sí'}, {option: 'No'}, {option: 'Abstenir-se'},]

  tinymceConfig = {
    base_url: '/tinymce',
    suffix: '.min',
    height: 500,
    menubar: false,
    setup: (editor: Editor) => {
      editor.on('NodeChange', (e) => {
        const tableElm = editor.dom.getParent(e.element, 'table');
        if (tableElm) {
          this.applyTableStyles(tableElm);
        }
      });
      this.editor = editor;
    },
    plugins: [
      // 'lists advlist autolink lists link image charmap print preview anchor',
      // 'searchreplace visualblocks code fullscreen',
      // 'insertdatetime media table paste code help wordcount',
      'table',
      'lists',

    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | \ \
      table tabledelete ',

  }

  editor!: Editor;

  subscriptions: Subscription[] = [];
  constructor(
    private proposalsService: ProposalsService,
    private router: Router,
    private readonly userStore: UserStoreService,
  ) {
    this.subscriptions.push(
      this.userStore
        .selectOnly(state => state).subscribe((data) => {
        if (data.cups.length) {
          this.communityId = data.cups[0].communityId
        }
        if (data.user) {
          this.userId = data.user.id
          this.userRole = data.user.role

          if (this.userRole == 'USER') this.status = 'pending'
        }
      })
    )
  }

  applyTableStyles(table: any) {
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    const cells = table.querySelectorAll('th, td');
    cells.forEach((cell: any) => {
      cell.style.border = '1px solid black';
      cell.style.paddingLeft = '10px'
      cell.style.paddingRight = '10px'
    });
  }

  setTransparentStatus() {
    this.transparentStatus = !this.transparentStatus
  }



  addOption() {
    this.options.unshift({})
  }

  removeOption(index: number) {
    this.options.splice(index, 1)
  }

  saveProposal() {
    this.loading = true;
    this.proposalDescription = this.editor ? this.editor.getContent() : ''
    const proposal: SaveProposal = {
      userId: this.userId,
      communityId: this.communityId || 0,
      expirationDt: dayjs(this.date).format('YYYY-MM-DD'),
      status: this.status,
      proposal: this.proposal,
      description: this.proposalDescription,
      quorum: this.minVotes / 100,
      transparent: this.transparentStatus ? 1 : 0,
      type: this.type
    }
    this.subscriptions.push(
      this.proposalsService.saveProposal(proposal).subscribe(
        (savedProposal) => {
          let proposalOptions: ProposalOption[] = [];

          for (const option of this.options) {
            proposalOptions.push({
              option: option.option,
              proposalId: savedProposal.data.id!,
              percentage: undefined
            })
          }

          this.proposalsService.saveProposalOption(proposalOptions).subscribe(
            (savedProposalOption) => {
              Swal.fire({
                icon: 'success',
                title: 'Proposta guardada correctament',
                confirmButtonText: 'Entès',
                customClass: {
                  confirmButton: 'btn btn-secondary-force'
                }
              }).then(() => {
                console.log(savedProposalOption)
                console.log(proposal, "proposal")
                this.loading = false
                this.router.navigate(['/governance/proposals']);
              });
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Hi ha hagut un error creant la proposta, revisa que tots els camps estiguin complets',
                confirmButtonText: 'Entès',
                customClass: {
                  confirmButton: 'btn btn-secondary-force'
                }
              }).then(() => {
                this.loading = false
                console.log("ERRROR", error)
              })
            })
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'Hi ha hagut un error creant la proposta, revisa que tots els camps estiguin complets',
            confirmButtonText: 'Entès',
            customClass: {
              confirmButton: 'btn btn-secondary-force'
            }
          }).then(() => {
            this.loading = false
            console.log("ERRROR", error)
          });

        })
    )

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
