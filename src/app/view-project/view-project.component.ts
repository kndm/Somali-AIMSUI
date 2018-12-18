import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../services/store-service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {
  requestNo: number = 0;
  errorMessage: string = '';
  isError: boolean = false;
  isLoading: boolean = true;
  isLocationLoading: boolean = true;
  isSectorLoading: boolean = true;
  projectId: number = 0;
  delayTime: number = 2000;

  //project data variables
  projectData: any = [];
  projectLocations: any = [];
  projectSectors: any = [];

  //Overlay UI blocker
  @BlockUI() blockUI: NgBlockUI;

  constructor(private projectService: ProjectService, private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService) { }

  ngOnInit() {
    if (this.route.snapshot.data) {
      var id = this.route.snapshot.params["{id}"];
      this.projectId = id;
      if (id) {
        this.loadProjectData(id);   

        setTimeout(() => {
          this.loadProjectLocations(id);
        }, this.delayTime); 

        setTimeout(() => {
          this.loadProjectSectors(id);
        }, this.delayTime); 
      } else {

      }
    }
    this.storeService.currentRequestTrack.subscribe(model => {
      if (model && this.requestNo == model.requestNo && model.errorStatus != 200) {
        this.errorMessage = model.errorMessage;
        this.isError = true;
      }
    });
  }

  addProjectLocation() {
    this.router.navigateByUrl('project-location/' + this.projectId);
  }

  addProjectSector() {
    this.router.navigateByUrl('project-sector/' + this.projectId);
  }

  loadProjectData(id) {
    this.projectService.getProject(id).subscribe(
      data => {
        this.hideLoader();
        this.projectData = data;
      },
      error => {
        this.hideLoader();
        console.log(error);
      }
    )
  }

  loadProjectLocations(id) {
    this.projectService.getProjectLocations(id).subscribe(
      data => {
        this.hideLocationLoader();
        this.projectLocations = data;
      },
      error => {
        console.log(error);
      }
    )
  }

  loadProjectSectors(id) {
    this.projectService.getProjectSectors(id).subscribe(
      data => {
        this.hideSectorLoader();
        this.projectSectors = data;
      },
      error => {
        console.log(error);
      }
    )
  }

  deleteProjectLocation(projectId, locationId) {
    this.blockUI.start('Working...');
    this.projectService.deleteProjectLocation(projectId, locationId).subscribe(
      data => {
        this.projectLocations = this.projectLocations.filter(l => l.id != locationId);
        this.blockUI.stop();
      },
      error => {
        console.log(error);
        this.blockUI.stop();
      }
    )
  }

  deleteProjectSector(projectId, sectorId) {
    this.blockUI.start('Working...');
    this.projectService.deleteProjectSector(projectId, sectorId).subscribe(
      data => {
        this.projectSectors = this.projectSectors.filter(s => s.sectorId != sectorId);
        this.blockUI.stop();
      },
      error => {
        console.log(error);
        this.blockUI.stop();
      }
    )
  }

  hideLoader() {
    this.isLoading = false;
  }

  hideLocationLoader() {
    this.isLocationLoading = false;
  }

  hideSectorLoader() {
    this.isSectorLoading = false;
  }

}
