import { Component, OnInit } from '@angular/core';
import { SecurityHelperService } from '../services/security-helper.service';
import { ContactService } from '../services/contact.service';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { Messages } from '../config/messages';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {
  isLoggedIn: boolean = false;
  errorMessage: string = null;
  successMessage: string = null;
  isShowSuccessMessage: boolean = false;
  isShowList: boolean = false;
  projectsList: any = [];
  filteredProjectsList: any = [];
  criteria: string = null;
  isLoading: boolean = false;
  model: any = { emailType: null, senderName: null, senderEmail: null, 
    projectId: 0, subject: null, message: null 
  };

  emailTypes: any = [
    { text: 'Help', val: 1 },
    { text: 'Project information', val: 2 }
  ];

  emailTypeCodes: any = {
    HELP: 1,
    INFORMATION: 2
  };
  @BlockUI() blockUI: NgBlockUI;
  
  constructor(private securityService: SecurityHelperService, 
    private contactService: ContactService, private errorModal: ErrorModalComponent,
    private projectService: ProjectService) {

    this.isLoggedIn = this.securityService.checkIsLoggedIn();
  }

  ngOnInit() {
    
  }

  sendEmailRequest() {
    if (this.model.emailType == this.emailTypeCodes.INFORMATION && this.model.projectId <= 0) {
      this.errorMessage = Messages.PROJECT_FOR_INFORMATION_REQUIRED;
      this.errorModal.openModal();
      return false;
    }

    this.blockUI.start('Submitting request...');
    this.contactService.sendContactEmail(this.model).subscribe(
      data => {
        if (data) {
          this.successMessage = "Your request is submitted successfully";
          this.isShowSuccessMessage = true;
        }
        this.blockUI.stop();
      }
    );
  }

  getProjects() {
    this.isLoading = true;
    this.projectService.getProjectsList().subscribe(
      data => {
        if (data) {
          this.projectsList = data;
        }
        this.isLoading = false;
      }
    );
  }

  filterProjects() {
    if (!this.criteria) {
      this.filteredProjectsList = this.projectsList;
    } else {
      if (this.projectsList.length > 0) {
        var criteria = this.criteria.toLowerCase();
        this.filteredProjectsList = this.projectsList.filter(s => (s.title.toLowerCase().indexOf(criteria) != -1));
      }
    }
  }

  selectProject(e) {
    var id = e.currentTarget.id.split('-')[1];
    if (id) {
      var selectedProject = this.projectsList.filter(p => p.id == id);
      if (selectedProject.length > 0) {
        this.model.projectId = id;
        this.criteria = selectedProject[0].title;
        this.isShowList = false;
      }
    }
  }

  changeRequest() {
    if (this.model.emailType == this.emailTypeCodes.INFORMATION) {
      this.isShowList = true;
      if (this.projectsList.length == 0) {
        this.getProjects();
      }
    } else {
      this.isShowList = false;
    }
  }

  clear() {
    this.criteria = null;
    this.model.projectId = 0;
    this.isShowList = true;
  }

}
