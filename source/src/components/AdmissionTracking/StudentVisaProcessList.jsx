import React, { useEffect, useState } from 'react';
import './VisaProcessList.css';
import axios from 'axios';
import BASE_URL from '../../Config';
import { FaFileDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const headings = [
    "full_name", "email", "phone", "date_of_birth", "passport_no", "applied_program", "intake", 
    "registration_date", "source"
];

// Documents and their corresponding status fields
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

// Mapping for stage filter values to API parameters
const stageApiMapping = {
    "application": "registration_visa_processing_stage",
    "interview": "documents_visa_processing_stage",
    "visa": "university_application_stage",
    "fee": "fee_payment_stage",
    "zoom": "university_interview_stage",
    "conditionalOffer": "offer_letter_stage",
    "tuitionFee": "tuition_fee_stage",
    "mainofferletter": "final_offer_stage",
    "embassydocument": "embassy_document_stage",
    "embassyappoint": "appointment_stage",
    "embassyinterview": "visa_approval_stage",
    "visaStatus": "visa_rejection_stage"
};

const StudentVisaProcessList = () => {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState(""); // State for filter input
    const [registrationDate, setRegistrationDate] = useState('');
    const [visaStatus, setVisaStatus] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(''); // Store user role

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const role = localStorage.getItem('role'); // Get role from local storage
                const studentId = localStorage.getItem('student_id'); // Get student ID from local storage
                const counselorId = localStorage.getItem('counselor_id');
                
                // Set user role state
                setUserRole(role || '');
                
                // Check if we have the necessary IDs
                if (!role) {
                    throw new Error("User role not found. Please login again.");
                }
                
                if (role === 'student' && !studentId) {
                    throw new Error("Student ID not found. Please login again.");
                }
                
                if (role !== 'student' && !counselorId) {
                    throw new Error("Counselor ID not found. Please login again.");
                }

                let apiUrl;
                let params = {};

                if (role === 'student') {
                    // Fetch data by student ID
                    apiUrl = `${BASE_URL}getVisaProcessByStudentId/VisaProcess/${studentId}`;
                } else {
                    // Use the correct API endpoint with counselor ID
                    apiUrl = `${BASE_URL}getvisaprocessbycounselorid/VisaProcess/${counselorId}`;
                    
                    // Add stage filter if selected
                    if (stageFilter && stageApiMapping[stageFilter]) {
                        params[stageApiMapping[stageFilter]] = 1;
                    }
                }

                console.log("Making API request to:", apiUrl);
                console.log("With params:", params);
                
                let response;
                if (Object.keys(params).length > 0) {
                    // If there are parameters, use them in the request
                    response = await axios.get(apiUrl, { params });
                } else {
                    // Otherwise, make a simple GET request
                    response = await axios.get(apiUrl);
                }

                console.log("API Response:", response.data);

                // Check if the response is an object (single student) and wrap it in an array
                if (Array.isArray(response.data)) {
                    setData(response.data);
                } else if (response.data && typeof response.data === 'object') {
                    setData([response.data]);
                } else {
                    setData([]); // Empty array if no data
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                
                // Handle different error scenarios
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (error.response.status === 404) {
                        setError("No visa applications found. Please check your filters or try again later.");
                        setData([]); // Set empty data array
                    } else {
                        setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    setError("Network error. Please check your internet connection.");
                } else {
                    // Something happened in setting up the request that triggered an Error
                    setError(error.message || "An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [stageFilter]); // Add stageFilter as dependency to refetch when it changes

    const handleDownload = (url) => {
        if (url) {
            const link = document.createElement('a');
            link.href = url.trim(); // Ensure no extra spaces
            link.setAttribute('download', ''); // This will trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No document available for download.");
        }
    };

    const exportToExcel = () => {
        if (data.length === 0) {
            alert("No data available to export");
            return;
        }
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Visa Process");
        XLSX.writeFile(workbook, "Visa_Process_List.xlsx");
    };

    const exportToPDF = () => {
        if (data.length === 0) {
            alert("No data available to export");
            return;
        }
        
        const input = document.getElementById('table-to-pdf');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgWidth = 190; // Width of the image in PDF
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

    // Function to format date/time to 'YYYY-MM-DD HH:MM:SS'
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

    // Function to check if user has download permission
    const hasDownloadPermission = () => {
        return userRole === 'admin' || userRole === 'process_team';
    };

    // Filtered data based on the filter input
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

        // Only Registration Date filter
        const matchRegistrationDate = registrationDate
            ? row.registration_date &&
              !isNaN(new Date(row.registration_date)) &&
              new Date(row.registration_date).toISOString().split('T')[0] === registrationDate
            : true;

        const lowerCaseVisaStatus = visaStatus.toLowerCase();
        const matchVisaStatus = visaStatus ? row.visa_status && row.visa_status.toLowerCase() === lowerCaseVisaStatus : true;

        const matchStage = stageFilter ? stageList.includes(stageFilter) : true;

        return matchFilter && matchRegistrationDate && matchVisaStatus && matchStage;
    });

    // Function to render status badge with appropriate color
    const renderStatusBadge = (status) => {
        if (!status) return <span className="badge bg-secondary">N/A</span>;

        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'approved') {
            return <span className="badge bg-success">Approved</span>;
        } else if (lowerStatus === 'pending') {
            return <span className="badge bg-warning text-dark">Pending</span>;
        } else if (lowerStatus === 'rejected') {
            return <span className="badge bg-danger">Rejected</span>;
        } else {
            return <span className="badge bg-info">{status}</span>;
        }
    };

    return (
        <div className="p-4">
           <div className="d-flex justify-content-between align-items-center mb-4">
  <h2 className="me-3">Visa Process List</h2>
  <div className="inquiry-actions d-flex gap-2">
    <select
      className="form-select"
      value={stageFilter}
      onChange={(e) => setStageFilter(e.target.value)}
      style={{ minWidth: '150px', width: 'auto' }}
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
    <input
      type="text"
      placeholder="Filter by Name, Email, or Phone"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="form-control"
      style={{ width: '250px' }}
    />
    {/* Only Registration Date filter */}
    <input
      type="date"
      className="form-control"
      value={registrationDate}
      onChange={(e) => setRegistrationDate(e.target.value)}
      style={{ maxWidth: '180px' }}
      title="Registration Date"
    />
    {/* Export buttons - only show for admin and process team */}
    {hasDownloadPermission() && (
      <>
        <button className="btn btn-success" onClick={exportToExcel}>
          Export to Excel
        </button>
        <button className="btn btn-danger" onClick={exportToPDF}>
          Export to PDF
        </button>
      </>
    )}
  </div>
</div>

            {/* Loading and Error States */}
            {loading && (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading visa process data...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-danger my-4" role="alert">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Table Section - Only show if not loading and no error */}
            {!loading && !error && (
                <div className="table-responsive mt-4" style={{ overflowX: "auto" }}>
                    {filteredData.length === 0 ? (
                        <div className="alert alert-info">
                            No visa applications found matching your criteria.
                        </div>
                    ) : (
                        <table id="table-to-pdf" className="table table-bordered inquiry-table text-nowrap text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    {headings.map((head, idx) => (
                                        <th key={idx}>{head
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, char => char.toUpperCase())}</th>
                                    ))}

                                    {/* Document columns with status */}
                                    {documentFields.map((field, idx) => (
                                        <React.Fragment key={idx}>
                                            <th>{field.doc
                                                .replace(/_/g, ' ')
                                                .replace(/\b\w/g, char => char.toUpperCase())}</th>
                                            <th>Status</th>
                                        </React.Fragment>
                                    ))}

                                    {otherFields.map((head, idx) => (
                                        <th key={idx}>{head
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, char => char.toUpperCase())}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>

                                        {/* Basic information fields */}
                                        {headings.map((head, idx) => {
                                            const value = row[head];

                                            return (
                                                <td key={idx}>
                                                    {head.toLowerCase().includes('date') ? (
                                                        formatDate(value)
                                                    ) : value ? (
                                                        value
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* Document fields with status */}
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
                                                                hasDownloadPermission() ? (
                                                                    <span
                                                                        onClick={() => handleDownload(docValue)}
                                                                        style={{ cursor: 'pointer', color: 'blue' }}
                                                                    >
                                                                        <FaFileDownload /> Download
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: 'gray' }}>
                                                                        <FaFileDownload /> View Only
                                                                    </span>
                                                                )
                                                            ) : (
                                                                docValue
                                                            )
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {renderStatusBadge(statusValue)}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* Other fields */}
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
                                                    {head.toLowerCase().includes('date') ? (
                                                        formatDate(value)
                                                    ) : value ? (
                                                        isFile ? (
                                                            hasDownloadPermission() ? (
                                                                <span
                                                                    onClick={() => handleDownload(value)}
                                                                    style={{ cursor: 'pointer', color: 'blue' }}
                                                                >
                                                                    <FaFileDownload /> Download
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: 'gray' }}>
                                                                    <FaFileDownload /> View Only
                                                                </span>
                                                            )
                                                        ) : (
                                                            value
                                                        )
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentVisaProcessList;