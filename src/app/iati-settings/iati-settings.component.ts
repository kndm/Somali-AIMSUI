import { Component, OnInit } from '@angular/core';
import { IATIService } from '../services/iati.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { InfoModalComponent } from '../info-modal/info-modal.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { Messages } from '../config/messages';
import { SecurityHelperService } from '../services/security-helper.service';
import { Router } from '@angular/router';
import { StoreService } from '../services/store-service';
import { Settings } from '../config/settings';

@Component({
  selector: 'app-iati-settings',
  templateUrl: './iati-settings.component.html',
  styleUrls: ['./iati-settings.component.css']
})
export class IatiSettingsComponent implements OnInit {

  btnText: string = 'Save IATI Settings';
  errorMessage: string = null;
  requestNo: number = 0;
  isError: boolean = false;
  infoMessage: string = null;
  countriesList: any = [];
  iatiSettingsOld: any = { baseUrl: null, helpText: null, isActive: false, sourceType: 0 };
  iatiSettingsNew: any = { baseUrl: null, helpText: null, isActive: false, sourceType: 0 };
  permissions: any = {};
  isLoading: boolean = true;
  iatiSettingsType: any = {
    OLD: 1,
    NEW: 2
  };
  iatiSettingsTypesList: any = [
    {
      id: 1,
      text: 'Old'
    },
    {
      id: 2,
      text: 'New'
    }
  ];

  //Overlay UI blocker
  @BlockUI() blockUI: NgBlockUI;

  constructor(private iatiService: IATIService, private infoModal: InfoModalComponent,
    private errorModal: ErrorModalComponent,
    private securityService: SecurityHelperService,
    private router: Router, private storeService: StoreService) { }

  ngOnInit() {
    this.permissions = this.securityService.getUserPermissions();
    if (!this.permissions.canDoSMTPSettings) {
      this.router.navigateByUrl('home');
    }

    this.storeService.newReportItem(Settings.dropDownMenus.management);
    this.getIATISettings();
  }

  getIATISettings() {
    this.iatiService.getIATISettings().subscribe(
      data => {
        if (data) {
          var settings = data.filter(s => s.sourceType == this.iatiSettingsType.OLD);
          if (settings.length > 0) {
            this.iatiSettingsOld = settings[0];
          }

          settings = data.filter(s => s.sourceType == this.iatiSettingsType.NEW);
          if (settings.length > 0) {
            this.iatiSettingsNew = settings[0];
          }
        }
      }
    )
  }

  saveIATISettings(sourceType) {
    var model = {};
    if (sourceType == this.iatiSettingsType.OLD) {
      model = this.iatiSettingsOld;
    } else if (sourceType == this.iatiSettingsType.NEW) {
      model = this.iatiSettingsNew;
    }

    this.blockUI.start('Saving IATI Settings');
    this.iatiService.setIATISettings(model).subscribe(
      data => {
        this.infoMessage = 'IATI Settings' + Messages.SAVED_SUCCESSFULLY;
        this.blockUI.stop();
        this.infoModal.openModal();
      },
      error => {
        this.blockUI.stop();
        this.errorMessage = 'An error occurred: ' + error;
        this.errorModal.openModal();
      }
    )
  }

  toggleActive(sourceType) {
    if (sourceType == this.iatiSettingsType.OLD) {
      this.iatiSettingsOld.isActive = !this.iatiSettingsOld.isActive;
    } else if (sourceType == this.iatiSettingsType.NEW) {
      this.iatiSettingsNew.isActive = !this.iatiSettingsNew.isActive;
    }
  }

}
