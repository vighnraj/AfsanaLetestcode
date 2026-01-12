// import React, { useEffect, useState } from 'react';
// import './VisaProcessList.css';
// import axios from 'axios';
// import BASE_URL from '../../Config';
// import { FaFileDownload } from 'react-icons/fa';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// const headings = [
//     "full_name", "email", "phone", "date_of_birth", "passport_no", "applied_program", "intake", "assigned_counselor",
//     "registration_date", "source", "passport_doc", "photo_doc", "ssc_doc", "hsc_doc", "bachelor_doc", "ielts_doc", "cv_doc",
//     "sop_doc", "medical_doc", "other_doc", "doc_status", "university_name", "program_name", "submission_date",
//     "submission_method", "application_proof", "application_id", "application_status", "fee_amount", "fee_method", "fee_date",
//     "fee_proof", "fee_status", "interview_date", "interview_platform", "interview_status", "interviewer_name",
//     "interview_recording", "interview_result", "interview_feedback", "interview_summary", "interview_result_date",
//     "conditional_offer_upload", "conditional_offer_date", "conditional_conditions", "conditional_offer_status",
//     "tuition_fee_amount", "tuition_fee_date", "tuition_fee_proof", "tuition_fee_status", "tuition_comments",
//     "main_offer_upload", "main_offer_date", "main_offer_status", "motivation_letter", "europass_cv", "bank_statement",
//     "birth_certificate", "tax_proof", "business_docs", "ca_certificate", "health_insurance", "residence_form",
//     "flight_booking", "police_clearance", "family_certificate", "application_form", "appointment_location",
//     "appointment_datetime", "appointment_letter", "appointment_status", "embassy_result_date", "embassy_feedback",
//     "embassy_result", "embassy_notes", "embassy_summary", "visa_status", "decision_date", "visa_sticker_upload",
//     "rejection_reason", "appeal_status"
// ];

// const VisaProcessingList = () => {
//     const [data, setData] = useState([]);
//     const [filter, setFilter] = useState(""); // State for filter input
//     const [appointmentDate, setAppointmentDate] = useState('');
//     const [registrationDate, setRegistrationDate] = useState('');
//     const [visaStatus, setVisaStatus] = useState('');
//     const [stageFilter, setStageFilter] = useState('');

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const role = localStorage.getItem('role'); // Get role from local storage
//                 const studentId = localStorage.getItem('student_id'); // Get student ID from local storage

//                 let response;
//                 if (role === 'student' && studentId) {
//                     // Fetch data by student ID
//                     response = await axios.get(`${BASE_URL}getVisaProcessByStudentId/VisaProcess/${studentId}`);
//                 } else {
//                     // Fetch all data if not a student
//                     response = await axios.get(`${BASE_URL}VisaProcess`);
//                 }

//                 console.log(response.data);


//                 // Check if the response is an object (single student) and wrap it in an array
//                 if (Array.isArray(response.data)) {
//                     setData(response.data);
//                 } else {
//                     setData([response.data]);
//                 }
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         };

//         fetchData();
//     }, []);

//     const handleDownload = (url) => {
//         if (url) {
//             const link = document.createElement('a');
//             link.href = url.trim(); // Ensure no extra spaces
//             link.setAttribute('download', ''); // This will trigger the download
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         } else {
//             alert("No document available for download.");
//         }
//     };

//     const exportToExcel = () => {
//         const worksheet = XLSX.utils.json_to_sheet(data);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Visa Process");
//         XLSX.writeFile(workbook, "Visa_Process_List.xlsx");
//     };

//     const exportToPDF = () => {
//         const input = document.getElementById('table-to-pdf');
//         html2canvas(input).then((canvas) => {
//             const imgData = canvas.toDataURL('image/png');
//             const pdf = new jsPDF();
//             const imgWidth = 190; // Width of the image in PDF
//             const pageHeight = pdf.internal.pageSize.height;
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;
//             let heightLeft = imgHeight;

//             let position = 0;

//             pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//             heightLeft -= pageHeight;

//             while (heightLeft >= 0) {
//                 position = heightLeft - imgHeight;
//                 pdf.addPage();
//                 pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//                 heightLeft -= pageHeight;
//             }
//             pdf.save('Visa_Process_List.pdf');
//         });
//     };

//     // Function to format date to dd/mm/yyyy
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
//         const year = date.getFullYear();
//         return `${day}/${month}/${year}`;
//     };

//     const calculateStages = (visaData) => {
//         const stages = [];
//         if (visaData.full_name) stages.push("application");
//         if (visaData.passport_doc) stages.push("interview");
//         if (visaData.university_name) stages.push("visa");
//         if (visaData.fee_amount) stages.push("fee");
//         if (visaData.interview_date) stages.push("zoom");
//         if (visaData.conditional_offer_upload) stages.push("conditionalOffer");
//         if (visaData.tuition_fee_amount) stages.push("tuitionFee");
//         if (visaData.main_offer_upload) stages.push("mainofferletter");
//         if (visaData.motivation_letter) stages.push("embassydocument");
//         if (visaData.appointment_location) stages.push("embassyappoint");
//         if (visaData.embassy_result) stages.push("embassyinterview");
//         if (visaData.visa_status) stages.push("visaStatus");
//         return stages;
//     };


//     // Filtered data based on the filter input
//     // const filteredData = data.filter(row => {
//     //     return (
//     //         row.full_name.toLowerCase().includes(filter.toLowerCase()) ||
//     //         row.email.toLowerCase().includes(filter.toLowerCase()) ||
//     //         row.phone.toLowerCase().includes(filter.toLowerCase())
//     //     );
//     // });
//     const filteredData = data.filter((row) => {
//         const stageList = calculateStages(row);

//         const lowerCaseFilter = filter.toLowerCase();
//         const lowerCaseFullName = row.full_name ? row.full_name.toLowerCase() : '';
//         const lowerCaseEmail = row.email ? row.email.toLowerCase() : '';
//         const lowerCasePhone = row.phone ? row.phone.toLowerCase() : '';

//         const matchFilter =
//             lowerCaseFullName.includes(lowerCaseFilter) ||
//             lowerCaseEmail.includes(lowerCaseFilter) ||
//             lowerCasePhone.includes(lowerCaseFilter);

//         // Fix: Safely check appointment date
//         const matchAppointmentDate = appointmentDate
//             ? row.appointment_datetime &&
//               !isNaN(new Date(row.appointment_datetime)) &&
//               new Date(row.appointment_datetime).toISOString().split('T')[0] === appointmentDate
//             : true;

//         // Fix: Safely check registration date
//         const matchRegistrationDate = registrationDate
//             ? row.registration_date &&
//               !isNaN(new Date(row.registration_date)) &&
//               new Date(row.registration_date).toISOString().split('T')[0] === registrationDate
//             : true;

//         const lowerCaseVisaStatus = visaStatus.toLowerCase();
//         const matchVisaStatus = visaStatus ? row.visa_status && row.visa_status.toLowerCase() === lowerCaseVisaStatus : true;

//         const matchStage = true;

//         return matchFilter && matchAppointmentDate && matchRegistrationDate && matchVisaStatus && matchStage;
//     });


//     return (
//         <div className="p-4">
//             <div className=" d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
//                 <h2 className="">Visa Process List</h2>
//                 <div className="inquiry-actions d-flex gap-2 flex-wrap">
//                     <input
//                         type="text"
//                         placeholder="Filter by Name, Email, or Phone"
//                         value={filter}
//                         onChange={(e) => setFilter(e.target.value)}
//                         className="form-control"
//                         style={{ width: '300px' }}
//                     />
//                     <button className="btn btn-outline-info inquiry-btn" onClick={exportToExcel}>Export Excel</button>
//                     <button className="btn btn-outline-danger inquiry-btn" onClick={exportToPDF}>Export PDF</button>
//                 </div>
//             </div>

//             {/* Filter Section */}
//             <div className="inquiry-filters row g-3">
//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Compliance Officer</label>
//                     <select className="form-select inquiry-select">
//                         <option>Specific Counselor</option>
//                         <option>Compliance Officer</option>
//                         <option>Visa Manager</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">University</label>
//                     <select className="form-select inquiry-select">
//                         <option>Select Option</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Program Level</label>
//                     <select className="form-select inquiry-select">
//                         <option>Bachelor's</option>
//                         <option>Master's</option>
//                         <option>Foundation</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Application Stage</label>
//                     {/* <select className="form-select inquiry-select">
//                         <option>Document Upload Pending</option>
//                         <option>Application Submitted</option>
//                         <option>Application Fee Paid</option>
//                         <option>Zoom Interview Scheduled</option>
//                         <option>Zoom Interview Done</option>
//                         <option>Zoom Interview Rejected</option>
//                         <option>Zoom Interview Accepted</option>
//                         <option>Conditional Offer Letter Received</option>
//                         <option>Tuition Fee Paid</option>
//                         <option>Main Offer Letter Received</option>
//                         <option>Main Offer Letter Not Issued</option>
//                         <option>Embassy Document Ready</option>
//                         <option>Embassy Appointment Scheduled</option>
//                         <option>Embassy Appointment Not Scheduled</option>
//                         <option>Embassy Interview Done</option>
//                         <option>Visa Status: Approved</option>
//                         <option>Visa Status: Rejected</option>
//                         <option>Visa Status: Appealed</option>
//                     </select> */}
//                     <select
//                         className="form-select"
//                         value={stageFilter}
//                         onChange={(e) => setStageFilter(e.target.value)}
//                     >
//                         <option value="">All Stages</option>
//                         <option value="application">Application</option>
//                         <option value="interview">Interview</option>
//                         <option value="visa">Visa</option>
//                         <option value="fee">Fee</option>
//                         <option value="zoom">Zoom</option>
//                         <option value="conditionalOffer">Conditional Offer</option>
//                         <option value="tuitionFee">Tuition Fee</option>
//                         <option value="mainofferletter">Main Offer Letter</option>
//                         <option value="embassydocument">Embassy Document</option>
//                         <option value="embassyappoint">Embassy Appointment</option>
//                         <option value="embassyinterview">Embassy Interview</option>
//                         <option value="visaStatus">Visa Status</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Visa Status</label>
//                     <select
//                         className="form-select"
//                         value={visaStatus}
//                         onChange={(e) => setVisaStatus(e.target.value)}
//                     >
//                         <option value="">All</option>
//                         <option value="Approved">Approved</option>
//                         <option value="Rejected">Rejected</option>
//                         <option value="Appealed">Appealed</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Tuition Fee Payment Status</label>
//                     <select className="form-select inquiry-select">
//                         <option>Not Paid</option>
//                         <option>Partially Paid</option>
//                         <option>Fully Paid</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Compliance Verification Status</label>
//                     <select className="form-select inquiry-select">
//                         <option>Verified by Compliance</option>
//                         <option>Under Review</option>
//                         <option>Rejected by Compliance</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Intake</label>
//                     <select className="form-select inquiry-select">
//                         <option>February 2025</option>
//                         <option>September 2025</option>
//                         <option>February 2026</option>
//                         <option>Custom intake filter</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Embassy Appointment Date</label>
//                     <input
//                         type="date"
//                         className="form-control"
//                         value={appointmentDate}
//                         onChange={(e) => setAppointmentDate(e.target.value)}
//                     />
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Country</label>
//                     <select className="form-select inquiry-select">
//                         <option>Hungary</option>
//                         <option>Cyprus</option>
//                         <option>Other destinations you support.</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Registration Date</label>
//                     <input
//                         type="date"
//                         className="form-control"
//                         value={registrationDate}
//                         onChange={(e) => setRegistrationDate(e.target.value)}
//                     />
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <label className="form-label fw-bold mb-1">Document Completion</label>
//                     <select className="form-select inquiry-select">
//                         <option>100% Complete</option>
//                         <option>75-99%</option>
//                         <option>Below 75%</option>
//                     </select>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <button className="btn btn-primary w-100 inquiry-btn">Apply</button>
//                 </div>

//                 <div className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <button className="btn btn-dark w-100 inquiry-btn">Reset</button>
//                 </div>
//             </div>

//             {/* Table Section */}
//             <div className="table-responsive mt-4" style={{ overflowX: "auto" }}>
//                 <table id="table-to-pdf" className="table table-bordered inquiry-table text-nowrap text-center align-middle">
//                     <thead className="table-light">
//                         <tr>
//                             <th>#</th>
//                             {headings.map((head, idx) => (
//                                 <th key={idx}>{head
//                                     .replace(/_/g, ' ')
//                                     .replace(/\b\w/g, char => char.toUpperCase())}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredData.map((row, i) => (
//                             <tr key={i}>
//                                 <td>{i + 1}</td>
//                                 {headings.map((head, idx) => {
//                                     const value = row[head];

//                                     const isFile =
//                                         head.toLowerCase().includes('doc') ||
//                                         head.toLowerCase().includes('file') ||
//                                         head.toLowerCase().includes('proof') ||
//                                         (typeof value === 'string' && value.includes('cloudinary'));

//                                     return (
//                                         <td key={idx}>
//                                             {head.toLowerCase().includes('date') ? (
//                                                 formatDate(value)
//                                             ) : value ? (
//                                                 isFile ? (
//                                                     <span
//                                                         onClick={() => handleDownload(value)}
//                                                         style={{ cursor: 'pointer', color: 'blue' }}
//                                                     >
//                                                         <FaFileDownload /> Download
//                                                     </span>
//                                                 ) : (
//                                                     value
//                                                 )
//                                             ) : (
//                                                 'N/A'
//                                             )}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default VisaProcessingList;


import React, { useEffect, useState } from 'react';
import './VisaProcessList.css';
import axios from 'axios';
import BASE_URL from '../../Config';
import { FaFileDownload, FaSync } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Pagination } from 'react-bootstrap';

const headings = [
  "full_name", "email", "phone", "date_of_birth", "passport_no", "applied_program", "intake", "assigned_counselor",
  "registration_date", "source"
];

const documentFields = [
  { doc: "passport_doc", status: "passport_doc_status" },
  { doc: "photo_doc", status: "photo_doc_status" },
  { doc: "ssc_doc", status: "ssc_doc_status" },
  { doc: "hsc_doc", status: "hsc_doc_status" },
  { doc: "bachelor_doc", status: "bachelor_doc_status" },
  { doc: "ielts_doc", status: "ielts_doc_status" },
  { doc: "cv_doc", status: "cv_doc_status" },
  { doc: "sop_doc", status: "sop_doc_status" },
  { doc: "medical_doc", status: "medical_doc_status" },
  { doc: "other_doc", status: "other_doc_status" },
  { doc: "doc_status", status: "doc_status" },
  { doc: "application_proof", status: "proof_submission_doc_status" },
  { doc: "fee_proof", status: "proof_fees_payment_doc_status" },
  { doc: "interview_recording", status: "recording_doc_status" },
  { doc: "conditional_offer_upload", status: "offer_letter_upload_doc_status" },
  { doc: "tuition_fee_proof", status: "proof_tuition_fees_payment_doc_status" },
  { doc: "motivation_letter", status: "motivation_letter_doc_status" },
  { doc: "europass_cv", status: "europass_cv_doc_status" },
  { doc: "bank_statement", status: "bank_statement_doc_status" },
  { doc: "birth_certificate", status: "birth_certificate_doc_status" },
  { doc: "tax_proof", status: "tax_proof_doc_status" },
  { doc: "business_docs", status: "business_documents_doc_status" },
  { doc: "ca_certificate", status: "ca_certificate_doc_status" },
  { doc: "health_insurance", status: "health_travel_insurance_doc_status" },
  { doc: "residence_form", status: "residence_form_doc_status" },
  { doc: "flight_booking", status: "flight_booking_doc_status" },
  { doc: "police_clearance", status: "police_clearance_doc_status" },
  { doc: "family_certificate", status: "family_certificate_doc_status" },
  { doc: "application_form", status: "application_form_doc_status" },
  { doc: "appointment_letter", status: "appointment_letter_doc_status" },
  { doc: "visa_sticker_upload", status: "visa_sticker_upload_doc_status" }
];

const otherFields = [
  "university_name", "program_name", "submission_date",
  "submission_method", "application_id", "application_status",
  "fee_amount", "fee_method", "fee_date", "fee_status",
  "interview_date", "interview_platform", "interview_status", "interviewer_name",
  "interview_result", "interview_feedback", "interview_summary", "interview_result_date",
  "conditional_offer_date", "conditional_conditions", "conditional_offer_status",
  "tuition_fee_amount", "tuition_fee_date", "tuition_fee_status", "tuition_comments",
  "main_offer_upload", "main_offer_date", "main_offer_status",
  "appointment_location", "appointment_datetime", "appointment_status",
  "embassy_result_date", "embassy_feedback", "embassy_result", "embassy_notes", "embassy_summary",
  "visa_status", "decision_date", "rejection_reason", "appeal_status"
];

// Map stage filter values to API parameters
const stageFilterMap = {
  "application": "registration_visa_processing_stage",
  "interview": "documents_visa_processing_stage",
  "visa": "embassy_docs_visa_processing_stage",
  "fee": "fee_payment_visa_processing_stage",
  "zoom": "university_interview_visa_processing_stage",
  "conditionalOffer": "offer_letter_visa_processing_stage",
  "tuitionFee": "tuition_fee_visa_processing_stage",
  "mainofferletter": "final_offer_visa_processing_stage",
  "embassydocument": "embassy_docs_visa_processing_stage",
  "embassyappoint": "appointment_visa_processing_stage",
  "embassyinterview": "visa_approval_visa_processing_stage",
  "visaStatus": "visa_approval_visa_processing_stage"
};

// Country options
const countryOptions = [
  "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", "Latvia", 
  "Germany", "New Zealand", "Estonia", "Australia", "South Korea", "Georgia", 
  "Denmark", "Netherlands", "Sweden", "Norway", "Belgium", "Romania", "Russia", 
  "Turkey", "Ireland", "USA", "Portugal", "Others"
];

const VisaProcessingList = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(""); 
  const [appointmentDate, setAppointmentDate] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [visaStatus, setVisaStatus] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [universities, setUniversities] = useState([]);
  const [counselors, setCounselors] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    
    const fetchUniversities = async () => {
      try {
        const response = await axios.get(`${BASE_URL}universities`);
        setUniversities(response.data);
      } catch (error) {
        console.error("Error fetching universities:", error);
      }
    };
    
    const fetchCounselors = async () => {
      try {
        const response = await axios.get(`${BASE_URL}counselor`);
        setCounselors(response.data);
      } catch (error) {
        console.error("Error fetching counselors:", error);
      }
    };
    
    fetchUniversities();
    fetchCounselors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const role = localStorage.getItem('role'); 
        const studentId = localStorage.getItem('student_id'); 

        let url;
        if (role === 'student' && studentId) {
          url = `${BASE_URL}getVisaProcessByStudentId/VisaProcess/${studentId}`;
        } else {
          if (stageFilter && stageFilterMap[stageFilter]) {
            const filterParam = stageFilterMap[stageFilter];
            url = `${BASE_URL}GetVisaProcessbyfilter?${filterParam}=1`;
          } else {
            url = `${BASE_URL}GetVisaProcessbyfilter`;
          }
        }

        const response = await axios.get(url);

        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setData([response.data]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stageFilter]);

  const handleStatusChange = async (studentId, field, newStatus) => {
    try {
      await axios.put(`${BASE_URL}VisaProcess/status/${studentId}`, {
        field: field,
        status: newStatus
      });

      setData(prevData =>
        prevData.map(item =>
          item.id === studentId ? { ...item, [field]: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDownload = (url) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url.trim(); 
      link.setAttribute('download', ''); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No document available for download.");
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visa Process");
    XLSX.writeFile(workbook, "Visa_Process_List.xlsx");
  };

  const exportToPDF = () => {
    const input = document.getElementById('table-to-pdf');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; 
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('Visa_Process_List.pdf');
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'N/A';
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

  const calculateStages = (visaData) => {
    const stages = [];
    if (visaData.full_name) stages.push("application");
    if (visaData.passport_doc) stages.push("interview");
    if (visaData.university_name) stages.push("visa");
    if (visaData.fee_amount) stages.push("fee");
    if (visaData.interview_date) stages.push("zoom");
    if (visaData.conditional_offer_upload) stages.push("conditionalOffer");
    if (visaData.tuition_fee_amount) stages.push("tuitionFee");
    if (visaData.main_offer_upload) stages.push("mainofferletter");
    if (visaData.motivation_letter) stages.push("embassydocument");
    if (visaData.appointment_location) stages.push("embassyappoint");
    if (visaData.embassy_result) stages.push("embassyinterview");
    if (visaData.visa_status) stages.push("visaStatus");
    return stages;
  };

  const resetFilters = () => {
    setStageFilter('');
    setUniversityFilter('');
    setCounselorFilter('');
    setCountryFilter('');
    setFilter('');
    setCreatedDate('');
    setVisaStatus('');
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  // Filter data based on filters
  const filteredData = data.filter((row) => {
    const stageList = calculateStages(row);

    const lowerCaseFilter = filter.toLowerCase();
    const lowerCaseFullName = row.full_name ? row.full_name.toLowerCase() : '';
    const lowerCaseEmail = row.email ? row.email.toLowerCase() : '';
    const lowerCasePhone = row.phone ? row.phone.toLowerCase() : '';

    const matchFilter =
      lowerCaseFullName.includes(lowerCaseFilter) ||
      lowerCaseEmail.includes(lowerCaseFilter) ||
      lowerCasePhone.includes(lowerCaseFilter);

    const matchCreatedDate = createdDate
      ? row.created_at &&
        !isNaN(new Date(row.created_at)) &&
        new Date(row.created_at).toISOString().split('T')[0] === createdDate
      : true;

    const lowerCaseVisaStatus = visaStatus.toLowerCase();
    const matchVisaStatus = visaStatus ? row.visa_status && row.visa_status.toLowerCase() === lowerCaseVisaStatus : true;

    const matchCounselor = counselorFilter
      ? row.assigned_counselor && row.assigned_counselor.toLowerCase().includes(counselorFilter.toLowerCase())
      : true;

    const matchUniversity = universityFilter
      ? row.university_name === universityFilter
      : true;
      
    const matchCountry = countryFilter
      ? row.country === countryFilter
      : true;

    return matchFilter && matchCreatedDate && matchVisaStatus && matchCounselor && matchUniversity && matchCountry;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Function to generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Always show First and Previous buttons
    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1} 
      />
    );
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
      />
    );
    
    // Always show page 1
    items.push(
      <Pagination.Item 
        key={1} 
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Show ellipsis if current page is > 4
    if (currentPage > 4) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }
    
    // Show pages around current page
    for (let page = Math.max(2, currentPage - 2); page <= Math.min(totalPages - 1, currentPage + 2); page++) {
      if (page > 1 && page < totalPages) {
        items.push(
          <Pagination.Item 
            key={page} 
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        );
      }
    }
    
    // Show ellipsis if current page is < totalPages - 3
    if (currentPage < totalPages - 3) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }
    
    // Show last page if it exists and is not page 1
    if (totalPages > 1) {
      items.push(
        <Pagination.Item 
          key={totalPages} 
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Always show Next and Last buttons
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages} 
      />
    );
    items.push(
      <Pagination.Last 
        key="last" 
        onClick={() => handlePageChange(totalPages)} 
        disabled={currentPage === totalPages} 
      />
    );
    
    return items;
  };

  // Find the index of date_of_birth in headings
  const dateOfBirthIndex = headings.indexOf("date_of_birth");

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Visa Process List</h2>
      </div>

      {/* Filters Card */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* First Row of Filters */}
            <div className="col-md-3">
              <label className="form-label">Stage</label>
              <select
                className="form-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All Stages</option>
                <option value="application">Registration</option>
                <option value="interview">Document</option>
                <option value="visa">University Application</option>
                <option value="fee">Fee Payment</option>
                <option value="zoom">University Interview</option>
                <option value="conditionalOffer">Offer Letter</option>
                <option value="tuitionFee">Tuition Fee</option>
                <option value="mainofferletter">Final Offer</option>
                <option value="embassydocument">Embassy Document</option>
                <option value="embassyappoint">Appointment</option>
                <option value="embassyinterview">Visa Approval</option>
                <option value="visaStatus">Visa Rejection</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">University</label>
              <select
                className="form-select"
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
              >
                <option value="">All Universities</option>
                {universities.map((university, index) => (
                  <option key={index} value={university.name}>{university.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Country</label>
              <select
                className="form-select"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <option value="">All Countries</option>
                {countryOptions.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">
                {userRole !== 'student' ? "Counselor" : "Visa Status"}
              </label>
              {userRole !== 'student' ? (
                <select
                  className="form-select"
                  value={counselorFilter}
                  onChange={(e) => setCounselorFilter(e.target.value)}
                >
                  <option value="">All Counselors</option>
                  {counselors.map((counselor, index) => (
                    <option key={index} value={counselor.full_name}>{counselor.full_name}</option>
                  ))}
                </select>
              ) : (
                <select
                  className="form-select"
                  value={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              )}
            </div>
            
            {/* Second Row of Filters */}
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name, Email, or Phone"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input 
                type="date"
                className="form-control"
                value={createdDate} 
                onChange={(e) => setCreatedDate(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">
                {userRole !== 'student' ? "Visa Status" : "Actions"}
              </label>
              {userRole !== 'student' ? (
                <select
                  className="form-select"
                  value={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              ) : (
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={resetFilters}
                  >
                    <FaSync /> Reset
                  </button>
                </div>
              )}
            </div>
            
            {/* Reset Button for Non-Student Users */}
            {userRole !== 'student' && (
              <div className="col-md-3 mt-2">
                <div className="d-flex justify-content-end">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={resetFilters}
                  >
                    <FaSync /> Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    
    

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading visa process data...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive mt-4" style={{ overflowX: "auto" }}>
            <table id="table-to-pdf" className="table table-bordered inquiry-table text-nowrap text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  {headings.map((head, idx) => (
                    <th key={idx}>
                      {head.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                    </th>
                  ))}
                  {/* Add Country column after date_of_birth */}
                  <th>Country</th>
                  {documentFields.map((field, idx) => (
                    <React.Fragment key={idx}>
                      <th>{field.doc.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</th>
                      <th>Status</th>
                    </React.Fragment>
                  ))}

                  {otherFields.map((head, idx) => (
                    <th key={idx}>{head.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, i) => (
                  <tr key={i}>
                    <td>{indexOfFirstItem + i + 1}</td>

                    {headings.map((head, idx) => {
                      const value = row[head];
                      return (
                        <td key={idx}>
                          {head.toLowerCase().includes('date') ? formatDate(value) : value || 'N/A'}
                        </td>
                      );
                    })}
                    {/* Add Country data after date_of_birth */}
                    <td>{row.country || 'N/A'}</td>
                    {documentFields.map((field, idx) => {
                      const docValue = row[field.doc];
                      const statusValue = row[field.status];

                      const isFile =
                        field.doc.toLowerCase().includes('doc') ||
                        field.doc.toLowerCase().includes('file') ||
                        field.doc.toLowerCase().includes('proof') ||
                        field.doc.toLowerCase().includes('upload') ||
                        field.doc.toLowerCase().includes('recording') ||
                        field.doc.toLowerCase().includes('letter') ||
                        (typeof docValue === 'string' && docValue.includes('cloudinary'));

                      return (
                        <React.Fragment key={idx}>
                          <td>
                            {docValue ? (
                              isFile ? (
                                <span
                                  onClick={() => handleDownload(docValue)}
                                  style={{ cursor: 'pointer', color: 'blue' }}
                                >
                                  <FaFileDownload /> Download
                                </span>
                              ) : (
                                docValue
                              )
                            ) : 'N/A'}
                          </td>

                          <td>
                            <select
                              value={statusValue || ""}
                              onChange={(e) =>
                                handleStatusChange(row.id, field.status, e.target.value)
                              }
                              className="form-select" 
                              style={{ minWidth: "120px" }}
                            >
                              <option value="">Select</option>
                              <option value="Approved">Approved</option>
                              <option value="Pending">Pending</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {otherFields.map((head, idx) => {
                      const value = row[head];
                      const isFile =
                        head.toLowerCase().includes('doc') ||
                        head.toLowerCase().includes('file') ||
                        head.toLowerCase().includes('proof') ||
                        head.toLowerCase().includes('upload') ||
                        head.toLowerCase().includes('recording') ||
                        head.toLowerCase().includes('letter') ||
                        (typeof value === 'string' && value.includes('cloudinary'));

                      return (
                        <td key={idx}>
                          {head.toLowerCase().includes('date') ? formatDate(value) : value ? (
                            isFile ? (
                              <span
                                onClick={() => handleDownload(value)}
                                style={{ cursor: 'pointer', color: 'blue' }}
                              >
                                <FaFileDownload /> Download
                              </span>
                            ) : value
                          ) : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advanced Pagination */}
          {filteredData.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {renderPaginationItems()}
              </Pagination>
            </div>
          )}

          {/* Pagination Info */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Page {currentPage} of {totalPages}
            </div>
            <div className="text-muted">
              {filteredData.length > 0 ? (
                <span>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                </span>
              ) : (
                <span>No entries found</span>
              )}
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">Go to page:</span>
              <input
                type="number"
                className="form-control form-control-sm"
                style={{ width: '80px' }}
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VisaProcessingList;