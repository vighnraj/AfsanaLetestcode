// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Bell,
//   MessageCircle,
//   UserCircle,
//   LogOut,
//   ChevronDown,
// } from "lucide-react";
// import { io } from "socket.io-client";
// import "../layout/Navbar.css";
// import BASE_URL from "../Config";

// const socket = io(`https://afsana-backend-production-0897.up.railway.app`, {
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
// });

// const Navbar = ({ toggleSidebar }) => {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);

//   const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
//   const loginName = loginDetail?.full_name;
//   const userRole = loginDetail?.role;
//   const student_id = loginDetail?.student_id || null;
//   const counselor_id = loginDetail?.counselor_id || null;
//    const staff_id = loginDetail?.staff_id || null;
//    let processor_id = loginDetail?.id && loginDetail.id !== 1 ? loginDetail.id : null;
//   const user_id = localStorage.getItem("user_id");

//   if(userRole === "staff"){
//    processor_id = staff_id;
//   }  
//   // ✅ Initial load + socket listeners
//   useEffect(() => {
//     // fetch notifications
//     socket.emit("getDashboardData", { student_id, counselor_id, processor_id, staff_id });

//     // listen for response
//     socket.on("dashboardDataResponse", (data) => {
//       if (data.success) {
//         console.log("📩 dashboardDataResponse:", data);
//         setNotifications(data.data || []);
//       }
//     });

//     // listen for broadcast update
//     socket.on("dashboardUpdated", (data) => {
//       if (
//         student_id === data.student_id ||
//         counselor_id === data.counselor_id ||
//         processor_id === data.processor_id ||
//         staff_id === data.staff_id
//       ) {
//         socket.emit("getDashboardData", {
//           student_id,
//           counselor_id,
//           processor_id,
//           staff_id
//         });
//       }
//     });

//     // listen for clear response
//     socket.on("updateDashboardResponse", (data) => {
//       console.log("📩 updateDashboardResponse received:", data);
//       if (data.success) {
//         console.log("✅ Notifications cleared successfully, refetching...");
//         socket.emit("getDashboardData", {
//           student_id,
//           counselor_id,
//           processor_id,
        
//         });
//       } else {
//         console.error("❌ Failed to clear notifications:", data);
//       }
//     });

//     return () => {
//       socket.off("dashboardDataResponse");
//       socket.off("dashboardUpdated");
//       socket.off("updateDashboardResponse");
//     };
//   }, [student_id, counselor_id, processor_id]);

//   // ✅ Clear All handler
//   const handleClearAllNotifications = () => {
//     console.log("🔔 Clear All clicked by role:", userRole);

//     if (userRole === "student" && student_id) {
//       console.log("➡️ Sending clear request for Student:", student_id);
//       socket.emit("updateDashboardNotification", {
//         student_id,
//         sNotification: "0",
//       });
//     } else if (userRole === "counselor" && counselor_id) {
//       console.log("➡️ Sending clear request for Counselor:", counselor_id);
//       socket.emit("updateDashboardNotification", {
//         counselor_id,
//         cNotification: "0",
//       });
//     } else if (userRole === "admin" && user_id) {
//       console.log("➡️ Sending clear request for Admin:", user_id);
//       socket.emit("updateDashboardNotification", {
//         user_id,
//         aNotification: "0",
//       });
//     } else if (userRole === "processors" && processor_id) {
//       console.log("➡️ Sending clear request for Processor:", processor_id);
//       socket.emit("updateDashboardNotification", {
//         processor_id,
//         pNotification: "0",
//       });
//     } else {
//       console.warn("⚠️ No matching role found for clearing notifications!");
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/");
//   };

//   const handleChat = () => {
//     navigate("/chat");
//   };

//   // ✅ Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowNotifications(false);
//       }
//     };

//     if (showNotifications) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   return (
//     <nav className="navbar bg-white fixed-top w-100 z-50">
//       <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
//         {/* Logo + Sidebar Toggle */}
//         <div
//           className="d-flex align-items-center gap-3"
//           style={{ marginTop: "-20px" }}
//         >
//           <img src="/img/logo.png" alt="Logo" height={100} />
//           <button
//             className="btn btn-light border"
//             onClick={(e) => {
//               e.stopPropagation();
//               toggleSidebar();
//             }}
//           >
//             ☰
//           </button>
//         </div>

//         {/* Right Icons */}
//         <div                   
//           className="d-flex align-items-center gap-4"
//           style={{ marginTop: "-20px" }}
//           ref={dropdownRef}
//         >
//           {/* Notifications */}
//           <div className="position-relative">
//             <Bell
//               size={22}
//               onClick={() => setShowNotifications(!showNotifications)}
//               style={{ cursor: "pointer" }}
//             />
//             {notifications.length > 0 && (
//               <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                 {notifications.length}
//               </span>
//             )}
//             {showNotifications && (
//               <div
//                 className="bg-white shadow p-3 rounded position-absolute"
//                 style={{
//                   top: "400%",
//                   transform: "translate(-50%, -50%)",
//                   width: "300px",
//                   zIndex: 1000,
//                 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <strong>Notifications</strong>
//                   <button
//                     className="btn btn-sm btn-outline-secondary"
//                     onClick={handleClearAllNotifications}
//                   >
//                     Clear All
//                   </button>
//                 </div>

//                 <ul
//                   className="list-unstyled mb-0"
//                   style={{ maxHeight: "200px", overflowY: "auto" }}
//                 >
//                   {notifications.length > 0 ? (
//                     notifications.map((item, index) => (
//                       <li key={index} className="border-bottom py-2">
//                         <div className="fw-semibold">{item.message}</div>
//                         <small className="text-muted">
//                           📅 Created:{" "}
//                           {item.created_at
//                             ? new Date(item.created_at).toLocaleDateString()
//                             : "N/A"}
//                         </small>
//                       </li>
//                     ))
//                   ) : (
//                     <li className="text-muted text-center py-2">
//                       No new notifications
//                     </li>
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* Chat Icon */}
//           <MessageCircle
//             size={22}
//             style={{ cursor: "pointer" }}
//             onClick={handleChat}
//           />

//           {/* Profile Dropdown */}
//           <div className="dropdown">
//             <div
//               className="d-flex align-items-center gap-2"
//               role="button"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               <UserCircle size={26} />
//               <span className="fw-semibold loginName">{loginName}</span>
//               <ChevronDown size={16} />
//             </div>
//             <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm">
//               <li>
//                 <Link className="dropdown-item" to="/profile">
//                   Profile
//                 </Link>
//               </li>
//               <li>
//                 <Link className="dropdown-item" to="/change-password">
//                   Change Password
//                 </Link>
//               </li>
//               <li>
//                 <hr className="dropdown-divider" />
//               </li>
//               <li>
//                 <button
//                   className="dropdown-item text-danger d-flex align-items-center gap-2"
//                   onClick={logout}
//                 >
//                   <LogOut size={16} /> Logout
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;





import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { io } from "socket.io-client";
import "../layout/Navbar.css";
import BASE_URL, { SOCKET_URL } from "../Config";

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

const Navbar = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
  const loginName = loginDetail?.full_name;
  const userRole = loginDetail?.role;
  const student_id = loginDetail?.student_id || null;
  const counselor_id = loginDetail?.counselor_id || null;
   const staff_id = loginDetail?.staff_id || null;
let processor_id = loginDetail?.id && loginDetail.id !== 135 ? loginDetail.id : null;
  const user_id = localStorage.getItem("user_id");

  if(userRole === "staff"){
   processor_id = staff_id;
  }  
  // ✅ Initial load + socket listeners
  useEffect(() => {
    // fetch notifications
    socket.emit("getDashboardData", { student_id, counselor_id, processor_id, staff_id });

    // listen for response
    socket.on("dashboardDataResponse", (data) => {
      if (data.success) {
        console.log("📩 dashboardDataResponse:", data);
        setNotifications(data.data || []);
      }
    });

    // listen for broadcast update
    socket.on("dashboardUpdated", (data) => {
      if (
        student_id === data.student_id ||
        counselor_id === data.counselor_id ||
        processor_id === data.processor_id ||
        staff_id === data.staff_id
      ) {
        socket.emit("getDashboardData", {
          student_id,
          counselor_id,
          processor_id,
          staff_id
        });
      }
    });

    // listen for clear response
    socket.on("updateDashboardResponse", (data) => {
      console.log("📩 updateDashboardResponse received:", data);
      if (data.success) {
        console.log("✅ Notifications cleared successfully, refetching...");
        socket.emit("getDashboardData", {
          student_id,
          counselor_id,
          processor_id,
        
        });
      } else {
        console.error("❌ Failed to clear notifications:", data);
      }
    });

    return () => {
      socket.off("dashboardDataResponse");
      socket.off("dashboardUpdated");
      socket.off("updateDashboardResponse");
    };
  }, [student_id, counselor_id, processor_id]);

  // ✅ Clear All handler
  const handleClearAllNotifications = () => {
    console.log("🔔 Clear All clicked by role:", userRole);

    if (userRole === "student" && student_id) {
      console.log("➡️ Sending clear request for Student:", student_id);
      socket.emit("updateDashboardNotification", {
        student_id,
        sNotification: "0",
      });
    } else if (userRole === "counselor" && counselor_id) {
      console.log("➡️ Sending clear request for Counselor:", counselor_id);
      socket.emit("updateDashboardNotification", {
        counselor_id,
        cNotification: "0",
      });
    } else if (userRole === "admin" && user_id) {
      console.log("➡️ Sending clear request for Admin:", user_id);
      socket.emit("updateDashboardNotification", {
        user_id,
        aNotification: "0",
      });
    } else if (userRole === "processors" && processor_id) {
      console.log("➡️ Sending clear request for Processor:", processor_id);
      socket.emit("updateDashboardNotification", {
        processor_id,
        pNotification: "0",
      });
    } else {
      console.warn("⚠️ No matching role found for clearing notifications!");
    }
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const handleChat = () => {
    navigate("/chat");
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <nav className="navbar bg-white fixed-top w-100 z-50">
      <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
        {/* Logo + Sidebar Toggle */}
        <div
          className="d-flex align-items-center gap-3"
          style={{ marginTop: "-20px" }}
        >
          <img src="/img/logo.png" alt="Logo" height={100} />
          <button
            className="btn btn-light border"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
          >
            ☰
          </button>
        </div>

        {/* Right Icons */}
        <div
          className="d-flex align-items-center gap-4"
          style={{ marginTop: "-20px" }}
          ref={dropdownRef}
        >
          {/* Notifications */}
          <div className="position-relative">
            <Bell
              size={22}
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: "pointer" }}
            />
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.length}
              </span>
            )}
            {showNotifications && (
              <div
                className="bg-white shadow p-3 rounded position-absolute"
                style={{
                  top: "400%",
                  transform: "translate(-50%, -50%)",
                  width: "300px",
                  zIndex: 1000,
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Notifications</strong>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleClearAllNotifications}
                  >
                    Clear All
                  </button>
                </div>

                <ul
                  className="list-unstyled mb-0"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                      <li key={index} className="border-bottom py-2">
                        <div className="fw-semibold">{item.message}</div>
                        <small className="text-muted">
                          📅 Created:{" "}
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "N/A"}
                        </small>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted text-center py-2">
                      No new notifications
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Chat Icon */}
          <MessageCircle
            size={22}
            style={{ cursor: "pointer" }}
            onClick={handleChat}
          />

          {/* Profile Dropdown */}
          <div className="dropdown">
            <div
              className="d-flex align-items-center gap-2"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <UserCircle size={26} />
              <span className="fw-semibold loginName">{loginName}</span>
              <ChevronDown size={16} />
            </div>
            <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm">
              <li>
                <Link className="dropdown-item" to="/profile">
                  Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/change-password">
                  Change Password
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={logout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
















// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Bell,
//   MessageCircle,
//   UserCircle,
//   LogOut,
//   ChevronDown
// } from "lucide-react";
// import api from "../services/axiosInterceptor";
// import "../layout/Navbar.css";

// const Navbar = ({ toggleSidebar }) => {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [userName, setUserName] = useState("User");
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);

//   const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
//   const loginName = loginDetail?.full_name;
//   const userRole = loginDetail?.role; // Assuming role is stored in login_detail

//   useEffect(() => {
//     // Initial fetch
//     fetchNotifications();

//     const interval = setInterval(() => {
//       fetchNotifications();
//     }, 7000);

//     return () => clearInterval(interval);
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await api.get(`notification`);

//       const tasks = (response.data.tasks || []).map((task) => ({
//         ...task,
//         type: "task",
//       }));

//       const inquiries = (response.data.inquiries || []).map((inquiry) => ({
//         ...inquiry,
//         type: "inquiry",
//       }));

//       // Combine all notifications initially
//       let allNotifications = [...tasks, ...inquiries];
      
//       // If user is a student, filter out inquiries
//       if (userRole === "student") {
//         allNotifications = allNotifications.filter(notification => notification.type === "task");
//       }

//       setNotifications(allNotifications);
//     } catch (error) {
//       console.log(error);
//     }
//   };


//   const handleNotificationRead = async (item) => {
//   // UI update
//   setFilteredNotifications(prev =>
//     prev.map(n =>
//       n.id === item.id ? { ...n, notification_status: "1" } : n
//     )
//   );

//   // Backend call
//   await axios.post(`${BASE_URL}/notification-read/${item.id}`);
// };

//   const handleClearAllNotifications = async () => {
//     // Separate task and inquiry IDs
//     const taskIds = notifications
//       .filter((n) => n.type === "task")
//       .map((n) => n.id);

//     const inquiryIds = notifications
//       .filter((n) => n.type === "inquiry")
//       .map((n) => n.id);

//     try {
//       await api.patch(`notifications/update-status`, {
//         taskIds,
//         inquiryIds,
//       });
//       await fetchNotifications();
//     } catch (error) {
//       console.error("Error clearing notifications:", error);
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/");
//   };

//   const handleChat = () => {
//     navigate("/chat");
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowNotifications(false);
//       }
//     };

//     if (showNotifications) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   // Filter notifications based on user role before displaying
//   const filteredNotifications = userRole === "student" 
//     ? notifications.filter(n => n.type === "task")
//     : notifications;

//   return (
//     <nav className="navbar  bg-white fixed-top w-100 z-50">
//       <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
//         {/* Logo + Sidebar Toggle */}
//         <div className="d-flex align-items-center gap-3" style={{ marginTop: "-20px" }}>
//           <img src="/img/logo.png" alt="Logo" height={100} />
//           {/* <img src="https://kiaantechnology.com/img/kt.png" alt="Logo" height={100} /> */}
//           <button
//             className="btn btn-light border"
//             onClick={(e) => {
//               e.stopPropagation();
//               toggleSidebar();
//             }}
//           >
//             ☰
//           </button>
//         </div>

//         {/* Right Icons */}
//         <div className="d-flex align-items-center gap-4" style={{ marginTop: "-20px" }} ref={dropdownRef}>
//           {/* Notifications */}
//        <div className="position-relative">
//             <Bell
//               size={22}
//               onClick={() => setShowNotifications(!showNotifications)}
//               style={{ cursor: "pointer" }}
//             />
//             {filteredNotifications.length > 0 && (
//               <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                 {filteredNotifications.length}
//               </span>
//             )}
//             {showNotifications && (
//               <div
//                 className="bg-white shadow p-3 rounded position-absolute"
//                 style={{ right: 0, top: "120%", width: "300px", zIndex: 1000 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <strong>Notifications</strong>
//                   <button
//                     className="btn btn-sm btn-outline-secondary"
//                     onClick={handleClearAllNotifications}
//                   >
//                     Clear All
//                   </button>
//                 </div>

//                 <ul
//                   className="list-unstyled mb-0"
//                   style={{ maxHeight: "200px", overflowY: "auto" }}
//                 >
//                   {filteredNotifications.filter((n) => n.notification_status === "0").length > 0 ? (
//                     <>
//                       {/* Tasks Section */}
//                       {filteredNotifications.some((n) => n.type === "task" && n.notification_status === "0") && (
//                         <li className="text-primary fw-bold pb-1">📝 Tasks</li>
//                       )}
//                       {filteredNotifications
//                         .filter((n) => n.type === "task" && n.notification_status === "0")
//                         .map((item, index) => (
//                           <li key={`task-${index}`} className="border-bottom py-2">
//                             <div className="fw-semibold">{item.title}</div>
//                             <small className="text-muted">
//                               📅 Due Date: {item.due_date ? new Date(item.due_date).toLocaleDateString() : "N/A"}
//                             </small>
//                           </li>
//                         ))}

//                       {/* Inquiries Section - Only show if user is not a student */}
//                       {userRole !== "student" && filteredNotifications.some((n) => n.type === "inquiry" && n.notification_status === "0") && (
//                         <li className="text-success fw-bold pt-3 pb-1">📩 Inquiries</li>
//                       )}
//                       {userRole !== "student" && filteredNotifications
//                         .filter((n) => n.type === "inquiry" && n.notification_status === "0")
//                         .map((item, index) => (
//                           <li key={`inq-${index}`} className="border-bottom py-2">
//                             <div className="fw-semibold">{item.full_name}</div>
//                             <div className="text-muted">📄 Type: <em>{item.inquiry_type}</em></div>
//                             <small className="text-muted">
//                               📅 Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
//                             </small>
//                           </li>
//                         ))}
//                     </>
//                   ) : (
//                     <li className="text-muted text-center py-2">No new notifications</li>
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>


//           {/* Chat Icon */}
//           <MessageCircle size={22} style={{ cursor: "pointer" }} onClick={handleChat} />

//           {/* Profile Dropdown */}
//           <div className="dropdown">
//             <div
//               className="d-flex align-items-center gap-2"
//               role="button"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               <UserCircle size={26} />
//               <span className="fw-semibold loginName">{loginName}</span>
//               <ChevronDown size={16} />
//             </div>
//             <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm">
//               <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
//               <li><Link className="dropdown-item" to="/change-password">Change Password</Link></li>
//               <li><hr className="dropdown-divider" /></li>
//               <li>
//                 <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={logout}>
//                   <LogOut size={16} /> Logout
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;




// import React, { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Bell,
//   MessageCircle,
//   UserCircle,
//   LogOut,
//   ChevronDown
// } from "lucide-react";
// import api from "../services/axiosInterceptor";
// import "../layout/Navbar.css";

// const Navbar = ({ toggleSidebar }) => {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [userName, setUserName] = useState("User");
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);

//   const loginDetail = JSON.parse(localStorage.getItem("login_detail"));
//   const loginName = loginDetail?.full_name;
//   const userRole = loginDetail?.role; // Assuming role is stored in login_detail

//   useEffect(() => {
//     // Initial fetch
//     fetchNotifications();

//     const interval = setInterval(() => {
//       fetchNotifications();
//     }, 7000);

//     return () => clearInterval(interval);
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await api.get(`notification`);

//       const tasks = (response.data.tasks || []).map((task) => ({
//         ...task,
//         type: "task",
//       }));

//       const inquiries = (response.data.inquiries || []).map((inquiry) => ({
//         ...inquiry,
//         type: "inquiry",
//       }));

//       // Combine all notifications initially
//       let allNotifications = [...tasks, ...inquiries];
      
//       // If user is a student, filter out inquiries
//       if (userRole === "student") {
//         allNotifications = allNotifications.filter(notification => notification.type === "task");
//       }

//       setNotifications(allNotifications);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleNotificationClick = async (item) => {
//     // If notification is already read, do nothing
//     if (item.notification_status === "1") return;
    
//     try {
//       // Update UI immediately for better UX
//       setNotifications(prev =>
//         prev.map(n =>
//           n.id === item.id ? { ...n, notification_status: "1" } : n
//         )
//       );
      
//       // Update backend
//       await api.post(`notification-read/${item.id}`);
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//       // Revert UI change if API call fails
//       setNotifications(prev =>
//         prev.map(n =>
//           n.id === item.id ? { ...n, notification_status: "0" } : n
//         )
//       );
//     }
//   };

//   const handleClearAllNotifications = async () => {
//     // Separate task and inquiry IDs
//     const taskIds = notifications
//       .filter((n) => n.type === "task")
//       .map((n) => n.id);

//     const inquiryIds = notifications
//       .filter((n) => n.type === "inquiry")
//       .map((n) => n.id);

//     try {
//       await api.patch(`notifications/update-status`, {
//         taskIds,
//         inquiryIds,
//       });
//       await fetchNotifications();
//     } catch (error) {
//       console.error("Error clearing notifications:", error);
//     }
//   };

//   const logout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/");
//   };

//   const handleChat = () => {
//     navigate("/chat");
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowNotifications(false);
//       }
//     };

//     if (showNotifications) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   // Filter notifications based on user role before displaying
//   const filteredNotifications = userRole === "student" 
//     ? notifications.filter(n => n.type === "task")
//     : notifications;

//   // Count unread notifications for badge
//   const unreadCount = filteredNotifications.filter(n => n.notification_status === "0").length;

//   return (
//     <nav className="navbar bg-white fixed-top w-100 z-50">
//       <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
//         {/* Logo + Sidebar Toggle */}
//         <div className="d-flex align-items-center gap-3" style={{ marginTop: "-20px" }}>
//           <img src="/img/logo.png" alt="Logo" height={100} />
//           <button
//             className="btn btn-light border"
//             onClick={(e) => {
//               e.stopPropagation();
//               toggleSidebar();
//             }}
//           >
//             ☰
//           </button>
//         </div>

//         {/* Right Icons */}
//         <div className="d-flex align-items-center gap-4" style={{ marginTop: "-20px" }} ref={dropdownRef}>
//           {/* Notifications */}
//            <div className="position-relative">
//             <Bell
//               size={22}
//               onClick={() => setShowNotifications(!showNotifications)}
//               style={{ cursor: "pointer" }}
//             />
//             {filteredNotifications.length > 0 && (
//               <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                 {filteredNotifications.length}
//               </span>
//             )}
//             {showNotifications && (
//               <div
//                 className="bg-white shadow p-3 rounded position-absolute"
//                 style={{ right: 0, top: "120%", width: "300px", zIndex: 1000 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <strong>Notifications</strong>
//                   <button
//                     className="btn btn-sm btn-outline-secondary"
//                     onClick={handleClearAllNotifications}
//                   >
//                     Clear All
//                   </button>
//                 </div>

//                 <ul
//                   className="list-unstyled mb-0"
//                   style={{ maxHeight: "200px", overflowY: "auto" }}
//                 >
//                   {filteredNotifications.filter((n) => n.notification_status === "0").length > 0 ? (
//                     <>
//                       {/* Tasks Section */}
//                       {filteredNotifications.some((n) => n.type === "task" && n.notification_status === "0") && (
//                         <li className="text-primary fw-bold pb-1">📝 Tasks</li>
//                       )}
//                       {filteredNotifications
//                         .filter((n) => n.type === "task" && n.notification_status === "0")
//                         .map((item, index) => (
//                           <li key={`task-${index}`} className="border-bottom py-2">
//                             <div className="fw-semibold">{item.title}</div>
//                             <small className="text-muted">
//                               📅 Due Date: {item.due_date ? new Date(item.due_date).toLocaleDateString() : "N/A"}
//                             </small>
//                           </li>
//                         ))}

//                       {/* Inquiries Section - Only show if user is not a student */}
//                       {userRole !== "student" && filteredNotifications.some((n) => n.type === "inquiry" && n.notification_status === "0") && (
//                         <li className="text-success fw-bold pt-3 pb-1">📩 Inquiries</li>
//                       )}
//                       {userRole !== "student" && filteredNotifications
//                         .filter((n) => n.type === "inquiry" && n.notification_status === "0")
//                         .map((item, index) => (
//                           <li key={`inq-${index}`} className="border-bottom py-2">
//                             <div className="fw-semibold">{item.full_name}</div>
//                             <div className="text-muted">📄 Type: <em>{item.inquiry_type}</em></div>
//                             <small className="text-muted">
//                               📅 Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
//                             </small>
//                           </li>
//                         ))}
//                     </>
//                   ) : (
//                     <li className="text-muted text-center py-2">No new notifications</li>
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>


//           {/* Chat Icon */}
//           <MessageCircle size={22} style={{ cursor: "pointer" }} onClick={handleChat} />

//           {/* Profile Dropdown */}
//           <div className="dropdown">
//             <div
//               className="d-flex align-items-center gap-2"
//               role="button"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               <UserCircle size={26} />
//               <span className="fw-semibold loginName">{loginName}</span>
//               <ChevronDown size={16} />
//             </div>
//             <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm">
//               <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
//               <li><Link className="dropdown-item" to="/change-password">Change Password</Link></li>
//               <li><hr className="dropdown-divider" /></li>
//               <li>
//                 <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={logout}>
//                   <LogOut size={16} /> Logout
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;