import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { SectorService } from 'src/app/services/sector.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { StoreService } from 'src/app/services/store-service';
import { ErrorModalComponent } from 'src/app/error-modal/error-modal.component';
import { Messages } from 'src/app/config/messages';

@Component({
  selector: 'project-sectors',
  templateUrl: './project-sectors.component.html',
  styleUrls: ['./project-sectors.component.css']
})
export class ProjectSectorsComponent implements OnInit {

  @Input()
  projectId: number = 0;
  @Input()
  sectorTypesList: any = [];
  @Input()
  sectorsList: any = [];
  @Input()
  currentProjectSectors: any = [];
  @Input()
  defaultSectorsList: any = [];
  @Input()
  defaultSectorTypeId: number = 0;
  @Input()
  defaultSectorType: string = null;
  @Input()
  locationsList: any = [];
  @Input()
  currentProjectLocations: any = [];

  @Output()
  projectSectorsChanged = new EventEmitter<any[]>();
  @Output()
  projectLocationsChanged = new EventEmitter<any[]>();

  typeSectorsList: any = [];
  sectorMappings: any = [];
  mappedSectorsList: any = [];
  newProjectSectors: any = [];
  mappingsCount: number = 0;
  requestNo: number = 0;
  errorMessage: string = null;
  showMappingManual: boolean = false;
  showMappingAuto: boolean = false;
  sectorModel: any = { sectorTypeId: null, sector: null, sectorId: null, mappingId: null, fundsPercentage: null, saved: false };
  newMappings: any = [];
  locationModel: any = { locationId: null, location: null, fundsPercentage: null, saved: false };
  
  @BlockUI() blockUI: NgBlockUI;
  constructor(private projectService: ProjectService, private sectorService: SectorService,
    private storeService: StoreService, private errorModal: ErrorModalComponent) { }

  ngOnInit() {
    this.requestNo = this.storeService.getNewRequestNumber();
    this.storeService.currentRequestTrack.subscribe(model => {
      if (model && this.requestNo == model.requestNo && model.errorStatus != 200) {
        this.errorMessage = model.errorMessage;
        this.errorModal.openModal();
      }
    });
  }

  getTypeSectorsList() {
    this.sectorModel.sectorId = null;
    if (!this.sectorModel.sectorTypeId) {
      this.typeSectorsList = [];
    } else {
      this.typeSectorsList = this.sectorsList.filter(s => s.sectorTypeId == this.sectorModel.sectorTypeId);
    }
    if (this.sectorModel.sectorTypeId == this.defaultSectorTypeId) {
      this.sectorMappings = this.defaultSectorsList;
    }
  }

  getSectorMappings() {
    if (this.defaultSectorTypeId != this.sectorModel.sectorTypeId) {
      this.blockUI.start('Fetching sector mappings...');
      var sectorId = this.sectorModel.sectorId;
      this.mappingsCount = 0;
      this.sectorMappings = [];

      this.sectorService.getMappingsForSector(sectorId).subscribe(
        data => {
          if (data && data.length > 0) {
            this.showMappingManual = true;
            this.showMappingAuto = false;
            this.sectorMappings = data;
            this.mappedSectorsList = data;
            this.mappingsCount = data.length;
            if (data.length >= 1) {
              this.sectorModel.mappingId = data[0].id;
            }
          } else {
            this.mappingsCount = 0;
            this.sectorMappings = this.defaultSectorsList;
          }
          this.blockUI.stop();
        }
      );
    }
  }

  getSectorMappingsByName() {
    if (this.defaultSectorTypeId != this.sectorModel.sectorTypeId) {
      var sectorName = this.sectorModel.sectorName;
      this.mappingsCount = 0;
      this.sectorMappings = [];

      this.sectorService.getMappingsForSectorByName(sectorName).subscribe(
        data => {
          if (data && data.length > 0) {
            this.showMappingManual = true;
            this.showMappingAuto = false;
            this.sectorMappings = data;
            this.mappedSectorsList = data;
            this.mappingsCount = data.length;
            if (data.length >= 1) {
              this.sectorModel.mappingId = data[0].id;
            }
          } else {
            this.mappingsCount = 0;
            this.sectorMappings = this.defaultSectorsList;
          }
        }
      );
    }
  }

  addSector(frm: any) {
    var sectorPercentage = this.sectorModel.fundsPercentage + this.calculateSectorPercentage();
    if (sectorPercentage > 100) {
      this.errorMessage = Messages.INVALID_PERCENTAGE;
      this.errorModal.openModal();
      return false;
    }

    if (this.sectorModel.sectorTypeId != this.defaultSectorTypeId) {
      if (!this.sectorModel.sectorId) {
        this.errorMessage = 'Sector is requred';
        this.errorModal.openModal();
        return false;
      }
    }
    var mappedSector = this.sectorsList.filter(s => s.id == this.sectorModel.mappingId);
    if (mappedSector.length > 0) {
      this.sectorModel.sector = mappedSector[0].sectorName;
    }

    var isSectorExists = this.currentProjectSectors.filter(s => s.sectorId == this.sectorModel.mappingId && s.saved == false);
    if (isSectorExists.length > 0) {
      isSectorExists[0].fundsPercentage += this.sectorModel.fundsPercentage;
    } else {
      this.currentProjectSectors.unshift(this.sectorModel);
    }
    
    this.sectorModel = { sectorTypeId: null, sectorId: null, mappingId: null, saved: false };
    this.mappingsCount = 0;
    this.sectorMappings = [];
    frm.resetForm();
  }

  addLocation(frm: any) {
    var locationPercentage = this.locationModel.fundsPercentage + this.calculateLocationPercentage();
    if (locationPercentage > 100) {
      this.errorMessage = Messages.INVALID_PERCENTAGE;
      this.errorModal.openModal();
      return false;
    }

    var mappedLocation = this.locationsList.filter(l => l.id == this.locationModel.locationId);
    if (mappedLocation.length > 0) {
      this.locationModel.location = mappedLocation[0].location;
    }

    var islocationExists = this.currentProjectLocations.filter(l => l.locationId == this.locationModel.locationId && l.saved == false);
    if (islocationExists.length > 0) {
      islocationExists[0].fundsPercentage += this.locationModel.fundsPercentage;
    } else {
      this.currentProjectLocations.unshift(this.locationModel);
    }
    this.locationModel = { locationId: null, location: null, fundsPercentage: null, saved: false };
    frm.resetForm();
  }

  setManualMappings() {
    this.sectorMappings = this.defaultSectorsList;
    this.showMappingManual = false;
    this.showMappingAuto = true;
  }

  setAutomaticMappings() {
    this.sectorMappings = this.mappedSectorsList;
    this.showMappingAuto = false;
    this.showMappingManual = true;
  }

  removeProjectSector(id) {
    this.currentProjectSectors = this.currentProjectSectors.filter(s => s.saved != false && s.sectorId != id);
  }

  removeProjectLocation(id) {
    this.currentProjectLocations = this.currentProjectLocations.filter(l => (l.saved != false && l.locationId == id));
  }

  deleteProjectSector(sectorId) {
    if (sectorId && this.projectId) {
      this.blockUI.start('Removing sector...');
      this.projectService.deleteProjectSector(this.projectId.toString(), sectorId).subscribe(
        data => {
          if (data) {
            this.currentProjectSectors = this.currentProjectSectors.filter(s => s.sectorId != sectorId);
            this.updateSectorsToParent();
          }
          this.blockUI.stop();
        }
      );
    }
  }

  deleteProjectLocation(locationId) {
    if (locationId && this.projectId) {
      this.blockUI.start('Removing location...');
      this.projectService.deleteProjectLocation(this.projectId.toString(), locationId).subscribe(
        data => {
          if (data) {
            this.currentProjectLocations = this.currentProjectLocations.filter(l => l.locationId != locationId);
            this.updateLocationsToParent();
          }
          this.blockUI.stop();
        }
      );
    }
  }

  areUnSavedSectors() {
    return this.currentProjectSectors.filter(s => s.saved == false).length > 0 ? true : false;
  }

  areUnSavedLocations() {
    return this.currentProjectLocations.filter(l => l.saved == false).length > 0 ? true : false;
  }

  calculateSectorPercentage() {
    var percentageList = this.currentProjectSectors.map(s => parseInt(s.fundsPercentage));
    return percentageList.reduce(this.storeService.sumValues, 0);
  }

  calculateLocationPercentage() {
    var percentageList = this.currentProjectLocations.map(l => parseInt(l.fundsPercentage));
    return percentageList.reduce(this.storeService.sumValues, 0);
  }

  saveProjectSectors() {
    var unSavedSectors = this.currentProjectSectors.filter(s => !s.saved);
    if (unSavedSectors.length > 0 && this.projectId) {
      unSavedSectors.forEach(s => {
        if (!s.sectorId) {
          s.sectorId = 0;
        }
        if (s.sectorTypeId != this.defaultSectorTypeId) {
          this.newMappings.push({
            sectorTypeId: s.sectorTypeId,
            sectorId: s.sectorId,
            mappingId: s.mappingId
          });
        }
      });
      var model = {
        projectId: this.projectId,
        projectSectors: unSavedSectors,
        newMappings: this.newMappings
      };
      this.blockUI.start('Saving sectors');
      this.projectService.addProjectSector(model).subscribe(
        data => {
          if (data) {
            this.getProjectSectors();    
          }
        }
      );
    }
  }

  saveProjectLocations() {
    var unSavedLocations = this.currentProjectLocations.filter(s => !s.saved);
    if (unSavedLocations.length > 0 && this.projectId) {
      var model = {
        projectId: this.projectId,
        projectLocations: unSavedLocations,
      };
      this.blockUI.start('Saving locations');
      this.projectService.addProjectLocation(model).subscribe(
        data => {
          if (data) {
            this.getProjectLocations();  
          }
        }
      );
    }
  }

  getProjectSectors() {
    this.projectService.getProjectSectors(this.projectId.toString()).subscribe(
      data => {
        if (data) {
          if (data.length > 0) {
            data.forEach(d => {
              d.saved = true;
            });
          }
          this.currentProjectSectors = data;
          this.updateSectorsToParent();
        }
        this.blockUI.stop();
      }
    );
  }

  getProjectLocations() {
    this.projectService.getProjectLocations(this.projectId.toString()).subscribe(
      data => {
        if (data) {
          if (data.length > 0) {
            data.forEach(d => {
              d.saved = true;
            });
          }
          this.currentProjectLocations = data;
          this.updateLocationsToParent();
        }
        this.blockUI.stop();
      }
    );
  }

  /*Sending updated data to parent*/
  updateSectorsToParent() {
    this.projectSectorsChanged.emit(this.currentProjectSectors);
  }

  updateLocationsToParent() {
    this.projectLocationsChanged.emit(this.currentProjectLocations);
  }

}
