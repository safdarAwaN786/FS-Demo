import { Route, Routes, useNavigate } from "react-router-dom";
import HRProfile from './HRPortal/HRProfile/HRProfile';
import EmployeeProfile from './HRPortal/Employees/EmployeeProfile';
import Employees from './HRPortal/Employees/Employees';
import AddEmployees from './HRPortal/Employees/AddEmployees';
import AddTrainer from './HRPortal/addTrainer/AddTrainer';
import AddTraining from './HRPortal/trainings/AddTraining';
import YearlyPlan from './HRPortal/yearlyPlan/YearlyPlan';
import Monthly from './HRPortal/yearlyPlan/Monthly';
import Checked from './HRPortal/yearlyPlan/Checked';
import Input from './HRPortal/yearlyPlan/Input';
import AddPlan from './HRPortal/monthly/AddPlan';
import PersonalRec from './HRPortal/personalRec/PersonalRec';
import AddPerson from './HRPortal/personalRec/AddPerson';
import AssignTrainings from './HRPortal/plannedTrainings/AssignTraining';
import PendingTasks from './TrainerPortalPages/myTasks/PendingTasks';
import CompletedTasks from './TrainerPortalPages/myTasks/CompletedTasks';
import Info from './TrainerPortalPages/infoSec/Info';
import TrainingInfoForAssigned from './HRPortal/trainingRecords/InfoForAssigned';
import TrainingInfoForPlanned from './HRPortal/trainingRecords/InfoForPlanned';
import MainForTrainerPortal from './TrainerPortalPages/viewTraings/MainForTrainerPortal';
import ShowAddPerson from './HRPortal/personalRec/ShowAddPerson';
import ShowPersonalRec from './HRPortal/personalRec/ShowPersonalRec';
import Trainings from './HRPortal/trainingRecords/Trainings';
import TrainedEmployees from './HRPortal/trainingRecords/TrainedEmployees';
import TrainingsRef from './HRPortal/trainings/TrainingsRef';
import PlannedTrainings from './HRPortal/plannedTrainings/PlannedTrainings';
import Main from './HRPortal/personalRec/Main';
import Trainers from './HRPortal/addTrainer/Trainers';
import { useEffect, useState } from 'react';
import AddDevices from './TechPortal/devices/AddDevices';
import Devices from './TechPortal/devices/Devices';
import AddMachine from './TechPortal/machines/AddMachine';
import Machines from './TechPortal/machines/Machines';
import Table1 from './TechPortal/mwr/TechMWR';
import GenerateMWR from './TechPortal/mwr/GenerateMWR';
import MaintananceRect from './TechPortal/mwr/MaintananceRect';
import MaintananceRect2 from './TechPortal/mwr/MaintananceRect2';
import CallibrationRect from './TechPortal/mwr/CallibrationRect';
import CallibrationRect2 from './TechPortal/mwr/CallibrationRect2';
import InternalExernal from './TechPortal/mwr/InternalExernal';
import Formtype from './TechPortal/mwr/Formtype';
import GenerateMWR2 from './TechPortal/mwr/GenerateMWR2';
import Auditors from './AuditingPortal/internalAuditors/Auditors';
import AddAuditor from './AuditingPortal/internalAuditors/AddAuditor';
import Processes from './AuditingPortal/processes/Processes';
import AddProcess from './AuditingPortal/processes/AddProcess';
import YearlyPlanAuditing from './AuditingPortal/yearlyPlan/YearlyPlan';
import AddAuditingYearlyPlan from './AuditingPortal/yearlyPlan/Input';
import AuditingChecked from './AuditingPortal/yearlyPlan/Checked';
import AddPlanAuditing from './AuditingPortal/monthlyAuditing/AddPlan';
import Cookies from 'js-cookie'
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import { useDispatch, useSelector } from "react-redux";
import { logInUser } from "./redux/slices/authSlice";
import axios from "axios";
import { setLoading } from "./redux/slices/loading";
import BlankScreen from "./BlankWhite";

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector(state => state.auth.loggedIn);
  useEffect(() => {
    if (loggedIn) {
      navigate('/quality-and-maintenance')
    } else {
      navigate('/')
    }
    const userToken = Cookies.get('userToken');
    if (userToken) {
      dispatch(setLoading(true));
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-user`, { headers: { Authorization: `Bearer ${userToken}` } })
        .then(response => {
          dispatch(logInUser(response.data.data));
          dispatch(setLoading(false))
        }).catch(error => {
          dispatch(setLoading(false));
          navigate('/');
          console.error('Error fetching user data:', error)});
    } else {
      navigate('/login')
    }
  }, []);


  useEffect(() => {
    if (loggedIn) {
      navigate('/quality-and-maintenance')
    } else {
      navigate('/')
    }
    const userToken = Cookies.get('userToken');
    if (userToken) {
      console.log(userToken);
      dispatch(setLoading(true));
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-user`, { headers: { Authorization: `Bearer ${userToken}` } })
        .then(response => {
          console.log(response.data);
          dispatch(logInUser(response.data.data));
          dispatch(setLoading(false));
        }).catch(error => {
          dispatch(setLoading(false));
          navigate('/');
          console.error('Error fetching user data:', error)});
    } else {
      dispatch(setLoading(false));
      navigate('/login')
      console.log('Token not exist');
    }
  }, [loggedIn]);

  const [personFormData, setPersonFormData] = useState({});
  return (
    < >
      <Routes>
        <Route path='/' element={<BlankScreen  />}></Route>
        <Route path='/login' element={<LoginPage  />}></Route>
        <Route path='/quality-and-maintenance' element={<MainPage  />}></Route>

        {/* --->HR Portal<--- */}
        {/* Employee Button Pages */}

        {/* <Route path="/" element={<WellcomePage />} /> */}
        <Route path="/hr/profile" element={<HRProfile />} />
        <Route path={`/hr/employeeProfile/:employeeID`} element={<EmployeeProfile />} />
        <Route path="/hr/employees" element={<Employees />} />
        <Route path="/hr/addemployee" element={<AddEmployees />} />
        {/* Training recs */}
        <Route path="/hr/trainings" element={<Trainings />} />
        <Route path="/hr/plannedtraininginfo/:plannedTrainingID" element={<TrainingInfoForPlanned />} />
        <Route path="/hr/assignedtraininginfo/:assignedTrainingID" element={<TrainingInfoForAssigned />} />
        <Route path="/hr/trainedemployees/:assignedTrainingID" element={<TrainedEmployees />} />
        {/* Training */}
        <Route path="/hr/trainingsref" element={<TrainingsRef />} />
        <Route path="/hr/addtraining" element={<AddTraining />} />
        <Route path="/hr/planned/trainings" element={<PlannedTrainings />} />
        <Route path="/hr/assign/trainings/:plannedTrainingID" element={<AssignTrainings />} />
        <Route path="/hr/showpersonalrec/:personID" element={<ShowPersonalRec />} />
        <Route path="/hr/personalrec" element={<Main />} />
        <Route path="/hr/showcredentails/:personID" element={<ShowAddPerson />} />


        <Route path="/hr/hiringrec" element={<PersonalRec personFormData={personFormData} setPersonFormData={setPersonFormData} />} />
        <Route path="/hr/addpersonalrec" element={<AddPerson personFormData={personFormData} setPersonFormData={setPersonFormData} />} />

        {/* Yearly Plan */}
        <Route path="/hr/giveplan" element={<Input />} />
        <Route path="/hr/yearlyplan" element={<YearlyPlan />} />
        <Route path="/hr/trainingweeks/:planId/:monthName" element={<Checked />} />
        <Route path="/hr/selectmonth/:planId" element={<Monthly />} />
        {/* Month Plan */}
        <Route path="/hr/addmonthlyplan" element={<AddPlan />} />
        {/* Trainer */}
        <Route path="/hr/addtrainer" element={<AddTrainer />} />
        <Route path="/hr/trainers" element={<Trainers />} />
        {/* --->Trainer Portal<--- */}
        <Route path="/trainer/pendingTasks" element={<PendingTasks />} />
        <Route path="/trainer/completedTasks" element={<CompletedTasks />} />
        <Route path="/trainer/traininginfo/:assignedTrainingId" element={<Info />} />
        <Route path="/trainer/trainings/:assignedTrainingId" element={<MainForTrainerPortal />} />
        {/* tech portal */}

        <Route path='/tech/adddevices' element={<AddDevices />} />
        <Route path='/tech/devices' element={<Devices />} />
        <Route path='/tech/addmachines' element={<AddMachine />} />
        <Route path='/tech/machines' element={<Machines />} />
        <Route path='/tech/mwr' element={<Table1 />} />
        <Route path='/tech/generatemwr' element={<GenerateMWR />} />
        <Route path='/tech/generatemwr2/:requestId' element={<GenerateMWR2 />} />

        <Route path='/tech/maintanancerect/:MachineId' element={<MaintananceRect />} />
        <Route path='/tech/maintanancerect2/:machineId/:dateType' element={<MaintananceRect2 />} />
        <Route path='/tech/callibrationrect/:equipmentId/:dateType/:callibrationType' element={<CallibrationRect />} />
        <Route path='/tech/callibrationrect2/:equipmentId/:dateType/:callibrationType' element={<CallibrationRect2 />} />
        <Route path='/tech/internalexternal/:equipmentId/:dateType/:callibrationType' element={<InternalExernal />} />
        <Route path='/tech/formtype/:machineId/:dateType' element={<Formtype />} />

        {/* Auditing panel routes starts here. */}

        <Route path='/auditing/auditors' element={<Auditors />}></Route>
        <Route path='/auditing/addauditor' element={<AddAuditor />}></Route>
        <Route path='/auditing/processes' element={<Processes />}></Route>
        <Route path='/auditing/addprocess' element={<AddProcess />}></Route>
        <Route path='/auditing/yearlyPlan' element={<YearlyPlanAuditing />}></Route>
        <Route path='/auditing/addyearlyplan' element={<AddAuditingYearlyPlan />}></Route>

        <Route path="/auditing/trainingweeks/:planId/:monthName" element={<AuditingChecked />} />
        <Route path="/auditing/addmonthlyplan" element={<AddPlanAuditing />} />
      </Routes>
    </>
  );
}

export default App;
