// import React, { useEffect, useState, useRef } from "react";
// import {
//   Table,
//   Form,
//   Button,
//   Badge,
//   Row,
//   Col,
//   InputGroup,
//   Modal,
//   Pagination
// } from "react-bootstrap";
// import {
//   BsUpload,
//   BsWhatsapp,
//   BsArrowRepeat,
//   BsSearch,
//   BsEnvelope,
//   BsTelephone
// } from "react-icons/bs";
// import api from "../../services/axiosInterceptor";
// import "./Lead.css";
// import AddLead from "./AddLead";
// import BASE_URL from "../../Config";
// import axios from "axios";

// const Lead = ({ show, handleClose }) => {
//   // Add refs for the table container and fake scrollbar
//   const tableContainerRef = useRef(null);
//   const fakeScrollbarRef = useRef(null);

//   // State to track if we need to show the fake scrollbar
//   const [showFakeScrollbar, setShowFakeScrollbar] = useState(false);

//   // All your existing state variables
//   const [convertData, setConvertData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [selectedInquiry, setSelectedInquiry] = useState(null);
//   const [counselors, setCounselors] = useState([]);
//   const [selectedCounselor, setSelectedCounselor] = useState(null);
//   const [followUpDate, setFollowUpDate] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [notes, setNotes] = useState("");
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
//   const [userRole, setUserRole] = useState(""); // New state to store user role
//   const [userBranch, setUserBranch] = useState(""); // New state to store user branch
//   const [staffData, setStaffData] = useState(null); // Store staff data
//   const [loading, setLoading] = useState(false); // Add loading state

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 100; // 10 items per page as requested

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
//     sortBy: "",
//     // New filter fields for follow-up functionality
//     followUpDoneFrom: "",
//     followUpDoneTo: "",
//     nextFollowUpFrom: "",
//     nextFollowUpTo: "",
//     followUpDonePreset: "",
//     nextFollowUpPreset: ""
//   });

//   const role = localStorage.getItem("role");
//   const user_id = localStorage.getItem("user_id");
//   console.log(user_id)

//   // ✅ Function to fetch staff branch
//   const fetchStaffBranch = async () => {
//     if (!user_id) {
//       console.error("User ID not found in localStorage");
//       setError("User not logged in.");
//       return null;
//     }

//     try {
//       const response = await axios.get(`${BASE_URL}getStaffById/${user_id}`);
//       if (response.status === 200 && response.data?.length > 0) {
//         const staff = response.data[0];
//         return {
//           branch: staff.branch || null,
//           created_at: staff.created_at
//             ? new Date(staff.created_at).toISOString().split("T")[0]
//             : null,
//         };
//       } else {
//         console.warn("Unexpected response:", response);
//         return { branch: null, created_at: null };
//       }
//     } catch (error) {
//       console.error("Error fetching staff branch:", error);
//       return { branch: null, created_at: null };
//     }
//   };

//   // ✅ Function to fetch converted leads
//   const fetchConvertedLeads = async () => {
//     setLoading(true);
//     try {
//       const { branch, created_at } = await fetchStaffBranch();

//       let response;
//       if (branch) {
//         // ✅ Branch mil gayi → filtered API call
//         console.log(`Fetching converted leads for branch: ${branch} on ${created_at}`);
//         response = await axios.get(
//           `${BASE_URL}AllConvertedLeadsinquiries?branch=${branch}&created_at=${created_at}`
//         );
//       } else {
//         // ✅ Branch nahi mili → all leads API call
//         console.log("Branch not found. Fetching all converted leads.");
//         response = await axios.get(`${BASE_URL}AllConvertedLeadsinquiries`);
//       }

//       if (response.data && Array.isArray(response.data)) {
//         setConvertData(response.data);
//         setFilteredData(response.data);
//         setCurrentPage(1);
//         console.log(`Fetched ${response.data.length} converted leads`);
//       } else {
//         console.error("Invalid response data:", response.data);
//         setConvertData([]);
//         setFilteredData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching converted leads:", error);
//       alert("Failed to fetch converted leads. Please try again.");
//       setConvertData([]);
//       setFilteredData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchConvertedLeads();
//   }, [user_id])

//   // Check if we need to show the fake scrollbar
//   useEffect(() => {
//     const checkScrollNeeded = () => {
//       if (tableContainerRef.current) {
//         const hasHorizontalScroll = tableContainerRef.current.scrollWidth > tableContainerRef.current.clientWidth;
//         setShowFakeScrollbar(hasHorizontalScroll);
//       }
//     };

//     // Initial check
//     checkScrollNeeded();

//     // Check on window resize
//     window.addEventListener('resize', checkScrollNeeded);

//     // Cleanup
//     return () => window.removeEventListener('resize', checkScrollNeeded);
//   }, [filteredData]);

//   // Sync scroll between table and fake scrollbar
//   useEffect(() => {
//     const tableContainer = tableContainerRef.current;
//     const fakeScrollbar = fakeScrollbarRef.current;

//     if (!tableContainer || !fakeScrollbar) return;

//     const handleTableScroll = () => {
//       if (fakeScrollbar) {
//         fakeScrollbar.scrollLeft = tableContainer.scrollLeft;
//       }
//     };

//     const handleFakeScrollbarScroll = () => {
//       if (tableContainer) {
//         tableContainer.scrollLeft = fakeScrollbar.scrollLeft;
//       }
//     };

//     tableContainer.addEventListener('scroll', handleTableScroll);
//     fakeScrollbar.addEventListener('scroll', handleFakeScrollbarScroll);

//     // Cleanup
//     return () => {
//       tableContainer.removeEventListener('scroll', handleTableScroll);
//       fakeScrollbar.removeEventListener('scroll', handleFakeScrollbarScroll);
//     };
//   }, [showFakeScrollbar]);

//   const fetchCounselors = async () => {
//     try {
//       const res = await api.get(`${BASE_URL}counselor`);
//       console.log("Counselors response:", res.data); // Debug log
//       setCounselors(res.data);
//     } catch (err) {
//       console.error("Error fetching counselors:", err);
//       if (err.response) {
//         console.error("Error response:", err.response);
//         console.error("Error status:", err.response.status);
//         console.error("Error data:", err.response.data);
//       }
//       alert("Failed to fetch counselors");
//     }
//   };

//   const fetchUniversities = async () => {
//     try {
//       const response = await api.get(`${BASE_URL}universities`);
//       console.log("Universities response:", response.data); // Debug log
//       setUniversities(response.data);
//     } catch (error) {
//       console.error("Error fetching universities:", error);
//       if (error.response) {
//         console.error("Error response:", error.response);
//         console.error("Error status:", error.response.status);
//         console.error("Error data:", error.response.data);
//       }
//       alert("Failed to fetch universities");
//     }
//   };

//   // Fetch counselors and universities when component mounts
//   useEffect(() => {
//     fetchCounselors();
//     fetchUniversities();
//   }, []);

//   const handleStatusChangeFromTable = async (id, status) => {
//     // Map frontend values to backend-expected strings (adjust mapping if your backend expects different text)
//     const statusMap = {
//       Review: "In Review", // fallback if old code sends "Review"
//       "In Review": "In Review",
//       Eligible: "Eligible",
//       "Not Eligible": "Not Eligible",
//       "New Lead": "New Lead",
//       Contacted: "Contacted",
//       "Follow-Up Needed": "Follow-Up Needed",
//       "Visited Office": "Visited Office",
//       "Not Interested": "Not Interested",
//       "Next Intake Interested": "Next Intake Interested",
//       Registered: "Registered",
//       Dropped: "Dropped"
//     };

//     const mappedStatus = statusMap[status] || status;

//     const payload = {
//       inquiry_id: id,
//       new_leads: mappedStatus,
//       lead_status: mappedStatus // send both keys to be compatible with different backend expectations
//     };

//     try {
//       const res = await api.patch(`${BASE_URL}update-lead-status-new`, payload);
//       if (res.status === 200 || res.status === 204) {
//         alert("Status updated successfully!");
//         fetchConvertedLeads();
//       } else {
//         console.warn("Unexpected update response:", res);
//         alert("Status update returned unexpected response. See console.");
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//         console.error("Error status:", error.response.status);
//         alert(`Failed to update status: ${error.response.data?.message || error.response.status}`);
//       } else {
//         alert("Failed to update status due to network error.");
//       }
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

//   // Filter function
//   useEffect(() => {
//     let data = [...convertData];
//     if (filters.search) {
//       const search = filters.search.toLowerCase();
//       data = data.filter(
//         (lead) =>
//           (lead.full_name && lead.full_name.toLowerCase().includes(search)) ||
//           (lead.email && lead.email.toLowerCase().includes(search)) ||
//           (lead.phone_number && lead.phone_number.includes(search))
//       );
//     }
//     if (filters.status) {
//       data = data.filter((lead) => lead.new_leads === filters.status);
//     }
//     if (filters.counselor) {
//       data = data.filter((lead) => String(lead.counselor_id) === filters.counselor);
//     }
//     if (filters.followUp) {
//       const today = new Date();
//       const dateOnly = (d) => new Date(d).toISOString().slice(0, 10);
//       if (filters.followUp === "today") {
//         data = data.filter((lead) => lead.follow_up_date && dateOnly(lead.follow_up_date) === dateOnly(today));
//       } else if (filters.followUp === "thisWeek") {
//         const endOfWeek = new Date();
//         endOfWeek.setDate(today.getDate() + 7);
//         data = data.filter(
//           (lead) =>
//             lead.follow_up_date &&
//             new Date(lead.follow_up_date) >= today &&
//             new Date(lead.follow_up_date) <= endOfWeek
//         );
//       } else if (filters.followUp === "overdue") {
//         data = data.filter((lead) => lead.follow_up_date && new Date(lead.follow_up_date) < today);
//       }
//     }
//     if (filters.country) {
//       data = data.filter((lead) => lead.country === filters.country);
//     }
//     if (filters.startDate && filters.endDate) {
//       const start = new Date(filters.startDate);
//       const end = new Date(filters.endDate);
//       end.setHours(23, 59, 59, 999);
//       data = data.filter((inq) => {
//         const inquiryDate = new Date(inq.created_at || inq.date_of_inquiry);
//         return inquiryDate >= start && inquiryDate <= end;
//       });
//     }
//     if (filters.source) {
//       data = data.filter((lead) => lead.source === filters.source);
//     }
//     if (filters.branch) {
//       data = data.filter((lead) => lead.branch === filters.branch);
//     }
//     if (filters.leadType) {
//       data = data.filter((lead) => lead.inquiry_type === filters.leadType);
//     }

//     // New Follow-Up Done Filter
//     if (filters.followUpDoneFrom && filters.followUpDoneTo) {
//       const fromDate = new Date(filters.followUpDoneFrom);
//       const toDate = new Date(filters.followUpDoneTo);
//       toDate.setHours(23, 59, 59, 999);

//       data = data.filter((lead) => {
//         if (!lead.follow_up_date) return false;
//         const followUpDate = new Date(lead.follow_up_date);
//         return followUpDate >= fromDate && followUpDate <= toDate;
//       });
//     }

//     // Handle Follow-Up Done Presets
//     if (filters.followUpDonePreset) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       const endOfWeek = new Date(today);
//       endOfWeek.setDate(endOfWeek.getDate() + 7);
//       const startOfNextWeek = new Date(endOfWeek);
//       const endOfNextWeek = new Date(startOfNextWeek);
//       endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

//       if (filters.followUpDonePreset === "today") {
//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           return followUpDate >= today && followUpDate < tomorrow;
//         });
//       } else if (filters.followUpDonePreset === "thisWeek") {
//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           return followUpDate >= today && followUpDate <= endOfWeek;
//         });
//       } else if (filters.followUpDonePreset === "nextWeek") {
//         data = data.filter((lead) => {
//           if (!lead.follow_up_date) return false;
//           const followUpDate = new Date(lead.follow_up_date);
//           return followUpDate >= startOfNextWeek && followUpDate <= endOfNextWeek;
//         });
//       }
//     }

//     // New Next Follow-Up Filter
//     if (filters.nextFollowUpFrom && filters.nextFollowUpTo) {
//       const fromDate = new Date(filters.nextFollowUpFrom);
//       const toDate = new Date(filters.nextFollowUpTo);
//       toDate.setHours(23, 59, 59, 999);

//       data = data.filter((lead) => {
//         if (!lead.next_follow_up_date) return false;
//         const nextFollowUpDate = new Date(lead.next_follow_up_date);
//         return nextFollowUpDate >= fromDate && nextFollowUpDate <= toDate;
//       });
//     }

//     // Handle Next Follow-Up Presets
//     if (filters.nextFollowUpPreset) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const tomorrow = new Date(today);
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       const endOfWeek = new Date(today);
//       endOfWeek.setDate(endOfWeek.getDate() + 7);
//       const startOfNextWeek = new Date(endOfWeek);
//       const endOfNextWeek = new Date(startOfNextWeek);
//       endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

//       if (filters.nextFollowUpPreset === "today") {
//         data = data.filter((lead) => {
//           if (!lead.next_follow_up_date) return false;
//           const nextFollowUpDate = new Date(lead.next_follow_up_date);
//           return nextFollowUpDate >= today && nextFollowUpDate < tomorrow;
//         });
//       } else if (filters.nextFollowUpPreset === "thisWeek") {
//         data = data.filter((lead) => {
//           if (!lead.next_follow_up_date) return false;
//           const nextFollowUpDate = new Date(lead.next_follow_up_date);
//           return nextFollowUpDate >= today && nextFollowUpDate <= endOfWeek;
//         });
//       } else if (filters.nextFollowUpPreset === "nextWeek") {
//         data = data.filter((lead) => {
//           if (!lead.next_follow_up_date) return false;
//           const nextFollowUpDate = new Date(lead.next_follow_up_date);
//           return nextFollowUpDate >= startOfNextWeek && nextFollowUpDate <= endOfNextWeek;
//         });
//       }
//     }

//     // Sorting Section
//     if (filters.sortBy) {
//       if (filters.sortBy === "newToOld") {
//         data.sort((a, b) => new Date(b.created_at || b.date_of_inquiry) - new Date(a.created_at || b.date_of_inquiry));
//       } else if (filters.sortBy === "oldToNew") {
//         data.sort((a, b) => new Date(a.created_at || a.date_of_inquiry) - new Date(b.created_at || a.date_of_inquiry));
//       } else if (filters.sortBy === "aToZ") {
//         data.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
//       } else if (filters.sortBy === "zToA") {
//         data.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
//       } else if (filters.sortBy === "updatedAt") {
//         data.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)); // Latest modified first
//       } else if (filters.sortBy === "followUpDateAsc") {
//         data.sort((a, b) => {
//           if (!a.follow_up_date) return 1;
//           if (!b.follow_up_date) return -1;
//           return new Date(a.follow_up_date) - new Date(b.follow_up_date);
//         });
//       } else if (filters.sortBy === "followUpDateDesc") {
//         data.sort((a, b) => {
//           if (!a.follow_up_date) return 1;
//           if (!b.follow_up_date) return -1;
//           return new Date(b.follow_up_date) - new Date(a.follow_up_date);
//         });
//       } else if (filters.sortBy === "nextFollowUpDateAsc") {
//         data.sort((a, b) => {
//           if (!a.next_follow_up_date) return 1;
//           if (!b.next_follow_up_date) return -1;
//           return new Date(a.next_follow_up_date) - new Date(b.next_follow_up_date);
//         });
//       } else if (filters.sortBy === "nextFollowUpDateDesc") {
//         data.sort((a, b) => {
//           if (!a.next_follow_up_date) return 1;
//           if (!b.next_follow_up_date) return -1;
//           return new Date(b.next_follow_up_date) - new Date(a.next_follow_up_date);
//         });
//       }
//     }

//     setFilteredData(data);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [filters, convertData]);

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
//       if (err.response) {
//         console.error("Error response:", err.response);
//         console.error("Error status:", err.response.status);
//         console.error("Error data:", err.response.data);
//       }
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
//       if (selectedFiles[key]) {
//         formData.append(key, selectedFiles[key]);
//       }
//     });
//     try {
//       const res = await api.post(`${BASE_URL}upload-inquiry-documents`, formData);
//       if (res.status === 200) {
//         alert("Documents uploaded successfully.");
//         setShowUploadModal(false);
//       }
//     } catch (err) {
//       console.error("Error uploading documents:", err);
//       if (err.response) {
//         console.error("Error response:", err.response);
//         console.error("Error status:", err.response.status);
//         console.error("Error data:", err.response.data);
//       }
//       alert("Failed to upload.");
//     }
//   };

//   const handleConvertToStudent = (lead) => {
//     let formattedDateOfBirth = "";
//     if (lead.date_of_birth) {
//       const dateObj = new Date(lead.date_of_birth);
//       formattedDateOfBirth = dateObj.toISOString().split('T')[0];
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
//     email: ""
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
//       alert(isEditing ? "Student updated successfully" : "Student created successfully");
//       resetForm();
//       fetchConvertedLeads();
//     } catch (err) {
//       console.error("Error:", err);
//       if (err.response) {
//         console.error("Error response:", err.response);
//         console.error("Error status:", err.response.status);
//         console.error("Error data:", err.response.data);
//       }
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
//       const university = universities.find(u => u.id.toString() === formData.university_id.toString());
//       const universityName = university ? university.name : "";
//       const identifying = `${formData.full_name} ${universityName} Deb`;
//       setFormData((prev) => ({
//         ...prev,
//         identifying_name: identifying,
//       }));
//     }
//   }, [formData.full_name, formData.university_id, universities]);

//   // Get unique values for filter dropdowns
//   const uniqueSources = [...new Set(convertData.map(lead => lead.source))].filter(Boolean);
//   const uniqueBranches = [...new Set(convertData.map(lead => lead.branch))].filter(Boolean);
//   const uniqueLeadTypes = [...new Set(convertData.map(lead => lead.inquiry_type))].filter(Boolean);
//   const uniqueCountries = [...new Set(convertData.map(lead => lead.country))].filter(Boolean);

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     // Scroll to top of table when changing page
//     if (tableContainerRef.current) {
//       tableContainerRef.current.scrollTo(0, 0);
//     }
//   };

//   // Handle preset changes for follow-up filters
//   const handleFollowUpDonePresetChange = (preset) => {
//     setFilters({
//       ...filters,
//       followUpDonePreset: preset,
//       followUpDoneFrom: "",
//       followUpDoneTo: ""
//     });
//   };

//   const handleNextFollowUpPresetChange = (preset) => {
//     setFilters({
//       ...filters,
//       nextFollowUpPreset: preset,
//       nextFollowUpFrom: "",
//       nextFollowUpTo: ""
//     });
//   };

//   return (
//     <div className="p-4" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
//                 onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
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
//                 onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
//               />
//             </Form.Group>
//           </Col>
//           {/* Existing Filters */}
//           <Col md={2}>
//             <Form.Label>All Statuses</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
//               onChange={(e) => setFilters({ ...filters, counselor: e.target.value })}
//             >
//               <option value="">All Counselors</option>
//               {counselors.map(counselor => (
//                 <option key={counselor.id} value={counselor.id}>{counselor.full_name}</option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>Follow Up</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.followUp}
//               onChange={(e) => setFilters({ ...filters, followUp: e.target.value })}
//             >
//               <option value="">Follow-Up</option>
//               <option value="today">Today</option>
//               <option value="yesterday">Yesterday</option>
//               <option value="nextWeek">Next Week</option>
//               <option value="thisWeek">This Week</option>
//               <option value="overdue">Overdue</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>All Country</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.country}
//               onChange={(e) => setFilters({ ...filters, country: e.target.value })}
//             >
//               <option value="">All Countries</option>
//               <option value="Hungary">Hungary</option>
//               <option value="UK">UK</option>
//               <option value="Cyprus">Cyprus</option>
//               <option value="Canada">Canada</option>
//               <option value="Malaysia">Malaysia</option>
//               <option value="Lithuania">Lithuania</option>
//               <option value="Latvia">Latvia</option>
//               <option value="Germany">Germany</option>
//               <option value="New Zealand">New Zealand</option>
//               <option value="Estonia">Estonia</option>
//               <option value="Australia">Australia</option>
//               <option value="South Korea">South Korea</option>
//               <option value="Georgia">Georgia</option>
//               <option value="Denmark">Denmark</option>
//               <option value="Netherlands">Netherlands</option>
//               <option value="Sweden">Sweden</option>
//               <option value="Norway">Norway</option>
//               <option value="Belgium">Belgium</option>
//               <option value="Romania">Romania</option>
//               <option value="Russia">Russia</option>
//               <option value="Turkey">Turkey</option>
//               <option value="Ireland">Ireland</option>
//               <option value="USA">USA</option>
//               <option value="Portugal">Portugal</option>
//               <option value="Others">Others</option>
//               {uniqueCountries.map((country, i) => (
//                 !["Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", "Latvia", "Germany",
//                   "New Zealand", "Estonia", "Australia", "South Korea", "Georgia", "Denmark", "Netherlands",
//                   "Sweden", "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", "USA", "Portugal", "Others"].includes(country) && (
//                   <option key={i} value={country}>
//                     {country}
//                   </option>
//                 )
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
//               <option value="whatsapp">WhatsApp</option>
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
//               onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
//               disabled={role !== "admin"} // Only admins can change branch filter
//             >
//               <option value="">All Branches</option>
//               <option value="Dhaka">Dhaka</option>
//               <option value="Sylhet">Sylhet</option>
//               {uniqueBranches.map((branch, i) => (
//                 branch !== "Dhaka" && branch !== "Sylhet" && (
//                   <option key={i} value={branch}>
//                     {branch}
//                   </option>
//                 )
//               ))}
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>All Lead Types</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.leadType}
//               onChange={(e) => setFilters({ ...filters, leadType: e.target.value })}
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
//             <Form.Label>Sort By</Form.Label>
//             <Form.Select
//               value={filters.sortBy}
//               onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
//             >
//               <option value="">Sort By</option>
//               <option value="newToOld">Newest First</option>
//               <option value="oldToNew">Oldest First</option>
//               <option value="aToZ">Name A → Z</option>
//               <option value="zToA">Name Z → A</option>
//               <option value="updatedAt">Recently Updated</option>
//               <option value="followUpDateAsc">Follow-Up Date (Asc)</option>
//               <option value="followUpDateDesc">Follow-Up Date (Desc)</option>
//               <option value="nextFollowUpDateAsc">Next Follow-Up (Asc)</option>
//               <option value="nextFollowUpDateDesc">Next Follow-Up (Desc)</option>
//             </Form.Select>
//           </Col>
//           <Col md={2}>
//             <Form.Label>Search</Form.Label>
//             <InputGroup size="sm">
//               <Form.Control
//                 placeholder="Search by name, email or phone"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               />
//               <InputGroup.Text>
//                 <BsSearch />
//               </InputGroup.Text>
//             </InputGroup>
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
//                   branch: role === "admin" ? "" : userBranch || "", // Reset to user's branch for staff, empty for admin
//                   leadType: "",
//                   sortBy: "",
//                   // Reset new follow-up filters
//                   followUpDoneFrom: "",
//                   followUpDoneTo: "",
//                   nextFollowUpFrom: "",
//                   nextFollowUpTo: "",
//                   followUpDonePreset: "",
//                   nextFollowUpPreset: ""
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
//             <Form.Label>Follow-Up Done</Form.Label>


//             <Form.Control
//               type="date"
//               size="sm"
//               placeholder="From"
//               value={filters.followUpDoneFrom}
//               onChange={(e) => setFilters({
//                 ...filters,
//                 followUpDoneFrom: e.target.value,
//                 followUpDonePreset: ""
//               })}
//             />
//           </Col>
//           <Col md={3}>
//             <Form.Label>Follow-Up Done</Form.Label>
//             <Form.Control
//               type="date"
//               size="sm"
//               placeholder="To"
//               value={filters.followUpDoneTo}
//               onChange={(e) => setFilters({
//                 ...filters,
//                 followUpDoneTo: e.target.value,
//                 followUpDonePreset: ""
//               })}
//             />


//           </Col>
//           {/* <Col md={3}>
//             <Form.Label>Quick Presets</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.followUpDonePreset}
//               onChange={(e) => handleFollowUpDonePresetChange(e.target.value)}
//             >
//               <option value="">Select Preset</option>
//               <option value="today">Today</option>
//               <option value="thisWeek">This Week</option>
//               <option value="nextWeek">Next Week</option>
//             </Form.Select>
//           </Col> */}
//           <Col md={3}>
//             <Form.Label>Next Follow-Up</Form.Label>

//             <Form.Control
//               type="date"
//               size="sm"
//               placeholder="From"
//               value={filters.nextFollowUpFrom}
//               onChange={(e) => setFilters({
//                 ...filters,
//                 nextFollowUpFrom: e.target.value,
//                 nextFollowUpPreset: ""
//               })}
//             />

//           </Col>
//           <Col md={3}>
//             <Form.Label>Next Follow-Up</Form.Label>
//             <Form.Control
//               type="date"
//               size="sm"
//               placeholder="To"
//               value={filters.nextFollowUpTo}
//               onChange={(e) => setFilters({
//                 ...filters,
//                 nextFollowUpTo: e.target.value,
//                 nextFollowUpPreset: ""
//               })}
//             />

//           </Col>
//           {/* <Col md={3}>
//             <Form.Label>Quick Presets</Form.Label>
//             <Form.Select
//               size="sm"
//               value={filters.nextFollowUpPreset}
//               onChange={(e) => handleNextFollowUpPresetChange(e.target.value)}
//             >
//               <option value="">Select Preset</option>
//               <option value="today">Today</option>
//               <option value="thisWeek">This Week</option>
//               <option value="nextWeek">Next Week</option>
//             </Form.Select>
//           </Col> */}
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
//       <div className="table-container" style={{ flex: '1 1 auto', position: 'relative', overflow: 'hidden' }}>
//         {loading ? (
//           <div className="text-center my-5">
//             <div className="spinner-border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//             <p className="mt-2">Loading leads data...</p>
//           </div>
//         ) : (
//           <>
//             <div
//               ref={tableContainerRef}
//               className="table-responsive"
//               style={{
//                 overflowX: 'auto',
//                 overflowY: 'hidden',
//                 width: '100%'
//               }}
//             >
//               <Table bordered hover className="freeze-columns-table" style={{ minWidth: '1200px' }}>
//                 <thead className="table-light">
//                   <tr>
//                     <th className="freeze-column freeze-column-1">#</th>
//                     <th className="freeze-column freeze-column-2">Name</th>
//                     <th className="freeze-column freeze-column-3">Email</th>
//                     <th className="freeze-column freeze-column-4">Phone</th>
//                     <th >Country</th>
//                     <th>Branch</th>
//                     <th>Enquiry Type</th>
//                     <th>Course</th>
//                     <th>Source</th>
//                     <th>Status</th>
//                     <th>Counselor Name</th>
//                     <th>Follow-Up Date</th>
//                     <th>Next Follow-Up</th>
//                     <th>Created At</th>
//                     <th>View</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.length > 0 ? (
//                     currentItems.map((lead, index) => (
//                       <tr key={lead.id}>
//                         <td className="freeze-column freeze-column-1">{indexOfFirstItem + index + 1}</td>
//                         <td className="freeze-column freeze-column-2">{lead.full_name || "N/A"}</td>
//                         <td className="freeze-column freeze-column-3">{lead.email || "N/A"}</td>
//                         <td className="freeze-column freeze-column-4">{lead.phone_number}</td>
//                         <td >{lead.country || "N/A"}</td>
//                         <td>{lead.branch || "N/A"}</td>
//                         <td>{lead.inquiry_type || "N/A"}</td>
//                         <td>{lead.course_name || "N/A"}</td>
//                         <td>{lead.source || "N/A"}</td>
//                         <td>
//                           <span className={`badge ${getStatusBadgeColor(lead.new_leads == 0 ? "New Lead" : lead.new_leads)}`}>
//                             {lead.new_leads == 0 ? "New Lead" : lead.new_leads || "N/A"}
//                           </span>
//                         </td>
//                         <td>
//                           {lead.counselor_id ? (
//                             <span
//                               className="badge bg-info"
//                               role="button"
//                               style={{ cursor: "pointer" }}
//                               onClick={() => handleOpenAssignModal(lead)}
//                             >
//                               {lead.counselor_name || "Assigned"}
//                             </span>
//                           ) : (
//                             <Button
//                               variant="info"
//                               size="sm"
//                               className="me-2"
//                               onClick={() => handleOpenAssignModal(lead)}
//                             >
//                               Assign Counselor
//                             </Button>
//                           )}
//                         </td>
//                         <td>{lead.follow_up_date?.slice(0, 10) || "N/A"}</td>
//                         <td>{lead.next_followup_date?.slice(0, 10) || "N/A"}</td>
//                         <td>{lead.created_at ? lead.created_at.slice(0, 10) : "N/A"}</td>
//                         <td>
//                           <Button
//                             variant="outline-primary"
//                             size="sm"
//                             onClick={() => {
//                               setSelectedLead(lead);
//                               setShowLeadDetailsModal(true);
//                             }}
//                           >
//                             View Lead
//                           </Button>
//                           <Button
//                             variant="outline-primary"
//                             size="sm"
//                             onClick={() => window.location.href = `/follow-up-history/${lead.id}`}
//                           >
//                             Follow-Up History
//                           </Button>
//                           <Button
//                             variant="outline-primary"
//                             size="sm"
//                             onClick={() => window.location.href = `/note-history/${lead.id}`}
//                           >
//                             View Notes
//                           </Button>
//                         </td>
//                         <td className="d-flex">
//                           <Form.Select
//                             size="sm"
//                             className="me-2"
//                             style={{ width: "100px" }}
//                             value={lead.lead_status || ""}
//                             onChange={(e) => handleStatusChangeFromTable(lead.id, e.target.value)}
//                           >
//                             <option>Action</option>
//                             <option value="Contacted">Contacted</option>
//                             <option value="Follow-Up Needed">Follow-Up Needed</option>
//                             <option value="Visited Office">Visited Office</option>
//                             <option value="Not Interested">Not Interested</option>
//                             <option value="Not Eligible">Not Eligible</option>
//                             <option value="Next Intake Interested">Next Intake Interested</option>
//                             <option value="Registered">Registered</option>
//                             <option value="Dropped">Dropped</option>
//                             <option value="In Review">In Review</option>
//                             <option value="Eligible">Eligible</option>
//                           </Form.Select>

//                           {lead.new_leads === "Registered" && (
//                             <Button
//                               variant="outline-primary"
//                               size="sm"
//                               className="ms-2 me-2"
//                               onClick={() => handleConvertToStudent(lead)}
//                             >
//                               <BsArrowRepeat className="me-1" /> Convert to Student
//                             </Button>
//                           )}
//                           <Button
//                             variant="outline-success"
//                             className=" btn btn-sm btn-outline-success me-2 py-1"
//                             size="sm"
//                             onClick={() => window.open(`https://wa.me/${lead.phone_number}`, '_blank')}
//                           >
//                             <i className="bi bi-whatsapp  "></i>
//                           </Button>
//                           <a
//                             href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}&su=Regarding Your Lead&body=${encodeURIComponent(
//                               `Dear ${lead.full_name},
// Here are your lead details:
// - Name: ${lead.full_name}
// - Phone: ${lead.phone_number}
// - Email: ${lead.email}
// - Inquiry Type: ${lead.inquiry_type}
// - Source: ${lead.source}
// - Branch: ${lead.branch}
// - Counselor: ${lead.counselor_name || 'Not Assigned'}
// - Country: ${lead.country}
// - Created At: ${lead.created_at ? lead.created_at.slice(0, 10) : ''}
// - Status: ${lead.new_leads}
// Thank you for your interest.
// Regards,
// Study First Info Team`
//                             )}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="btn btn-sm btn-outline-dark"
//                             style={{ display: "flex", alignItems: "center" }}
//                           >
//                             <BsEnvelope className="me-1" />
//                           </a>
//                           <a
//                             href={`tel:${lead.phone_number}`}
//                             className="btn btn-sm btn-outline-primary ms-2"
//                             style={{ display: "flex", alignItems: "center" }}
//                             title="Call"
//                           >
//                             <BsTelephone className="me-1" />
//                           </a>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="16" className="text-center py-4">
//                         No leads found. Try adjusting your filters or add a new lead.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </div>

//             {/* Pagination Component */}
//             {filteredData.length > itemsPerPage && (
//               <div className="d-flex justify-content-between align-items-center mt-3">
//                 <div>
//                   Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
//                 </div>
//                 <Pagination>
//                   <Pagination.Prev
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                   />
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                     <Pagination.Item
//                       key={page}
//                       active={page === currentPage}
//                       onClick={() => handlePageChange(page)}
//                     >
//                       {page}
//                     </Pagination.Item>
//                   ))}
//                   <Pagination.Next
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                   />
//                 </Pagination>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* All your existing modals */}
//       {/* Assign Modal */}
//       <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {selectedInquiry?.counselor_id ? "Update Counselor" : "Assign Counselor"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedInquiry && (
//             <>
//               <p><strong>Lead:</strong> {selectedInquiry.full_name}</p>
//               <Form.Group className="mb-3">
//                 <Form.Label>Counselor *</Form.Label>
//                 <Form.Select
//                   value={selectedCounselor?.id || ""}
//                   onChange={(e) => {
//                     const id = e.target.value;
//                     const counselor = counselors.find((c) => c.id.toString() === id);
//                     setSelectedCounselor(counselor);
//                   }}
//                 >
//                   <option value="">Select Counselor</option>
//                   {counselors.map((c) => (
//                     <option key={c.id} value={c.id}>{c.full_name}</option>
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
//                 <Form.Label>Next Follow-Up Date</Form.Label>
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
//           <Button variant="secondary" onClick={handleCloseAssignModal}>Cancel</Button>
//           <Button variant="primary" onClick={handleAssignCounselor}>
//             {selectedInquiry?.counselor_id ? "Update Counselor" : "Assign Counselor"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Upload Documents Modal */}
//       <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
//         <Modal.Header closeButton><Modal.Title>Upload Documents</Modal.Title></Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Passport</Form.Label>
//             <Form.Control type="file" onChange={(e) => handleFileChange(e, "passport")} />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Certificates</Form.Label>
//             <Form.Control type="file" onChange={(e) => handleFileChange(e, "certificates")} />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>IELTS</Form.Label>
//             <Form.Control type="file" onChange={(e) => handleFileChange(e, "ielts")} />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>SOP</Form.Label>
//             <Form.Control type="file" onChange={(e) => handleFileChange(e, "sop")} />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
//           <Button variant="primary" onClick={handleUploadDocuments}>Upload</Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Student Form Modal */}
//       <Modal
//         show={showStudentModal}
//         onHide={resetForm}
//         size="xl"
//         centered
//       >
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
//                     onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//                     required
//                     readOnly
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
//                     onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     required
//                     readOnly
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
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
//                     required
//                     readOnly
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
//                     onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, identifying_name: e.target.value })}
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
//                         onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
//                 <Col md={6}><strong>Name:</strong> {selectedLead.full_name}</Col>
//                 <Col md={6}><strong>Email:</strong> {selectedLead.email}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Phone:</strong> {selectedLead.phone_number}</Col>
//                 <Col md={6}><strong>Gender:</strong> {selectedLead.gender}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Date of Birth:</strong> {selectedLead.date_of_birth?.slice(0, 10)}</Col>
//                 <Col md={6}><strong>City:</strong> {selectedLead.city}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Address:</strong> {selectedLead.address}</Col>
//                 <Col md={6}><strong>Present Address:</strong> {selectedLead.present_address}</Col>
//               </Row>
//               {/* Inquiry Info */}
//               <h5 className="mt-4 mb-3">Inquiry Details</h5>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Inquiry Type:</strong> {selectedLead.inquiry_type}</Col>
//                 <Col md={6}><strong>Source:</strong> {selectedLead.source}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Branch:</strong> {selectedLead.branch}</Col>
//                 <Col md={6}><strong>Country:</strong> {selectedLead.country}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Course Name:</strong> {selectedLead.course_name}</Col>
//                 <Col md={6}><strong>Status:</strong> {selectedLead.lead_status}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Payment Status:</strong> {selectedLead.payment_status}</Col>
//                 <Col md={6}><strong>Eligibility Status:</strong> {selectedLead.eligibility_status}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Follow-Up Date:</strong> {selectedLead.follow_up_date?.slice(0, 10) || "N/A"}</Col>
//                 <Col md={6}><strong>Next Follow-Up Date:</strong> {selectedLead.next_follow_up_date?.slice(0, 10) || "N/A"}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Date of Inquiry:</strong> {selectedLead.date_of_inquiry?.slice(0, 10)}</Col>
//                 <Col md={6}><strong>Created At:</strong> {selectedLead.created_at?.slice(0, 10)}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Updated At:</strong> {selectedLead.updated_at?.slice(0, 10)}</Col>
//               </Row>
//               {/* Education Background */}
//               <h5 className="mt-4 mb-3">Education Background</h5>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Highest Level:</strong> {selectedLead.highest_level}</Col>
//                 <Col md={6}><strong>Study Level:</strong> {selectedLead.study_level}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Study Field:</strong> {selectedLead.study_field}</Col>
//                 <Col md={6}><strong>Intake:</strong> {selectedLead.intake}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Budget:</strong> {selectedLead.budget}</Col>
//                 <Col md={6}><strong>University:</strong> {selectedLead.university}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Study Gap:</strong> {selectedLead.study_gap}</Col>
//                 <Col md={6}><strong>Visa Refused:</strong> {selectedLead.visa_refused}</Col>
//               </Row>
//               {selectedLead.visa_refused === "yes" && (
//                 <Row className="mb-2">
//                   <Col md={12}><strong>Refusal Reason:</strong> {selectedLead.refusal_reason}</Col>
//                 </Row>
//               )}
//               {/* English Proficiency */}
//               <h5 className="mt-4 mb-3">English Proficiency</h5>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Test Type:</strong> {selectedLead.test_type}</Col>
//                 <Col md={6}><strong>Overall Score:</strong> {selectedLead.overall_score}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={3}><strong>Reading:</strong> {selectedLead.reading_score}</Col>
//                 <Col md={3}><strong>Writing:</strong> {selectedLead.writing_score}</Col>
//                 <Col md={3}><strong>Speaking:</strong> {selectedLead.speaking_score}</Col>
//                 <Col md={3}><strong>Listening:</strong> {selectedLead.listening_score}</Col>
//               </Row>
//               {/* Work Experience */}
//               <h5 className="mt-4 mb-3">Work Experience</h5>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Company Name:</strong> {selectedLead.company_name}</Col>
//                 <Col md={6}><strong>Job Title:</strong> {selectedLead.job_title}</Col>
//               </Row>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Job Duration:</strong> {selectedLead.job_duration}</Col>
//               </Row>
//               {/* Additional Info */}
//               <h5 className="mt-4 mb-3">Additional Info</h5>
//               <Row className="mb-2">
//                 <Col md={6}><strong>Counselor Name:</strong> {selectedLead.counselor_name}</Col>
//                 <Col md={6}><strong>Notes:</strong> {selectedLead.notes}</Col>
//               </Row>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowLeadDetailsModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* showfollowup modal */}
//       <Modal show={showFollowUpModal} onHide={() => setShowFollowUpModal(false)} centered>
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
//                 <Form.Label>Next Follow-Up Date</Form.Label>
//                 <Form.Control type="date" />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Follow-Up Notes</Form.Label>
//                 <Form.Control as="textarea" rows={3} placeholder="Enter notes..." />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Next Action</Form.Label>
//                 <Form.Control type="text" placeholder="e.g. Call, Email, Meeting" />
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowFollowUpModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary">
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>
//       <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Add Notes</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLead && (
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Notes</Form.Label>
//                 <Form.Control as="textarea" rows={4} placeholder="Write your notes here..." />
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
//           <Button variant="primary">
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Lead;



import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Form,
  Button,
  Badge,
  Row,
  Col,
  InputGroup,
  Modal,
  Pagination
} from "react-bootstrap";
import {
  BsUpload,
  BsWhatsapp,
  BsArrowRepeat,
  BsSearch,
  BsEnvelope,
  BsTelephone
} from "react-icons/bs";
import api from "../../services/axiosInterceptor";
import "./Lead.css";
import AddLead from "./AddLead";
import BASE_URL from "../../Config";
import axios from "axios";

const Lead = ({ show, handleClose }) => {
  // Add refs for the table container and fake scrollbar
  const tableContainerRef = useRef(null);
  const fakeScrollbarRef = useRef(null);

  // State to track if we need to show the fake scrollbar
  const [showFakeScrollbar, setShowFakeScrollbar] = useState(false);

  // All your existing state variables
  const [convertData, setConvertData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState(""); // Added for next follow-up date
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
  const [userRole, setUserRole] = useState(""); // New state to store user role
  const [userBranch, setUserBranch] = useState(""); // New state to store user branch
  const [staffData, setStaffData] = useState(null); // Store staff data
  const [loading, setLoading] = useState(false); // Add loading state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // 10 items per page as requested

  // const [filters, setFilters] = useState({
  //   status: "",
  //   counselor: "",
  //   followUp: "",
  //   country: "",
  //   search: "",
  //   startDate: "",
  //   endDate: "",
  //   source: "",
  //   branch: "",
  //   leadType: "",
  //   priority: "",
  //   sortBy: "",
  //   // New filter fields for follow-up functionality
  //   followUpDoneFrom: "",
  //   followUpDoneTo: "",
  //   nextFollowUpFrom: "",
  //   nextFollowUpTo: "",
  //   followUpDonePreset: "",
  //   nextFollowUpPreset: ""
  // });



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

  // ... 其他代码保持不变

  // 修改重置按钮的处理函数，同时清除 localStorage
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

  const role = localStorage.getItem("role");
  const user_id = localStorage.getItem("user_id");
  console.log(user_id)

  // ✅ Function to fetch staff branch
  const fetchStaffBranch = async () => {
    if (!user_id) {
      console.error("User ID not found in localStorage");
      setError("User not logged in.");
      return null;
    }

    try {
      const response = await axios.get(`${BASE_URL}getStaffById/${user_id}`);
      if (response.status === 200 && response.data?.length > 0) {
        const staff = response.data[0];
        return {
          branch: staff.branch || null,
          created_at: staff.created_at
            ? new Date(staff.created_at).toISOString().split("T")[0]
            : null,
        };
      } else {
        console.warn("Unexpected response:", response);
        return { branch: null, created_at: null };
      }
    } catch (error) {
      console.error("Error fetching staff branch:", error);
      return { branch: null, created_at: null };
    }
  };

  // Helper: parse education_background which may be a JSON string
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

  // ✅ Function to fetch converted leads
  const fetchConvertedLeads = async () => {
    setLoading(true);
    try {
      const { branch, created_at } = await fetchStaffBranch();

      let response;
      if (branch) {
        // ✅ Branch mil gayi → filtered API call
        console.log(`Fetching converted leads for branch: ${branch} on ${created_at}`);
        response = await axios.get(
          `${BASE_URL}AllConvertedLeadsinquiries?branch=${branch}&created_at=${created_at}`
        );
      } else {
        // ✅ Branch nahi mili → all leads API call
        console.log("Branch not found. Fetching all converted leads.");
        response = await axios.get(`${BASE_URL}AllConvertedLeadsinquiries`);
      }

      if (response.data && Array.isArray(response.data)) {
        // Ensure each item has a priority (default to 'Low') so UI/filtering works
        const withPriority = response.data.map((item) => ({
          ...item,
          priority: item.priority || "Low",
        }));
        setConvertData(withPriority);
        setFilteredData(withPriority);
        setCurrentPage(1);
        console.log(`Fetched ${response.data.length} converted leads`);
      } else {
        console.error("Invalid response data:", response.data);
        setConvertData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching converted leads:", error);
      alert("Failed to fetch converted leads. Please try again.");
      setConvertData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format ISO datetimes: replace 'T' with space and trim to seconds
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

  const nextformatDateTime = (value) => {
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

  const lastformatDateTime = (value) => {
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

  useEffect(() => {
    fetchConvertedLeads();
  }, [user_id])

  // Check if we need to show the fake scrollbar
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (tableContainerRef.current) {
        const hasHorizontalScroll = tableContainerRef.current.scrollWidth > tableContainerRef.current.clientWidth;
        setShowFakeScrollbar(hasHorizontalScroll);
      }
    };

    // Initial check
    checkScrollNeeded();

    // Check on window resize
    window.addEventListener('resize', checkScrollNeeded);

    // Cleanup
    return () => window.removeEventListener('resize', checkScrollNeeded);
  }, [filteredData]);

  // Sync scroll between table and fake scrollbar
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const fakeScrollbar = fakeScrollbarRef.current;

    if (!tableContainer || !fakeScrollbar) return;

    const handleTableScroll = () => {
      if (fakeScrollbar) {
        fakeScrollbar.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const handleFakeScrollbarScroll = () => {
      if (tableContainer) {
        tableContainer.scrollLeft = fakeScrollbar.scrollLeft;
      }
    };

    tableContainer.addEventListener('scroll', handleTableScroll);
    fakeScrollbar.addEventListener('scroll', handleFakeScrollbarScroll);

    // Cleanup
    return () => {
      tableContainer.removeEventListener('scroll', handleTableScroll);
      fakeScrollbar.removeEventListener('scroll', handleFakeScrollbarScroll);
    };
  }, [showFakeScrollbar]);

  const fetchCounselors = async () => {
    try {
      const res = await api.get(`${BASE_URL}counselor`);
      console.log("Counselors response:", res.data); // Debug log
      setCounselors(res.data);
    } catch (err) {
      console.error("Error fetching counselors:", err);
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error status:", err.response.status);
        console.error("Error data:", err.response.data);
      }
      alert("Failed to fetch counselors");
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await api.get(`${BASE_URL}universities`);
      console.log("Universities response:", response.data); // Debug log
      setUniversities(response.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
      if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      alert("Failed to fetch universities");
    }
  };

  // Fetch counselors and universities when component mounts
  useEffect(() => {
    fetchCounselors();
    fetchUniversities();
  }, []);

  const handleStatusChangeFromTable = async (id, status) => {
    // Map frontend values to backend-expected strings (adjust mapping if your backend expects different text)
    const statusMap = {
      Review: "Not reachable", // fallback if old code sends "Review"
      "Not reachable": "Not reachable",
      Eligible: "Eligible",
      "Not Eligible": "Not Eligible",
      "New Lead": "New Lead",
      Contacted: "Contacted",
      "Follow-Up Needed": "Follow-Up Needed",
      "Visited Office": "Visited Office",
      "Not Interested": "Not Interested",
      "Next Intake Interested": "Next Intake Interested",
      Registered: "Registered",
      Dropped: "Dropped"
    };

    const mappedStatus = statusMap[status] || status;

    const payload = {
      inquiry_id: id,
      new_leads: mappedStatus,
      lead_status: mappedStatus // send both keys to be compatible with different backend expectations
    };

    try {
      const res = await api.patch(`${BASE_URL}update-lead-status-new`, payload);
      if (res.status === 200 || res.status === 204) {
        alert("Status updated successfully!");
        fetchConvertedLeads();
      } else {
        console.warn("Unexpected update response:", res);
        alert("Status update returned unexpected response. See console.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        alert(`Failed to update status: ${error.response.data?.message || error.response.status}`);
      } else {
        alert("Failed to update status due to network error.");
      }
    }
  };

  // Update priority for an inquiry/lead from the table
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

  // Filter function
  useEffect(() => {
    let data = [...convertData];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (lead) =>
          (lead.full_name && lead.full_name.toLowerCase().includes(search)) ||
          (lead.email && lead.email.toLowerCase().includes(search)) ||
          (lead.phone_number && lead.phone_number.includes(search))
      );
    }
    if (filters.status) {
      data = data.filter((lead) => lead.new_leads === filters.status);
    }
    if (filters.counselor) {
      data = data.filter((lead) => String(lead.counselor_id) === filters.counselor);
    }
    if (filters.followUp) {
      const today = new Date();
      const dateOnly = (d) => new Date(d).toISOString().slice(0, 10);
      if (filters.followUp === "today") {
        data = data.filter((lead) => lead.follow_up_date && dateOnly(lead.follow_up_date) === dateOnly(today));
      } else if (filters.followUp === "thisWeek") {
        const endOfWeek = new Date();
        endOfWeek.setDate(today.getDate() + 7);
        data = data.filter(
          (lead) =>
            lead.follow_up_date &&
            new Date(lead.follow_up_date) >= today &&
            new Date(lead.follow_up_date) <= endOfWeek
        );
      } else if (filters.followUp === "overdue") {
        data = data.filter((lead) => lead.follow_up_date && new Date(lead.follow_up_date) < today);
      }
    }
    if (filters.country) {
      data = data.filter((lead) => lead.country === filters.country);
    }
    // Priority filter
    if (filters.priority) {
      data = data.filter((lead) => (lead.priority || "Low") === filters.priority);
    }
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter((inq) => {
        const inquiryDate = new Date(inq.created_at || inq.date_of_inquiry);
        return inquiryDate >= start && inquiryDate <= end;
      });
    }
    if (filters.source) {
      data = data.filter((lead) => lead.source === filters.source);
    }
    if (filters.branch) {
      data = data.filter((lead) => lead.branch === filters.branch);
    }
    if (filters.leadType) {
      data = data.filter((lead) => lead.inquiry_type === filters.leadType);
    }

    // FIXED: Follow-Up Done Filter
    if (filters.followUpDoneFrom && filters.followUpDoneTo) {
      const fromDate = new Date(filters.followUpDoneFrom);
      const toDate = new Date(filters.followUpDoneTo);
      toDate.setHours(23, 59, 59, 999);

      data = data.filter((lead) => {
        if (!lead.last_followup_date) return false;
        const followUpDate = new Date(lead.last_followup_date);
        return followUpDate >= fromDate && followUpDate <= toDate;
      });
    }

    // FIXED: Handle Follow-Up Done Presets
    if (filters.followUpDonePreset) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      const startOfNextWeek = new Date(endOfWeek);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

      if (filters.followUpDonePreset === "today") {
        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          return followUpDate >= today && followUpDate < tomorrow;
        });
      } else if (filters.followUpDonePreset === "thisWeek") {
        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          return followUpDate >= today && followUpDate <= endOfWeek;
        });
      } else if (filters.followUpDonePreset === "nextWeek") {
        data = data.filter((lead) => {
          if (!lead.last_followup_date) return false;
          const followUpDate = new Date(lead.last_followup_date);
          return followUpDate >= startOfNextWeek && followUpDate <= endOfNextWeek;
        });
      }
    }

    // FIXED: Next Follow-Up Filter
    if (filters.nextFollowUpFrom && filters.nextFollowUpTo) {
      const fromDate = new Date(filters.nextFollowUpFrom);
      const toDate = new Date(filters.nextFollowUpTo);
      toDate.setHours(23, 59, 59, 999);

      data = data.filter((lead) => {
        if (!lead.next_followup_date) return false; // Fixed: use correct field name
        const nextFollowUpDate = new Date(lead.next_followup_date); // Fixed: use correct field name
        return nextFollowUpDate >= fromDate && nextFollowUpDate <= toDate;
      });
    }

    // FIXED: Handle Next Follow-Up Presets
    if (filters.nextFollowUpPreset) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      const startOfNextWeek = new Date(endOfWeek);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

      if (filters.nextFollowUpPreset === "today") {
        data = data.filter((lead) => {
          if (!lead.next_followup_date) return false; // Fixed: use correct field name
          const nextFollowUpDate = new Date(lead.next_followup_date); // Fixed: use correct field name
          return nextFollowUpDate >= today && nextFollowUpDate < tomorrow;
        });
      } else if (filters.nextFollowUpPreset === "thisWeek") {
        data = data.filter((lead) => {
          if (!lead.next_followup_date) return false; // Fixed: use correct field name
          const nextFollowUpDate = new Date(lead.next_followup_date); // Fixed: use correct field name
          return nextFollowUpDate >= today && nextFollowUpDate <= endOfWeek;
        });
      } else if (filters.nextFollowUpPreset === "nextWeek") {
        data = data.filter((lead) => {
          if (!lead.next_followup_date) return false; // Fixed: use correct field name
          const nextFollowUpDate = new Date(lead.next_followup_date); // Fixed: use correct field name
          return nextFollowUpDate >= startOfNextWeek && nextFollowUpDate <= endOfNextWeek;
        });
      }
    }

    // Sorting Section
    if (filters.sortBy) {
      if (filters.sortBy === "newToOld") {
        data.sort((a, b) => new Date(b.created_at || b.date_of_inquiry) - new Date(a.created_at || b.date_of_inquiry));
      } else if (filters.sortBy === "oldToNew") {
        data.sort((a, b) => new Date(a.created_at || a.date_of_inquiry) - new Date(b.created_at || a.date_of_inquiry));
      } else if (filters.sortBy === "aToZ") {
        data.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
      } else if (filters.sortBy === "zToA") {
        data.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
      } else if (filters.sortBy === "updatedAt") {
        data.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)); // Latest modified first
      } else if (filters.sortBy === "followUpDateAsc") {
        data.sort((a, b) => {
          if (!a.last_followup_date) return 1;
          if (!b.last_followup_date) return -1;
          return new Date(a.last_followup_date) - new Date(b.last_followup_date);
        });
      } else if (filters.sortBy === "followUpDateDesc") {
        data.sort((a, b) => {
          if (!a.last_followup_date) return 1;
          if (!b.last_followup_date) return -1;
          return new Date(b.last_followup_date) - new Date(a.last_followup_date);
        });
      } else if (filters.sortBy === "nextFollowUpDateAsc") {
        data.sort((a, b) => {
          if (!a.next_followup_date) return 1; // Fixed: use correct field name
          if (!b.next_followup_date) return -1; // Fixed: use correct field name
          return new Date(a.next_followup_date) - new Date(b.next_followup_date); // Fixed: use correct field name
        });
      } else if (filters.sortBy === "nextFollowUpDateDesc") {
        data.sort((a, b) => {
          if (!a.next_followup_date) return 1; // Fixed: use correct field name
          if (!b.next_followup_date) return -1; // Fixed: use correct field name
          return new Date(b.next_followup_date) - new Date(a.next_followup_date); // Fixed: use correct field name
        });
      }
    }

    setFilteredData(data);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, convertData]);

  const handleAssignCounselor = async () => {
    if (!selectedCounselor || !followUpDate) {
      alert("Please select counselor & follow-up date.");
      return;
    }
    const payload = {
      inquiry_id: selectedInquiry.id,
      counselor_id: selectedCounselor.id,
      follow_up_date: followUpDate,
      next_follow_up_date: nextFollowUpDate, // Added next follow-up date to payload
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
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error status:", err.response.status);
        console.error("Error data:", err.response.data);
      }
      alert("Failed to assign counselor.");
    }
  };

  const resetAssignModal = () => {
    setSelectedInquiry(null);
    setSelectedCounselor(null);
    setFollowUpDate("");
    setNextFollowUpDate(""); // Reset next follow-up date
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
      if (selectedFiles[key]) {
        formData.append(key, selectedFiles[key]);
      }
    });
    try {
      const res = await api.post(`${BASE_URL}upload-inquiry-documents`, formData);
      if (res.status === 200) {
        alert("Documents uploaded successfully.");
        setShowUploadModal(false);
      }
    } catch (err) {
      console.error("Error uploading documents:", err);
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error status:", err.response.status);
        console.error("Error data:", err.response.data);
      }
      alert("Failed to upload.");
    }
  };

  const handleConvertToStudent = (lead) => {
    let formattedDateOfBirth = "";
    if (lead.date_of_birth) {
      const dateObj = new Date(lead.date_of_birth);
      formattedDateOfBirth = dateObj.toISOString().split('T')[0];
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
    email: ""
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
      alert(isEditing ? "Student updated successfully" : "Student created successfully");
      resetForm();
      fetchConvertedLeads();
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error status:", err.response.status);
        console.error("Error data:", err.response.data);
      }
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
      const university = universities.find(u => u.id.toString() === formData.university_id.toString());
      const universityName = university ? university.name : "";
      const identifying = `${formData.full_name} ${universityName} `;
      setFormData((prev) => ({
        ...prev,
        identifying_name: identifying,
      }));
    }
  }, [formData.full_name, formData.university_id, universities]);

  // Get unique values for filter dropdowns
  const uniqueSources = [...new Set(convertData.map(lead => lead.source))].filter(Boolean);
  const uniqueBranches = [...new Set(convertData.map(lead => lead.branch))].filter(Boolean);
  const uniqueLeadTypes = [...new Set(convertData.map(lead => lead.inquiry_type))].filter(Boolean);
  const uniqueCountries = [...new Set(convertData.map(lead => lead.country))].filter(Boolean);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table when changing page
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo(0, 0);
    }
  };

  // Handle preset changes for follow-up filters
  const handleFollowUpDonePresetChange = (preset) => {
    setFilters({
      ...filters,
      followUpDonePreset: preset,
      followUpDoneFrom: "",
      followUpDoneTo: ""
    });
  };

  const handleNextFollowUpPresetChange = (preset) => {
    setFilters({
      ...filters,
      nextFollowUpPreset: preset,
      nextFollowUpFrom: "",
      nextFollowUpTo: ""
    });
  };

  return (
    <div className="p-4" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h4 className="">Lead Table</h4>

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
                className="filter-input"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label className="small fw-semibold">End Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                className="filter-input"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </Form.Group>
          </Col>
          {/* Existing Filters */}
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Statuses</Form.Label>
            <Form.Select
              size="sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              <option>Not reachable</option>
              <option>Converted to Lead</option>
              <option>Dropped</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Counselors</Form.Label>
            <Form.Select
              size="sm"
              value={filters.counselor}
              onChange={(e) => setFilters({ ...filters, counselor: e.target.value })}
            >
              <option value="">All Counselors</option>
              {counselors.map(counselor => (
                <option key={counselor.id} value={counselor.id}>{counselor.full_name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Follow Up</Form.Label>
            <Form.Select
              size="sm"
              value={filters.followUp}
              onChange={(e) => setFilters({ ...filters, followUp: e.target.value })}
            >
              <option value="">Follow-Up</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="nextWeek">Next Week</option>
              <option value="thisWeek">This Week</option>
              <option value="overdue">Overdue</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Country</Form.Label>
            <Form.Select
              size="sm"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            >
              <option value="">All Countries</option>
              <option value="Hungary">Hungary</option>
              <option value="UK">UK</option>
              <option value="Cyprus">Cyprus</option>
              <option value="Canada">Canada</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Lithuania">Lithuania</option>
              <option value="Latvia">Latvia</option>
              <option value="Germany">Germany</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Estonia">Estonia</option>
              <option value="Australia">Australia</option>
              <option value="South Korea">South Korea</option>
              <option value="Georgia">Georgia</option>
              <option value="Denmark">Denmark</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Sweden">Sweden</option>
              <option value="Norway">Norway</option>
              <option value="Belgium">Belgium</option>
              <option value="Romania">Romania</option>
              <option value="Russia">Russia</option>
              <option value="Turkey">Turkey</option>
              <option value="Ireland">Ireland</option>
              <option value="USA">USA</option>
              <option value="Portugal">Portugal</option>
              <option value="Others">Others</option>
              {uniqueCountries.map((country, i) => (
                !["Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", "Latvia", "Germany",
                  "New Zealand", "Estonia", "Australia", "South Korea", "Georgia", "Denmark", "Netherlands",
                  "Sweden", "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", "USA", "Portugal", "Others"].includes(country) && (
                  <option key={i} value={country}>
                    {country}
                  </option>
                )
              ))}
            </Form.Select>
          </Col>
          {/* New Filters */}
          <Col md={2}>
            <Form.Label className="small fw-semibold">All Sources</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            >
              <option value="">All Sources</option>
              <option value="whatsapp">WhatsApp</option>
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
            <Form.Label className="small fw-semibold">All Branches</Form.Label>
            <Form.Select
              size="sm"
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              disabled={role !== "admin"} // Only admins can change branch filter
            >
              <option value="">All Branches</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Sylhet">Sylhet</option>
              {uniqueBranches.map((branch, i) => (
                branch !== "Dhaka" && branch !== "Sylhet" && (
                  <option key={i} value={branch}>
                    {branch}
                  </option>
                )
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Priority</Form.Label>
            <Form.Select
              size="sm"
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
            <Form.Label className="small fw-semibold">All Lead Types</Form.Label>
            <Form.Select
              size="sm"
              value={filters.leadType}
              onChange={(e) => setFilters({ ...filters, leadType: e.target.value })}
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
            <Form.Label className="small fw-semibold">Sort By</Form.Label>
            <Form.Select
              size="sm"
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="">Sort By</option>
              <option value="newToOld">Newest First</option>
              <option value="oldToNew">Oldest First</option>
              <option value="aToZ">Name A → Z</option>
              <option value="zToA">Name Z → A</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="small fw-semibold">Search</Form.Label>
            <InputGroup size="sm">
              <Form.Control
                placeholder="Search by name, email or phone"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={1}>
            {/* <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setFilters({
                  status: "",
                  counselor: "",
                  followUp: "",
                  country: "",
                  search: "",
                  startDate: "",
                  endDate: "",
                  source: "",
                  branch: role === "admin" ? "" : userBranch || "", // Reset to user's branch for staff, empty for admin
                  priority: "",
                  leadType: "",
                  sortBy: "",
                  // Reset new follow-up filters
                  followUpDoneFrom: "",
                  followUpDoneTo: "",
                  nextFollowUpFrom: "",
                  nextFollowUpTo: "",
                  followUpDonePreset: "",
                  nextFollowUpPreset: ""
                });
              }}
            >
              Reset
            </Button> */}


          </Col>
        </Row>

        {/* New Follow-Up Filters Row */}
        <Row className="g-2 align-items-end ">
          <Col md={3}>
            <Form.Label className="small fw-semibold">Last Follow-Up Form</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              placeholder="From"
              className="filter-input"
              value={filters.followUpDoneFrom}
              onChange={(e) => setFilters({
                ...filters,
                followUpDoneFrom: e.target.value,
                followUpDonePreset: ""
              })}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">Last Follow-Up To</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              placeholder="To"
              className="filter-input"
              value={filters.followUpDoneTo}
              onChange={(e) => setFilters({
                ...filters,
                followUpDoneTo: e.target.value,
                followUpDonePreset: ""
              })}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">Next Follow-Up From</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              placeholder="From"
              className="filter-input"
              value={filters.nextFollowUpFrom}
              onChange={(e) => setFilters({
                ...filters,
                nextFollowUpFrom: e.target.value,
                nextFollowUpPreset: ""
              })}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-semibold">Next Follow-Up To</Form.Label>
            <Form.Control
              type="date"
              size="sm"
              placeholder="To"
              className="filter-input"
              value={filters.nextFollowUpTo}
              onChange={(e) => setFilters({
                ...filters,
                nextFollowUpTo: e.target.value,
                nextFollowUpPreset: ""
              })}
            />
          </Col>
        </Row>

        <Row className="mt-2 d-flex justify-content-end">
          <Col md="1">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Col>
          <Col md="2" >
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
            <AddLead />
          </Modal.Body>
        </Modal>
      </div>



      {/* === TABLE SECTION === */}
      <div className="table-container" style={{ flex: '1 1 auto', position: 'relative'  }}>
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading leads data...</p>
          </div>
        ) : (
          <>
            <div
              ref={tableContainerRef}
              className="table-responsive"
              style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                width: '100%',
                
              }}
            >
              <div
              className="table-responsive-wrapper"
              >
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
             
              <Table bordered hover className="freeze-columns-table " >
                <thead className="table-light " >
                  <tr>
                    <th className="freeze-column freeze-column-1">#</th>
                    <th className="freeze-column freeze-column-2">Name</th>
                    <th className="freeze-column freeze-column-3">Email</th>
                    <th className="freeze-column freeze-column-4">Phone</th>
                    <th >Country</th>
                    <th>Branch</th>
                    <th>Enquiry Type</th>
                    <th>Course</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Counselor Name</th>
                    <th>Last Follow-Up Date</th>
                    <th>Next Follow-Up</th>
                    <th>Created At</th>
                    <th>View</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((lead, index) => (
                      <tr key={lead.id}>
                        <td className="freeze-column freeze-column-1">{indexOfFirstItem + index + 1}</td>
                        <td className="freeze-column freeze-column-2">{lead.full_name || "N/A"}</td>
                        <td className="freeze-column freeze-column-3">{lead.email || "N/A"}</td>
                        <td className="freeze-column freeze-column-4">{lead.phone_number}</td>
                        <td >{lead.country || "N/A"}</td>
                        <td>{lead.branch || "N/A"}</td>
                        <td>{lead.inquiry_type || "N/A"}</td>
                        <td>{lead.course_name || "N/A"}</td>
                        <td>{lead.source || "N/A"}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeColor(lead.new_leads == 0 ? "New Lead" : lead.new_leads)}`}>
                            {lead.new_leads == 0 ? "New Lead" : lead.new_leads || "N/A"}
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
                        <td>{lead.last_followup_date ? lastformatDateTime(lead.last_followup_date) : "N/A"}</td>
                        <td>{lead.next_followup_date ? nextformatDateTime(lead.next_followup_date) : "N/A"}</td>
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
                            onClick={() => window.location.href = `/follow-up-history/${lead.id}`}
                          >
                            Follow-Up History
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => window.location.href = `/note-history/${lead.id}`}
                          >
                            View Notes
                          </Button>
                        </td>
                        <td className="d-flex">
                          <Form.Select
                            size="sm"
                            className="me-2"
                            style={{ width: "100px" }}
                            value={lead.lead_status || ""}
                            onChange={(e) => handleStatusChangeFromTable(lead.id, e.target.value)}
                          >
                            <option>Action</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Follow-Up Needed">Follow-Up Needed</option>
                            <option value="Visited Office">Visited Office</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Not Eligible">Not Eligible</option>
                            <option value="Next Intake Interested">Next Intake Interested</option>
                            <option value="Registered">Registered</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Not reachable">Not reachable</option>
                            <option value="Eligible">Eligible</option>
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
                            onClick={() => window.open(`https://wa.me/${lead.phone_number}`, '_blank')}
                          >
                            <i className="bi bi-whatsapp  "></i>
                          </Button>
                          <button
                            onClick={() => {
                              axios
                                .post(`${BASE_URL}send-inquiry-mail`, lead)
                                .then(() => alert("Mail sent successfully!"))
                                .catch(() => alert("Mail send failed!"));
                            }}
                            className="btn btn-sm btn-outline-dark"
                          // style={{ display: "flex", alignItems: "center" }}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="16" className="text-center py-4">
                        No leads found. Try adjusting your filters or add a new lead.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
               </div>
            </div>

            {/* Pagination Component */}

          </>
        )}
      </div>
     {filteredData.length > itemsPerPage && (
  <div className="d-flex justify-content-center mt-4">
    <Pagination>
      {/* First Page Button */}
      <Pagination.First
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      />
      
      {/* Previous Button */}
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      
      {/* Always show first page */}
      <Pagination.Item
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
      
      {/* Show ellipsis after first page if current page is > 4 */}
      {currentPage > 4 && <Pagination.Ellipsis disabled />}
      
      {/* Show pages around current page */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        // Show page if:
        // 1. It's page 1 (already shown above)
        // 2. It's the last page (will be shown below)
        // 3. It's within 2 pages of current page
        if (
          page !== 1 &&
          page !== totalPages &&
          Math.abs(page - currentPage) <= 2
        ) {
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          );
        }
        return null;
      })}
      
      {/* Show ellipsis before last page if current page is < totalPages - 3 */}
      {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}
      
      {/* Always show last page if there is more than 1 page */}
      {totalPages > 1 && (
        <Pagination.Item
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      )}
      
      {/* Next Button */}
      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      
      {/* Last Page Button */}
      <Pagination.Last
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  </div>
)}
      {/* All your existing modals */}
      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedInquiry?.counselor_id ? "Update Counselor" : "Assign Counselor"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInquiry && (
            <>
              <p><strong>Lead:</strong> {selectedInquiry.full_name}</p>
              <Form.Group className="mb-3">
                <Form.Label>Counselor *</Form.Label>
                <Form.Select
                  value={selectedCounselor?.id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const counselor = counselors.find((c) => c.id.toString() === id);
                    setSelectedCounselor(counselor);
                  }}
                >
                  <option value="">Select Counselor</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
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
                <Form.Label>Next Follow-Up Date</Form.Label>
                <Form.Control
                  type="date"
                  value={nextFollowUpDate} // Use the new state variable
                  onChange={(e) => setNextFollowUpDate(e.target.value)} // Update the new state variable
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
          <Button variant="secondary" onClick={handleCloseAssignModal}>Cancel</Button>
          <Button variant="primary" onClick={handleAssignCounselor}>
            {selectedInquiry?.counselor_id ? "Update Counselor" : "Assign Counselor"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Documents Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Upload Documents</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Passport</Form.Label>
            <Form.Control type="file" onChange={(e) => handleFileChange(e, "passport")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Certificates</Form.Label>
            <Form.Control type="file" onChange={(e) => handleFileChange(e, "certificates")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>IELTS</Form.Label>
            <Form.Control type="file" onChange={(e) => handleFileChange(e, "ielts")} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>SOP</Form.Label>
            <Form.Control type="file" onChange={(e) => handleFileChange(e, "sop")} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUploadDocuments}>Upload</Button>
        </Modal.Footer>
      </Modal>

      {/* Student Form Modal */}
      <Modal
        show={showStudentModal}
        onHide={resetForm}
        size="xl"
        centered
      >
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
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    readOnly
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
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    readOnly
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    required
                    readOnly
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
                    onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, identifying_name: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                <Col md={6}><strong>Name:</strong> {selectedLead.full_name}</Col>
                <Col md={6}><strong>Email:</strong> {selectedLead.email}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Phone:</strong> {selectedLead.phone_number}</Col>
                <Col md={6}><strong>Gender:</strong> {selectedLead.gender}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Date of Birth:</strong> {selectedLead.date_of_birth?.slice(0, 10)}</Col>
                <Col md={6}><strong>City:</strong> {selectedLead.city}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Address:</strong> {selectedLead.address}</Col>
                <Col md={6}><strong>Present Address:</strong> {selectedLead.present_address}</Col>
              </Row>
              {/* Inquiry Info */}
              <h5 className="mt-4 mb-3">Inquiry Details</h5>
              <Row className="mb-2">
                <Col md={6}><strong>Inquiry Type:</strong> {selectedLead.inquiry_type}</Col>
                <Col md={6}><strong>Source:</strong> {selectedLead.source}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Branch:</strong> {selectedLead.branch}</Col>
                <Col md={6}><strong>Country:</strong> {selectedLead.country}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Course Name:</strong> {selectedLead.course_name}</Col>
                <Col md={6}><strong>Status:</strong> {selectedLead.lead_status}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Payment Status:</strong> {selectedLead.payment_status}</Col>
                <Col md={6}><strong>Eligibility Status:</strong> {selectedLead.eligibility_status}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Follow-Up Date:</strong> {selectedLead.follow_up_date?.slice(0, 10) || "N/A"}</Col>
                <Col md={6}><strong>Next Follow-Up Date:</strong> {selectedLead.next_followup_date?.slice(0, 10) || "N/A"}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Date of Inquiry:</strong> {selectedLead.date_of_inquiry?.slice(0, 10)}</Col>
                <Col md={6}><strong>Created At:</strong> {formatDateTime(selectedLead.created_at)}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Updated At:</strong> {selectedLead.updated_at?.slice(0, 10)}</Col>
              </Row>
              {/* Education Background */}
              <h5 className="mt-4 mb-3">Education Background</h5>
              <Row className="mb-2">
                <Col md={6}><strong>Highest Level:</strong> {selectedLead.highest_level}</Col>
                <Col md={6}><strong>Study Level:</strong> {selectedLead.study_level}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Study Field:</strong> {selectedLead.study_field}</Col>
                <Col md={6}><strong>Intake:</strong> {selectedLead.intake}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Budget:</strong> {selectedLead.budget}</Col>
                <Col md={6}><strong>University:</strong> {selectedLead.university}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Study Gap:</strong> {selectedLead.study_gap}</Col>
                <Col md={6}><strong>Visa Refused:</strong> {selectedLead.visa_refused}</Col>
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
                  <Col md={12}><strong>Refusal Reason:</strong> {selectedLead.refusal_reason}</Col>
                </Row>
              )}
              {/* English Proficiency */}
              <h5 className="mt-4 mb-3">English Proficiency</h5>
              <Row className="mb-2">
                <Col md={6}><strong>Test Type:</strong> {selectedLead.test_type}</Col>
                <Col md={6}><strong>Overall Score:</strong> {selectedLead.overall_score}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3}><strong>Reading:</strong> {selectedLead.reading_score}</Col>
                <Col md={3}><strong>Writing:</strong> {selectedLead.writing_score}</Col>
                <Col md={3}><strong>Speaking:</strong> {selectedLead.speaking_score}</Col>
                <Col md={3}><strong>Listening:</strong> {selectedLead.listening_score}</Col>
              </Row>
              {/* Work Experience */}
              <h5 className="mt-4 mb-3">Work Experience</h5>
              <Row className="mb-2">
                <Col md={6}><strong>Company Name:</strong> {selectedLead.company_name}</Col>
                <Col md={6}><strong>Job Title:</strong> {selectedLead.job_title}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Job Duration:</strong> {selectedLead.job_duration}</Col>
              </Row>
              {/* Additional Info */}
              <h5 className="mt-4 mb-3">Additional Info</h5>
              <Row className="mb-2">
                <Col md={6}><strong>Counselor Name:</strong> {selectedLead.counselor_name}</Col>
                <Col md={6}><strong>Notes:</strong> {selectedLead.notes}</Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeadDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* showfollowup modal */}
      <Modal show={showFollowUpModal} onHide={() => setShowFollowUpModal(false)} centered>
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
                <Form.Label>Next Follow-Up Date</Form.Label>
                <Form.Control type="date" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Follow-Up Notes</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter notes..." />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Next Action</Form.Label>
                <Form.Control type="text" placeholder="e.g. Call, Email, Meeting" />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFollowUpModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control as="textarea" rows={4} placeholder="Write your notes here..." />
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
          <Button variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Lead;