import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { switchMap, debounceTime, tap, finalize, startWith, map } from 'rxjs/operators';
import { OrganizationService } from '../services/organization-service';
import { StoreService } from '../services/store-service';
import { RegistrationModel } from '../models/registration';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { Messages } from '../config/messages';
import { Organization } from '../models/organization-model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-org-registration',
  templateUrl: './user-org-registration.component.html',
  styleUrls: ['./user-org-registration.component.css']
})
export class UserOrgRegistrationComponent implements OnInit {

  organizations: any = [];
  userInput = new FormControl();
  filteredOrganizations: any = [] ;
  organizationTypes: any = [];
  organizationType: string = null;
  isLoading = true;
  //model: RegistrationModel = null;
  organizationId: number = 0;
  organizationTypeId: string = null;
  isProcessing: boolean = false;
  btnRegisterText: string = 'Register';
  isShowType: boolean = false;
  delaySeconds: number = 2000;
  selectedOrganizationId: number = 0;
  validationMessage: string = '';
  requestNo: number = 0;
  isError: boolean = false;
  errorMessage: string = '';
  model: any = { email: null, password: null, organizationId: null, IsNewOrganization: false, organizationName: null };

  constructor(private fb: FormBuilder, private organizationService: OrganizationService,
    private storeService: StoreService, private userService: UserService,
    private router: Router,
    private zone: NgZone) {

  }

  ngOnInit() {
    this.storeService.currentRegistration.subscribe(model => {
      if (model) {
        if (model.Email === '' || model.Email == null) {
          this.router.navigateByUrl('user-registration');
        } else {
          this.model = model;
        }
      } else {
        this.router.navigateByUrl('user-registration');
      }
    });

    this.storeService.currentRequestTrack.subscribe(model => {
      if (model && this.requestNo == model.requestNo && model.errorStatus != 200) {
        this.errorMessage = model.errorMessage;
        this.isError = true;
      }
    });
    this.loadOrganizations();
  }
  
  displayFn(organization?: Organization): string | undefined {
    if (organization) {
      this.selectedOrganizationId = organization.id;
    } else {
      this.selectedOrganizationId = 0;
    }
    return organization ? organization.organizationName : undefined;
  }

  /*private filterOrganizations(value: string): Organization[] {
    if (typeof value != "string") {
    } else {
      const filterValue = value.toLowerCase();
      return this.organizations.filter(organization => organization.organizationName.toLowerCase().indexOf(filterValue) !== -1);
    }
  }*/

  selectOrganization(e) {
    var id = e.currentTarget.id.split('-')[1];
    if (id) {
      var organization = this.organizations.filter(o => o.id == id);
      if (organization.length > 0) {
        this.selectedOrganizationId = organization[0].id;
        this.model.organizationName = organization[0].organizationName;
      }
    }
  }

  filterOrganizations() {
    var org = this.model.organizationName;
    if (!org) {
      this.filteredOrganizations = this.organizations;
    } else {
      org = org.toLowerCase();
      this.filteredOrganizations = this.organizations.filter(o => o.organizationName.toLowerCase().indexOf(org) != -1);
    }
  }

  /*loadOrganizations() {
    this.organizationService.getOrganizationsList().subscribe(
      data => {
        this.organizations = data;
        this.filteredOrganizations = this.userInput.valueChanges
      .pipe(
        startWith(''),
        map(organization => organization ? this.filterOrganizations(organization) : this.organizations.slice())
      );
      },
      error => {
        console.log("Request Failed: ", error);
      }
    );
  }*/

  loadOrganizations() {
    this.organizationService.getOrganizationsList().subscribe(
      data => {
        if (data) {
          this.organizations = data;
          this.filteredOrganizations = data;
        }
        this.isLoading = false;
      }
    );
  }

  registerUser() {
    if (this.selectedOrganizationId == 0) {
      this.model.OrganizationName = this.model.organizationName;
      if (this.model.OrganizationName.length == 0) {
        //Need to show a dialog message here
        console.log('error');
        return false;
      } else if (this.model.IsNewOrganization) {
        return false;
      }
      this.model.IsNewOrganization = true;
      this.model.OrganizationId = '0';
    } else if (this.selectedOrganizationId != 0) {
      this.model.OrganizationId = this.selectedOrganizationId.toString();
    }

    this.requestNo = this.storeService.getNewRequestNumber();
    this.isProcessing = true;
    this.btnRegisterText = 'Wait processing...';
    this.userService.registerUser(this.model).subscribe(
      data => {
        if (!this.isError) {
          this.storeService
            .newInfoMessage(Messages.USER_REGISTRATION_MESSAGE);
          this.btnRegisterText = 'Redirecting...';
          setTimeout(() => {
            this.resetModel();
            this.router.navigateByUrl('');
          }, this.delaySeconds);
        } else {
          this.resetProcessingStatus();
        }
      },
      error => {
        console.log("Request Faild: ", error);
        this.resetProcessingStatus();
      }
    )
  }

  resetProcessingStatus() {
    this.btnRegisterText = 'Register';
    this.isProcessing = false;
  }

  resetModel() {
    this.model = new RegistrationModel('', '', '', '', '', '', false);
  }

  clear() {
    this.model.organizationName = null;
    this.selectedOrganizationId = 0;
  }

}
