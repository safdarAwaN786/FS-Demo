import style from './MainPage.module.css'
import logo from './assets/images/sidebar/logo.svg'
import MenuButton from './components/menuButton/MenuButton'
import arrow from './assets/images/sidebar/dropdownArrow.svg'
import profile from './assets/images/sidebar/profile.svg'
import { useNavigate } from 'react-router-dom';
import ProfileUser from './components/profileUser/ProfileUser'
import { useEffect, useState } from 'react'
import Auditors from './AuditingPortal/internalAuditors/Auditors'
import AddAuditor from './AuditingPortal/internalAuditors/AddAuditor'
import AddPlanAuditing from './AuditingPortal/monthlyAuditing/AddPlan'
import AddProcess from './AuditingPortal/processes/AddProcess'
import Processes from './AuditingPortal/processes/Processes'
import YearlyPlanAuditing from './AuditingPortal/yearlyPlan/YearlyPlan'
import ProcessRecords from './AuditingPortal/processRecords/ProcessRecords'
import ProcessInfo from './AuditingPortal/processRecords/ProcessInfo'
import copy from './assets/images/employeeProfile/CopyP.svg'
import DocumentsList from './AuditingPortal/listOfDocuments/DocumentsList'
import CreateDocument from './AuditingPortal/listOfDocuments/CreateDocument'
import ViewDocument from './AuditingPortal/listOfDocuments/ViewDocument'
import FormsList from './AuditingPortal/listOfForms/FormsList'
import CreateForm from './AuditingPortal/listOfForms/CreateForm'
import FormRecords from './AuditingPortal/formRecords/FormRecords'
import ResultsHistory from './AuditingPortal/formRecords/ResultsHistory'
import ChangeRequests from './AuditingPortal/changeRequests/ChangeRequests'
import AddChangeRequest from './AuditingPortal/changeRequests/AddChangeRequest'
import ViewChangeRequest from './AuditingPortal/changeRequests/ViewChangeRequest'
import UploadedDocuments from './AuditingPortal/uploadDocuments/UploadedDocuments'
import UploadDocument from './AuditingPortal/uploadDocuments/UploadDocument'
import DocumentHistory from './AuditingPortal/uploadDocuments/DocumentHistory'
import Dashboard from './AuditingPortal/dashboard/Dashboard'
import Checklist from './AuditorPanel/checklist/Checklist'
import CreateCecklist from './AuditorPanel/checklist/CreateChecklist'
import ConductAudits from './AuditorPanel/conductAudits/ConductAudit'
import AuditConduction from './AuditorPanel/conductAudits/AuditConduction'
import ReportsRecords from './AuditorPanel/reportsrecords/ReprtsRecords'
import RecordReport from './AuditorPanel/reportsrecords/RecordReport'
import CorrectiveActions from './AuditorPanel/correctiveAction/CorrectiveAction'
import ActionOnCorrective from './AuditorPanel/correctiveAction/ActionOnCorrective'
import HACCPteams from './HACCP Panel/HACCP team/HACCPteams'
import HACCPTeamMembers from './HACCP Panel/HACCP team/HACCPTeamMembers'
import AddHACCPTeam from './HACCP Panel/HACCP team/AddHACCPTeam'
import ProductDetails from './HACCP Panel/productDetails/ProductDetails'
import ViewProductDetails from './HACCP Panel/productDetails/ViewProductDetails'
import AddProductDetails from './HACCP Panel/productDetails/AddProductDetails'
import ProcessDetails from './HACCP Panel/processDetails/ProcessDetails'
import ViewProcessDetails from './HACCP Panel/processDetails/ViewProcessDetails'
import AddProcessDetails from './HACCP Panel/processDetails/AddProcessDetails'
import ConductHACCP from './HACCP Panel/conductHACCP/ConductHACCP'
import AddHACCPRiskAssessment from './HACCP Panel/conductHACCP/AddHACCPRiskAssessment'
import ConductHACCPTeamMembers from './HACCP Panel/conductHACCP/ConductHACCPTeamMembers'
import DecisionTree from './HACCP Panel/decisionTree/DecisionTree'
import AddDecisionTree from './HACCP Panel/decisionTree/AddDecisionTree'
import FoodSafetyPlan from './HACCP Panel/foodSafetyPlan/FoodSafetyPlan'
import AddFoodSafetyPlan from './HACCP Panel/foodSafetyPlan/AddFoodSafetyPlan'
import AddAuditingYearlyPlan from './AuditingPortal/yearlyPlan/Input'
import AuditingChecked from './AuditingPortal/yearlyPlan/Checked'
import ViewChecklist from './AuditorPanel/checklist/ViewChecklist'
import EditChecklist from './AuditorPanel/checklist/EditChecklist'
import ViewAudit from './AuditorPanel/conductAudits/ViewAudit'
import ViewReport from './AuditorPanel/reportsrecords/ViewReport'
import ViewCorrectiveAction from './AuditorPanel/correctiveAction/ViewCorrectiveAction'
import UpdateHACCPTeam from './HACCP Panel/HACCP team/UpdateHACCPTeam'
import UpdateProductsDetails from './HACCP Panel/productDetails/UpdateProductsDetails'
import UpdateProcessDetails from './HACCP Panel/processDetails/UpdateProcessDetails'
import UpdateConductHACCP from './HACCP Panel/conductHACCP/UpdateConductHACCP'
import DecisionTreeMembers from './HACCP Panel/decisionTree/DecisionTreeMembers'
import UpdateDecisionTree from './HACCP Panel/decisionTree/UpdateDecisionTree'
import FoodSafetyPlanMembers from './HACCP Panel/foodSafetyPlan/FoodSafetyPlanMembers'
import UpdateFoodSafetyPlan from './HACCP Panel/foodSafetyPlan/UpdateFoodSafetyPlan'
import EditDocument from './AuditingPortal/listOfDocuments/EditDocument'
import ViewForm from './AuditingPortal/listOfForms/ViewForm'
import EditForm from './AuditingPortal/listOfForms/EditForm'
import FillForm from './AuditingPortal/formRecords/FillForm'
import Participants from './ManagementPanel/participants/Participants'
import AddParticipant from './ManagementPanel/participants/AddParticipant'
import Notifications from './ManagementPanel/sendNotifications/Notifications'
import SendNotification from './ManagementPanel/sendNotifications/SendNotification'
import MRMs from './ManagementPanel/sendMRM/MRMs'
import SendMRM from './ManagementPanel/sendMRM/SendMRM'
import Companies from './MasterPanel/companies/Companies'
import AddCompany from './MasterPanel/companies/AddCompany'
import Departments from './MasterPanel/departments/Departments'
import AddDepartments from './MasterPanel/departments/AddDepartment'
import ViewDepartments from './MasterPanel/departments/ViewDepartments'
import UsersCompanies from './MasterPanel/users/UsersCompanies'
import AddUsers from './MasterPanel/users/AddUsers'
import UsersList from './MasterPanel/users/UsersList'
import AssignTabs from './MasterPanel/users/AssignTabs'
import HRProfile from './HRPortal/HRProfile/HRProfile'
import Employees from './HRPortal/Employees/Employees'
import Trainings from './HRPortal/trainingRecords/Trainings'
import TrainingsRef from './HRPortal/trainings/TrainingsRef'
import PlannedTrainings from './HRPortal/plannedTrainings/PlannedTrainings'
import Trainers from './HRPortal/addTrainer/Trainers'
import Main from './HRPortal/personalRec/Main'
import YearlyPlan from './HRPortal/yearlyPlan/YearlyPlan'
import AddPlan from './HRPortal/monthly/AddPlan'
import Machines from './TechPortal/machines/Machines'
import Devices from './TechPortal/devices/Devices'
import TechMWR from './TechPortal/mwr/TechMWR'
import PendingTasks from './TrainerPortalPages/myTasks/PendingTasks'
import CompletedTasks from './TrainerPortalPages/myTasks/CompletedTasks'
import AddTrainer from './HRPortal/addTrainer/AddTrainer'
import AddEmployee from './HRPortal/Employees/AddEmployees'
import EmployeeProfile from './HRPortal/Employees/EmployeeProfile'
import TrainedEmployees from './HRPortal/trainingRecords/TrainedEmployees'
import InfoForAssigned from './HRPortal/trainingRecords/InfoForAssigned'
import AddTraining from './HRPortal/trainings/AddTraining'
import InfoForPlanned from './HRPortal/trainingRecords/InfoForPlanned'
import AssignTrainings from './HRPortal/plannedTrainings/AssignTraining'
import AddPerson from './HRPortal/personalRec/AddPerson'
import PersonalRec from './HRPortal/personalRec/PersonalRec'
import ShowAddPerson from './HRPortal/personalRec/ShowAddPerson'
import ShowPersonalRec from './HRPortal/personalRec/ShowPersonalRec'
import Formtype from './TechPortal/mwr/Formtype'
import AddMachine from './TechPortal/machines/AddMachine'
import MaintananceRect2 from './TechPortal/mwr/MaintananceRect2'
import MaintananceRect from './TechPortal/mwr/MaintananceRect'
import AddDevices from './TechPortal/devices/AddDevices'
import CallibrationRect from './TechPortal/mwr/CallibrationRect'
import InternalExernal from './TechPortal/mwr/InternalExernal'
import CallibrationRect2 from './TechPortal/mwr/CallibrationRect2'
import GenerateMWR2 from './TechPortal/mwr/GenerateMWR2'
import GenerateMWR from './TechPortal/mwr/GenerateMWR'
import Info from './TrainerPortalPages/infoSec/Info'
import MainForTrainerPortal from './TrainerPortalPages/viewTraings/MainForTrainerPortal'
import Input from './HRPortal/yearlyPlan/Input'
import Monthly from './HRPortal/yearlyPlan/Monthly'
import Checked from './HRPortal/yearlyPlan/Checked'
import TrainedEmployeesForTrainer from './TrainerPortalPages/myTasks/TrainedEmployeesForTrainer'
import Wellcome from './HRPortal/welcomePage/Wellcome'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from './redux/slices/tabSlice'
import UsersDepartments from './MasterPanel/users/UsersDepartments'
import AssignTabsToMember from './HACCP Panel/HACCP team/AssignTabsToMember'
import AssignTabsToTrainer from './HRPortal/addTrainer/AssignTabsToTrainer'
import AssignTabsToEmployee from './HRPortal/Employees/AssignTabsToEmployee'
import MaintananceRectForMWR from './TechPortal/mwr/MaintenanceRectForMWR'
import MRMDetails from './ManagementPanel/sendMRM/MRMDetails'
import ViewSubProcessDetails from './HACCP Panel/processDetails/viewSubProcessDetails'
import ConductHACCPHazards from './HACCP Panel/conductHACCP/ConductHACCPHazards'
import ViewDecisionTree from './HACCP Panel/decisionTree/ViewDecisionTree'
import ViewFoodSafetyPlan from './HACCP Panel/foodSafetyPlan/ViewFoodSafetyPlan'
import AssignTabsToOwner from './AuditingPortal/processes/AssignTabsToOwner'
import AssignTabsToInternalAuditor from './AuditingPortal/internalAuditors/AssignTabsToInternalAuditor'
import ShowFormAnswers from './AuditingPortal/formRecords/ShowFormAnswers'
import AuditsHistory from './AuditorPanel/conductAudits/Auditshistory'
import { FadeLoader, ScaleLoader } from 'react-spinners'
import AddSupplier from './HRPortal/Supplier/AddSuppier'
import Suppliers from './HRPortal/Supplier/Suppliers'







function MainPage() {
    const [offcanvas, setOffcanvas] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [redTab, setRedTab] = useState(null);
    const dispatch = useDispatch()
    const Tab = useSelector(state => state.tab?.Tab)
    console.log(Tab);
    const loggedIn = useSelector(state => state.auth.loggedIn)
    const user = useSelector(state => state.auth.user)
    const navigate = useNavigate();

    const loading = useSelector(state => state.loading);


    useEffect(() => {
        if (!loggedIn) {
            navigate('/')
        }
    }, [])


    const toggleDropdown = () => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    };


    return (
        <>
            {loading && (
                <div className={style.loaderContainer}>
                    <div className={style.loaderInner}>
                        <FadeLoader
                            color="#f76060"
                            height={30}
                            margin={8}
                            radius={4}
                            speedMultiplier={0.9}
                            width={8}
                        />
                    </div>
                </div>
            )}
            <>
                <div className={`${style.myNavbar} align-items-center px-lg-5 px-md-4 px-sm-3 px-1  d-flex justify-content-between bg-light`}>
                    <div>
                        <img className={`${style.logoImg}`} src={logo} alt="logo" />
                    </div>
                    <div className='d-flex flex-row align-items-center'>
                        <ProfileUser setRedTab={setRedTab} />
                        <div className={style.menuBtnBox}>
                            <MenuButton func={() => {
                                setOffcanvas(!offcanvas)
                            }} offcanvas={offcanvas} />
                        </div>
                    </div>
                </div>
                <div className={style.parent}>
                    <div className={style.sidebar}>



                        <div className={offcanvas ? `${style.sidebarParentoffcanvas}  ${style.mkvisiable}` : `${style.sidebarParentoffcanvas}`}>
                            <div className={`${style.offcanvas} ${style.block}`}>
                                <div className={style.parent}>
                                    <div className={style.dropdown}>

                                        <div className={style.dropdown}>
                                            <div style={{
                                                cursor: "pointer",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "10px"

                                            }}  >
                                                <div >
                                                    <img src={profile} alt="" />
                                                </div>
                                                <p style={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '15px',
                                                    fontWeight: '500',
                                                    lineHeight: '23px',
                                                    letterSpacing: '0em',
                                                    color: '#ffffff',
                                                    marginBottom: '0'
                                                }}>{user?.Department?.ShortName} Panel</p>
                                                <div style={{
                                                    borderRadius: '1.5rem',
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    flexGrow: '0 !important',
                                                    backgroundColor: 'rgba(253, 189, 164, 0.38)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    justifySelf: 'flex-end',

                                                    cursor: 'pointer',
                                                }} onClick={toggleDropdown} >

                                                    <img className={isOpen ? style.rotate : style.notrotate} src={arrow} alt="" />
                                                </div>
                                            </div>

                                        </div>

                                        {isOpen ? <div className={style.optsParent}>
                                            <ul className={style.opts}>

                                                {user?.Tabs.map((tabObj) => {
                                                    return (
                                                        <li className={redTab === tabObj.Tab ? style.checkedli : null} onClick={() => {

                                                            dispatch(updateTabData(tabObj))


                                                            setRedTab(tabObj.Tab)

                                                            setOffcanvas(!offcanvas)
                                                        }}>

                                                            {tabObj.Tab}</li>
                                                    )
                                                })}



                                            </ul>
                                        </div> : null}

                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className={`${style.sidebarParent} bg-light`}>

                            <div className={isOpen ? `${style.offcanvas} ${style.block}` : style.offcanvas}>
                                <div >
                                    <div className='ms-2'>


                                        <div className={style.dropdown}>
                                            <div style={{
                                                cursor: "pointer",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "10px"

                                            }}  >
                                                <div >
                                                    <img src={profile} alt="" />
                                                </div>
                                                <p style={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '15px',
                                                    fontWeight: '500',
                                                    lineHeight: '23px',
                                                    letterSpacing: '0em',
                                                    color: '#ffffff',
                                                    marginBottom: '0'
                                                }}>{user?.Department.ShortName} Panel</p>
                                                <div style={{
                                                    borderRadius: '1.5rem',
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    flexGrow: '0 !important',
                                                    backgroundColor: 'rgba(253, 189, 164, 0.38)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    justifySelf: 'flex-end',

                                                    cursor: 'pointer',
                                                }} onClick={toggleDropdown} >
                                                    <img className={isOpen ? style.rotate : style.notrotate} src={arrow} alt="" />
                                                </div>
                                            </div>

                                        </div>

                                        {isOpen ? <div className={style.optsParent}>
                                            <ul style={{
                                                height: '395px',
                                                overflowY: 'scroll',
                                                paddingBottom: '10px'
                                            }} className={style.opts}>

                                                {user?.Tabs.map((tabObj) => {
                                                    return (
                                                        <li className={redTab === tabObj.Tab ? style.checkedli : null} onClick={() => {
                                                            dispatch(updateTabData(tabObj))


                                                            setRedTab(tabObj.Tab)

                                                        }}>

                                                            {tabObj.Tab}</li>
                                                    )
                                                })}




                                            </ul>
                                        </div> : null}

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>


                    {Tab === 'HACCP Teams' && (
                        <HACCPteams />
                    )}
                    {Tab === 'addSupplier' && (
                        <AddSupplier />
                    )}
                    {Tab === 'Suppliers' && (
                        <Suppliers />
                    )}
                    {Tab === 'Employees' && (

                        <Employees />
                    )}
                    {Tab === 'addEmployee' && (

                        <AddEmployee />
                    )}
                    {Tab === 'viewEmployeeProfile' && (

                        <EmployeeProfile />
                    )}
                    {Tab === 'trainedEmployees' && (

                        <TrainedEmployees />
                    )}
                    {Tab === 'trainedEmployeesForTrainer' && (

                        <TrainedEmployeesForTrainer />
                    )}
                    {Tab === 'Trainings Records' && (

                        <Trainings />
                    )}
                    {Tab === 'assignedTrainingInfo' && (

                        <InfoForAssigned />
                    )}
                    {Tab === 'plannedTrainingInfo' && (

                        <InfoForPlanned />
                    )}
                    {Tab === 'Trainings' && (

                        <TrainingsRef />
                    )}
                    {Tab === 'addTraining' && (

                        <AddTraining />
                    )}
                    {Tab === 'Planned Trainings' && (

                        <PlannedTrainings />
                    )}
                    {Tab === 'assignTraining' && (

                        <AssignTrainings />
                    )}
                    {Tab === 'Trainers' && (

                        <Trainers />
                    )}
                    {Tab === 'addTrainer' && (

                        <AddTrainer />
                    )}
                    {Tab === 'Personal Rec' && (

                        <Main />
                    )}
                    {Tab === 'addPersonalRec' && (

                        <AddPerson />
                    )}
                    {Tab === 'showPersonalRec' && (

                        <ShowAddPerson />
                    )}
                    {Tab === 'showPersonalRec2' && (

                        <ShowPersonalRec />
                    )}
                    {Tab === 'addPersonalRec2' && (

                        <PersonalRec />
                    )}
                    {Tab === 'Yearly Plan H' && (

                        <YearlyPlan />
                    )}

                    {Tab === 'showPlanMonths' && (

                        <Monthly />
                    )}
                    {Tab === 'showPlanWeeks' && (

                        <Checked />
                    )}
                    {Tab === 'addYearlyPlanHR' && (

                        <Input />
                    )}
                    {Tab === 'Monthly Plan H' && (

                        <AddPlan />
                    )}

                    {Tab === 'Machinery' && (

                        <Machines />
                    )}
                    {Tab === 'addMachine' && (

                        <AddMachine />
                    )}
                    {Tab === 'startMaintenance' && (

                        <Formtype />
                    )}
                    {Tab === 'viewCallibration' && (

                        <CallibrationRect />
                    )}
                    {Tab === 'startCallibration' && (

                        <CallibrationRect2 />
                    )}
                    {Tab === 'internalExternal' && (

                        <InternalExernal />
                    )}
                    {Tab === 'viewMaintenance' && (

                        <MaintananceRect2 />
                    )}
                    {Tab === 'viewCorrectiveMaintenance' && (

                        <MaintananceRect />
                    )}
                    {Tab === 'viewCorrectiveMaintenanceForMWR' && (

                        <MaintananceRectForMWR />
                    )}
                    {Tab === 'Measuring Devices' && (

                        <Devices />
                    )}
                    {Tab === 'addDevice' && (

                        <AddDevices />
                    )}
                    {Tab === 'MWR Requests' && (

                        <TechMWR />
                    )}
                    {Tab === 'generateMWR' && (

                        <GenerateMWR />
                    )}
                    {Tab === 'MWRDetails' && (

                        <GenerateMWR2 />
                    )}
                    {Tab === 'Pending Tasks' && (

                        <PendingTasks />
                    )}
                    {Tab === 'viewTrainingInfo' && (

                        <Info />
                    )}
                    {Tab === 'conductTraining' && (

                        <MainForTrainerPortal />
                    )}
                    {Tab === 'Completed Tasks' && (

                        <CompletedTasks />
                    )}

                    {Tab === 'Food Safety Plan' && (
                        <FoodSafetyPlan />
                    )}
                    {Tab === 'updateFoodSafetyPlan' && (
                        <UpdateFoodSafetyPlan />
                    )}
                    {Tab === 'viewFoodSafetyPlan' && (
                        <ViewFoodSafetyPlan />
                    )}
                    {Tab === 'foodSafetyPlanMembers' && (
                        <FoodSafetyPlanMembers />
                    )}
                    {Tab === 'addFoodSafetyPlan' && (

                        <AddFoodSafetyPlan />
                    )}
                    {Tab === 'addDecisionTree' && (

                        <AddDecisionTree />
                    )}
                    {Tab === 'viewDecisionTree' && (

                        <ViewDecisionTree />
                    )}

                    {Tab === 'Decision Tree' && (

                        <DecisionTree />
                    )}
                    {Tab === 'updateDecisionTree' && (

                        <UpdateDecisionTree />
                    )}
                    {Tab === 'decisionTreeMembers' && (

                        <DecisionTreeMembers />
                    )}
                    {Tab === 'Product Details' && (

                        <ProductDetails />
                    )}
                    {Tab === 'Process Details' && (

                        <ProcessDetails />
                    )}
                    {Tab === 'viewProductDetails' && (

                        <ViewProductDetails />
                    )}
                    {Tab === 'viewProcessDetails' && (

                        <ViewProcessDetails />
                    )}
                    {Tab === 'addHACCPTeam' && (

                        <AddHACCPTeam />
                    )}
                    {Tab === 'updateHACCPTeam' && (

                        <UpdateHACCPTeam />
                    )}
                    {Tab === 'updateProductsDetail' && (

                        <UpdateProductsDetails />
                    )}
                    {Tab === 'updateProcessDetails' && (

                        <UpdateProcessDetails />
                    )}
                    {Tab === 'addProductDetails' && (

                        <AddProductDetails />
                    )}
                    {Tab === 'addProcessDetails' && (

                        <AddProcessDetails />
                    )}
                    {Tab === 'HACCPTeamMembers' && (

                        <HACCPTeamMembers />
                    )}
                    {Tab === 'Internal Auditors' && (

                        <Auditors />
                    )}
                    {Tab === 'addAuditors' && (

                        <AddAuditor />
                    )}
                    {Tab === 'Monthly Plan A' && (

                        <AddPlanAuditing />
                    )}
                    {Tab === 'Processes' && (

                        <Processes />
                    )}
                    {Tab === 'addProcess' && (

                        <AddProcess />
                    )}
                    {!Tab && (

                        <Wellcome />
                    )}
                    {Tab === 'Yearly Plan A' && (

                        <YearlyPlanAuditing />
                    )}
                    {Tab === 'auditingYearlyPlanChecked' && (

                        <AuditingChecked />
                    )}
                    {Tab === 'addAuditingYearlyPlan' && (

                        <AddAuditingYearlyPlan />
                    )}
                    {Tab === 'Process Records' && (

                        <ProcessRecords />
                    )}
                    {Tab === 'processInfo' && (

                        <ProcessInfo />
                    )}

                    {Tab === 'List of Documents' && (

                        <DocumentsList />
                    )}
                    {Tab === 'createDocument' && (

                        <CreateDocument />
                    )}
                    {Tab === 'viewDocument' && (

                        <ViewDocument />
                    )}
                    {Tab === 'editDocument' && (

                        <EditDocument />
                    )}
                    {Tab === 'List of Forms' && (

                        <FormsList />
                    )}
                    {Tab === 'createForm' && (

                        <CreateForm />
                    )}
                    {Tab === 'viewForm' && (

                        <ViewForm />
                    )}
                    {Tab === 'editForm' && (

                        <EditForm />
                    )}
                    {Tab === 'Form Records' && (

                        <FormRecords />
                    )}
                    {Tab === 'fillForm' && (

                        <FillForm />
                    )}
                    {Tab === 'Conduct HACCP' && (

                        <ConductHACCP />
                    )}

                    {Tab === 'conductHACCPTeamMembers' && (

                        <ConductHACCPTeamMembers />
                    )}
                    {Tab === 'addHACCPRiskAssessment' && (

                        <AddHACCPRiskAssessment />
                    )}
                    {Tab === 'updateConductHACCP' && (

                        <UpdateConductHACCP />
                    )}
                    {Tab === 'viewResultsHistory' && (

                        <ResultsHistory />
                    )}
                    {Tab === 'Change Requests' && (

                        <ChangeRequests />
                    )}

                    {Tab === 'addRequest' && (
                        <AddChangeRequest />
                    )}
                    {Tab === 'viewChangeRequest' && (
                        <ViewChangeRequest />
                    )}
                    {Tab === 'Upload Document' && (
                        <UploadedDocuments />
                    )}
                    {Tab === 'uploadDocument' && (
                        <UploadDocument />
                    )}

                    {Tab === 'documentHistory' && (
                        <DocumentHistory />
                    )}
                    {Tab === 'dashboard' && (
                        <Dashboard />
                    )}
                    {Tab === 'Checklist' && (
                        <Checklist />
                    )}
                    {Tab === 'viewChecklist' && (
                        <ViewChecklist />
                    )}
                    {Tab === 'editChecklist' && (
                        <EditChecklist />
                    )}
                    {Tab === 'createChecklist' && (
                        <CreateCecklist />
                    )}
                    {Tab === 'Conduct Audit' && (
                        <ConductAudits />
                    )}
                    {Tab === 'auditConduction' && (
                        <AuditConduction />
                    )}
                    {Tab === 'viewAuditAnswers' && (
                        <ViewAudit />
                    )}
                    {Tab === 'Reports Records' && (
                        <ReportsRecords />
                    )}
                    {Tab === 'recordReport' && (
                        <RecordReport />
                    )}
                    {Tab === 'viewReport' && (
                        <ViewReport />
                    )}
                    {Tab === 'Corrective Action' && (
                        <CorrectiveActions />
                    )}
                    {Tab === 'actionOnCorrective' && (
                        <ActionOnCorrective />
                    )}
                    {Tab === 'viewCorrectiveAction' && (
                        <ViewCorrectiveAction />
                    )}
                    {Tab === 'Participants' && (
                        <Participants />
                    )}
                    {Tab === 'addParticipant' && (
                        <AddParticipant />
                    )}
                    {Tab === 'notifications' && (
                        <Notifications />
                    )}

                    {Tab === 'Send Notification' && (
                        <Notifications />
                    )}
                    {Tab === 'sendNotification' && (
                        <SendNotification />
                    )}
                    {Tab === 'Generate MRM' && (
                        <MRMs />
                    )}
                    {Tab === 'sendMRM' && (
                        <SendMRM />
                    )}
                    {Tab === 'Companies' && (
                        <Companies />
                    )}
                    {Tab === 'addCompany' && (
                        <AddCompany />
                    )}
                    {Tab === 'Departments' && (
                        <Departments />
                    )}
                    {Tab === 'addDepartments' && (
                        <AddDepartments />
                    )}
                    {Tab === 'viewDepartments' && (
                        <ViewDepartments />
                    )}
                    {Tab === 'Users Details' && (
                        <UsersCompanies />
                    )}
                    {Tab === 'addUsers' && (
                        <AddUsers />
                    )}
                    {Tab === 'viewUsersList' && (
                        <UsersList />
                    )}
                    {Tab === 'assignTabs' && (
                        <AssignTabs />
                    )}
                    {Tab === 'User Profile' && (
                        <HRProfile />
                    )}
                    {Tab === 'viewUsersDepartments' && (
                        <UsersDepartments />
                    )}
                    {Tab === 'assignTabsToMember' && (
                        <AssignTabsToMember />
                    )}
                    {Tab === 'assignTabsToTrainer' && (
                        <AssignTabsToTrainer />
                    )}
                    {Tab === 'assignTabsToEmployee' && (
                        <AssignTabsToEmployee />
                    )}
                    {Tab === 'viewMRMDetails' && (
                        <MRMDetails />
                    )}
                    {Tab === 'viewSubProcesses' && (
                        <ViewSubProcessDetails />
                    )}
                    {Tab === 'viewAllHazards' && (
                        <ConductHACCPHazards />
                    )}
                    {Tab === 'assignTabsToOwner' && (
                        <AssignTabsToOwner />
                    )}
                    {Tab === 'assignTabsToInternalAuditor' && (
                        <AssignTabsToInternalAuditor />
                    )}
                    {Tab === 'viewFormAnswers' && (
                        <ShowFormAnswers />
                    )}
                    {Tab === 'viewAuditsHistory' && (
                        <AuditsHistory />
                    )}

                </div>
            </>


        </>
    )
}

export default MainPage