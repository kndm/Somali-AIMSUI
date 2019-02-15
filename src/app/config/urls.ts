export const urls = {
	//baseUrl: "http://104.140.103.166:7000/api/",
	baseUrl: "http://localhost:60815/api/",
	getToken: "User/Token",
	checkEmailAvailability: "User/CheckEmailAvailability/",
	userRegistration: "User",
	editUserPassword: "User/EditPassword/",
	deleteUserAccount: "User/DeleteAccount",
	resetPasswordRequest: "User/ResetPasswordRequest/",
	organizationsList: "Organization",
	organizationTypesList: "OrganizationType",
	userNotificationsList: "Notification",
	userAccountActivation: "User/ActivateAccount/",
	searchOrganizations: "Organization/",
	getOrganization: "Organization/GetById/",
	organizationUrl: "Organization",
	locationUrl: "Location",
	getLocation: "Location/GetById/",
	sectorTypesUrl: "SectorTypes",
	getSectorType: "SectorTypes/GetById/",
	sectorCategoriesUrl: "SectorCategory",
	getSectorCategory: "SectorCategory/GetById/",
	sectorSubCategoriesUrl: "SectorSubCategory",
	getSectorSubCategory: "SectorSubCategory/GetById/",
	sectorsUrl: "Sector",
	getSector: "Sector/GetById/",
	projectTypesUrl: "ProjectType",
	getProjectType: "ProjectType/GetById/",
	projectsUrl: "Project",
	getProject: "Project/GetById/",
	getProjectProfileReport: "Project/GetProjectProfileReport/",
	getProjectTitle: "Project/GetTitle/",
	getProjectLocationsUrl: "Project/GetLocations/",
	addProjectLocation: "Project/AddProjectLocation",
	getProjectSectorsUrl: "Project/GetSectors/",
	addProjectSector: "Project/AddProjectSector",
	getProjectFundersUrl: "Project/GetFunders/",
	addProjectFunder: "Project/AddProjectFunder",
	getProjectImplementersUrl: "Project/GetImplementers/",
	addProjectImplementer: "Project/AddProjectImplementer",
	getProjectDisbursementUrl: "Project/GetDisbursements/",
	addProjectDisbursement: "Project/AddProjectDisbursement",
	getProjectDocumentUrl: "Project/GetDocuments/",
	addProjectDocument: "Project/AddProjectDocument",
	deleteProjectLocation: "Project/DeleteProjectLocation/",
	deleteProjectSector: "Project/DeleteProjectSector/",
	deleteProjectFunder: "Project/DeleteProjectFunder/",
	deleteProjectImplementer: "Project/DeleteProjectImplementer/",
	deleteProjectDisbursement: "Project/DeleteProjectDisbursement/",
	deleteProjectDocument: "Project/DeleteProjectDocument/",
	iatiActivities: "IATI/GetActivities",
	iatiOrganizations: "IATI/GetOrganizations",
	iatiMatchingActivities: "IATI/GetMatchingActivities",
	iatiProjects: "IATI/GetProjects",
	getIatiSettings: "IATI/GetIATISettings",
	setIatiSettings: "IATI/SetIATISettings",
	iatiProjectsByIds: "IATI/ExtractProjectsByIds",
	aimsProjectsByIds: "Project/ExtractProjectsByIds",
	sectorProjectsReport: "Report/GetSectorWiseProjects",
	searchProjectsViewByCriteria: "Project/SearchProjectsViewByCriteria",
	searchProjectsByCriteriaReport: "Report/SearchProjectsByCriteria",
	getFinancialYears: "FinancialYear",
	smtpSettings: "SMTPSettings",
	notificationsCount: "Notification/GetCount",
	notifications: "Notification",
	markNotificationsRead: "Notification/MarkNotificationsRead",
	deleteNotifications: "Notification/DeleteNotifications"
};