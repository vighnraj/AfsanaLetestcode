
// // // CounselorDashboard.js
// // import React, { useState, useEffect } from "react";
// // import {
// //   FaUsers,
// //   FaUserGraduate,
// //   FaUniversity,
// //   FaTasks,
// //   FaReply,
// //   FaChartLine,
// // } from "react-icons/fa";
// // import Chart from "chart.js/auto";
// // import { Bar } from "react-chartjs-2";
// // import api from "../../services/axiosInterceptor";
// // import BASE_URL from "../../Config";


// // const CounselorDashboard = () => {
// //   const [filters, setFilters] = useState({});
// //   const [metrics, setMetrics] = useState({
// //     leads: 2,
// //     students: 7,
// //     universities: 6,
// //     tasks: 2,
// //     followups: 9,
// //     followupsDue: 12,
// //   });



// //   const counselor_idmain = localStorage.getItem("counselor_id")
// //   //   // Get dashboard data

// //   useEffect(() => {
// //     const allData = async () => {
// //       try {
// //         const dashData = await api.get(`${BASE_URL}getCounselorDashboardData?counselor_id=${counselor_idmain}`);
// //         const data = dashData.data;
// // console.log("datat", data)
// //         // Handle object or array
// //         if (Array.isArray(data)) {
// //           setDashboardData(data);
// //         } else {
// //           setDashboardData([data]); // Convert object to array
// //         }

// //         if (data?.leads) {
// //           setLeads(data.leads); // assuming leads are in response
// //         }

// //       } catch (error) {
// //         console.log("Dashboard fetch error", error);
// //       }
// //     };

// //     allData();
// //   }, []);

// //   const followupEfficiency = ((metrics.followups / metrics.followupsDue) * 100).toFixed(2);
// //   const conversionRate = ((metrics.students / metrics.leads) * 100).toFixed(2);

// //   const dummyLeads = [
// //     { name: "John Doe", country: "India", intake: "Fall 2025", status: "Lead", followup: "2025-06-20" },
// //   ];
// //   const dummyApplications = [
// //     { name: "Jane Smith", university: "ABC Univ", stage: "Offer", assigned: "2025-06-18" },
// //   ];
// //   const dummyFollowups = [

// //     { type: "Call", date: "2025-06-20", remarks: "Interested", status: "Done" },
// //   ];
// //   const dummyTasks = [
// //     { name: "Follow up with Rahul", due: "2025-06-26", status: "Pending" },
// //   ];

// //   const funnelData = {
// //     labels: ["Inquiries", "Leads", "Students", "Applicants"],
// //     datasets: [
// //       {
// //         label: "Count",
// //         data: [7, metrics.leads, metrics.students, 5],
// //         backgroundColor: "#5a67d8",
// //       },
// //     ],
// //   };

// //   return (
// //     <div className="cd-wrapper">
// //       {/* Filters */}
// //       <div className="cd-filters full-width">
// //         <select className="cd-select"><option>Date Range</option></select>
// //         <select className="cd-select"><option>Country</option></select>
// //         <select className="cd-select"><option>Status</option></select>
// //         <select className="cd-select"><option>Intake</option></select>
// //         <button className="cd-reset">Reset Filters</button>
// //       </div>

// //       {/* KPI Cards */}
// //       <div className="cd-kpis">
// //         <div className="cd-kpi-card"><FaUsers /><p>Total Leads</p><h2>{metrics.leads}</h2></div>
// //         <div className="cd-kpi-card"><FaUserGraduate /><p>Total Students</p><h2>{metrics.students}</h2></div>
// //         <div className="cd-kpi-card"><FaUniversity /><p>Total Universities</p><h2>{metrics.universities}</h2></div>
// //         <div className="cd-kpi-card"><FaTasks /><p>Total Tasks</p><h2>{metrics.tasks}</h2></div>
// //         <div className="cd-kpi-card"><FaReply /><p>Total Follow-ups</p><h2>{metrics.followups}</h2></div>
// //         <div className="cd-kpi-card efficiency-box">
// //           <FaChartLine />
// //           <p>Efficiency</p>
// //           <h2>Follow-up: {followupEfficiency}%</h2>
// //           <h2>Conversion: {conversionRate}%</h2>
// //         </div>
// //       </div>

// //       {/* Conversion Funnel & Performance */}
// //       <div className="cd-charts">
// //         <div className="cd-chart-box">
// //           <h4>Conversion Funnel</h4>
// //           <Bar data={funnelData} />
// //         </div>
// //         <div className="cd-chart-box">
// //           <h4>Follow-up Gaps</h4>
// //           <ul>
// //             <li>2 leads not followed up in 7+ days</li>
// //           </ul>
// //         </div>
// //         <div className="cd-chart-box">
// //           <h4>Performance Tips</h4>
// //           <ul>
// //             <li>3 leads not contacted in 10 days</li>
// //           </ul>
// //         </div>
// //       </div>

// //       {/* Data Tables */}
// //       <div className="cd-tables">
// //         <h4>Recent Leads</h4>
// //         <div className="cd-table-box">
// //           <table className="cd-table">
// //             <thead><tr><th>Name</th><th>Country</th><th>Intake</th><th>Status</th><th>Last Follow-up</th></tr></thead>
// //             <tbody>
// //               {dummyLeads.map((lead, i) => (
// //                 <tr key={i}><td>{lead.name}</td><td>{lead.country}</td><td>{lead.intake}</td><td>{lead.status}</td><td>{lead.followup}</td></tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         <h4>Student Application List</h4>
// //         <div className="cd-table-box">
// //           <table className="cd-table">
// //             <thead><tr><th>Name</th><th>University</th><th>Stage</th><th>Assigned Date</th></tr></thead>
// //             <tbody>
// //               {dummyApplications.map((app, i) => (
// //                 <tr key={i}><td>{app.name}</td><td>{app.university}</td><td>{app.stage}</td><td>{app.assigned}</td></tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         <h4>Follow-up Table</h4>
// //         <div className="cd-table-box">
// //           <table className="cd-table">
// //             <thead><tr><th>Type</th><th>Date</th><th>Remarks</th><th>Status</th></tr></thead>
// //             <tbody>
// //               {dummyFollowups.map((f, i) => (
// //                 <tr key={i}><td>{f.type}</td><td>{f.date}</td><td>{f.remarks}</td><td>{f.status}</td></tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         <h4>Upcoming Tasks</h4>
// //         <div className="cd-table-box">
// //           <table className="cd-table">
// //             <thead><tr><th>Name</th><th>Due Date</th><th>Status</th></tr></thead>
// //             <tbody>
// //               {dummyTasks.map((t, i) => (
// //                 <tr key={i}><td>{t.name}</td><td>{t.due}</td><td>{t.status}</td></tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CounselorDashboard;









// import React, { useState, useEffect } from "react";
// import {
//   FaUsers,
//   FaUserGraduate,
//   FaUniversity,
//   FaTasks,
//   FaReply,
//   FaChartLine,
// } from "react-icons/fa";
// import Chart from "chart.js/auto";
// import { Bar } from "react-chartjs-2";
// import axios from "axios";
// import api from "../../services/axiosInterceptor";

// const CounselorDashboard = () => {
//   const [metrics, setMetrics] = useState({
//     leads: 0,
//     students: 0,
//     universities: 0,
//     tasks: 0,
//     followups: 9,         // Static fallback
//     followupsDue: 12,     // Static fallback
//     inquiries: 0,
//     applications: 0,
//   });

//   const [recentLeads, setRecentLeads] = useState([]);
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true); // Start with loading true
  
//   // State for filters
//   const [filters, setFilters] = useState({
//     dateRange: "",
//     country: "",
//     status: "",
//     intake: ""
//   });

//   const counselor_id = localStorage.getItem("counselor_id");

//   // Function to fetch dashboard data with filters
//   const fetchDashboardData = async () => {
//     if (!counselor_id) return;
    
//     setLoading(true);
    
//     try {
//       // Build query string from filters
//       const queryParams = new URLSearchParams();
//       queryParams.append('counselor_id', counselor_id);
      
//       if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
//       if (filters.country) queryParams.append('country', filters.country);
//       if (filters.status) queryParams.append('status', filters.status);
//       if (filters.intake) queryParams.append('intake', filters.intake);
      
//       const response = await api.get(`getCounselorDashboardData?${queryParams.toString()}`);
//       const data = response.data;
      
//       console.log("API Response:", data); // Log the full response for debugging
      
//       // Update metrics
//       const kpi = data.kpi || {};
//       setMetrics({
//         leads: kpi.totalLeads || 0,
//         students: kpi.totalStudents || 0,
//         universities: kpi.totalUniversities || 0,
//         tasks: kpi.totalTasks || 0,
//         followups: kpi.totalFollowups || 9,
//         followupsDue: kpi.totalFollowupsDue || 12,
//         inquiries: kpi.inquiries || 0,
//         applications: kpi.applications || 0,
//       });

//       // Update tables data - fix the property name to match API response
//       console.log("Setting recentLeads:", data.recentLeads);
//       // Fixed: Added fallback empty array
//       setRecentLeads(data.recentLeads || []);
      
//       // Fixed: Added fallback empty array
//       setApplications(data.studentApplications || []);
      
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial data fetch
//   useEffect(() => {
//     fetchDashboardData();
//   }, [counselor_id]);

//   // Handle filter changes
//   const handleFilterChange = (filterName, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterName]: value
//     }));
//   };

//   // Apply filters when they change
//   useEffect(() => {
//     fetchDashboardData();
//   }, [filters]);

//   // Reset all filters
//   const resetFilters = () => {
//     setFilters({
//       dateRange: "",
//       country: "",
//       status: "",
//       intake: ""
//     });
//   };

//   // Apply filters manually (if needed)
//   const applyFilters = () => {
//     fetchDashboardData();
//   };

//   const followupEfficiency = ((metrics.followups / metrics.followupsDue) * 100).toFixed(2);
//   const conversionRate = ((metrics.leads > 0 ? metrics.students / metrics.leads : 0) * 100).toFixed(2);

//   const funnelData = {
//     labels: ["Inquiries", "Leads", "Students", "Applicants"],
//     datasets: [
//       {
//         label: "Count",
//         data: [metrics.inquiries, metrics.leads, metrics.students, metrics.applications],
//         backgroundColor: "#5a67d8",
//       },
//     ],
//   };

//   // Helper function to check if a date is within a range
//   const isDateInRange = (dateString, range) => {
//     if (!dateString) return false;
    
//     const date = new Date(dateString);
//     const today = new Date();
    
//     // Normalize dates to midnight for comparison
//     today.setHours(0, 0, 0, 0);
//     const normalizedDate = new Date(date);
//     normalizedDate.setHours(0, 0, 0, 0);
    
//     switch(range) {
//       case "Today":
//         return normalizedDate.getTime() === today.getTime();
        
//       case "ThisWeek":
//         // Get current day of week (0 = Sunday, 1 = Monday, etc.)
//         const dayOfWeek = today.getDay();
//         // Calculate start of week (Sunday)
//         const weekStart = new Date(today);
//         weekStart.setDate(today.getDate() - dayOfWeek);
//         weekStart.setHours(0, 0, 0, 0);
//         // Calculate end of week (Saturday)
//         const weekEnd = new Date(weekStart);
//         weekEnd.setDate(weekStart.getDate() + 6);
//         weekEnd.setHours(23, 59, 59, 999);
        
//         return normalizedDate >= weekStart && normalizedDate <= weekEnd;
        
//       case "ThisMonth":
//         return normalizedDate.getMonth() === today.getMonth() && 
//                normalizedDate.getFullYear() === today.getFullYear();
               
//       case "ThisYear":
//         return normalizedDate.getFullYear() === today.getFullYear();
        
//       default:
//         return true;
//     }
//   };

//   // Client-side filtering for recent leads
//   const filteredRecentLeads = recentLeads.filter(lead => {
    
//     // Country filter
//     if (filters.country && lead.country !== filters.country) {
   
//       return false;
//     }
    
//     // Status filter
//     if (filters.status) {
//       const leadStatus = lead.status ? lead.status.toString().toLowerCase() : "";
//       const filterStatus = filters.status.toString().toLowerCase();
      
//       if (!leadStatus.includes(filterStatus) && !filterStatus.includes(leadStatus)) {
     
//         return false;
//       }
//     }
    
//     // Intake filter
//     if (filters.intake) {
//       const leadIntake = lead.intake ? lead.intake.toString().toLowerCase() : "";
//       const filterIntake = filters.intake.toString().toLowerCase();
      
//       if (!leadIntake.includes(filterIntake) && !filterIntake.includes(leadIntake)) {
     
//         return false;
//       }
//     }
    
//     // Date range filtering
//     if (filters.dateRange) {
//       const isInRange = isDateInRange(lead.last_follow_up, filters.dateRange);
    
//       return isInRange;
//     }
    
//     return true;
//   });

//   // Client-side filtering for applications
//   const filteredApplications = applications.filter(app => {
 
    
//     // Country filter
//     if (filters.country && app.country !== filters.country) {

//       return false;
//     }
    
//     // Intake filter
//     if (filters.intake) {
//       const appIntake = app.intake ? app.intake.toString().toLowerCase() : "";
//       const filterIntake = filters.intake.toString().toLowerCase();
      
//       if (!appIntake.includes(filterIntake) && !filterIntake.includes(appIntake)) {
     
//         return false;
//       }
//     }
    
//     // Date range filtering
//     if (filters.dateRange) {
//       const isInRange = isDateInRange(app.assigned_date, filters.dateRange);
   
//       return isInRange;
//     }
    
//     return true;
//   });


//   return (
//     <div className="cd-wrapper">
//       {/* Full-screen loader */}
//       {loading && (
//         <div className="fullscreen-loader">
//           <div className="loader-container">
//             <div className="spinner"></div>
//             <p>Loading dashboard data...</p>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="cd-filters full-width">
//         {/* Date Range */}
//         <select 
//           className="cd-select"
//           value={filters.dateRange}
//           onChange={(e) => handleFilterChange('dateRange', e.target.value)}
//         >
//           <option value="">Date Range</option>
//           <option value="Today">Today</option>
//           <option value="ThisWeek">This Week</option>
//           <option value="ThisMonth">This Month</option>
//           <option value="ThisYear">This Year</option>
//         </select>

//         {/* Country */}
//         <select 
//           className="cd-select"
//           value={filters.country}
//           onChange={(e) => handleFilterChange('country', e.target.value)}
//         >
//          <option>Select Country</option>
//           <option>Hungary</option>
//           <option>UK</option>
//           <option>Cyprus</option>
//           <option>Canada</option>
//           <option>Malaysia</option>
//           <option>Lithuania</option>
//           <option>Latvia</option>
//           <option>Germany</option>
//           <option>New Zealand</option>
//           <option>Estonia</option>
//           <option>Australia</option>
//           <option>South Korea</option>
//           <option>Georgia</option>
//           <option>Denmark</option>
//           <option>Netherlands</option>
//           <option>Sweden</option>
//           <option>Norway</option>
//           <option>Belgium</option>
//           <option>Romania</option>
//           <option>Russia</option>
//           <option>Turkey</option>
//           <option>Ireland</option>
//           <option>USA</option>
//           <option>Portugal</option>
//           <option>Others</option>
//         </select>

//         {/* Status */}
//         <select 
//           className="cd-select"
//           value={filters.status}
//           onChange={(e) => handleFilterChange('status', e.target.value)}
//         >
//           <option value="">Status</option>
//           <option value="New">New</option>
//           <option value="In Review">In Review</option>
//           <option value="Converted to lead">Converted to lead</option>
//           <option value="Not Interested">Not Interested</option>
//           <option value="Converted to student">Converted to student</option>
//         </select>

//         {/* Intake */}
//         <select 
//           className="cd-select"
//           value={filters.intake}
//           onChange={(e) => handleFilterChange('intake', e.target.value)}
//         >
//           <option value="">Intake</option>
//           <option value="February">February</option>
//           <option value="September">September</option>
//           <option value="Other">Other</option>
//         </select>

//         <button className="cd-reset" onClick={resetFilters}>Reset Filters</button>
//         <button className="cd-apply" onClick={applyFilters}>Apply Filters</button>
//       </div>

//       {/* KPI Cards */}
//       <div className="cd-kpis">
//         <div className="cd-kpi-card"><FaUsers /><p>Total Leads</p><h2>{metrics.leads}</h2></div>
//         <div className="cd-kpi-card"><FaUserGraduate /><p>Total Students</p><h2>{metrics.students}</h2></div>
//         <div className="cd-kpi-card"><FaTasks /><p>Total Tasks</p><h2>{metrics.tasks}</h2></div>
//         <div className="cd-kpi-card"><FaReply /><p>Total Follow-ups</p><h2>{metrics.followups}</h2></div>
//       </div>

//       <div className="cd-kpi-card efficiency-box">
//         <FaChartLine />
//         <p>Efficiency</p>
//         <h2>Follow-up: {followupEfficiency}%</h2>
//         <h2>Conversion: {conversionRate}%</h2>
//       </div>

//       {/* Tables */}
//       <div className="cd-tables">
//         <h4>Recent Leads</h4>
//         <div className="cd-table-box">
//           <table className="cd-table">
//             <thead><tr><th>Name</th><th>Country</th><th>Intake</th><th>Status</th><th>Last Follow-up</th></tr></thead>
//             <tbody>
//               {recentLeads.length > 0 ? (
//                 recentLeads.map((lead, i) => (
//                   <tr key={i}>
//                     <td>{lead.name}</td>
//                     <td>{lead.country}</td>
//                     <td>{lead.intake || "-"}</td>
//                     <td>{lead.status}</td>
//                     <td>{lead.last_follow_up ? new Date(lead.last_follow_up).toLocaleDateString() : "-"}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="no-data">No leads found with the selected filters</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <h4>Student Application List</h4>
//         <div className="cd-table-box">
//           <table className="cd-table">
//             <thead><tr><th>Name</th><th>Email</th><th>University Name</th></tr></thead>
//             <tbody>
//               {applications.length > 0 ? (
//                 applications.map((app, i) => (
//                   <tr key={i}>
//                     <td>{app?.full_name}</td>
//                     <td>{app.email}</td>
//                     <td>{app?.university_name}</td>
                  
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="no-data">No applications found with the selected filters</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Loader Styles */}
//       <style jsx global>{`
//         .fullscreen-loader {
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background-color: rgba(255, 255, 255, 0.95);
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           z-index: 9999;
//         }
        
//         .loader-container {
//           text-align: center;
//         }
        
//         .spinner {
//           border: 5px solid rgba(90, 103, 216, 0.2);
//           border-radius: 50%;
//           border-top: 5px solid #5a67d8;
//           width: 50px;
//           height: 50px;
//           animation: spin 1s linear infinite;
//           margin: 0 auto 15px;
//         }
        
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         .cd-wrapper {
//           padding: 20px;
//           max-width: 1200px;
//           margin: 0 auto;
//         }
        
//         .cd-filters {
//           display: flex;
//           gap: 10px;
//           margin-bottom: 20px;
//           flex-wrap: wrap;
//           align-items: center;
//           position: relative; /* Add this */
//         }
        
//         .date-range-container {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background-color: white;
//           border: 1px solid #ccc;
//           border-radius: 4px;
//           padding: 8px 12px;
//           z-index: 1; /* Add this */
//         }
        
//         .cd-select {
//           padding: 8px 12px;
//           border: 1px solid #ccc;
//           border-radius: 4px;
//           background-color: white;
//           min-width: 150px;
//           position: relative; /* Add this */
//           z-index: 0; /* Add this */
//         }
        
//         .cd-date-input {
//           border: 1px solid #ccc;
//           border-radius: 4px;
//           outline: none;
//           padding: 4px 8px;
//           font-size: 14px;
//           width: 130px; /* Add fixed width */
//         }
        
//         .date-range-container label {
//           font-size: 14px;
//           color: #555;
//           white-space: nowrap; /* Prevent label from wrapping */
//         }
        
//         .cd-reset, .cd-apply {
//           padding: 8px 16px;
//           border: none;
//           border-radius: 4px;
//           cursor: pointer;
//           font-weight: bold;
//         }
        
//         .cd-reset {
//           background-color: #f0f0f0;
//           color: #333;
//         }
        
//         .cd-apply {
//           background-color: #5a67d8;
//           color: white;
//         }
        
//         .cd-kpis {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 20px;
//           margin-bottom: 20px;
//         }
        
//         .cd-kpi-card {
//           background-color: white;
//           border-radius: 8px;
//           padding: 20px;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           text-align: center;
//         }
        
//         .cd-kpi-card svg {
//           font-size: 24px;
//           color: #5a67d8;
//           margin-bottom: 10px;
//         }
        
//         .efficiency-box {
//           grid-column: span 2;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }
        
//         .efficiency-box svg {
//           font-size: 24px;
//           color: #5a67d8;
//           margin-bottom: 10px;
//         }
        
//         .cd-tables {
//           margin-top: 30px;
//         }
        
//         .cd-table-box {
//           overflow-x: auto;
//           margin-bottom: 30px;
//         }
        
//         .cd-table {
//           width: 100%;
//           border-collapse: collapse;
//           background-color: white;
//           border-radius: 8px;
//           overflow: hidden;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
        
//         .cd-table th {
//           background-color: #5a67d8;
//           color: white;
//           padding: 12px 15px;
//           text-align: left;
//         }
        
//         .cd-table td {
//           padding: 12px 15px;
//           border-bottom: 1px solid #eee;
//         }
        
//         .cd-table tr:last-child td {
//           border-bottom: none;
//         }
        
//         .no-data {
//           text-align: center;
//           color: #666;
//           font-style: italic;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CounselorDashboard;




import React, { useState, useEffect, useMemo } from "react";
import {
  FaUsers,
  FaUserGraduate,
  FaUniversity,
  FaTasks,
  FaReply,
  FaChartLine,
} from "react-icons/fa";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import api from "../../services/axiosInterceptor";

const CounselorDashboard = () => {
  const [allRecentLeads, setAllRecentLeads] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    country: "",
    status: "",
    intake: ""
  });

  const counselor_id = localStorage.getItem("counselor_id");

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    if (!counselor_id) return;
    
    setLoading(true);
    
    try {
      const response = await api.get(`getCounselorDashboardData?counselor_id=${counselor_id}`);
      const data = response.data;
      
      console.log("API Response:", data);
      
      // Store all data for client-side filtering
      setAllRecentLeads(data.recentLeads || []);
      setAllApplications(data.studentApplications || []);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [counselor_id]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      country: "",
      status: "",
      intake: ""
    });
  };

  // Apply filters - this will trigger client-side filtering
  const applyFilters = () => {
    // We don't need to call API again, just trigger re-render
    // The useMemo hooks below will handle the filtering
  };

  // Helper function to check if a date is within a custom range
  const isDateInCustomRange = (dateString, fromDate, toDate) => {
    if (!dateString) return true;
    if (!fromDate && !toDate) return true;
    
    const date = new Date(dateString);
    
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (date < from) return false;
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
    
    return true;
  };

  // Client-side filtering for recent leads
  const filteredRecentLeads = useMemo(() => {
    return allRecentLeads.filter(lead => {
      // Country filter
      if (filters.country && lead.country !== filters.country) {
        return false;
      }
      
      // Status filter
      if (filters.status) {
        const leadStatus = lead.status ? lead.status.toString().toLowerCase() : "";
        const filterStatus = filters.status.toString().toLowerCase();
        
        if (!leadStatus.includes(filterStatus) && !filterStatus.includes(leadStatus)) {
          return false;
        }
      }
      
      // Intake filter
      if (filters.intake) {
        const leadIntake = lead.intake ? lead.intake.toString().toLowerCase() : "";
        const filterIntake = filters.intake.toString().toLowerCase();
        
        if (!leadIntake.includes(filterIntake) && !filterIntake.includes(leadIntake)) {
          return false;
        }
      }
      
      // Custom date range filtering
      if (filters.fromDate || filters.toDate) {
        const inRange = isDateInCustomRange(lead.last_follow_up, filters.fromDate, filters.toDate);
        if (!inRange) return false;
      }
      
      return true;
    });
  }, [allRecentLeads, filters]);

  // Client-side filtering for applications
  const filteredApplications = useMemo(() => {
    return allApplications.filter(app => {
      // Country filter
      if (filters.country && app.country !== filters.country) {
        return false;
      }
      
      // Intake filter
      if (filters.intake) {
        const appIntake = app.intake ? app.intake.toString().toLowerCase() : "";
        const filterIntake = filters.intake.toString().toLowerCase();
        
        if (!appIntake.includes(filterIntake) && !filterIntake.includes(appIntake)) {
          return false;
        }
      }
      
      // Custom date range filtering
      if (filters.fromDate || filters.toDate) {
        const inRange = isDateInCustomRange(app.assigned_date, filters.fromDate, filters.toDate);
        if (!inRange) return false;
      }
      
      return true;
    });
  }, [allApplications, filters]);

  // Calculate metrics from filtered data
  const metrics = useMemo(() => {
    const leads = filteredRecentLeads.length;
    const students = filteredApplications.length;
    
    // Calculate tasks and followups from filtered data
    const tasks = filteredRecentLeads.filter(lead => lead.status === "Pending").length;
    const followups = filteredRecentLeads.filter(lead => lead.last_follow_up).length;
    
    // Calculate followups due (leads not followed up in 7+ days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const followupsDue = filteredRecentLeads.filter(lead => {
      if (!lead.last_follow_up) return true; // No follow up at all
      const lastFollowUp = new Date(lead.last_follow_up);
      return lastFollowUp < sevenDaysAgo;
    }).length;
    
    // Calculate inquiries and applications
    const inquiries = filteredRecentLeads.filter(lead => lead.status === "New").length;
    const applications = filteredApplications.length;
    
    return {
      leads,
      students,
      universities: 0, // Not available in filtered data
      tasks,
      followups,
      followupsDue,
      inquiries,
      applications
    };
  }, [filteredRecentLeads, filteredApplications]);

  const followupEfficiency = ((metrics.followups / (metrics.followups + metrics.followupsDue)) * 100).toFixed(2);
  const conversionRate = ((metrics.leads > 0 ? metrics.students / metrics.leads : 0) * 100).toFixed(2);

  const funnelData = {
    labels: ["Inquiries", "Leads", "Students", "Applicants"],
    datasets: [
      {
        label: "Count",
        data: [metrics.inquiries, metrics.leads, metrics.students, metrics.applications],
        backgroundColor: "#5a67d8",
      },
    ],
  };

  return (
    <div className="cd-wrapper">
      {/* Full-screen loader */}
      {loading && (
        <div className="fullscreen-loader">
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="cd-filters ">
        {/* Custom Date Range */}
        <div className="date-range-container">
          <label>From:</label>
          <input 
            type="date" 
            className="cd-date-input"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
          />
          <label>To:</label>
          <input 
            type="date" 
            className="cd-date-input"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
          />
        </div>

        {/* Country */}
        <select 
          className="cd-select"
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
        >
          <option value="">Select Country</option>
          <option>Hungary</option>
          <option>UK</option>
          <option>Cyprus</option>
          <option>Canada</option>
          <option>Malaysia</option>
          <option>Lithuania</option>
          <option>Latvia</option>
          <option>Germany</option>
          <option>New Zealand</option>
          <option>Estonia</option>
          <option>Australia</option>
          <option>South Korea</option>
          <option>Georgia</option>
          <option>Denmark</option>
          <option>Netherlands</option>
          <option>Sweden</option>
          <option>Norway</option>
          <option>Belgium</option>
          <option>Romania</option>
          <option>Russia</option>
          <option>Turkey</option>
          <option>Ireland</option>
          <option>USA</option>
          <option>Portugal</option>
          <option>Others</option>
        </select>

        {/* Status */}
        <select 
          className="cd-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Status</option>
          <option value="New">New</option>
          <option value="In Review">In Review</option>
          <option value="Converted to lead">Converted to lead</option>
          <option value="Not Interested">Not Interested</option>
          <option value="Converted to student">Converted to student</option>
        </select>

        {/* Intake */}
        <select 
          className="cd-select"
          value={filters.intake}
          onChange={(e) => handleFilterChange('intake', e.target.value)}
        >
          <option value="">Intake</option>
          <option value="February">February</option>
          <option value="September">September</option>
          <option value="Other">Other</option>
        </select>

        <button className="cd-reset" onClick={resetFilters}>Reset Filters</button>
        <button className="cd-apply" onClick={applyFilters}>Apply Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="cd-kpis">
        <div className="cd-kpi-card"><FaUsers /><p>Total Leads</p><h2>{metrics.leads}</h2></div>
        <div className="cd-kpi-card"><FaUserGraduate /><p>Total Students</p><h2>{metrics.students}</h2></div>
        <div className="cd-kpi-card"><FaTasks /><p>Total Tasks</p><h2>{metrics.tasks}</h2></div>
        <div className="cd-kpi-card"><FaReply /><p>Total Follow-ups</p><h2>{metrics.followups}</h2></div>
      </div>

      <div className="cd-kpi-card efficiency-box">
        <FaChartLine />
        <p>Efficiency</p>
        <h2>Follow-up: {followupEfficiency}%</h2>
        <h2>Conversion: {conversionRate}%</h2>
      </div>

      {/* Tables */}
      <div className="cd-tables">
        <h4>Recent Leads</h4>
        <div className="cd-table-box">
          <table className="cd-table">
            <thead><tr><th>Name</th><th>Country</th><th>Intake</th><th>Status</th><th>Last Follow-up</th></tr></thead>
            <tbody>
              {filteredRecentLeads.length > 0 ? (
                filteredRecentLeads.map((lead, i) => (
                  <tr key={i}>
                    <td>{lead.name}</td>
                    <td>{lead.country}</td>
                    <td>{lead.intake || "-"}</td>
                    <td>{lead.status}</td>
                    <td>{lead.last_follow_up ? new Date(lead.last_follow_up).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No leads found with the selected filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h4>Student Application List</h4>
        <div className="cd-table-box">
          <table className="cd-table">
            <thead><tr><th>Name</th><th>Email</th><th>University Name</th></tr></thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, i) => (
                  <tr key={i}>
                    <td>{app?.full_name}</td>
                    <td>{app.email}</td>
                    <td>{app?.university_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No applications found with the selected filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loader Styles */}
      <style jsx global>{`
        .fullscreen-loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .loader-container {
          text-align: center;
        }
        
        .spinner {
          border: 5px solid rgba(90, 103, 216, 0.2);
          border-radius: 50%;
          border-top: 5px solid #5a67d8;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cd-wrapper {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .cd-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
          position: relative; /* Add this */
        }
        
        .date-range-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 8px 12px;
          z-index: 1; /* Add this */
        }
        
        .cd-select {
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: white;
          min-width: 150px;
          position: relative; /* Add this */
          z-index: 0; /* Add this */
        }
        
        .cd-date-input {
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          padding: 4px 8px;
          font-size: 14px;
          width: 130px; /* Add fixed width */
        }
        
        .date-range-container label {
          font-size: 14px;
          color: #555;
          white-space: nowrap; /* Prevent label from wrapping */
        }
        
        .cd-reset, .cd-apply {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .cd-reset {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .cd-apply {
          background-color: #5a67d8;
          color: white;
        }
        
        .cd-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .cd-kpi-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .cd-kpi-card svg {
          font-size: 24px;
          color: #5a67d8;
          margin-bottom: 10px;
        }
        
        .efficiency-box {
          grid-column: span 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .efficiency-box svg {
          font-size: 24px;
          color: #5a67d8;
          margin-bottom: 10px;
        }
        
        .cd-tables {
          margin-top: 30px;
        }
        
        .cd-table-box {
          overflow-x: auto;
          margin-bottom: 30px;
        }
        
        .cd-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .cd-table th {
          background-color: #5a67d8;
          color: white;
          padding: 12px 15px;
          text-align: left;
        }
        
        .cd-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
        }
        
        .cd-table tr:last-child td {
          border-bottom: none;
        }
        
        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default CounselorDashboard;