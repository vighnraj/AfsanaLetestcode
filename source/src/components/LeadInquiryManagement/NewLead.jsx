// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Form,
//   Button,
//   Badge,
//   Row,
//   Col,
//   InputGroup,
//   Modal,
// } from "react-bootstrap";
// import {
//   BsUpload,
//   BsWhatsapp,
//   BsArrowRepeat,
//   BsSearch,
//   BsEnvelope,
//   BsTelephone,
// } from "react-icons/bs";
// import api from "../../services/axiosInterceptor";
// import "./Lead.css";
// import AddLead from "./AddLead";
// import BASE_URL from "../../Config";
// import { Link } from "react-router-dom";

// const LeadTable = ({ show, handleClose }) => {
//   const [convertData, setConvertData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [selectedInquiry, setSelectedInquiry] = useState(null);
//   const [counselors, setCounselors] = useState([]);
//   const [selectedCounselor, setSelectedCounselor] = useState(null);
//   const [followUpDate, setFollowUpDate] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [notes, setNotes] = useState("");
//   const [sortOption, setSortOption] = useState("");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState({});
//   const [uploadInquiry, setUploadInquiry] = useState(null);
//   const [showStudentModal, setShowStudentModal] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editStudentId, setEditStudentId] = useState(null);
//   const [photo, setPhoto] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [universities, setUniversities] = useState([]);
//   const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [showFollowUpModal, setShowFollowUpModal] = useState(false);
//   const [showNotesModal, setShowNotesModal] = useState(false);
//   const [filters, setFilters] = useState({
//     status: "",
//     counselor: "",
//     followUp: "",
//     country: "",
//     search: "",
//     startDate: "",
//     endDate: "",
//     source: "",
//     branch: "",
//     leadType: "",
//     // New filters for follow-up dates
//     followUpDoneFrom: "",
//     followUpDoneTo: "",
//     nextFollowUpFrom: "",
//     nextFollowUpTo: "",
//   });
//   const user_id = localStorage.getItem("user_id");

//   // Load data on component mount
//   useEffect(() => {
//     fetchConvertedLeads();
//     fetchCounselors();
//     fetchUniversities();
//   }, []);

//   const counsolerId = localStorage.getItem("counselor_id");
//   const fetchConvertedLeads = async () => {
//     try {
//       const response = await api.get(
//         `${BASE_URL}leads/by-counselor/${counsolerId}`
//       );
//       setConvertData(response.data);
//       setFilteredData(response.data);
//     } catch (error) {
//       console.error("Error fetching converted leads:", error);
//       alert("Failed to fetch leads");
//     }
//   };

//   const fetchCounselors = async () => {
//     try {
//       const res = await api.get(`${BASE_URL}counselor`);
//       setCounselors(res.data);
//     } catch (err) {
//       console.error("Error fetching counselors:", err);
//       alert("Failed to fetch counselors");
//     }
//   };

//   const fetchUniversities = async () => {
//     try {
//       const response = await api.get(`${BASE_URL}universities`);
//       setUniversities(response.data);
//     } catch (error) {
//       console.log("Error fetching universities:", error);
//       alert("Failed to fetch universities");
//     }
//   };

//   const handleStatusChangeFromTable = async (id, status) => {
//     try {
//       await api.patch(`${BASE_URL}update-lead-status-new`, {
//         inquiry_id: id,
//         new_leads: status,
//       });
//       alert("Status updated successfully!");
//       fetchConvertedLeads();
//     } catch (error) {
//       console.error("Error updating status:", error);
//       alert("Failed to update status.");
//     }
//   };

//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case "New Lead":
//         return "bg-success";
//       case "Contacted":
//         return "bg-warning text-dark";
//       case "Follow-Up Needed":
//         return "bg-primary";
//       case "Visited Office":
//         return "bg-orange text-white";
//       case "Not Interested":
//         return "bg-secondary";
//       case "Next Intake Interested":
//         return "bg-light-purple text-white";
//       case "Registered":
//         return "bg-purple text-white";
//       case "Dropped":
//         return "bg-danger";
//       default:
//         return "bg-dark";
//     }
//   };

//   // Filter function - Updated with new follow-up filters
//   useEffect(() => {
//     let data = [...convertData];

//     // Search filter
//     if (filters.search) {
//       const search = filters.search.toLowerCase();
//       data = data.filter(
//         (lead) =>
//           (lead.full_name && lead.full_name.toLowerCase().includes(search)) ||
//           (lead.email && lead.email.toLowerCase().includes(search)) ||
//           (lead.phone_number && lead.phone_number.includes(search))
//       );
//     }

//     // Status filter
//     if (filters.status) {
//       data = data.filter((lead) => lead.new_leads === filters.status);
//     }

//     // Counselor filter
//     if (filters.counselor) {
//       data = data.filter(
//         (lead) => String(lead.counselor_id) === filters.counselor
//       );
//     }

//     // Follow-up filter
//     if (filters.followUp) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       if (filters.followUp === "today") {
//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           followUpDate.setHours(0, 0, 0, 0);
//           return followUpDate.getTime() === today.getTime();
//         });
//       } else if (filters.followUp === "thisWeek") {
//         const endOfWeek = new Date(today);
//         endOfWeek.setDate(today.getDate() + 7);

//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           return followUpDate >= today && followUpDate <= endOfWeek;
//         });
//       } else if (filters.followUp === "overdue") {
//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           return followUpDate < today;
//         });
//       } else if (filters.followUp === "tomorrow") {
//         const tomorrow = new Date(today);
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           followUpDate.setHours(0, 0, 0, 0);
//           return followUpDate.getTime() === tomorrow.getTime();
//         });
//       } else if (filters.followUp === "nextWeek") {
//         const nextWeekStart = new Date(today);
//         nextWeekStart.setDate(today.getDate() + 7);
//         const nextWeekEnd = new Date(nextWeekStart);
//         nextWeekEnd.setDate(nextWeekStart.getDate() + 7);

//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           return followUpDate >= nextWeekStart && followUpDate <= nextWeekEnd;
//         });
//       }
//     }

//     // Country filter
//     if (filters.country) {
//       data = data.filter((lead) => lead.country === filters.country);
//     }

//     // Date range filter
//     if (filters.startDate && filters.endDate) {
//       const start = new Date(filters.startDate);
//       start.setHours(0, 0, 0, 0);

//       const end = new Date(filters.endDate);
//       end.setHours(23, 59, 59, 999);

//       data = data.filter((inq) => {
//         if (!inq.created_at && !inq.date_of_inquiry) return false;
//         const inquiryDate = new Date(inq.created_at || inq.date_of_inquiry);
//         return inquiryDate >= start && inquiryDate <= end;
//       });
//     }

//     // Source filter
//     if (filters.source) {
//       const normalizedFilter = (filters.source || "").toString().toLowerCase().replace(/[\s-_]/g, "");
//       data = data.filter((lead) => {
//         const leadSource = (lead.source || "").toString().toLowerCase().replace(/[\s-_]/g, "");
//         return leadSource === normalizedFilter || leadSource.includes(normalizedFilter);
//       });
//     }

//     // Branch filter
//     if (filters.branch) {
//       data = data.filter((lead) => lead.branch === filters.branch);
//     }

//     // Lead type filter
//     if (filters.leadType) {
//       data = data.filter((lead) => lead.inquiry_type === filters.leadType);
//     }

//     // Follow-Up Done (Completed) filter
//     if (filters.followUpDoneFrom && filters.followUpDoneTo) {
//       const fromDate = new Date(filters.followUpDoneFrom);
//       fromDate.setHours(0, 0, 0, 0);

//       const toDate = new Date(filters.followUpDoneTo);
//       toDate.setHours(23, 59, 59, 999);

//       data = data.filter((lead) => {
//         if (!lead.follow_up_completed_date) return false;
//         const completedDate = new Date(lead.follow_up_completed_date);
//         return completedDate >= fromDate && completedDate <= toDate;
//       });
//     }

//     // Next Follow-Up filter
//     if (filters.nextFollowUpFrom && filters.nextFollowUpTo) {
//       const fromDate = new Date(filters.nextFollowUpFrom);
//       fromDate.setHours(0, 0, 0, 0);

//       const toDate = new Date(filters.nextFollowUpTo);
//       toDate.setHours(23, 59, 59, 999);

//       data = data.filter((lead) => {
//         if (!lead.next_follow_up_date) return false;
//         const nextFollowUpDate = new Date(lead.next_follow_up_date);
//         return nextFollowUpDate >= fromDate && nextFollowUpDate <= toDate;
//       });
//     }

//     // Apply sorting
//     if (sortOption === "new-old") {
//       data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//     } else if (sortOption === "old-new") {
//       data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
//     } else if (sortOption === "a-z") {
//       data.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
//     } else if (sortOption === "z-a") {
//       data.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
//     } else if (sortOption === "latest") {
//       data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//     } else if (sortOption === "followUpAsc") {
//       data.sort((a, b) => {
//         if (!a.follow_up_date) return 1;
//         if (!b.follow_up_date) return -1;
//         return new Date(a.follow_up_date) - new Date(b.follow_up_date);
//       });
//     } else if (sortOption === "followUpDesc") {
//       data.sort((a, b) => {
//         if (!a.follow_up_date) return 1;
//         if (!b.follow_up_date) return -1;
//         return new Date(b.follow_up_date) - new Date(a.follow_up_date);
//       });
//     } else if (sortOption === "nextFollowUpAsc") {
//       data.sort((a, b) => {
//         if (!a.next_follow_up_date) return 1;
//         if (!b.next_follow_up_date) return -1;
//         return new Date(a.next_follow_up_date) - new Date(b.next_follow_up_date);
//       });
//     } else if (sortOption === "nextFollowUpDesc") {
//       data.sort((a, b) => {
//         if (!a.next_follow_up_date) return 1;
//         if (!b.next_follow_up_date) return -1;
//         return new Date(b.next_follow_up_date) - new Date(a.next_follow_up_date);
//       });
//     }

//     setFilteredData(data);
//   }, [filters, convertData, sortOption]);

//   const handleAssignCounselor = async () => {
//     if (!selectedCounselor || !followUpDate) {
//       alert("Please select counselor & follow-up date.");
//       return;
//     }
//     const payload = {
//       inquiry_id: selectedInquiry.id,
//       counselor_id: selectedCounselor.id,
//       follow_up_date: followUpDate,
//       notes: notes,
//     };
//     try {
//       const res = await api.post(`${BASE_URL}assign-inquiry`, payload);
//       if (res.status === 200) {
//         alert("Counselor assigned successfully.");
//         setShowAssignModal(false);
//         fetchConvertedLeads();
//         resetAssignModal();
//       }
//     } catch (err) {
//       console.error("Error assigning counselor:", err);
//       alert("Failed to assign counselor.");
//     }
//   };

//   const resetAssignModal = () => {
//     setSelectedInquiry(null);
//     setSelectedCounselor(null);
//     setFollowUpDate("");
//     setNotes("");
//   };

//   const handleOpenAssignModal = (inquiry) => {
//     setSelectedInquiry(inquiry);
//     setShowAssignModal(true);
//   };

//   const handleCloseAssignModal = () => {
//     setShowAssignModal(false);
//     resetAssignModal();
//   };

//   const handleOpenUploadModal = (inquiry) => {
//     setUploadInquiry(inquiry);
//     setShowUploadModal(true);
//     setSelectedFiles({});
//   };

//   const handleFileChange = (e, docType) => {
//     setSelectedFiles({
//       ...selectedFiles,
//       [docType]: e.target.files[0],
//     });
//   };

//   const handleUploadDocuments = async () => {
//     if (!uploadInquiry) return;
//     const formData = new FormData();
//     formData.append("inquiry_id", uploadInquiry.id);
//     Object.keys(selectedFiles).forEach((key) => {
//       formData.append(key, selectedFiles[key]);
//     });
//     try {
//       const res = await api.post(
//         `${BASE_URL}upload-inquiry-documents`,
//         formData
//       );
//       if (res.status === 200) {
//         alert("Documents uploaded successfully.");
//         setShowUploadModal(false);
//       }
//     } catch (err) {
//       console.error("Error uploading documents:", err);
//       alert("Failed to upload.");
//     }
//   };

//   const handleConvertToStudent = (lead) => {
//     let formattedDateOfBirth = "";
//     if (lead.date_of_birth) {
//       const dateObj = new Date(lead.date_of_birth);
//       formattedDateOfBirth = dateObj.toISOString().split("T")[0];
//     }

//     setFormData({
//       user_id: user_id,
//       full_name: lead.full_name || "",
//       father_name: "",
//       identifying_name: "",
//       mother_name: "",
//       mobile_number: lead.phone_number || "",
//       university_id: "",
//       date_of_birth: formattedDateOfBirth,
//       gender: lead.gender || "",
//       category: "",
//       address: lead.address || "",
//       role: "student",
//       password: "",
//       email: lead.email || "",
//     });
//     setPhoto(null);
//     setDocuments([]);
//     setIsEditing(false);
//     setShowStudentModal(true);
//   };

//   const [formData, setFormData] = useState({
//     user_id: user_id,
//     full_name: "",
//     father_name: "",
//     mother_name: "",
//     identifying_name: "",
//     mobile_number: "",
//     university_id: "",
//     date_of_birth: "",
//     gender: "",
//     category: "",
//     address: "",
//     role: "student",
//     password: "",
//     email: "",
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formPayload = new FormData();
//     for (const key in formData) {
//       formPayload.append(key, formData[key]);
//     }
//     if (photo) formPayload.append("photo", photo);
//     documents.forEach((doc) => formPayload.append("documents", doc));
//     const url = isEditing
//       ? `${BASE_URL}auth/updateStudent/${editStudentId}`
//       : `${BASE_URL}auth/createStudent`;
//     const method = isEditing ? "put" : "post";
//     try {
//       const res = await api({
//         method,
//         url,
//         data: formPayload,
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert(
//         isEditing
//           ? "Student updated successfully"
//           : "Student created successfully"
//       );
//       resetForm();
//       fetchConvertedLeads();
//     } catch (err) {
//       console.error("Error:", err);
//       alert("User Already exits");
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       user_id: user_id,
//       full_name: "",
//       father_name: "",
//       admission_no: "",
//       id_no: "",
//       mobile_number: "",
//       university_id: "",
//       date_of_birth: "",
//       gender: "",
//       category: "",
//       address: "",
//       role: "student",
//       password: "",
//       email: "",
//     });
//     setPhoto(null);
//     setDocuments([]);
//     setIsEditing(false);
//     setEditStudentId(null);
//     setShowStudentModal(false);
//   };

//   useEffect(() => {
//     if (formData.full_name && formData.university_id) {
//       const university = universities.find(
//         (u) => u.id.toString() === formData.university_id.toString()
//       );
//       const universityName = university ? university.name : "";
//       const identifying = `${formData.full_name} ${universityName} Deb`;
//       setFormData((prev) => ({
//         ...prev,
//         identifying_name: identifying,
//       }));
//     }
//   }, [formData.full_name, formData.university_id, universities]);

//   // Get unique values for filter dropdowns
//   const uniqueSources = [
//     ...new Set(convertData.map((lead) => lead.source)),
//   ].filter(Boolean);
//   const uniqueBranches = [
//     ...new Set(convertData.map((lead) => lead.branch_name)),
//   ].filter(Boolean);
//   const uniqueLeadTypes = [
//     ...new Set(convertData.map((lead) => lead.inquiry_type)),
//   ].filter(Boolean);

//   // All countries including existing and new ones
//   const allCountries = [
//     "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", 
//     "Latvia", "Germany", "New Zealand", "Estonia", "Australia", 
//     "South Korea", "Georgia", "Denmark", "Netherlands", "Sweden", 
//     "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", 
//     "USA", "Portugal"
//   ];

//   return (
//     <div className="p-4">
//       <h2 className="">Lead Table</h2>
//       {/* === FILTER SECTION === */}
//       <div className="mb-3 p-3 bg-light rounded border">
//         <Row className="g-2 align-items-end">
//           {/* Date Range Filters */}
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>Start Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 size="sm"
//                 value={filters.startDate}
//                 onChange={(e) =>
//                   setFilters({ ...filters, startDate: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Col>
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>End Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 size="sm"
//                 value={filters.endDate}
//                 onChange={(e) =>
//                   setFilters({ ...filters, endDate: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Col>
//           {/* Existing Filters */}
//           <Col md={2}>
//             <Form.Label>All Statuses</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.status}
//               onChange={(e) =>
//                 setFilters({ ...filters, status: e.target.value })
//               }
//             >
//               <option value="">All Statuses</option>
//               <option value="new">New Lead</option>
//               <option>Contacted</option>
//               <option>Follow-Up Needed</option>
//               <option>Visited Office</option>
//               <option>Not Interested</option>
//               <option>Next Intake Interested</option>
//               <option>Registered</option>
//               <option>Not Eligible</option>
//               <option>In Review</option>
//               <option>Converted to Lead</option>
//               <option>Dropped</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>All Counselors</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.counselor}
//               onChange={(e) =>
//                 setFilters({ ...filters, counselor: e.target.value })
//               }
//             >
//               <option value="">All Counselors</option>
//               {[...new Set(convertData.map((d) => d.counselor_id))]
//                 .filter((id) => id !== 1)
//                 .map((id) => (
//                   <option key={id} value={id}>
//                     {convertData.find((c) => c.counselor_id === id)
//                       ?.counselor_name || "N/A"}
//                   </option>
//                 ))}
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>Follow Up</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.followUp}
//               onChange={(e) =>
//                 setFilters({ ...filters, followUp: e.target.value })
//               }
//             >
//               <option value="">Follow-Up</option>
//               <option value="today">Today</option>
//               <option value="tomorrow">Tomorrow</option>
//               <option value="thisWeek">This Week</option>
//               <option value="nextWeek">Next Week</option>
//               <option value="overdue">Overdue</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>All Country</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.country}
//               onChange={(e) =>
//                 setFilters({ ...filters, country: e.target.value })
//               }
//             >
//               <option value="">All Countries</option>
//               {allCountries.map((country, i) => (
//                 <option key={i} value={country}>
//                   {country}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           {/* New Filters */}
//           <Col md={2}>
//             <Form.Label>All Sources</Form.Label>
//             <Form.Select
//               style={{ height: "40px" }}
//               value={filters.source}
//               onChange={(e) =>
//                 setFilters({ ...filters, source: e.target.value })
//               }
//             >
//               <option value="">All Sources</option>
//               <option value="whatsapp">Whatsapp</option>
//               <option value="facebook">Facebook</option>
//               <option value="youtube">YouTube</option>
//               <option value="website">Website</option>
//               <option value="referral">Referral</option>
//               <option value="event">Event</option>
//               <option value="agent">Agent</option>
//               <option value="office_visit">Office Visit</option>
//               <option value="hotline">Hotline</option>
//               <option value="seminar">Seminar</option>
//               <option value="expo">Expo</option>
//               <option value="other">Other</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>All Branches</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.branch}
//               onChange={(e) =>
//                 setFilters({ ...filters, branch: e.target.value })
//               }
//             >
//               <option value="">All Branches</option>
//               <option value="Dhaka">Dhaka</option>
//               <option value="Sylhet">Sylhet</option>
//               {uniqueBranches.map(
//                 (branch, i) =>
//                   branch !== "Dhaka" &&
//                   branch !== "Sylhet" && (
//                     <option key={i} value={branch}>
//                       {branch}
//                     </option>
//                   )
//               )}
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>All Lead Types</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.leadType}
//               onChange={(e) =>
//                 setFilters({ ...filters, leadType: e.target.value })
//               }
//             >
//               <option value="">All Lead Types</option>
//               <option value="student_visa">Student Visa</option>
//               <option value="visit_visa">Visit Visa</option>
//               <option value="work_visa">Work Visa</option>
//               <option value="short_visa">Short Visa</option>
//               <option value="german_course">German Course</option>
//               <option value="english_course">English Course</option>
//               <option value="others">Others</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>Search</Form.Label>
//             <InputGroup size="sm">
//               <Form.Control
//                 placeholder="Search by name, email or phone"
//                 value={filters.search}
//                 onChange={(e) =>
//                   setFilters({ ...filters, search: e.target.value })
//                 }
//               />
//               <InputGroup.Text>
//                 <BsSearch />
//               </InputGroup.Text>
//             </InputGroup>
//           </Col>
//           <Col md={2}>
//             <Form.Label>Sort By</Form.Label>
//             <Form.Select
//               size="sm"
//               value={sortOption}
//               onChange={(e) => setSortOption(e.target.value)}
//             >
//               <option value="">Default</option>
//               <option value="new-old">New → Old</option>
//               <option value="old-new">Old → New</option>
//               <option value="a-z">A → Z</option>
//               <option value="z-a">Z → A</option>
//               <option value="latest">Date → Latest</option>
//               <option value="followUpAsc">Follow-Up (Earliest First)</option>
//               <option value="followUpDesc">Follow-Up (Latest First)</option>
//               <option value="nextFollowUpAsc">Next Follow-Up (Earliest First)</option>
//               <option value="nextFollowUpDesc">Next Follow-Up (Latest First)</option>
//             </Form.Select>
//           </Col>
//           <Col md={1}>
//             <Button
//               size="sm"
//               variant="secondary"
//               onClick={() => {
//                 setFilters({
//                   status: "",
//                   counselor: "",
//                   followUp: "",
//                   country: "",
//                   search: "",
//                   startDate: "",
//                   endDate: "",
//                   source: "",
//                   branch: "",
//                   leadType: "",
//                   followUpDoneFrom: "",
//                   followUpDoneTo: "",
//                   nextFollowUpFrom: "",
//                   nextFollowUpTo: "",
//                 });
//               }}
//             >
//               Reset
//             </Button>
//           </Col>
//         </Row>

//         {/* New Follow-Up Filters Row */}
//         <Row className="g-2 align-items-end mt-2">
//           <Col md={3}>
//             <Form.Label>Follow-Up Done (From)</Form.Label>
//             <Form.Control
//               type="date"
//               size="sm"
//               value={filters.followUpDoneFrom}
//               onChange={(e) =>
//                 setFilters({ ...filters, followUpDoneFrom: e.target.value })
//               }
//             />
//           </Col>
//           <Col md={3}>
//             <Form.Label>Follow-Up Done (To)</Form.Label>
//             <Form.Control
//               type="date"
//               size="sm"
//               value={filters.followUpDoneTo}
//               onChange={(e) =>
//                 setFilters({ ...filters, followUpDoneTo: e.target.value })
//               }
//             />
//           </Col>
//           <Col md={3}>
//             <Form.Label>Next Follow-Up (From)</Form.Label>
//             <Form.Control
//               type="date"
//               size="sm"
//               value={filters.nextFollowUpFrom}
//               onChange={(e) =>
//                 setFilters({ ...filters, nextFollowUpFrom: e.target.value })
//               }
//             />
//           </Col>
//           <Col md={3}>
//             <Form.Label>Next Follow-Up (To)</Form.Label>
//             <Form.Control
//               type="date"
//               size="sm"
//               value={filters.nextFollowUpTo}
//               onChange={(e) =>
//                 setFilters({ ...filters, nextFollowUpTo: e.target.value })
//               }
//             />
//           </Col>
//         </Row>

//         <Row className="mt-2">
//           <Col md="auto" className="ms-auto">
//             <Button
//               size="sm"
//               variant="secondary"
//               onClick={() => setShowModal(true)}
//             >
//               Add Lead
//             </Button>
//           </Col>
//         </Row>
//         <Modal
//           show={showModal}
//           onHide={() => setShowModal(false)}
//           backdrop="static"
//           size="lg"
//           centered
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Add Lead</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <AddLead />
//           </Modal.Body>
//         </Modal>
//       </div>

//       {/* === TABLE SECTION === */}
//       <div className="table-responsive-wrapper">
//         <div className="table-responsive">
//           <Table bordered hover className="freeze-columns-table">
//             <thead className="table-light">
//               <tr>
//                 <th className="freeze-column freeze-column-1">#</th>
//                 <th className="freeze-column freeze-column-2">Name</th>
//                 <th className="freeze-column freeze-column-3">Email</th>
//                 <th className="freeze-column freeze-column-4">Phone</th>
//                 <th>Country</th>
//                 <th>Branch</th>
//                 <th>Enquiry Type</th>
//                 <th>Course</th>
//                 <th>Source</th>
//                 <th>Status</th>
//                 <th>Counselor Name</th>
//                 <th>Follow-Up Date</th>
//                 <th>Next Follow-Up Date</th>
//                 <th>Created At</th>
//                 <th>View</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.map((lead, index) => (
//                 <tr key={lead.id}>
//                   <td className="freeze-column freeze-column-1">{index + 1}</td>
//                   <td className="freeze-column freeze-column-2">
//                     {lead.full_name || "N/A"}
//                   </td>
//                   <td className="freeze-column freeze-column-3">
//                     {lead.email || "N/A"}
//                   </td>
//                   <td className="freeze-column freeze-column-4">
//                     {lead.phone_number || "N/A"}
//                   </td>
//                   <td>{lead.country || "N/A"}</td>
//                   <td>{lead.branch || "N/A"}</td>
//                   <td>{lead.inquiry_type || "N/A"}</td>
//                   <td>{lead.course_name || "N/A"}</td>
//                   <td>{lead.source || "N/A"}</td>
//                   <td>
//                     <span
//                       className={`badge ${getStatusBadgeColor(
//                         lead.new_leads == 0 ? "New Lead" : lead.new_leads
//                       )}`}
//                     >
//                       {lead.new_leads == 0
//                         ? "New Lead"
//                         : lead.new_leads || "N/A"}
//                     </span>
//                   </td>
//                   <td>
//                     {lead.counselor_id ? (
//                       <span
//                         className="badge bg-info"
//                         role="button"
//                         style={{ cursor: "pointer" }}
//                         onClick={() => handleOpenAssignModal(lead)}
//                       >
//                         {lead.counselor_name || "Assigned"}
//                       </span>
//                     ) : (
//                       <Button
//                         variant="info"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleOpenAssignModal(lead)}
//                       >
//                         Assign Counselor
//                       </Button>
//                     )}
//                   </td>
//                   <td>{lead.follow_up_date?.slice(0, 10) || "N/A"}</td>   
//                   <td>{lead.next_followup_date?.slice(0, 10) || "N/A"}</td>
//                   <td>
//                     {lead.created_at ? lead.created_at.slice(0, 10) : "N/A"}
//                   </td>
//                   <td>
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedLead(lead);
//                         setShowLeadDetailsModal(true);
//                       }}
//                     >
//                       View Lead
//                     </Button>
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       onClick={() =>
//                         (window.location.href = `/follow-up-history/${lead.id}`)
//                       }
//                     >
//                       Follow-Up History
//                     </Button>
//                     <Link to={`/note-history/${lead.id}`}>
//                       {" "}
//                       <Button> Add Notes</Button>
//                     </Link>
//                   </td>
//                   <td className="d-flex">
//                     <Form.Select
//                       size="sm"
//                       className="me-2"
//                       style={{ width: "100px" }}
//                       value={lead.lead_status || ""}
//                       onChange={(e) =>
//                         handleStatusChangeFromTable(lead.id, e.target.value)
//                       }
//                     >
//                       <option>Action</option>
//                       <option value="Contacted">Contacted</option>
//                       <option value="Follow-Up Needed">Follow-Up Needed</option>
//                       <option value="Visited Office">Visited Office</option>
//                       <option value="Not Interested">Not Interested</option>
//                       <option value="In Review">In Review</option>
//                       <option value="Not Eligible">Not Eligible</option>
//                       <option value="Next Intake Interested">
//                         Next Intake Interested
//                       </option>
//                       <option value="Registered">Registered</option>
//                       <option value="Dropped">Dropped</option>
//                     </Form.Select>
//                     {lead.new_leads === "Registered" && (
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         className="ms-2 me-2"
//                         onClick={() => handleConvertToStudent(lead)}
//                       >
//                         <BsArrowRepeat className="me-1" /> Convert to Student
//                       </Button>
//                     )}
//                     <Button
//                       variant="outline-success"
//                       className=" btn btn-sm btn-outline-success me-2 py-1"
//                       size="sm"
//                       onClick={() =>
//                         window.open(
//                           `https://wa.me/${lead.phone_number}`,
//                           "_blank"
//                         )
//                       }
//                     >
//                       <i className="bi bi-whatsapp  "></i>
//                     </Button>
//                     <a
//                       href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
//                         lead.email
//                       }&su=Regarding Your Lead&body=${encodeURIComponent(
//                         `Dear ${lead.full_name},
// Here are your lead details:
// - Name: ${lead.full_name}
// - Phone: ${lead.phone_number}
// - Email: ${lead.email}
// - Inquiry Type: ${lead.inquiry_type}
// - Source: ${lead.source}
// - Branch: ${lead.branch}
// - Counselor: ${lead.counselor_name || "Not Assigned"}
// - Country: ${lead.country}
// - Created At: ${lead.created_at ? lead.created_at.slice(0, 10) : ""}
// - Status: ${lead.new_leads}
// Thank you for your interest.
// Regards,
// Study First Info Team`
//                       )}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="btn btn-sm btn-outline-dark"
//                       style={{ display: "flex", alignItems: "center" }}
//                     >
//                       <BsEnvelope className="me-1" />
//                     </a>
//                     <a
//                       href={`tel:${lead.phone_number}`}
//                       className="btn btn-sm btn-outline-primary ms-2"
//                       style={{ display: "flex", alignItems: "center" }}
//                       title="Call"
//                     >
//                       <BsTelephone className="me-1" />
//                     </a>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       </div>

//       {/* Assign Modal */}
//       <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {selectedInquiry?.counselor_id
//               ? "Update Counselor"
//               : "Assign Counselor"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedInquiry && (
//             <>
//               <p>
//                 <strong>Lead:</strong> {selectedInquiry.full_name}
//               </p>
//               <Form.Group className="mb-3">
//                 <Form.Label>Counselor *</Form.Label>
//                 <Form.Select
//                   value={selectedCounselor?.id || ""}
//                   onChange={(e) => {
//                     const id = e.target.value;
//                     const counselor = counselors.find(
//                       (c) => c.id.toString() === id
//                     );
//                     setSelectedCounselor(counselor);
//                   }}
//                 >
//                   <option value="">Select Counselor</option>
//                   {counselors.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.full_name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Follow-Up Date *</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={followUpDate}
//                   onChange={(e) => setFollowUpDate(e.target.value)}
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Notes</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   placeholder="Write notes..."
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                 />
//               </Form.Group>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseAssignModal}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleAssignCounselor}>
//             {selectedInquiry?.counselor_id
//               ? "Update Counselor"
//               : "Assign Counselor"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Upload Documents Modal */}
//       <Modal
//         show={showUploadModal}
//         onHide={() => setShowUploadModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Upload Documents</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Passport</Form.Label>
//             <Form.Control
//               type="file"
//               onChange={(e) => handleFileChange(e, "passport")}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Certificates</Form.Label>
//             <Form.Control
//               type="file"
//               onChange={(e) => handleFileChange(e, "certificates")}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>IELTS</Form.Label>
//             <Form.Control
//               type="file"
//               onChange={(e) => handleFileChange(e, "ielts")}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>SOP</Form.Label>
//             <Form.Control
//               type="file"
//               onChange={(e) => handleFileChange(e, "sop")}
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleUploadDocuments}>
//             Upload
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Student Form Modal */}
//       <Modal show={showStudentModal} onHide={resetForm} size="xl" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Student Information</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Group controlId="fullName">
//                   <Form.Label>Student Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter student name"
//                     value={formData.full_name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, full_name: e.target.value })
//                     }
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group controlId="fatherName">
//                   <Form.Label>Father Name</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter father name"
//                     value={formData.father_name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, father_name: e.target.value })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group controlId="motherName">
//                   <Form.Label>Mother Name</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter mother name"
//                     value={formData.mother_name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, mother_name: e.target.value })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group controlId="email">
//                   <Form.Label>Email *</Form.Label>
//                   <Form.Control
//                     type="email"
//                     placeholder="Enter student's email"
//                     value={formData.email}
//                     onChange={(e) =>
//                       setFormData({ ...formData, email: e.target.value })
//                     }
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group controlId="password">
//                   <Form.Label>Password *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter password"
//                     value={formData.password}
//                     onChange={(e) =>
//                       setFormData({ ...formData, password: e.target.value })
//                     }
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group controlId="dob">
//                   <Form.Label>Date of Birth</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={formData.date_of_birth}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         date_of_birth: e.target.value,
//                       })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group controlId="mobileNumber">
//                   <Form.Label>Mobile Number *</Form.Label>
//                   <Form.Control
//                     type="tel"
//                     placeholder="Enter mobile number"
//                     value={formData.mobile_number}
//                     onChange={(e) => {
//                       const value = e.target.value;
//                       if (/^\d*$/.test(value)) {
//                         setFormData({ ...formData, mobile_number: value });
//                       }
//                     }}
//                     required
//                     maxLength={10}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group controlId="university">
//                   <Form.Label>University Name</Form.Label>
//                   <Form.Select
//                     value={formData.university_id}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         university_id: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="">Select university</option>
//                     {universities?.map((uni) => (
//                       <option key={uni.id} value={uni.id}>
//                         {uni.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group controlId="identifyingName">
//                   <Form.Label>Student Identifying Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={formData.identifying_name}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         identifying_name: e.target.value,
//                       })
//                     }
//                     placeholder="e.g., Rahim Harvard Deb"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group controlId="gender">
//                   <Form.Label>Gender</Form.Label>
//                   <div>
//                     {["Male", "Female", "Other"].map((g) => (
//                       <Form.Check
//                         inline
//                         key={g}
//                         type="radio"
//                         label={g}
//                         name="gender"
//                         value={g}
//                         checked={formData.gender === g}
//                         onChange={(e) =>
//                           setFormData({ ...formData, gender: e.target.value })
//                         }
//                       />
//                     ))}
//                   </div>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group controlId="category">
//                   <Form.Label>Category</Form.Label>
//                   <Form.Select
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({ ...formData, category: e.target.value })
//                     }
//                   >
//                     <option value="">Select category</option>
//                     <option value="General">General</option>
//                     <option value="SC">SC</option>
//                     <option value="ST">ST</option>
//                     <option value="OBC">OBC</option>
//                     <option value="Other">Other</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={12}>
//                 <Form.Group controlId="address">
//                   <Form.Label>Address</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={3}
//                     placeholder="Enter complete address"
//                     value={formData.address}
//                     onChange={(e) =>
//                       setFormData({ ...formData, address: e.target.value })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <div className="d-flex justify-content-end mt-3">
//               <Button variant="secondary" onClick={resetForm} className="me-2">
//                 Cancel
//               </Button>
//               <Button variant="primary" type="submit">
//                 {isEditing ? "Update" : "Submit"}
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* Lead Details Modal */}
//       <Modal
//         show={showLeadDetailsModal}
//         onHide={() => setShowLeadDetailsModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Lead Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLead && (
//             <div>
//               {/* Personal Information */}
//               <h5 className="mb-3">Personal Information</h5>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Name:</strong> {selectedLead.full_name}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Email:</strong> {selectedLead.email}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Phone:</strong> {selectedLead.phone_number}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Gender:</strong> {selectedLead.gender}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Date of Birth:</strong>{" "}
//                   {selectedLead.date_of_birth?.slice(0, 10)}
//                 </Col>
//                 <Col md={6}>
//                   <strong>City:</strong> {selectedLead.city}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Address:</strong> {selectedLead.address}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Present Address:</strong>{" "}
//                   {selectedLead.present_address}
//                 </Col>
//               </Row>
//               {/* Inquiry Info */}
//               <h5 className="mt-4 mb-3">Inquiry Details</h5>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Inquiry Type:</strong> {selectedLead.inquiry_type}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Source:</strong> {selectedLead.source}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Branch:</strong> {selectedLead.branch}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Country:</strong> {selectedLead.country}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Course Name:</strong> {selectedLead.course_name}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Status:</strong> {selectedLead.lead_status}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Payment Status:</strong> {selectedLead.payment_status}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Eligibility Status:</strong>{" "}
//                   {selectedLead.eligibility_status}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Follow-Up Date:</strong>{" "}
//                   {selectedLead.follow_up_date?.slice(0, 10) || "N/A"}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Follow-Up Done Date:</strong>{" "}
//                   {selectedLead.follow_up_completed_date?.slice(0, 10) || "N/A"}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Next Follow-Up Date:</strong>{" "}
//                   {selectedLead.next_follow_up_date?.slice(0, 10) || "N/A"}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Date of Inquiry:</strong>{" "}
//                   {selectedLead.date_of_inquiry?.slice(0, 10)}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Created At:</strong>{" "}
//                   {selectedLead.created_at?.slice(0, 10)}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Updated At:</strong>{" "}
//                   {selectedLead.updated_at?.slice(0, 10)}
//                 </Col>
//               </Row>
//               {/* Education Background */}
//               <h5 className="mt-4 mb-3">Education Background</h5>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Highest Level:</strong> {selectedLead.highest_level}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Study Level:</strong> {selectedLead.study_level}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Study Field:</strong> {selectedLead.study_field}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Intake:</strong> {selectedLead.intake}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Budget:</strong> {selectedLead.budget}
//                 </Col>
//                 <Col md={6}>
//                   <strong>University:</strong> {selectedLead.university}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Study Gap:</strong> {selectedLead.study_gap}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Visa Refused:</strong> {selectedLead.visa_refused}
//                 </Col>
//               </Row>
//               {selectedLead.visa_refused === "yes" && (
//                 <Row className="mb-2">
//                   <Col md={12}>
//                     <strong>Refusal Reason:</strong>{" "}
//                     {selectedLead.refusal_reason}
//                   </Col>
//                 </Row>
//               )}
//               {/* English Proficiency */}
//               <h5 className="mt-4 mb-3">English Proficiency</h5>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Test Type:</strong> {selectedLead.test_type}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Overall Score:</strong> {selectedLead.overall_score}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={3}>
//                   <strong>Reading:</strong> {selectedLead.reading_score}
//                 </Col>
//                 <Col md={3}>
//                   <strong>Writing:</strong> {selectedLead.writing_score}
//                 </Col>
//                 <Col md={3}>
//                   <strong>Speaking:</strong> {selectedLead.speaking_score}
//                 </Col>
//                 <Col md={3}>
//                   <strong>Listening:</strong> {selectedLead.listening_score}
//                 </Col>
//               </Row>
//               {/* Work Experience */}
//               <h5 className="mt-4 mb-3">Work Experience</h5>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Company Name:</strong> {selectedLead.company_name}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Job Title:</strong> {selectedLead.job_title}
//                 </Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Job Duration:</strong> {selectedLead.job_duration}
//                 </Col>
//               </Row>
//               {/* Additional Info */}
//               <h5 className="mt-4 mb-3">Additional Info</h5>
//               <Row className="mb-2">
//                 <Col md={6}>
//                   <strong>Counselor Name:</strong> {selectedLead.counselor_name}
//                 </Col>
//                 <Col md={6}>
//                   <strong>Notes:</strong> {selectedLead.notes}
//                 </Col>
//               </Row>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowLeadDetailsModal(false)}
//           >
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* showfollowup modal */}
//       <Modal
//         show={showFollowUpModal}
//         onHide={() => setShowFollowUpModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add Follow-Up</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLead && (
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Follow-Up Date</Form.Label>
//                 <Form.Control type="date" />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Follow-Up Notes</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   placeholder="Enter notes..."
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Next Action</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="e.g. Call, Email, Meeting"
//                 />
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowFollowUpModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button variant="primary">Save</Button>
//         </Modal.Footer>
//       </Modal>

//       <Modal
//         show={showNotesModal}
//         onHide={() => setShowNotesModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add Notes</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLead && (
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Notes</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={4}
//                   placeholder="Write your notes here..."
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Note Type</Form.Label>
//                 <Form.Select>
//                   <option value="">Select Type</option>
//                   <option value="General">General</option>
//                   <option value="Follow-Up">Follow-Up</option>
//                   <option value="Important">Important</option>
//                 </Form.Select>
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary">Save</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LeadTable;



import React, { useEffect, useState } from "react";
import {
  Table,
  Form,
  Button,
  Badge,
  Row,
  Col,
  InputGroup,
  Modal,
  Pagination,
} from "react-bootstrap";
import {
  BsUpload,
  BsWhatsapp,
  BsArrowRepeat,
  BsSearch,
  BsEnvelope,
  BsTelephone,
} from "react-icons/bs";
import api from "../../services/axiosInterceptor";
import "./Lead.css";
import AddLead from "./AddLead";
import BASE_URL from "../../Config";
import { Link } from "react-router-dom";
import CounselorAddLead from "./CounselorAddLead";

const LeadTable = ({ show, handleClose }) => {
  const [convertData, setConvertData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadInquiry, setUploadInquiry] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);


  const [showEditModal, setShowEditModal] = useState(false);
  const [editLeadData, setEditLeadData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('leadTableFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      status: "",
      counselor: "",
      followUp: "",
      country: "",
      search: "",
      startDate: "",
      endDate: "",
      source: "",
      branch: "",
      priority: "",
      leadType: "",
      // New filters for follow-up dates
      followUpDoneFrom: "",
      followUpDoneTo: "",
      nextFollowUpFrom: "",
      nextFollowUpTo: "",
    };
  });
  
  // 同样对 sortOption 状态进行初始化
  const [sortOption, setSortOption] = useState(() => {
    return localStorage.getItem('leadTableSortOption') || "";
  });
  
  // 每当 filters 或 sortOption 变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('leadTableFilters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    localStorage.setItem('leadTableSortOption', sortOption);
  }, [sortOption]);
  
 useEffect(() => {
    const total = Math.ceil(filteredData.length / itemsPerPage);
    setTotalPages(total);
    // Reset to page 1 when filters change
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredData, itemsPerPage, currentPage]);



   const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

   const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    try {
      if (typeof value === "string") {
        // remove trailing Z if present, replace T with space, keep up to seconds
        return value.replace("T", " ").replace("Z", "").slice(0, 19);
      }
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toISOString().replace("T", " ").slice(0, 19);
    } catch (err) {
      return String(value);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      status: "",
      counselor: "",
      followUp: "",
      country: "",
      search: "",
      startDate: "",
      endDate: "",
      source: "",
      branch: "",
      priority: "",
      leadType: "",
      followUpDoneFrom: "",
      followUpDoneTo: "",
      nextFollowUpFrom: "",
      nextFollowUpTo: "",
    };
    setFilters(defaultFilters);
    setSortOption("");
    localStorage.removeItem('leadTableFilters');
    localStorage.removeItem('leadTableSortOption');
  };

  const user_id = localStorage.getItem("user_id");

  // Load data on component mount
  useEffect(() => {
    fetchConvertedLeads();
    fetchCounselors();
    fetchUniversities();
  }, []);

  const counsolerId = localStorage.getItem("counselor_id");
  const fetchConvertedLeads = async () => {
    try {
      const response = await api.get(
        `${BASE_URL}leads/by-counselor/${counsolerId}`
      );
      // Ensure every lead has a priority (default to 'Low' when missing)
      const normalized = (response.data || []).map((item) => ({
        ...item,
        priority: item.priority || "Low",
      }));
      setConvertData(normalized);
      setFilteredData(normalized);
    } catch (error) {
      console.error("Error fetching converted leads:", error);
      alert("Failed to fetch leads");
    }
  };

  const handlePriorityChangeFromTable = async (id, priority) => {
    try {
      // backend expects inquiry_id and priority
      const payload = {
        inquiry_id: id,
        priority: priority,
      };
      const res = await api.patch(`${BASE_URL}priority`, payload);
      if (res.status === 200 || res.status === 204) {
        // Refresh data to reflect updated priority
        fetchConvertedLeads();
      } else {
        console.warn('Unexpected response updating priority', res);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  // Helper: parse education_background which may be stored as a JSON string
  const parseEducationBackground = (education_background) => {
    try {
      if (!education_background) return [];
      if (typeof education_background === "string") {
        return JSON.parse(education_background);
      }
      return Array.isArray(education_background) ? education_background : [];
    } catch (err) {
      console.error("Failed to parse education_background:", err);
      return [];
    }
  };

  const fetchCounselors = async () => {
    try {
      const res = await api.get(`${BASE_URL}counselor`);
      setCounselors(res.data);
    } catch (err) {
      console.error("Error fetching counselors:", err);
      alert("Failed to fetch counselors");
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await api.get(`${BASE_URL}universities`);
      setUniversities(response.data);
    } catch (error) {
      console.log("Error fetching universities:", error);
      alert("Failed to fetch universities");
    }
  };

  const handleStatusChangeFromTable = async (id, status) => {
    try {
      await api.patch(`${BASE_URL}update-lead-status-new`, {
        inquiry_id: id,
        new_leads: status,
      });
      alert("Status updated successfully!");
      fetchConvertedLeads();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };




  const handleEditLead = (lead) => {
  // Parse education background if it exists
  let educationLevels = [
    { level: "", institute: "", board: "", year: "", gpa: "" },
    { level: "", institute: "", board: "", year: "", gpa: "" },
    { level: "", institute: "", board: "", year: "", gpa: "" },
    { level: "", institute: "", board: "", year: "", gpa: "" }
  ];

  // If education_background exists, parse it
  if (lead.education_background) {
    try {
      const eduBg = typeof lead.education_background === 'string' 
        ? JSON.parse(lead.education_background)
        : lead.education_background;
      
      if (Array.isArray(eduBg)) {
        eduBg.forEach((edu, index) => {
          if (index < educationLevels.length) {
            educationLevels[index] = {
              level: edu.level || edu.degree || "",
              institute: edu.institute || edu.school || "",
              board: edu.board || edu.university || "",
              year: edu.year || "",
              gpa: edu.gpa || edu.grade || ""
            };
          }
        });
      }
    } catch (error) {
      console.error("Error parsing education background:", error);
    }
  }

  // Format data for CounselorAddLead component
  const formattedData = {
    id: lead.id, // Add ID for editing
    name: lead.full_name || "",
    email: lead.email || "",
    phone: lead.phone_number || "",
    city: lead.city || "",
    address: lead.address || "",
    course_name: lead.course_name || "",
    source: lead.source || "Whatsapp",
    inquiryType: lead.inquiry_type || "",
    branch: lead.branch || "",
    country: lead.country || "",
    date_of_birth: lead.date_of_birth ? lead.date_of_birth.slice(0, 10) : "",
    gender: lead.gender || "",
    highestLevel: lead.highest_level || "",
    education: educationLevels.filter(edu => edu.level !== ""),
    studyLevel: lead.study_level || "",
    studyField: lead.study_field || "",
    intake: lead.intake || "",
    budget: lead.budget || "",
    university: lead.university || "",
    testType: lead.test_type || "",
    overallScore: lead.overall_score || "",
    readingScore: lead.reading_score || "",
    writingScore: lead.writing_score || "",
    speakingScore: lead.speaking_score || "",
    listeningScore: lead.listening_score || "",
    companyName: lead.company_name || "",
    jobTitle: lead.job_title || "",
    jobDuration: lead.job_duration || "",
    studyGap: lead.study_gap || "",
    visaRefused: lead.visa_refused || "",
    refusalReason: lead.refusal_reason || "",
    presentAddress: lead.present_address || "",
    date_of_inquiry: lead.date_of_inquiry ? lead.date_of_inquiry.slice(0, 10) : "",
    additionalNotes: lead.additional_notes || "",
    consent: true,
    // Add country code based on phone number
    countryCode: extractCountryCode(lead.phone_number),
    phone: lead.phone_number || ""
  };

  setEditLeadData(formattedData);
  setIsEditMode(true);
  setShowEditModal(true);
};

// Helper function to extract country code from phone number
const extractCountryCode = (phone) => {
  if (!phone) return "+880";
  if (phone.startsWith("+36")) return "+36";
  if (phone.startsWith("+44")) return "+44";
  if (phone.startsWith("+357")) return "+357";
  if (phone.startsWith("+1")) return "+1";
  if (phone.startsWith("+60")) return "+60";
  if (phone.startsWith("+370")) return "+370";
  if (phone.startsWith("+371")) return "+371";
  if (phone.startsWith("+49")) return "+49";
  if (phone.startsWith("+64")) return "+64";
  if (phone.startsWith("+372")) return "+372";
  if (phone.startsWith("+61")) return "+61";
  if (phone.startsWith("+82")) return "+82";
  if (phone.startsWith("+995")) return "+995";
  if (phone.startsWith("+45")) return "+45";
  if (phone.startsWith("+31")) return "+31";
  if (phone.startsWith("+46")) return "+46";
  if (phone.startsWith("+47")) return "+47";
  if (phone.startsWith("+32")) return "+32";
  if (phone.startsWith("+40")) return "+40";
  if (phone.startsWith("+7")) return "+7";
  if (phone.startsWith("+90")) return "+90";
  if (phone.startsWith("+353")) return "+353";
  if (phone.startsWith("+351")) return "+351";
  return "+880"; // Default to Bangladesh
};


  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "New Lead":
        return "bg-success";
      case "Contacted":
        return "bg-warning text-dark";
      case "Follow-Up Needed":
        return "bg-primary";
      case "Visited Office":
        return "bg-orange text-white";
      case "Not Interested":
        return "bg-secondary";
      case "Next Intake Interested":
        return "bg-light-purple text-white";
      case "Registered":
        return "bg-purple text-white";
      case "Dropped":
        return "bg-danger";
      default:
        return "bg-dark";
    }
  };

  // Filter function - Updated with new follow-up filters
  useEffect(() => {
    let data = [...convertData];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (lead) =>
          (lead.full_name && lead.full_name.toLowerCase().includes(search)) ||
          (lead.email && lead.email.toLowerCase().includes(search)) ||
          (lead.phone_number && lead.phone_number.includes(search))
      );
    }

    // Status filter
    if (filters.status) {
      data = data.filter((lead) => lead.new_leads === filters.status);
    }

    // Counselor filter
    if (filters.counselor) {
      data = data.filter(
        (lead) => String(lead.counselor_id) === filters.counselor
      );
    }

    // Follow-up filter
    if (filters.followUp) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.followUp === "today") {
        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          followUpDate.setHours(0, 0, 0, 0);
          return followUpDate.getTime() === today.getTime();
        });
      } else if (filters.followUp === "thisWeek") {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);

        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          return followUpDate >= today && followUpDate <= endOfWeek;
        });
      } else if (filters.followUp === "overdue") {
        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          return followUpDate < today;
        });
      } else if (filters.followUp === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          followUpDate.setHours(0, 0, 0, 0);
          return followUpDate.getTime() === tomorrow.getTime();
        });
      } else if (filters.followUp === "nextWeek") {
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + 7);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 7);

        data = data.filter((lead) => {
          if (!lead.follow_up_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          return followUpDate >= nextWeekStart && followUpDate <= nextWeekEnd;
        });
      }
    }

    // Country filter
    if (filters.country) {
      data = data.filter((lead) => lead.country === filters.country);
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);

      data = data.filter((inq) => {
        if (!inq.created_at && !inq.date_of_inquiry) return false;
        const inquiryDate = new Date(inq.created_at || inq.date_of_inquiry);
        return inquiryDate >= start && inquiryDate <= end;
      });
    }

    // Source filter
    if (filters.source) {
      const normalizedFilter = (filters.source || "").toString().toLowerCase().replace(/[\s-_]/g, "");
      data = data.filter((lead) => {
        const leadSource = (lead.source || "").toString().toLowerCase().replace(/[\s-_]/g, "");
        return leadSource === normalizedFilter || leadSource.includes(normalizedFilter);
      });
    }

    // Branch filter
    if (filters.branch) {
      data = data.filter((lead) => lead.branch === filters.branch);
    }

    // Lead type filter
    if (filters.leadType) {
      data = data.filter((lead) => lead.inquiry_type === filters.leadType);
    }

    // Priority filter
    if (filters.priority) {
      data = data.filter((lead) => (lead.priority || "Low") === filters.priority);
    }

    // Follow-Up Done (Completed) filter - FIXED
    if (filters.followUpDoneFrom && filters.followUpDoneTo) {
      const fromDate = new Date(filters.followUpDoneFrom);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(filters.followUpDoneTo);
      toDate.setHours(23, 59, 59, 999);

      data = data.filter((lead) => {
        // Check if follow_up_date exists and is valid
        if (!lead.last_followup_date) return false;
        const followUpDate = new Date(lead.last_followup_date);
        // Check if the date is valid
        if (isNaN(followUpDate.getTime())) return false;
        return followUpDate >= fromDate && followUpDate <= toDate;
      });
    }

    // Next Follow-Up filter - FIXED
    if (filters.nextFollowUpFrom && filters.nextFollowUpTo) {
      const fromDate = new Date(filters.nextFollowUpFrom);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(filters.nextFollowUpTo);
      toDate.setHours(23, 59, 59, 999);

      data = data.filter((lead) => {
        // Check if next_followup_date exists and is valid
        if (!lead.next_followup_date) return false;
        const nextFollowUpDate = new Date(lead.next_followup_date);
        // Check if the date is valid
        if (isNaN(nextFollowUpDate.getTime())) return false;
        return nextFollowUpDate >= fromDate && nextFollowUpDate <= toDate;
      });
    }

    // Apply sorting
    if (sortOption === "new-old") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOption === "old-new") {
      data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortOption === "a-z") {
      data.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    } else if (sortOption === "z-a") {
      data.sort((a, b) => (b.full_name || "").localeCompare(a.full_name || ""));
    } else if (sortOption === "latest") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOption === "followUpAsc") {
      data.sort((a, b) => {
        if (!a.follow_up_date) return 1;
        if (!b.follow_up_date) return -1;
        return new Date(a.follow_up_date) - new Date(b.follow_up_date);
      });
    } else if (sortOption === "followUpDesc") {
      data.sort((a, b) => {
        if (!a.follow_up_date) return 1;
        if (!b.follow_up_date) return -1;
        return new Date(b.follow_up_date) - new Date(a.follow_up_date);
      });
    } else if (sortOption === "nextFollowUpAsc") {
      data.sort((a, b) => {
        if (!a.next_followup_date) return 1;
        if (!b.next_followup_date) return -1;
        return new Date(a.next_followup_date) - new Date(b.next_followup_date);
      });
    } else if (sortOption === "nextFollowUpDesc") {
      data.sort((a, b) => {
        if (!a.next_followup_date) return 1;
        if (!b.next_followup_date) return -1;
        return new Date(b.next_followup_date) - new Date(a.next_followup_date);
      });
    }

    setFilteredData(data);
  }, [filters, convertData, sortOption]);

  const handleAssignCounselor = async () => {
    if (!selectedCounselor || !followUpDate) {
      alert("Please select counselor & follow-up date.");
      return;
    }
    const payload = {
      inquiry_id: selectedInquiry.id,
      counselor_id: selectedCounselor.id,
      follow_up_date: followUpDate,
      notes: notes,
    };
    try {
      const res = await api.post(`${BASE_URL}assign-inquiry`, payload);
      if (res.status === 200) {
        alert("Counselor assigned successfully.");
        setShowAssignModal(false);
        fetchConvertedLeads();
        resetAssignModal();
      }
    } catch (err) {
      console.error("Error assigning counselor:", err);
      alert("Failed to assign counselor.");
    }
  };

  const resetAssignModal = () => {
    setSelectedInquiry(null);
    setSelectedCounselor(null);
    setFollowUpDate("");
    setNotes("");
  };

  const handleOpenAssignModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    resetAssignModal();
  };

  const handleOpenUploadModal = (inquiry) => {
    setUploadInquiry(inquiry);
    setShowUploadModal(true);
    setSelectedFiles({});
  };

  const handleFileChange = (e, docType) => {
    setSelectedFiles({
      ...selectedFiles,
      [docType]: e.target.files[0],
    });
  };

  const handleUploadDocuments = async () => {
    if (!uploadInquiry) return;
    const formData = new FormData();
    formData.append("inquiry_id", uploadInquiry.id);
    Object.keys(selectedFiles).forEach((key) => {
      formData.append(key, selectedFiles[key]);
    });
    try {
      const res = await api.post(
        `${BASE_URL}upload-inquiry-documents`,
        formData
      );
      if (res.status === 200) {
        alert("Documents uploaded successfully.");
        setShowUploadModal(false);
      }
    } catch (err) {
      console.error("Error uploading documents:", err);
      alert("Failed to upload.");
    }
  };

  const handleConvertToStudent = (lead) => {
    let formattedDateOfBirth = "";
    if (lead.date_of_birth) {
      const dateObj = new Date(lead.date_of_birth);
      formattedDateOfBirth = dateObj.toISOString().split("T")[0];
    }

    setFormData({
      user_id: user_id,
      full_name: lead.full_name || "",
      father_name: "",
      identifying_name: "",
      mother_name: "",
      mobile_number: lead.phone_number || "",
      university_id: "",
      date_of_birth: formattedDateOfBirth,
      gender: lead.gender || "",
      category: "",
      address: lead.address || "",
      role: "student",
      password: "",
      email: lead.email || "",
    });
    setPhoto(null);
    setDocuments([]);
    setIsEditing(false);
    setShowStudentModal(true);
  };

  const [formData, setFormData] = useState({
    user_id: user_id,
    full_name: "",
    father_name: "",
    mother_name: "",
    identifying_name: "",
    mobile_number: "",
    university_id: "",
    date_of_birth: "",
    gender: "",
    category: "",
    address: "",
    role: "student",
    password: "",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    for (const key in formData) {
      formPayload.append(key, formData[key]);
    }
    if (photo) formPayload.append("photo", photo);
    documents.forEach((doc) => formPayload.append("documents", doc));
    const url = isEditing
      ? `${BASE_URL}auth/updateStudent/${editStudentId}`
      : `${BASE_URL}auth/createStudent`;
    const method = isEditing ? "put" : "post";
    try {
      const res = await api({
        method,
        url,
        data: formPayload,
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(
        isEditing
          ? "Student updated successfully"
          : "Student created successfully"
      );
      resetForm();
      fetchConvertedLeads();
    } catch (err) {
      console.error("Error:", err);
      alert("User Already exits");
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: user_id,
      full_name: "",
      father_name: "",
      admission_no: "",
      id_no: "",
      mobile_number: "",
      university_id: "",
      date_of_birth: "",
      gender: "",
      category: "",
      address: "",
      role: "student",
      password: "",
      email: "",
    });
    setPhoto(null);
    setDocuments([]);
    setIsEditing(false);
    setEditStudentId(null);
    setShowStudentModal(false);
  };

  useEffect(() => {
    if (formData.full_name && formData.university_id) {
      const university = universities.find(
        (u) => u.id.toString() === formData.university_id.toString()
      );
      const universityName = university ? university.name : "";
      const identifying = `${formData.full_name} ${universityName} `;
      setFormData((prev) => ({
        ...prev,
        identifying_name: identifying,
      }));
    }
  }, [formData.full_name, formData.university_id, universities]);

  // Get unique values for filter dropdowns
  const uniqueSources = [
    ...new Set(convertData.map((lead) => lead.source)),
  ].filter(Boolean);
  const uniqueBranches = [
    ...new Set(convertData.map((lead) => lead.branch_name)),
  ].filter(Boolean);
  const uniqueLeadTypes = [
    ...new Set(convertData.map((lead) => lead.inquiry_type)),
  ].filter(Boolean);

  // All countries including existing and new ones
  const allCountries = [
    "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania",
    "Latvia", "Germany", "New Zealand", "Estonia", "Australia",
    "South Korea", "Georgia", "Denmark", "Netherlands", "Sweden",
    "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland",
    "USA", "Portugal"
  ];

  return (
    <div className="p-4">
      <h2 className="">Lead Table</h2>
      {/* === FILTER SECTION === */}
      <div className="mb-3 p-3 bg-light rounded border">
        <style>
          {`
      /* Make all filters uniform */
      .filter-input,
      .filter-select {
        height: 32px !important;
        border-radius: 4px !important;
      }

      /* Remove rounded border from date input (browser default) */
      input[type="date"].filter-input {
        border-radius: 4px !important;
      }
    `}
        </style>
        <Row className="g-2 align-items-end">
          {/* Date Range Filters */}
          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">Start Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={filters.startDate}
                className="filter-input"
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">End Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={filters.endDate}
                className="filter-input"
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </Form.Group>
          </Col>
          {/* Existing Filters */}
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Statuses</Form.Label>
            <Form.Select
              size="sm"
              value={filters.status}
              className="filter-select"
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Statuses</option>
              <option value="new">New Lead</option>
              <option>Contacted</option>
              <option>Follow-Up Needed</option>
              <option>Visited Office</option>
              <option>Not Interested</option>
              <option>Next Intake Interested</option>
              <option>Registered</option>
              <option>Not Eligible</option>
              <option>Not Reachable</option>
              <option>Converted to Lead</option>
              <option>Dropped</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Counselors</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.counselor}
              onChange={(e) =>
                setFilters({ ...filters, counselor: e.target.value })
              }
            >
              <option value="">All Counselors</option>
              {[...new Set(convertData.map((d) => d.counselor_id))]
                .filter((id) => id !== 1)
                .map((id) => (
                  <option key={id} value={id}>
                    {convertData.find((c) => c.counselor_id === id)
                      ?.counselor_name || "N/A"}
                  </option>
                ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Follow Up</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.followUp}
              onChange={(e) =>
                setFilters({ ...filters, followUp: e.target.value })
              }
            >
              <option value="">Follow-Up</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="thisWeek">This Week</option>
              <option value="nextWeek">Next Week</option>
              <option value="overdue">Overdue</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Country</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.country}
              onChange={(e) =>
                setFilters({ ...filters, country: e.target.value })
              }
            >
              <option value="">All Countries</option>
              {allCountries.map((country, i) => (
                <option key={i} value={country}>
                  {country}
                </option>
              ))}
            </Form.Select>
          </Col>
          {/* New Filters */}
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Sources</Form.Label>
            <Form.Select
              style={{ height: "40px" }}
              value={filters.source}
              className="filter-select"
              onChange={(e) =>
                setFilters({ ...filters, source: e.target.value })
              }
            >
              <option value="">All Sources</option>
              <option value="whatsapp">Whatsapp</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="event">Event</option>
              <option value="agent">Agent</option>
              <option value="office_visit">Office Visit</option>
              <option value="hotline">Hotline</option>
              <option value="seminar">Seminar</option>
              <option value="expo">Expo</option>
              <option value="other">Other</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Priority</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Branches</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.branch}
              onChange={(e) =>
                setFilters({ ...filters, branch: e.target.value })
              }
            >
              <option value="">All Branches</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Sylhet">Sylhet</option>
              {uniqueBranches.map(
                (branch, i) =>
                  branch !== "Dhaka" &&
                  branch !== "Sylhet" && (
                    <option key={i} value={branch}>
                      {branch}
                    </option>
                  )
              )}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Lead Types</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.leadType}
              onChange={(e) =>
                setFilters({ ...filters, leadType: e.target.value })
              }
            >
              <option value="">All Lead Types</option>
              <option value="student_visa">Student Visa</option>
              <option value="visit_visa">Visit Visa</option>
              <option value="work_visa">Work Visa</option>
              <option value="short_visa">Short Visa</option>
              <option value="german_course">German Course</option>
              <option value="english_course">English Course</option>
              <option value="others">Others</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Search</Form.Label>
            <InputGroup size="sm">
              <Form.Control
                placeholder="Search by name, email or phone"
                value={filters.search}
                className="filter-input"
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Sort By</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Default</option>
              <option value="new-old">New → Old</option>
              <option value="old-new">Old → New</option>
              <option value="a-z">A → Z</option>
              <option value="z-a">Z → A</option>
              <option value="latest">Date → Latest</option>
              <option value="followUpAsc">Follow-Up (Earliest First)</option>
              <option value="followUpDesc">Follow-Up (Latest First)</option>
              <option value="nextFollowUpAsc">Next Follow-Up (Earliest First)</option>
              <option value="nextFollowUpDesc">Next Follow-Up (Latest First)</option>
            </Form.Select>
          </Col>
          <Col md={1}></Col>
        </Row>

        {/* New Follow-Up Filters Row */}
        <Row className="g-2 align-items-end mt-2">
          <Col md={3}>
            <Form.Label className="small fw-semibold">Last Follow-Up Done (From)</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              className="filter-input"
              value={filters.followUpDoneFrom}
              onChange={(e) =>
                setFilters({ ...filters, followUpDoneFrom: e.target.value })
              }
            />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">Last Follow-Up Done (To)</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              className="filter-input"
              value={filters.followUpDoneTo}
              onChange={(e) =>
                setFilters({ ...filters, followUpDoneTo: e.target.value })
              }
            />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">Next Follow-Up (From)</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              className="filter-input"
              value={filters.nextFollowUpFrom}
              onChange={(e) =>
                setFilters({ ...filters, nextFollowUpFrom: e.target.value })
              }
            />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">Next Follow-Up (To)</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              className="filter-input"
              value={filters.nextFollowUpTo}
              onChange={(e) =>
                setFilters({ ...filters, nextFollowUpTo: e.target.value })
              }
            />
          </Col>
        </Row>

        <Row className="mt-2 d-flex justify-content-end ">
          <Col md={1}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Col>
          <Col md={2}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowModal(true)}
            >
              Add Lead
            </Button>
          </Col>
        </Row>
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          backdrop="static"
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CounselorAddLead />
          </Modal.Body>
        </Modal>

        {/* Edit Lead Modal */}
<Modal
  show={showEditModal}
  onHide={() => {
    setShowEditModal(false);
    setEditLeadData(null);
    setIsEditMode(false);
  }}
  backdrop="static"
  size="lg"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Edit Lead</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <CounselorAddLead 
      isEditMode={isEditMode}
      editData={editLeadData}
      onClose={() => {
        setShowEditModal(false);
        setEditLeadData(null);
        setIsEditMode(false);
      }}
      onSuccess={() => {
        setShowEditModal(false);
        fetchConvertedLeads(); // Refresh data
      }}
    />
  </Modal.Body>
</Modal>
      </div>

      {/* === TABLE SECTION === */}
      <div className="table-responsive-wrapper">
        <style>
          {`
            /* Table container styling */
            .table-responsive-wrapper {
              position: relative;
              height: 70vh;
              overflow-y: auto;
              overflow-x: auto;
              border: 1px solid #dee2e6;
            }
            
            /* Table styling */
            .freeze-columns-table {
              position: relative;
              min-width: 1200px;
            }
            
            /* Freeze columns for both header and body cells */
            .freeze-column {
              position: sticky;
              background-color: white;
              z-index: 10;
              box-sizing: border-box;
              white-space: normal;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            /* Individual column positioning to prevent overlap */
            /* Explicit left positions for frozen columns (header + body) */
            .freeze-column-1 {
              left: 0;
              z-index: 30;
              min-width: 50px;
              width: 50px;
            }

            .freeze-column-2 {
              left: 50px;
              z-index: 28;
              min-width: 150px;
              width: 150px;
            }

            .freeze-column-3 {
              left: 200px;
              z-index: 26;
              min-width: 200px;
              width: 200px;
            }

            .freeze-column-4 {
              left: 400px;
              z-index: 24;
              min-width: 120px;
              width: 120px;
            }
            
            /* Header styling */
            .freeze-columns-table thead th {
              position: sticky;
              top: 0;
              background-color: #f8f9fa;
              z-index: 20;
            }
            
            /* Higher z-index for frozen header columns */
            .freeze-columns-table thead th.freeze-column-1 {
              z-index: 50;
            }
            
            .freeze-columns-table thead th.freeze-column-2 {
              z-index: 49;
            }
            
            .freeze-columns-table thead th.freeze-column-3 {
              z-index: 48;
            }
            
            .freeze-columns-table thead th.freeze-column-4 {
              z-index: 47;
            }
            
            /* Border styling for frozen columns */
            .freeze-columns-table thead th.freeze-column,
            .freeze-columns-table tbody td.freeze-column {
              border-right: 2px solid #dee2e6;
            }
            
            /* Custom scrollbar styling */
            .table-responsive-wrapper::-webkit-scrollbar {
              width: 12px;
              height: 12px;
            }
            
            .table-responsive-wrapper::-webkit-scrollbar-track {
              background: #f1f1f1;
            }
            
            .table-responsive-wrapper::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 6px;
            }
            
            .table-responsive-wrapper::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}
        </style>
        
        <Table bordered hover className="freeze-columns-table">
          <thead className="table-light">
            <tr>
              <th className="freeze-column freeze-column-1">#</th>
              <th className="freeze-column freeze-column-2">Name</th>
              <th className="freeze-column freeze-column-3">Email</th>
              <th className="freeze-column freeze-column-4">Phone</th>
              <th>Country</th>
              <th>Branch</th>
              <th>Enquiry Type</th>
              <th>Course</th>
              <th>Source</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Counselor Name</th>
              <th>Last Follow-Up Date</th>
              <th>Next Follow-Up Date</th>
              <th>Created At</th>
              <th>View</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageData().map((lead, index) =>{
               const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
              return (
      
              <tr key={lead.id}>
                 <td className="freeze-column freeze-column-1">{globalIndex}</td>
                <td className="freeze-column freeze-column-2">
                  {lead.full_name || "N/A"}
                </td>
                <td className="freeze-column freeze-column-3">
                  {lead.email || "N/A"}
                </td>
                <td className="freeze-column freeze-column-4">
                  {lead.phone_number || "N/A"}
                </td>
                <td>{lead.country || "N/A"}</td>
                <td>{lead.branch || "N/A"}</td>
                <td>{lead.inquiry_type || "N/A"}</td>
                <td>{lead.course_name || "N/A"}</td>
                <td>{lead.source || "N/A"}</td>
                <td>
                  <span
                    className={`badge ${getStatusBadgeColor(
                      lead.new_leads == 0 ? "New Lead" : lead.new_leads
                    )}`}
                  >
                    {lead.new_leads == 0
                      ? "New Lead"
                      : lead.new_leads || "N/A"}
                  </span>
                </td>
                <td>{lead.priority || "N/A"}</td>
                <td>
                  {lead.counselor_id ? (
                    <span
                      className="badge bg-info"
                      role="button"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenAssignModal(lead)}
                    >
                      {lead.counselor_name || "Assigned"}
                    </span>
                  ) : (
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenAssignModal(lead)}
                    >
                      Assign Counselor
                    </Button>
                  )}
                </td>
                <td>{lead.last_followup_date?.slice(0, 10) || "N/A"}</td>
                <td>{lead.next_followup_date?.slice(0, 10) || "N/A"}</td>
                <td>{lead.created_at ? formatDateTime(lead.created_at) : "N/A"}</td>
                <td>
                  <Form.Select
                    size="sm"
                    className="me-2"
                    style={{ width: "100px" }}
                    value={lead.priority || ""}
                    onChange={(e) => handlePriorityChangeFromTable(lead.id, e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowLeadDetailsModal(true);
                    }}
                  >
                    View Lead
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/follow-up-history/${lead.id}`)
                    }
                  >
                    Follow-Up History
                  </Button>
                  <Link to={`/note-history/${lead.id}`}>
                    {" "}
                    <Button> Add Notes</Button>
                  </Link>
                </td>
                <td className="d-flex">
                  <Form.Select
                    size="sm"
                    className="me-2"
                    style={{ width: "100px" }}
                    value={lead.lead_status || ""}
                    onChange={(e) =>
                      handleStatusChangeFromTable(lead.id, e.target.value)
                    }
                  >
                    <option>Action</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-Up Needed">Follow-Up Needed</option>
                    <option value="Visited Office">Visited Office</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Not reachable">Not Reachable</option>
                    <option value="Not Eligible">Not Eligible</option>
                    <option value="Next Intake Interested">
                      Next Intake Interested
                    </option>
                    <option value="Registered">Registered</option>
                    <option value="Dropped">Dropped</option>
                  </Form.Select>
                  {lead.new_leads === "Registered" && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2 me-2"
                      onClick={() => handleConvertToStudent(lead)}
                    >
                      <BsArrowRepeat className="me-1" /> Convert to Student
                    </Button>
                  )}
                  <Button
                    variant="outline-success"
                    className=" btn btn-sm btn-outline-success me-2 py-1"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${lead.phone_number}`,
                        "_blank"
                      )
                    }
                  >
                    <i className="bi bi-whatsapp  "></i>
                  </Button>
                  <Button
  variant="outline-warning"
  size="sm"
  className="ms-2 me-2"
  onClick={() => handleEditLead(lead)}
>
  <i className="bi bi-pencil"></i> Edit
</Button>
                  <button
                    onClick={() => {
                      axios
                        .post(`${BASE_URL}send-inquiry-mail`, lead)
                        .then(() => alert("Mail sent successfully!"))
                        .catch(() => alert("Mail send failed!"));
                    }}
                    className="btn btn-sm btn-outline-dark"
                  >
                    <BsEnvelope className="me-1" /> Send Mail
                  </button>
                  <a
                    href={`tel:${lead.phone_number}`}
                    className="btn btn-sm btn-outline-primary ms-2"
                    style={{ display: "flex", alignItems: "center" }}
                    title="Call"
                  >
                    <BsTelephone className="me-1" />
                  </a>
                </td>
              </tr>
              );
})}
          </tbody>
        </Table>
      </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center">
          <span className="me-2">Show</span>
          <Form.Select 
            size="sm" 
            style={{ width: '80px' }}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
          <span className="ms-2">entries</span>
        </div>
        
        <div>
          <span className="me-3">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
        </div>
        
        <div>
          <Pagination className="mb-0">
            <Pagination.First 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {renderPaginationItems()}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedInquiry?.counselor_id
              ? "Update Counselor"
              : "Assign Counselor"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInquiry && (
            <>
              <p>
                <strong>Lead:</strong> {selectedInquiry.full_name}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Counselor *</Form.Label>
                <Form.Select
                  value={selectedCounselor?.id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const counselor = counselors.find(
                      (c) => c.id.toString() === id
                    );
                    setSelectedCounselor(counselor);
                  }}
                >
                  <option value="">Select Counselor</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Follow-Up Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Write notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAssignModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignCounselor}>
            {selectedInquiry?.counselor_id
              ? "Update Counselor"
              : "Assign Counselor"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Documents Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload Documents</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Passport</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, "passport")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Certificates</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, "certificates")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>IELTS</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, "ielts")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>SOP</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => handleFileChange(e, "sop")}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadDocuments}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Student Form Modal */}
      <Modal show={showStudentModal} onHide={resetForm} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Student Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="fullName">
                  <Form.Label>Student Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter student name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="fatherName">
                  <Form.Label>Father Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter father name"
                    value={formData.father_name}
                    onChange={(e) =>
                      setFormData({ ...formData, father_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="motherName">
                  <Form.Label>Mother Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter mother name"
                    value={formData.mother_name}
                    onChange={(e) =>
                      setFormData({ ...formData, mother_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter student's email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="dob">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="mobileNumber">
                  <Form.Label>Mobile Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.mobile_number}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, mobile_number: value });
                      }
                    }}
                    required
                    maxLength={10}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="university">
                  <Form.Label>University Name</Form.Label>
                  <Form.Select
                    value={formData.university_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        university_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select university</option>
                    {universities?.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="identifyingName">
                  <Form.Label>Student Identifying Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.identifying_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identifying_name: e.target.value,
                      })
                    }
                    placeholder="e.g., Rahim Harvard Deb"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <div>
                    {["Male", "Female", "Other"].map((g) => (
                      <Form.Check
                        inline
                        key={g}
                        type="radio"
                        label={g}
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="category">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="General">Bachelor </option>
                    <option value="SC">Masters </option>
                    <option value="ST">Post graduate
                    </option>
                    <option value="OBC">Foundation </option>
                    <option value="Other">Scholarship </option>
                    <option value="Other">PhD </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={resetForm} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? "Update" : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Lead Details Modal */}
      <Modal
        show={showLeadDetailsModal}
        onHide={() => setShowLeadDetailsModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Lead Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <div>
              {/* Personal Information */}
              <h5 className="mb-3">Personal Information</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Name:</strong> {selectedLead.full_name}
                </Col>
                <Col md={6}>
                  <strong>Email:</strong> {selectedLead.email}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Phone:</strong> {selectedLead.phone_number}
                </Col>
                <Col md={6}>
                  <strong>Gender:</strong> {selectedLead.gender}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Date of Birth:</strong>{" "}
                  {selectedLead.date_of_birth?.slice(0, 10)}
                </Col>
                <Col md={6}>
                  <strong>City:</strong> {selectedLead.city}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Address:</strong> {selectedLead.address}
                </Col>
                <Col md={6}>
                  <strong>Present Address:</strong>{" "}
                  {selectedLead.present_address}
                </Col>
              </Row>
              {/* Inquiry Info */}
              <h5 className="mt-4 mb-3">Inquiry Details</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Inquiry Type:</strong> {selectedLead.inquiry_type}
                </Col>
                <Col md={6}>
                  <strong>Source:</strong> {selectedLead.source}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Branch:</strong> {selectedLead.branch}
                </Col>
                <Col md={6}>
                  <strong>Country:</strong> {selectedLead.country}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Course Name:</strong> {selectedLead.course_name}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {selectedLead.lead_status}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Payment Status:</strong> {selectedLead.payment_status}
                </Col>
                <Col md={6}>
                  <strong>Eligibility Status:</strong>{" "}
                  {selectedLead.eligibility_status}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Follow-Up Date:</strong>{" "}
                  {selectedLead.follow_up_date?.slice(0, 10) || "N/A"}
                </Col>
                <Col md={6}>
                  <strong>Follow-Up Done Date:</strong>{" "}
                  {selectedLead.follow_up_date?.slice(0, 10) || "N/A"}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Next Follow-Up Date:</strong>{" "}
                  {selectedLead.next_followup_date?.slice(0, 10) || "N/A"}
                </Col>
                <Col md={6}>
                  <strong>Date of Inquiry:</strong>{" "}
                  {selectedLead.date_of_inquiry?.slice(0, 10)}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Created At:</strong>{" "}
                  {selectedLead.created_at?.slice(0, 10)}
                </Col>
                <Col md={6}>
                  <strong>Updated At:</strong>{" "}
                  {selectedLead.updated_at?.slice(0, 10)}
                </Col>
              </Row>
              {/* Education Background */}
              <h5 className="mt-4 mb-3">Education Background</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Highest Level:</strong> {selectedLead.highest_level}
                </Col>
                <Col md={6}>
                  <strong>Study Level:</strong> {selectedLead.study_level}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Study Field:</strong> {selectedLead.study_field}
                </Col>
                <Col md={6}>
                  <strong>Intake:</strong> {selectedLead.intake}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Budget:</strong> {selectedLead.budget}
                </Col>
                <Col md={6}>
                  <strong>University:</strong> {selectedLead.university}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Study Gap:</strong> {selectedLead.study_gap}
                </Col>
                <Col md={6}>
                  <strong>Visa Refused:</strong> {selectedLead.visa_refused}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={12}>
                  <strong>Education Records:</strong>
                  {(() => {
                    const edu = parseEducationBackground(selectedLead.education_background);
                    return edu && edu.length ? (
                      <ul className="mb-0 mt-2">
                        {edu.map((e, idx) => (
                          <li key={idx}>
                            <strong>{e.level || e.degree || 'Level'}:</strong> {e.gpa ? `GPA ${e.gpa}` : e.grade || 'N/A'} {e.year ? `(${e.year})` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2">No education records available.</div>
                    );
                  })()}
                </Col>
              </Row>
              {selectedLead.visa_refused === "yes" && (
                <Row className="mb-2">
                  <Col md={12}>
                    <strong>Refusal Reason:</strong>{" "}
                    {selectedLead.refusal_reason}
                  </Col>
                </Row>
              )}
              {/* English Proficiency */}
              <h5 className="mt-4 mb-3">English Proficiency</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Test Type:</strong> {selectedLead.test_type}
                </Col>
                <Col md={6}>
                  <strong>Overall Score:</strong> {selectedLead.overall_score}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={3}>
                  <strong>Reading:</strong> {selectedLead.reading_score}
                </Col>
                <Col md={3}>
                  <strong>Writing:</strong> {selectedLead.writing_score}
                </Col>
                <Col md={3}>
                  <strong>Speaking:</strong> {selectedLead.speaking_score}
                </Col>
                <Col md={3}>
                  <strong>Listening:</strong> {selectedLead.listening_score}
                </Col>
              </Row>
              {/* Work Experience */}
              <h5 className="mt-4 mb-3">Work Experience</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Company Name:</strong> {selectedLead.company_name}
                </Col>
                <Col md={6}>
                  <strong>Job Title:</strong> {selectedLead.job_title}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Job Duration:</strong> {selectedLead.job_duration}
                </Col>
              </Row>
              {/* Additional Info */}
              <h5 className="mt-4 mb-3">Additional Info</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <strong>Counselor Name:</strong> {selectedLead.counselor_name}
                </Col>
                <Col md={6}>
                  <strong>Notes:</strong> {selectedLead.notes}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLeadDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* showfollowup modal */}
      <Modal
        show={showFollowUpModal}
        onHide={() => setShowFollowUpModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Follow-Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Follow-Up Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Follow-Up Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter notes..."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Next Action</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Call, Email, Meeting"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowFollowUpModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary">Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showNotesModal}
        onHide={() => setShowNotesModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Write your notes here..."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Note Type</Form.Label>
                <Form.Select>
                  <option value="">Select Type</option>
                  <option value="General">General</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Important">Important</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeadTable;