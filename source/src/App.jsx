import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import Home from "./auth/Home";
import React, { useEffect, useState } from "react";
import Login from "./auth/Login";
import Dashboard from "./components/Dashboard/Dashbord";
import ChatBox from "./components/CommunicationFollowupManagement/ChatBox";
import Contract from "./components/LeadInquiryManagement/Contract";
import Profile from "./components/Profile/Profile";
import StudentDetailsPage from "./components/Profile/StudentDetailsPage";
import Lead from "./components/LeadInquiryManagement/Lead";
import NewLead from "./components/LeadInquiryManagement/NewLead";
import Deal from "./components/LeadInquiryManagement/Deal";
import AdmissionNew from "./components/AdmissionTracking/AdmissionNew";
import ProfileDetails from "./components/Profile/ProfileDetails";
import LeadInquiryManagement from "./components/LeadInquiryManagement/LeadInquiryManagement";
import StudentDetails from "./components/Profile/StudentDetails";
import AdmissionTracking from "./components/AdmissionTracking/AdmissionTracking";
import TaskCalendarManagement from "./components/TaskCalendarManagement/TaskCalendarManagement";

import PaymentInvoiceMangament from "./components/PaymentInvoiceManagement/PaymentInvoiceManagement";
import ReportingAnalytics from "./components/ReportingAnalytics/ReportingAnalytics";
import UserRolesAccessControl from "./components/UserRolesAccessControl/UserRolesAccessControl";
import CommunicationFollowupManagement from "./components/CommunicationFollowupManagement/CommunicationFollowupManagement";
import Inquriy from "./components/LeadInquiryManagement/Inquriy";
import ApplicationTracker from "./components/AdmissionTracking/ApplicationTracker";
import DocumentUpload from "./components/AdmissionTracking/DocumentUpload";
import UniversitySubmissions from "./components/AdmissionTracking/UniversitySubmissions";
import AdmissionDecisions from "./components/AdmissionTracking/AdmissionDecisions";
import FollowUpScheduling from "./components/CommunicationFollowupManagement/FollowUpScheduling";
import AutomatedReminders from "./components/CommunicationFollowupManagement/AutomatedReminders";
import ManaDetails from "./components/Profile/ManaDetails";
import AddCounselor from "./components/TaskCalendarManagement/AddCounselor";
import TaskAssignment from "./components/TaskCalendarManagement/TaskAssignment";
import TaskReminder from "./components/TaskCalendarManagement/TaskReminder";
import RolesManagement from "./components/CourseUniversityDatabase/RolesManagement";
import PermissionsTable from "./components/CourseUniversityDatabase/permissionsData";
import CourseUniversityDatabase from "./components/CourseUniversityDatabase/CourseUniversityDatabase";
import StudentProfile from "./components/Profile/Dashboard";
import StudentUniversity from "./components/PaymentInvoiceManagement/StudentUniversity";
import Councelor from "./components/Dashboard/Councelor";

import CounselorTask from "./components/LeadInquiryManagement/CouncelorTask";
import StatusTracking from "./components/LeadInquiryManagement/StatusTracking";
import AdminStatus from "./components/LeadInquiryManagement/AdminStatus";
import { LeadProvider } from "./context/LeadContext";
import LeadCouncelor from "./components/LeadInquiryManagement/LeadCouncelor";
import UniversityCards from "./components/PaymentInvoiceManagement/UniversityCards";
import BmuUniversity from "./components/UniversityForms/BmuUniversity";
import DebrecenUniversity from "./components/UniversityForms/DebrecenUniversity";
import HunguryUniversity from "./components/UniversityForms/HunguryUniversity";
import GyorUniversity from "./components/UniversityForms/GyorUniversity";
import WekerleUiversity from "./components/UniversityForms/WekerleUniversity";
import MainStudentDetails from "./components/Profile/MainStudentDetails";
import ViewStudentProfile from "./components/AdmissionTracking/ViewStudentProfile";
import SearchPrograms from "./components/Profile/SearchPrograms";
import Payment from "./components/ReportingAnalytics/Payment";
import StudentTask from "./components/TaskCalendarManagement/StudentTask";
import Support from "./components/CommunicationFollowupManagement/Support";

import MyApplication from "./components/AdmissionTracking/MyApplication";
import CounselorApplications from "./components/AdmissionTracking/CounselorApplications";
import ApplicationTimeline from "./components/AdmissionTracking/ApplicationTimeline";
import MyProfile from "./profile/MyProfile";
import Addbranch from "./components/ReportingAnalytics/Addbranch";
import ChangePassword from "./profile/ChangePassword";
import ProtectedRoute from "./routes/ProtectedRoute";
// import chatBox from "./components/ChatSection/ChatBox"
import ChatBox2 from "./components/ChatSection/ChatBox";
import ChatHistory from "./components/ChatSection/ChatHistory";
import ChatList from "./components/ChatSection/ChatList";
import Signup from "./auth/Signup";
import InquiryForm from "./auth/InquiryForm";
import InquryTabledemo from "./demo/InquryTabledemo";
import Applicationtracking from "./components/Profile/Applicationtracking";
import CounslerStudentTable from "./components/Profile/CounslerStudentTable";
import Addstaff from "./components/TaskCalendarManagement/Addstaff";
import StaffInquiry from "./components/LeadInquiryManagement/StaffInquiry";
import Visaprocesing from "./components/AdmissionTracking/Visaprocesing";
import StaffDashboard from "./components/UniversityForms/StaffDashboard";
import Stafflead from "./components/LeadInquiryManagement/Stafflead";
import VisaProcessList from "./components/AdmissionTracking/VisaProcessingList";
import StudentDecisions from "./components/StudentDecision/StudentDewcision";
import BASE_URL from "./Config";
import DashboardVisa from "./components/AdmissionTracking/DashboardVisa";
import ProcessorsDashboard from "./components/Processors/Processors/ProcessorsDashboard";
import StudentDocument from "./components/Processors/StudentDocument/StudentDocument";
import AddProcessor from "./components/Processors/AddProvessor/AddProcessor";
import ApplicationProcessors from "./components/Processors/ApplicationProcessors";
import Chats from "./components/Rehan-chat/Chat";
import MasterAdminDashboard from "./components/MasterAdmin/MasterAdminDashboard";
import MasterTable from "./components/MasterAdmin/MasterTable";
import ChatbotMain from "./components/ChatBot/ChatBot";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import ProcessorStudentDetails from "./components/Processors/StudentDetails/StudentDetails";
import ProcessorStudentDetailsTable from "./components/ProcessorStudentDetails/ProcessorStudentDetails";
import ProcessorProfile from "./components/ProcessorStudentDetails/ProcessordetailsPage";
import CounselorProfile from "./components/CounselorDetails/CounselorProfile";
import CounselorStudentDetails from "./components/CounselorDetails/CounselorstudentDetails";
import FollowUpHistory from "./components/LeadInquiryManagement/FollowUpHistory";
import NoteHistory from "./components/LeadInquiryManagement/NoteHistory";
import { messaging, getToken, onMessage, getVapidKey } from "./services/FirebaseNotification";
import GlobalTableScrollbar from "./components/GlobalTableScrollbar/GlobalTableScrollbar";
import VisaProcesingNew from "./components/AdmissionTracking/VisaProcessingNew";
import StudentVisaProcesing from "./components/Processors/StudentVisaProcess/VisaProcessingNew";
import ProcessorDashboard from "./components/Processors/StudentVisaProcess/ProcesssorDashboard";
import StudentVisaProcessList from "./components/AdmissionTracking/StudentVisaProcessList";
import StudentInvoice from "./components/ReportingAnalytics/StudentInvoice";
import StudentInqueryForm from "./demo/StudentInqueryForm";


function App() {
  //show details to admin

  const navigate = useNavigate();
  const [login, setLogin] = useState(localStorage.getItem("login") || "");

  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("✅ Notification permission granted.");

        try {
          // 🔹 Replace with your actual VAPID key
          const vapidKey = getVapidKey();
          if (!vapidKey) {
            console.warn('⚠️ VAPID key not configured. Push notifications disabled.');
            return;
          }
          const token = await getToken(messaging, { vapidKey });

          if (token) {
            console.log("🎯 FCM Token:", token);

            // ✅ LocalStorage में set करना
            localStorage.setItem("fcm_token", token);

            // ✅ Verify
            console.log("💾 Token saved in localStorage:", localStorage.getItem("fcm_token"));
          } else {
            console.log("⚠️ No registration token available.");
          }
        } catch (error) {
          console.error("❌ An error occurred while retrieving token:", error);
        }
      } else {
        console.log("🚫 Permission denied.");
      }
    };

    requestPermission();

    // 🔹 Foreground messages
    onMessage(messaging, (payload) => {
      console.log("📩 Message received in foreground:", payload);
    });
  }, []);


  useEffect(() => {

    if (login) {
      localStorage.setItem("login", login);
    }
  }, [login]);

  // Cross-tab login/logout sync
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'authEvent') {
        const authToken = localStorage.getItem("authToken");
        const role = localStorage.getItem("role");
        if (authToken && role) {
          if (role === "admin") {
            navigate("/dashboard");
          } else if (role === "student") {
            navigate("/dashboardvisa");
          } else if (role === "counselor") {
            navigate("/councelor");
          } else if (role === "staff") {
            navigate("/staffDashboard");
          }
        } else {
          navigate("/login");
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  const [counselors, setCounselors] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Task 1",
    },
  ]);

  const handleAddCounselor = (name) => {
    setCounselors([...counselors, name]);
  };
  // console.log(counselors);

  const handleTaskAssign = (task) => {
    setTasks([...tasks, task]);
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const menusidebarcollaps = () => {
    setIsSidebarCollapsed(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };
  const location = useLocation();
  const user_id = localStorage.getItem("user_id")
  const noLayoutPaths = ["/", "/login", "/signup", "/forgotpassword", "/resetpassword","/StudentInqueryForm"];
  const hideLayout = noLayoutPaths.includes(location.pathname);
  // Detect screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>

      {/* navbar */}
      {!hideLayout && <Navbar toggleSidebar={toggleSidebar} />}
      {/* navbar end */}
      {/* sidebar start */}
      <div className={`main-content ${hideLayout ? "full-width" : ""}`}>
        {!hideLayout && (
          <Sidebar
            collapsed={isSidebarCollapsed}
            isMobile={isMobile}
            menuItemClick={menusidebarcollaps}
            login={login}
            toggleSidebar={toggleSidebar}
          />
        )}
        {/* sidebar end */}
        {/* right side  */}
        <div className={`right-side-content ${hideLayout ? "full-width" : isSidebarCollapsed ? "collapsed" : ""}`} style={hideLayout ? { marginTop: "0", paddingLeft: "0" } : {}}>
          {/* Show Chatbot for student on all pages except login/signup/home */}
          {login === "student" && !hideLayout && <ChatbotMain />}
          <LeadProvider>
            <Routes>
              {/* University Routes */}
              <Route path="/university/GyorUniversity" element={<ProtectedRoute><GyorUniversity /></ProtectedRoute>} />
              <Route path="/university/WekerleUniversity" element={<ProtectedRoute><WekerleUiversity /></ProtectedRoute>} />
              <Route path="/university/HunguryUniversity" element={<ProtectedRoute><HunguryUniversity /></ProtectedRoute>} />
              <Route path="/university/DebrecenUniversity" element={<ProtectedRoute><DebrecenUniversity /></ProtectedRoute>} />
              <Route path="/university/:id" element={<ProtectedRoute><BmuUniversity /></ProtectedRoute>} />
                            <Route path="/StudentInqueryForm" element={<StudentInqueryForm />} />


              {/* Login & Signup */}
              <Route path="/login" element={<Login login={login} setLogin={setLogin} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword" element={<ResetPassword />} />
              <Route path="/" element={<Home />} />

              {/* Protected Route for Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboardvisa" element={<ProtectedRoute><DashboardVisa /></ProtectedRoute>} />

              {/* Other Protected Routes */}
              <Route path="/councelor" element={<ProtectedRoute><Councelor /></ProtectedRoute>} />
              <Route path="/studentProfile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
              <Route path="/Searchprograms" element={<ProtectedRoute><SearchPrograms /></ProtectedRoute>} />
              <Route path="/inquiry" element={<ProtectedRoute><Inquriy /></ProtectedRoute>} />
              <Route path="/lead" element={<ProtectedRoute><Lead /></ProtectedRoute>} />
              <Route path="/lead/:id" element={<ProtectedRoute><Deal /></ProtectedRoute>} />
              <Route path="/leadCouncelor" element={<ProtectedRoute><LeadCouncelor /></ProtectedRoute>} />
              <Route path="/newLead" element={<ProtectedRoute><NewLead /></ProtectedRoute>} />
              <Route path="/councelorTask" element={<ProtectedRoute><CounselorTask /></ProtectedRoute>} />
              <Route path="/contract" element={<ProtectedRoute><Contract /></ProtectedRoute>} />
              <Route path="/status" element={<ProtectedRoute><CounselorApplications /></ProtectedRoute>} />
              <Route path="/adminstatus" element={<ProtectedRoute><AdminStatus /></ProtectedRoute>} />
              <Route path="/timeline/:applicationId" element={<ProtectedRoute><ApplicationTimeline /></ProtectedRoute>} />
              <Route path="/studentinvoice" element={<ProtectedRoute><StudentInvoice/></ProtectedRoute>} /> 
              {/* Student Management */}
              <Route path="/studentDetails" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
              <Route path="/MainStudentDetails" element={<ProtectedRoute><MainStudentDetails /></ProtectedRoute>} />
              <Route path="/manaDetails" element={<ProtectedRoute><ManaDetails /></ProtectedRoute>} />
              <Route path="/admission" element={<ProtectedRoute><AdmissionNew /></ProtectedRoute>} />
              <Route path="/new" element={<ProtectedRoute><AdmissionTracking /></ProtectedRoute>} />
              <Route path="/studentProfile/:studentId" element={<ProtectedRoute><StudentDetailsPage /></ProtectedRoute>} />
              <Route path="/student/:id" element={<ProtectedRoute><ViewStudentProfile /></ProtectedRoute>} />

              {/* Communication */}
              <Route path="/communication" element={<ProtectedRoute><CommunicationFollowupManagement /></ProtectedRoute>} />
              <Route path="/myapplication" element={<ProtectedRoute><MyApplication /></ProtectedRoute>} />
              <Route path="/ContactSupport" element={<ProtectedRoute><Support /></ProtectedRoute>} />

              {/* Application Tracking */}
              <Route path="/tracker" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />

              {/* Admission Decisions */}
              <Route path="/applications" element={<ProtectedRoute><AdmissionDecisions /></ProtectedRoute>} />
              <Route path="/AdmissionTracking" element={<ProtectedRoute><AdmissionTracking /></ProtectedRoute>} />
              <Route path="/studentDecision" element={<ProtectedRoute><StudentDecisions /></ProtectedRoute>} />

              {/* Follow Up */}
              <Route path="/followup" element={<ProtectedRoute><FollowUpScheduling /></ProtectedRoute>} />
              <Route path="/follow-up-history/:id" element={<FollowUpHistory />} />
              <Route path="/note-history/:id" element={<NoteHistory />} />

              {/* Automated Reminders */}
              <Route path="/reminder" element={<ProtectedRoute><AutomatedReminders /></ProtectedRoute>} />

              {/* Add Counselor */}
              <Route path="/addcounselor" element={<ProtectedRoute><AddCounselor onAdd={handleAddCounselor} /></ProtectedRoute>} />

              {/* Tasks */}
              <Route path="/tasks" element={<ProtectedRoute><TaskAssignment counselors={counselors} tasks={tasks} onTaskAssign={handleTaskAssign} /></ProtectedRoute>} />
              <Route path="/tasksreminder" element={<ProtectedRoute><TaskReminder tasks={tasks} /></ProtectedRoute>} />
              <Route path="/studenttasks" element={<ProtectedRoute><StudentTask /></ProtectedRoute>} />

              {/* Roles Permissions */}
              <Route path="/RolesManagement" element={<ProtectedRoute><RolesManagement /></ProtectedRoute>} />
              <Route path="/permissions/:role" element={<ProtectedRoute><PermissionsTable /></ProtectedRoute>} />

              {/* Reports & Analytics */}
              <Route path="/CourseUniversityDatabase" element={<ProtectedRoute><CourseUniversityDatabase /></ProtectedRoute>} />
              <Route path="/ReportingAnalytics" element={<ProtectedRoute><ReportingAnalytics /></ProtectedRoute>} />

              {/* Payment & Invoices */}
              <Route path="/addbranch" element={<ProtectedRoute><Addbranch /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/UniversityCards" element={<ProtectedRoute><UniversityCards /></ProtectedRoute>} />
              <Route path="/PaymentInvoiceManagement" element={<ProtectedRoute><PaymentInvoiceMangament /></ProtectedRoute>} />

              {/* Chatbox Route */}
              <Route path="/chatbox" element={<ProtectedRoute><ChatBox /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              {/* <Route path="/chat" element={<ProtectedRoute><ChatBox2/></ProtectedRoute>} />
             <Route path="/chatHistory" element={<ProtectedRoute><ChatBox2/></ProtectedRoute>} /> */}
              <Route path="/chat/:receiverId" element={<ChatBox2 userId={user_id} />} />
              <Route path="/chatHistory" element={<ChatHistory userId={user_id} />} />
              <Route path="/chatList" element={<ChatList userId={user_id} />} />
              <Route path="/chat" element={<Chats />} />
              <Route path="/chatbot" element={<ChatbotMain />} />

              {/* <Route path="/inquirydemo" element={<Inquirydemo/>} /> */}
              <Route path="/inquryTabledemo" element={<InquryTabledemo />} />
              <Route path="/applicationtracking" element={<Applicationtracking />} />
              <Route path="/counslerStudentTable" element={<CounslerStudentTable />} />
              <Route path="/addStaff" element={<Addstaff />} />
              {/* <Route path="/staffInquiry" element={<StaffInquiry />} /> */}
              <Route path="/staffInquiry" element={<Inquriy />} />
              {/* <Route path="/visaprocesing" element={<Visaprocesing />} /> */}
              <Route path="/visaprocesing" element={<VisaProcesingNew />} />

              <Route path="/processorStudent" element={<ProcessorDashboard />} />
              <Route path="/studentvisaprocesing" element={<StudentVisaProcesing />} />
              <Route path="/visaprocesinglist" element={<VisaProcessList />} />
              <Route path="/studentvisaprocesinglist" element={<StudentVisaProcessList />} />
              <Route path="/staffDashboard" element={<StaffDashboard />} />
              <Route path="/stafflead" element={<Stafflead />} />

              <Route path="/processorsDashboard" element={<ProcessorsDashboard />} />
              <Route path="/processorsDocument" element={<StudentDocument />} />
              <Route path="/addProcessor" element={<AddProcessor />} />
              <Route path="/applicationProcessor" element={<ApplicationProcessors />} />

              <Route path="/masterDashboard" element={<MasterAdminDashboard />} />
              <Route path="/masterTable" element={<MasterTable />} />
              <Route path="/processordetails" element={<ProcessorStudentDetails />} />
              <Route path="/processorDetailsTable/:id" element={<ProcessorProfile />} />
              <Route path="/counselorDetailsTable" element={<CounselorStudentDetails />} />
              <Route path="/counselorDetailsTable/:id" element={<CounselorProfile />} />
            </Routes>
          </LeadProvider>
        </div>
        {/* right end  */}
      </div>
    </>
  );
}

export default App;
