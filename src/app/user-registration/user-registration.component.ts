import { Component, OnInit } from '@angular/core';
import { RegistrationModel } from '../models/registration';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { StoreService } from '../services/store-service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit {
  userTypes = [];
  model: any = {};
  isEmailOk: boolean = false;
  emailNotAvailable: boolean = false;
  disableEmail: boolean = false;
  isNameFocus: boolean = false;
  isEmailFocus: boolean = false;
  isSearchingEmail: boolean = false;
  btnCheckEmailTitle: string = 'Check Availability';

  constructor(private userService: UserService, private router: Router, private storeService: StoreService) { 
  
  }
 
  onSubmit() {
    //console.log(JSON.stringify(this.model));
  }

  ngOnInit() {
    this.model = new RegistrationModel('', '', '', '', '', '', false);
    this.fillUserTypes();
  }

  fillUserTypes() {
    this.userTypes.push({
      "id": 2,
      "typeName": "Manager"
    });

    this.userTypes.push({
      "id": 3,
      "typeName": "Regular"
    });
  }

  checkIfEmailAvailable() {
    this.isSearchingEmail = true;
    this.btnCheckEmailTitle = 'Wait processing...';

    this.userService.checkEmailAvailability(this.model.Email).subscribe(
      data => {
        console.log(data);
        this.isEmailOk = data;
        if (!this.isEmailOk) {
          this.emailNotAvailable = true;
          this.disableEmail = false;
          this.isEmailFocus = true;
        } else {
          this.emailNotAvailable = false;
          this.disableEmail = true;
          this.isNameFocus = true;
          this.isEmailFocus = false;
        }
        this.isSearchingEmail = false;
        this.btnCheckEmailTitle = 'Check Email';
      },
      error => {
        console.log("Request Failed: ", error);
      }
    );
  }

  resetEmailAvailable(el: any) {
    this.emailNotAvailable = false;
  }

  proceedRegistration() {
    this.storeService.newRegistration(this.model);
    this.router.navigateByUrl('user-org-registration');
  }

}
