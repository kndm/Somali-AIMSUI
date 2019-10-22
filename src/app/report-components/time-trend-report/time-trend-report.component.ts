import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { StoreService } from 'src/app/services/store-service';
import { SectorService } from 'src/app/services/sector.service';
import { FinancialYearService } from 'src/app/services/financial-year.service';
import { OrganizationService } from 'src/app/services/organization-service';
import { LocationService } from 'src/app/services/location.service';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import { CurrencyService } from 'src/app/services/currency.service';
import { ErrorModalComponent } from 'src/app/error-modal/error-modal.component';
import { Messages } from 'src/app/config/messages';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'time-trend-report',
  templateUrl: './time-trend-report.component.html',
  styleUrls: ['./time-trend-report.component.css']
})
export class TimeTrendReportComponent implements OnInit {
  sectorsSettings: any = [];
  selectedSectors: any = [];
  selectedOrganizations: any = [];
  selectedLocations: any = [];
  selectedDataOptions: any = [];
  selectedChartType: number = 1;
  organizationsSettings: any = {};
  dataOptionSettings: any = {};
  locationsSettings: any = {};
  oldCurrencyRate: number = 0;
  oldCurrency: string = null;
  currencyRate: number = 0;
  yearsList: any = [];
  sectorsList: any = [];
  subSectorsList: any = [];
  organizationsList: any = [];
  currenciesList: any = [];
  locationsList: any = [];
  exchangeRatesList: any = [];
  exchangeRates: any = [];
  manualExRate: any = 0;
  defaultCurrency: string = null;
  defaultCurrencyRate: number = 0;
  nationalCurrency: string = null;
  nationalCurrencyName: string = null;
  selectedCurrencyName: string = null;
  errorMessage: string = null;
  showChart: boolean = true;
  excelFile: string = null;
  chartCategory: number = 1;
  multiDataDisplay: boolean = true;
  datedToday: string = null;
  paramSectorIds: any = [];
  paramOrgIds: any = [];
  paramLocationIds: any = [];
  loadReport: boolean = false;
  isLoading: boolean = true;
  isDataLoading: boolean = true;
  chartTypeName: string = 'bar';

  chartOptions: any = [
    { id: 1, type: 'bar', title: 'Bar chart' },
    { id: 2, type: 'pie', title: 'Pie chart' },
    { id: 3, type: 'doughnut', title: 'Doughnut chart' },
    { id: 4, type: 'line', title: 'Line chart' },
    { id: 5, type: 'radar', title: 'Radar' },
    { id: 6, type: 'polarArea', title: 'Polar area' }
  ];

  chartTypes: any = {
    BAR: 'bar',
    PIE: 'pie',
    DOUGHNUT: 'doughnut',
    LINE: 'line',
    RADAR: 'radar',
    POLAR: 'polarArea'
  };

  chartTypeCodes: any = {
    BAR: 1,
    PIE: 2,
    DOUGHNUT: 3,
    LINE: 4,
    RADAR: 5,
    POLAR: 6
  };

  dataOptions: any = [
    { id: 1, type: 'actual-disbursements', value: 'Actual disbursements' },
    { id: 2, type: 'planned-disbursements', value: 'Planned disbursements' },
    { id: 3, type: 'total-disbursements', value: 'Total disbursements' }
  ];

  dataOptionsIndexForDoughnut: any = {
    1: 0,
    2: 1,
    3: 2
  };

  dataOptionsCodes: any = {
    'ACTUAL_DISBURSEMENTS': 1,
    'PLANNED_DISBURSEMENTS': 2,
    'DISBURSEMENTS': 3
  };

  dataOptionLabels: any = {
    ACTUAL_DISBURSEMENTS: 'Actual disbursements',
    PLANNED_DISBURSEMENTS: 'Planned disbursements',
    DISBURSEMENTS: 'Total disbursements'
  };

  exRateSourceCodes: any = {
    'OPEN_EXCHANGE': 1,
    'AFRICAN_BANK': 2
  };

  exRateSources: any = [
    { id: 1, value: 'Open exchange api' },
    { id: 2, value: 'African bank' }
  ];

  reportDataList: any = [];
  dropdownSettings: any = {};
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          var tooltipValue = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return parseInt(tooltipValue).toLocaleString();
        }
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          callback: function (value, index, values) {
            return value.toLocaleString("en-US");
          }
        }
      }],
      xAxes: [{
        beginAtZero: true,
        ticks: {
          autoSkip: false
        }
      }],
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  pieChartOptions: any = {
    responsive: true,
    legend: {
      position: 'top',
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          var dataLabel = data.labels[tooltipItem.index];
          var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
          dataLabel += value;
          return dataLabel;
        }
      }
    }
  }

  radarChartOptions: any = {
    responsive: true,
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          var dataLabel = data.labels[tooltipItem.index];
          var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
          dataLabel += value;
          return dataLabel;
        }
      }
    }
  }
  
  chartColors: any = [
    {
      backgroundColor: [
        "#FF7360", "#6FC8CE", "#4cc6bb", "#fdd100", "#123ea9"
      ]
    }
  ];
  chartLables: any = [];
  doughnutChartLabels: any = [];
  barChartType: string = 'bar';
  chartLegend: boolean = true;
  chartData: any = [];
  doughnutChartData: any = [];
  model: any = {
    title: '', organizationIds: [], startingYear: 0, endingYear: 0, chartType: 1,
    sectorIds: [], locationIds: [], selectedSectors: [], selectedOrganizations: [],
    selectedLocations: [], sectorsList: [], locationsList: [], organizationsList: [],
    selectedCurrency: null, exRateSource: null, dataOption: 1, selectedDataOptions: [],
    selectedDataOption: 1, chartTypeName: 'bar'
  };
  //Overlay UI blocker
  @BlockUI() blockUI: NgBlockUI;

  constructor(private reportService: ReportService, private storeService: StoreService,
    private sectorService: SectorService, private fyService: FinancialYearService,
    private organizationService: OrganizationService, private locationService: LocationService,
    private currencyService: CurrencyService, private errorModal: ErrorModalComponent,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (this.route.snapshot.queryParams.load) {
      this.route.queryParams.subscribe(params => {
        if (params) {
          this.model.title = (params.title) ? params.title : null;
          this.model.startingYear = (params.syear) ? params.syear : 0;
          this.model.endingYear = (params.eyear) ? params.eyear : 0;
          this.paramSectorIds = (params.sectors) ? params.sectors.split(',') : [];
          this.paramOrgIds = (params.orgs) ? params.orgs.split(',') : [];
          this.paramLocationIds = (params.locations) ? params.locations.split(',') : [];
          this.loadReport = true;
        } 
      });
    } else {
      this.isLoading = false;
    }

    this.getSectorsList();
    this.getLocationsList();
    this.getOrganizationsList();
    this.loadFinancialYears();
    this.getDefaultCurrency();
    this.getNationalCurrency();
    this.getManualExchangeRateForToday();
    this.datedToday = this.storeService.getLongDateString(new Date());

    this.sectorsSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'sectorName',
      selectAllText: 'Select all',
      unSelectAllText: 'Unselect all',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };

    this.organizationsSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'organizationName',
      selectAllText: 'Select all',
      unSelectAllText: 'Unselect all',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };

    this.locationsSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'location',
      selectAllText: 'Select all',
      unSelectAllText: 'Unselect all',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };

    this.dataOptionSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'value',
      selectAllText: 'Select all',
      unSelectAllText: 'Unselect all',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };

    var dataOption = this.dataOptions.filter(o => o.id == 1);
    if (dataOption.length > 0) {
      this.model.selectedDataOptions.push(dataOption[0]);
      this.selectedDataOptions.push(this.dataOptionsCodes.PROJECTS);
    }
  }

  getDefaultCurrency() {
    this.currencyService.getDefaultCurrency().subscribe(
      data => {
        if (data) {
          this.defaultCurrency = data.currency;
          this.model.selectedCurrency = data.currency;
          this.oldCurrency = this.model.selectedCurrency;
          this.selectedCurrencyName = data.currencyName;
          this.currenciesList.push(data);
        }
      }
    );
  }

  getNationalCurrency() {
    this.currencyService.getNationalCurrency().subscribe(
      data => {
        if (data) {
          this.nationalCurrency = data;
          this.nationalCurrencyName = data.currency;
          this.currenciesList.push(data);
        }

        setTimeout(() => {
          this.isDataLoading = false;
        }, 2000);
      }
    );
  }

  searchProjectsByCriteriaReport() {
    this.blockUI.start('Searching Projects...');

    this.chartLables = [];
    this.chartData = [];
    var searchModel = {
      title: this.model.title,
      startingYear: this.model.startingYear,
      endingYear: this.model.endingYear,
      organizationIds: this.model.selectedOrganizations.map(o => o.id),
      sectorIds: this.model.selectedSectors.map(s => s.id),
    };

    this.resetSearchResults();
    this.reportService.getYearlyProjectsReport(searchModel).subscribe(
      data => {
        this.reportDataList = data;
        if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
          var years = this.reportDataList.yearlyProjectsList.map(y => y.year);
          this.chartLables = years;
          if (this.reportDataList.reportSettings) {
            this.excelFile = this.reportDataList.reportSettings.excelReportName;
            this.setExcelFile();
          }

          this.manageDataToDisplay();
          this.model.selectedCurrency = this.defaultCurrency;
          this.selectCurrency();
        }
        this.blockUI.stop();
      }
    )

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    
  }

  resetSearchResults() {
    this.chartData = [];
    this.chartLables = [];
    this.reportDataList = [];
  }

  formatFunders(funders: any = null) {
    var fundersStr = '';
    if (funders && funders.length > 0) {
      var funderNames = funders.map(f => f.funder);
      fundersStr = funderNames.join(', ');
    }
    return fundersStr;
  }

  formatImplementers(implementers: any = null) {
    var implementersStr = '';
    if (implementers && implementers.length > 0) {
      var implementerNames = implementers.map(i => i.implementer);
      implementersStr = implementerNames.join(', ');
    }
    return implementersStr;
  }

  loadFinancialYears() {
    this.fyService.getYearsList().subscribe(
      data => {
        if (data) {
          this.yearsList = data;
        }
      }
    );
  }

  generatePDF() {
    this.blockUI.start('Generating PDF...');
    var result = Promise.resolve(this.reportService.generatePDF('rpt-timetrend-pdf-view'));
    result.then(() => {
      this.blockUI.stop();
    });
  }

  printReport() {
    this.storeService.printReport('rpt-time-trend-report', 'Time trend report');
  }

  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

  getSectorsList() {
    this.sectorService.getDefaultSectors().subscribe(
      data => {
        var sectorsList = data;
        this.sectorsList = sectorsList.filter(s => s.parentSectorId == null);
        this.subSectorsList = [];
        if (this.loadReport) {
          if (this.paramSectorIds.length > 0) {
            this.paramSectorIds.forEach(function (id) {
              var sector = this.sectorsList.filter(s => s.id == id);
              if (sector.length > 0) {
                this.model.selectedSectors.push(sector[0]);
              }
            }.bind(this));
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getManualExchangeRateForToday() {
    var dated = this.storeService.getCurrentDateSQLFormat();
    var model = {
      dated: dated
    };
    this.currencyService.getAverageCurrencyForDate(model).subscribe(
      data => {
        if (data) {
          this.exchangeRates = data;
          var nationalCurrencyRate = this.exchangeRates.filter(c => c.currency == this.nationalCurrencyName);
          if (nationalCurrencyRate.length > 0) {
            this.manualExRate = nationalCurrencyRate[0].rate;
            this.oldCurrencyRate = 1;
          }
        }
      });
  }


  getLocationsList() {
    this.locationService.getLocationsList().subscribe(
      data => {
        this.locationsList = data;
      },
      error => {
        console.log(error);
      }
    );
  }

  getOrganizationsList() {
    this.organizationService.getOrganizationsList().subscribe(
      data => {
        this.organizationsList = data;

        if (this.loadReport) {
          if (this.paramOrgIds.length > 0) {
            this.paramOrgIds.forEach(function (id) {
              var org = this.organizationsList.filter(o => o.id == id);
              if (org.length > 0) {
                this.model.selectedOrganizations.push(org[0]);
              }
            }.bind(this));
          }
          this.searchProjectsByCriteriaReport();
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  onSectorSelect(item: any) {
    var id = item.id;
    if (this.selectedSectors.indexOf(id) == -1) {
      this.selectedSectors.push(id);
    }
  }

  onSectorDeSelect(item: any) {
    var id = item.id;
    var index = this.selectedSectors.indexOf(id);
    this.selectedSectors.splice(index, 1);

    this.searchProjectsByCriteriaReport();
  }

  onSectorSelectAll(items: any) {
    items.forEach(function (item) {
      var id = item.id;
      if (this.selectedSectors.indexOf(id) == -1) {
        this.selectedSectors.push(id);
      }
    }.bind(this))
  }

  onOrganizationSelect(item: any) {
    var id = item.id;
    /*if (this.selectedOrganizations.indexOf(id) == -1) {
      this.selectedOrganizations.push(id);
    }*/
  }

  onOrganizationDeSelect(item: any) {
    var id = item.id;
    this.searchProjectsByCriteriaReport();
  }

  onOrganizationSelectAll(items: any) {
  }

  onLocationSelect(item: any) {
    var id = item.id;
  }

  onLocationDeSelect(item: any) {
    var id = item.id;
    this.searchProjectsByCriteriaReport();
  }

  onLocationSelectAll(items: any) {
  }

  onDataOptionSelect(item: any) {
    var id = item.id;
    if (this.selectedDataOptions.indexOf(id) == -1) {
      this.selectedDataOptions.push(id);
      this.manageDataOptions();
    }
  }

  onDataOptionDeSelect(item: any) {
    var id = item.id;
    var index = this.selectedDataOptions.indexOf(id);
    this.selectedDataOptions.splice(index, 1);
    this.manageDataOptions();
  }

  onDataOptionSelectAll(items: any) {
    items.forEach(function (item) {
      var id = item.id;
      if (this.selectedDataOptions.indexOf(id) == -1) {
        this.selectedDataOptions.push(id);
      }
    }.bind(this));
    this.manageDataOptions();
  }

  onDataOptionDeSelectAll(items: any) {
    this.selectedDataOptions = [];
    this.manageDataOptions();
  }

  manageDataToDisplay() {
    this.chartData = [];
    var selectedDataOption = 1;
    if (this.model.selectedDataOption) {
      this.selectedDataOptions = [];
      selectedDataOption = parseInt(this.model.selectedDataOption);
      this.selectedDataOptions.push(selectedDataOption);
    }
    selectedDataOption = parseInt(this.model.selectedDataOption);
    var chartType = this.chartOptions.filter(c => c.id == this.model.chartType);
    if (chartType.length > 0) {
      this.model.chartTypeName = chartType[0].type;
    }
    if (this.model.chartType != this.chartTypeCodes.PIE && this.model.chartType != this.chartTypeCodes.POLAR) {
      this.manageDataOptions();
    } else {
      switch (selectedDataOption) {
        case this.dataOptionsCodes.ACTUAL_DISBURSEMENTS:
          this.chartData = this.reportDataList.yearlyProjectsList.map(p => p.totalActualDisbursements);
          break;
  
        case this.dataOptionsCodes.PLANNED_DISBURSEMENTS:
          this.chartData = this.reportDataList.yearlyProjectsList.map(p => p.totalPlannedDisbursements);
          break;
  
        case this.dataOptionsCodes.DISBURSEMENTS:
          this.chartData = this.reportDataList.yearlyProjectsList.map(p => p.totalDisbursements);
          break;
  
        default:
          this.chartData = this.reportDataList.yearlyProjectsList.map(p => p.totalActualDisbursements);
          break;
      }
    }
  }

  getGrandTotalFundingForYear() {
    var totalFunding = 0;
    if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
      this.reportDataList.yearlyProjectsList.forEach(function (p) {
        totalFunding += p.totalFunding;
      });
    }
    return totalFunding;
  }

  getGrandTotalProjectValueForYear() {
    var projectValue = 0;
    if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
      this.reportDataList.yearlyProjectsList.forEach(function (p) {
        projectValue += p.totalProjectValue;
      });
    }
    return projectValue;
  }

  getGrandTotalDisbursementForYear() {
    var totalDisbursement = 0;
    if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
      this.reportDataList.yearlyProjectsList.forEach(function (p) {
        totalDisbursement += p.totalDisbursements;
      });
    }
    return totalDisbursement;
  }

  getGrandTotalPlannedDisbursementForYear() {
    var totalDisbursement = 0;
    if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
      this.reportDataList.yearlyProjectsList.forEach(function (p) {
        totalDisbursement += p.totalPlannedDisbursements;
      });
    }
    return totalDisbursement;
  }

  convertAmountsToCurrency() {
    if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
      this.reportDataList.yearlyProjectsList.forEach(function (p) {
        p.totalDisbursements = 0;
      });
    }
  }

  manageDataOptions() {
    if (this.selectedDataOptions.length > 0 && this.reportDataList.yearlyProjectsList) {
      this.chartData = [];
      this.doughnutChartData = [];
      this.showChart = false;

      if (this.selectedDataOptions.indexOf(this.dataOptionsCodes.ACTUAL_DISBURSEMENTS) != -1) {
        var isDataExists = this.chartData.filter(d => d.label == this.dataOptionLabels.ACTUAL_DISBURSEMENTS);
        if (isDataExists.length == 0) {
          var sectorProjects = this.reportDataList.yearlyProjectsList.map(p => p.totalActualDisbursements);
          var chartData = { data: sectorProjects, label: this.dataOptionLabels.ACTUAL_DISBURSEMENTS };
          this.chartData.push(chartData);
          this.doughnutChartData.push(sectorProjects);
          this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.ACTUAL_DISBURSEMENTS] = (this.doughnutChartData.length - 1);
        }
      } else {
        this.chartData = this.chartData.filter(d => d.label != this.dataOptionLabels.ACTUAL_DISBURSEMENTS);
        this.doughnutChartData.splice(this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.ACTUAL_DISBURSEMENTS], 1);
      }

      if (this.selectedDataOptions.indexOf(this.dataOptionsCodes.PLANNED_DISBURSEMENTS) != -1) {
        var isDataExists = this.chartData.filter(d => d.label == this.dataOptionLabels.PLANNED_DISBURSEMENTS);
        if (isDataExists.length == 0) {
          var totalPlannedDisbursements = this.reportDataList.yearlyProjectsList.map(p => p.totalPlannedDisbursements);
          var chartData = { data: totalPlannedDisbursements, label: this.dataOptionLabels.PLANNED_DISBURSEMENTS };
          this.chartData.push(chartData);
          this.doughnutChartData.push(totalPlannedDisbursements);
          this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.PLANNED_DISBURSEMENTS] = (this.doughnutChartData.length - 1);
        }
      } else {
        this.chartData = this.chartData.filter(d => d.label != this.dataOptionLabels.PLANNED_DISBURSEMENTS);
        this.doughnutChartData.splice(this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.PLANNED_DISBURSEMENTS], 1);
      }

      if (this.selectedDataOptions.indexOf(this.dataOptionsCodes.DISBURSEMENTS) != -1) {
        var isDataExists = this.chartData.filter(d => d.label == this.dataOptionLabels.DISBURSEMENTS);
        if (isDataExists.length == 0) {
          var sectorDisbursements = this.reportDataList.yearlyProjectsList.map(p => p.totalDisbursements);
          var chartData = { data: sectorDisbursements, label: this.dataOptionLabels.DISBURSEMENTS };
          this.chartData.push(chartData);
          this.doughnutChartData.push(sectorDisbursements);
          this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.DISBURSEMENTS] = (this.doughnutChartData.length - 1);
        }
      } else {
        this.chartData = this.chartData.filter(d => d.label != this.dataOptionLabels.DISBURSEMENTS);
        this.doughnutChartData.splice(this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.DISBURSEMENTS], 1);
      }

      if (this.selectedDataOptions.length > 0) {
        setTimeout(() => {
          this.showChart = true;
        }, 1000);
      }
    }

    if (this.selectedDataOptions.length == 0 && this.chartData.length > 0) {
      this.chartData = [];
      this.doughnutChartData = [];
      setTimeout(() => {
        this.showChart = true;
      }, 1000);
    }
  }

  selectCurrency() {
    if (this.model.selectedCurrency == null || this.model.selectedCurrency == 'null') {
      return false;
    } else {
      var selectedCurrency = this.currenciesList.filter(c => c.currency == this.model.selectedCurrency);
      if (selectedCurrency.length > 0) {
        this.selectedCurrencyName = selectedCurrency[0].currencyName;
      }
    }
    if (this.model.selectedCurrency) {
      this.getCurrencyRates();
    }
  }

  getCurrencyRates() {
    var exRate: number = 0;
    var calculatedRate = 0;
    if (this.manualExRate == 0) {
      this.errorMessage = Messages.EX_RATE_NOT_FOUND;
      this.errorModal.openModal();
      return false;
    }

    if (this.model.selectedCurrency == this.defaultCurrency) {
      exRate = 1;
    } else {
      exRate = this.manualExRate;
    }

    calculatedRate = (exRate / this.oldCurrencyRate);
    this.oldCurrencyRate = exRate;
    this.oldCurrency = this.model.selectedCurrency;

    if (calculatedRate > 0 && calculatedRate != 1) {
      this.applyRateOnFinancials(calculatedRate);
    }
  }

  applyRateOnFinancials(calculatedRate: number) {
    if (this.reportDataList && this.reportDataList.yearlyProjectsList) {
      this.reportDataList.yearlyProjectsList.forEach(function (year) {
        year.totalFunding = Math.round(parseFloat(((year.totalFunding * calculatedRate).toFixed(2))));
        year.totalDisbursements = Math.round(parseFloat(((year.totalDisbursements * calculatedRate).toFixed(2))));
        year.totalActualDisbursements = Math.round(parseFloat(((year.totalActualDisbursements * calculatedRate).toFixed(2))));
        year.totalPlannedDisbursements = Math.round(parseFloat(((year.totalPlannedDisbursements * calculatedRate).toFixed(2))));

        if (year.projects && year.projects.length > 0) {
          year.projects.forEach(function (project) {
            project.projectCost = Math.round(parseFloat(((project.projectCost * calculatedRate).toFixed(2))));
            project.actualDisbursements = Math.round(parseFloat(((project.actualDisbursements * calculatedRate).toFixed(2))));
            project.plannedDisbursements = Math.round(parseFloat(((project.plannedDisbursements * calculatedRate).toFixed(2))));
          });
        }
      });

      this.getGrandTotalFundingForYear();
      this.getGrandTotalDisbursementForYear();
      
      this.showChart = false;
      if (this.selectedDataOptions.indexOf(this.dataOptionsCodes.FUNDING) != -1) {
          this.chartData = [];
          var sectorFunding = this.reportDataList.yearlyProjectsList.map(p => p.totalFunding);
          var chartData = { data: sectorFunding, label: this.dataOptionLabels.FUNDING };
          this.chartData.push(chartData);
          this.doughnutChartData.push(sectorFunding);
          this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.FUNDING] = (this.doughnutChartData.length - 1);
      }

      if (this.selectedDataOptions.indexOf(this.dataOptionsCodes.DISBURSEMENTS) != -1) {
          this.chartData = [];
          var sectorDisbursements = this.reportDataList.yearlyProjectsList.map(p => p.totalDisbursements);
          var chartData = { data: sectorDisbursements, label: this.dataOptionLabels.DISBURSEMENTS };
          this.chartData.push(chartData);
          this.doughnutChartData.push(sectorDisbursements);
          this.dataOptionsIndexForDoughnut[this.dataOptionsCodes.DISBURSEMENTS] = (this.doughnutChartData.length - 1);
      }

      setTimeout(() => {
        this.showChart = true;
      }, 1000);
    }
  }

  setExcelFile() {
    if (this.excelFile) {
      this.excelFile = this.storeService.getExcelFilesUrl() + this.excelFile;
    }
  }

  formatNumber(value: number) {
    return this.storeService.getNumberWithCommas(value);
  }

}
