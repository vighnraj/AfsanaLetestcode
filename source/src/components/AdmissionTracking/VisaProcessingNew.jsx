import React, { useEffect, useState } from "react";
import {
    Form,
    Button,
    Card,
    Container,
    Row,
    Col,
    Alert,
    Spinner,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import api from "../../services/axiosInterceptor";
import BASE_URL from "../../Config";
import Swal from "sweetalert2";
import { RiH2 } from "react-icons/ri";

const VisaProcesingNew = () => {
    const [activeStep, setActiveStep] = useState("application");
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [recordId, setRecordId] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [selectedUniversityId, setSelectedUniversityId] = useState(null);
    const [userRole, setUserRole] = useState(null); // To track user role
    const [selectedUniversityName, setSelectedUniversityName] = useState(""); // Add this state to track the selected university name

    const steps = [
        { key: "application", label: "Registration", icon: "bi-person", stageKey: "registration_visa_processing_stage" },
        { key: "interview", label: "Documents", icon: "bi-file-earmark", stageKey: "documents_visa_processing_stage" },
        { key: "visa", label: "University Application", icon: "bi-building", stageKey: "university_application_visa_processing_stage" },
        { key: "fee", label: "Fee Payment", icon: "bi-credit-card", stageKey: "fee_payment_visa_processing_stage" },
        { key: "zoom", label: "Interview", icon: "bi-camera-video", stageKey: "university_interview_visa_processing_stage" },
        { key: "conditionalOffer", label: "Offer Letter", icon: "bi-file-text", stageKey: "offer_letter_visa_processing_stage" },
        { key: "tuitionFee", label: "Tuition Fee", icon: "bi-cash-stack", stageKey: "tuition_fee_visa_processing_stage" },
        { key: "mainofferletter", label: "Final Offer", icon: "bi-file-check", stageKey: "final_offer_visa_processing_stage" },
        { key: "embassydocument", label: "Embassy Docs", icon: "bi-folder", stageKey: "embassy_docs_visa_processing_stage" },
        { key: "embassyappoint", label: "Appointment", icon: "bi-calendar", stageKey: "appointment_visa_processing_stage" },
        { key: "embassyinterview", label: "Interview", icon: "bi-mic", stageKey: "visa_approval_visa_processing_stage" },
        { key: "visaStatus", label: "Visa Status", icon: "bi-passport", stageKey: "visa_rejection_visa_processing_stage" },
    ];

    // Function to format date to Bangladesh Standard Time (BST)
    const formatDateToBST = (date, includeTime = false) => {
        if (!date) return null;
        
        // If date is a string, convert to Date object
        const d = typeof date === 'string' ? new Date(date) : date;
        
        // Convert to BST (UTC+6)
        const bstOffset = 360; // BST is UTC+6 (6*60 minutes)
        const localOffset = d.getTimezoneOffset(); // Local timezone offset in minutes
        const totalOffset = bstOffset + localOffset;
        
        // Create new date with BST offset
        const bstDate = new Date(d.getTime() + totalOffset * 60000);
        
        const pad = (n) => String(n).padStart(2, "0");
        const yyyy = bstDate.getFullYear();
        const mm = pad(bstDate.getMonth() + 1);
        const dd = pad(bstDate.getDate());
        
        if (includeTime) {
            const hh = pad(bstDate.getHours());
            const mi = pad(bstDate.getMinutes());
            const ss = pad(bstDate.getSeconds());
            return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
        }
        
        return `${yyyy}-${mm}-${dd}`;
    };

    // Function to get current BST datetime for datetime-local input
    const getCurrentBSTDateTime = () => {
        const now = new Date();
        const bstOffset = 360; // BST is UTC+6 (6*60 minutes)
        const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
        const totalOffset = bstOffset + localOffset;
        
        // Create new date with BST offset
        const bstDate = new Date(now.getTime() + totalOffset * 60000);
        
        const pad = (n) => String(n).padStart(2, "0");
        const yyyy = bstDate.getFullYear();
        const mm = pad(bstDate.getMonth() + 1);
        const dd = pad(bstDate.getDate());
        const hh = pad(bstDate.getHours());
        const mi = pad(bstDate.getMinutes());
        
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    // Function to load visa process data for a specific university
    const loadVisaProcessData = async (universityId, studentId) => {
        try {
            console.log("Loading visa process data for university:", universityId, "and student:", studentId);
            const visaProcessResponse = await api.get(
                `${BASE_URL}auth/getVisaProcessByuniversityidsss/${universityId}/${studentId}`
            );
            
            const visaData = visaProcessResponse.data[0];
            console.log("Visa process data:", visaData);

            if (visaData) {
                setRecordId(visaData.id);
                
                // Format dates to BST before setting form data
                const formattedVisaData = { ...visaData };
                if (formattedVisaData.interview_date) {
                    formattedVisaData.interview_date = formatDateToBST(formattedVisaData.interview_date, true);
                }
                if (formattedVisaData.appointment_datetime) {
                    formattedVisaData.appointment_datetime = formatDateToBST(formattedVisaData.appointment_datetime, true);
                }
                
                setFormData(formattedVisaData);

                // Set the selected university ID if it exists in the visa data
                if (visaData.university_id) {
                    setSelectedUniversityId(visaData.university_id.toString());
                }

                // Determine completed steps based on stage values
                const completed = [];
                steps.forEach(step => {
                    if (visaData[step.stageKey] === 1) {
                        completed.push(step.key);
                    }
                });
                setCompletedSteps(completed);
                
                return visaData;
            }
            return null;
        } catch (e) {
            console.log("No existing visa process record found for university:", universityId, "Error:", e);
            return null;
        }
    };

    // Function to reset form data when switching to a university with no data
    const resetFormData = (universityId) => {
        // Keep only basic student info and reset everything else
        setFormData(prev => ({
            ...prev,
            university_id: universityId,
            // Reset all stage-related fields
            registration_visa_processing_stage: 0,
            documents_visa_processing_stage: 0,
            university_application_visa_processing_stage: 0,
            fee_payment_visa_processing_stage: 0,
            university_interview_visa_processing_stage: 0,
            offer_letter_visa_processing_stage: 0,
            tuition_fee_visa_processing_stage: 0,
            final_offer_visa_processing_stage: 0,
            embassy_docs_visa_processing_stage: 0,
            appointment_visa_processing_stage: 0,
            visa_approval_visa_processing_stage: 0,
            visa_rejection_visa_processing_stage: 0,
            // Reset document fields
            passport_doc: "",
            photo_doc: "",
            ssc_doc: "",
            hsc_doc: "",
            bachelor_doc: "",
            ielts_doc: "",
            cv_doc: "",
            sop_doc: "",
            medical_doc: "",
            other_doc: "",
            // Reset university application fields
            university_name: "",
            program_name: "",
            submission_date: "",
            submission_method: "",
            application_proof: "",
            application_id: "",
            application_status: "",
            // Reset fee payment fields
            fee_amount: "",
            fee_currency: "USD", // Default currency
            fee_method: "",
            fee_date: "",
            fee_proof: "",
            fee_status: "",
            // Reset interview fields
            interview_date: "",
            interview_platform: "",
            interview_status: "Scheduled", // Default status
            interviewer_name: "",
            interview_recording: "",
            interview_result: "Pending", // Default result
            interview_feedback: "",
            interview_summary: "",
            interview_result_date: "",
            // Reset offer letter fields
            conditional_offer_upload: "",
            conditional_offer_date: "",
            conditional_conditions: "",
            conditional_offer_status: "",
            tuition_fee_amount: "",
            tuition_fee_currency: "USD", // Default currency
            tuition_fee_date: "",
            tuition_fee_proof: "",
            tuition_fee_status: "",
            tuition_comments: "",
            main_offer_upload: "",
            main_offer_date: "",
            main_offer_status: "",
            // Reset embassy document fields
            motivation_letter: "",
            europass_cv: "",
            bank_statement: "",
            birth_certificate: "",
            tax_proof: "",
            business_docs: "",
            ca_certificate: "",
            health_insurance: "",
            residence_form: "",
            flight_booking: "",
            police_clearance: "",
            family_certificate: "",
            application_form: "",
            // Reset embassy appointment fields
            appointment_location: "",
            appointment_datetime: "",
            appointment_letter: "",
            appointment_status: "",
            // Reset embassy result fields
            embassy_result_date: "",
            embassy_feedback: "",
            embassy_result: "",
            embassy_notes: "",
            embassy_summary: "",
            // Reset visa status fields
            visa_status: "",
            decision_date: "",
            visa_sticker_upload: "",
            rejection_reason: "",
            appeal_status: "",
            // Reset all status fields
            passport_doc_status: "",
            photo_doc_status: "",
            ssc_doc_status: "",
            hsc_doc_status: "",
            bachelor_doc_status: "",
            ielts_doc_status: "",
            cv_doc_status: "",
            sop_doc_status: "",
            medical_doc_status: "",
            other_doc_status: "",
            proof_submission_doc_status: "",
            proof_fees_payment_doc_status: "",
            recording_doc_status: "",
            offer_letter_upload_doc_status: "",
            proof_tuition_fees_payment_doc_status: "",
            motivation_letter_doc_status: "",
            europass_cv_doc_status: "",
            bank_statement_doc_status: "",
            birth_certificate_doc_status: "",
            tax_proof_doc_status: "",
            business_documents_doc_status: "",
            ca_certificate_doc_status: "",
            health_travel_insurance_doc_status: "",
            residence_form_doc_status: "",
            flight_booking_doc_status: "",
            police_clearance_doc_status: "",
            family_certificate_doc_status: "",
            application_form_doc_status: "",
            appointment_letter_doc_status: "",
            visa_sticker_upload_doc_status: "",
            main_offer_upload_doc_status: "",
            tuition_fee_proof_status: "",
            fee_proof_status: ""
        }));
        
        // Reset completed steps
        setCompletedSteps([]);
        setRecordId(null);
    };

    // Load student data and check existing visa process record
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const studentId = localStorage.getItem("student_id");
                const role = localStorage.getItem("role"); // Get user role from localStorage
                setUserRole(role); // Set user role in state

                const universityID = localStorage.getItem("university_id");
                console.log("Initial load - studentId:", studentId, "universityID:", universityID);

                // Get student basic info
                const studentResponse = await api.get(
                    `${BASE_URL}auth/getStudentById/${studentId}`
                );

                const studentData = studentResponse.data;
                console.log("Student data:", studentData);

                // Fetch universities
                const universitiesRes = await api.get(`${BASE_URL}universities`);
                setUniversities(universitiesRes.data);
                console.log("Universities loaded:", universitiesRes.data);

                // Set initial form data with student info
                setFormData((prev) => ({
                    ...prev,
                    full_name: studentData.full_name || "",
                    email: studentData.email || "",
                    phone: studentData.mobile_number || "",
                    date_of_birth: studentData.date_of_birth
                        ? studentData.date_of_birth.split("T")[0]
                        : "",
                    passport_no: studentData.passport_no || prev.passport_no || "",
                    university_id: universityID || prev.university_id || "", // Add university_id to form data
                }));

                // Set selected university ID and name from localStorage
                if (universityID) {
                    setSelectedUniversityId(universityID.toString());
                    
                    // Find and set the selected university name
                    const university = universitiesRes.data.find(uni => uni.id.toString() === universityID);
                    if (university) {
                        setSelectedUniversityName(university.name);
                        console.log("Set selected university name to:", university.name);
                    }
                    
                    // Load visa process data for the selected university
                    await loadVisaProcessData(universityID, studentId);
                } else if (universitiesRes.data.length > 0) {
                    // Fallback to first university if no ID in localStorage
                    setSelectedUniversityId(universitiesRes.data[0].id.toString());
                    setSelectedUniversityName(universitiesRes.data[0].name);
                    console.log("Set selected university ID to first university:", universitiesRes.data[0].id);
                    console.log("Set selected university name to first university:", universitiesRes.data[0].name);
                }
            } catch (err) {
                console.error("Failed to load initial data:", err);
                setError("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Handle university change
    const handleUniversityChange = async (e) => {
        const universityId = e.target.value;
        console.log("University changed to:", universityId);
        
        if (!universityId) {
            // If no university is selected, reset form data
            resetFormData("");
            setSelectedUniversityId("");
            setSelectedUniversityName(""); // Clear the university name
            return;
        }
        
        // Find and set the selected university name
        const university = universities.find(uni => uni.id.toString() === universityId);
        if (university) {
            setSelectedUniversityName(university.name);
            console.log("Set selected university name to:", university.name);
        }
        
        setSelectedUniversityId(universityId);
        
        // Update form data with new university ID (but don't update university_name)
        setFormData((prev) => ({
            ...prev,
            university_id: universityId,
        }));
        
        // Load visa process data for the newly selected university
        const studentId = localStorage.getItem("student_id");
        if (studentId) {
            setLoading(true);
            try {
                const visaData = await loadVisaProcessData(universityId, studentId);
                
                // If no visa data exists for this university, reset the form
                if (!visaData) {
                    resetFormData(universityId);
                }
            } catch (err) {
                console.error("Failed to load visa process data for university:", universityId, err);
                setError("Failed to load visa process data for the selected university");
                // Reset form data if there's an error
                resetFormData(universityId);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files[0],
        }));

        // When a file is uploaded, automatically set its status to "Pending"
        const statusFieldName = `${name}_status`;
        setFormData((prev) => ({
            ...prev,
            [statusFieldName]: "Pending"
        }));
    };

    // Format JS Date -> MySQL DATE or DATETIME
    const formatDateForMySQL = (date, includeTime = false) => {
        if (!date) return null;
        const d = new Date(date);
        const pad = (n) => String(n).padStart(2, "0");
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        if (includeTime) {
            const hh = pad(d.getHours());
            const mi = pad(d.getMinutes());
            const ss = pad(d.getSeconds());
            return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        }
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        const studentId = localStorage.getItem("student_id");

        try {
            const formDataToSend = new FormData();

            // Prepare the data object with proper formatting
            const submissionData = {
                ...formData,
                // Convert dates to ISO string format if they exist
                date_of_birth: formData.date_of_birth
                    ? new Date(formData.date_of_birth).toISOString()
                    : null,
                registration_date: formData.registration_date
                    ? new Date(formData.registration_date).toISOString()
                    : null,
                embassy_result_date: formData.embassy_result_date
                    ? formatDateForMySQL(formData.embassy_result_date, true) // if DATETIME
                    : null,
                decision_date: formData.decision_date
                    ? formatDateForMySQL(formData.decision_date, true) // if DATETIME
                    : null,
                student_id: studentId,
                // Ensure university_id is included
                university_id: selectedUniversityId || formData.university_id || localStorage.getItem("university_id"),
                // Add other date fields if needed
            };

            // Remove the 'message' key if it exists
            delete submissionData.message;
            delete submissionData.affectedRows;
            delete submissionData.updatedFields;
            delete submissionData.created_at;
            delete submissionData.motivation_letter_status;
            delete submissionData.interview_recording_status;
            delete submissionData.bank_statement_status;
            delete submissionData.tax_proof_status;
            delete submissionData.ca_certificate_status;
            delete submissionData.residence_form_status;
            delete submissionData.police_clearance_status;
            delete submissionData.application_form_status;
            delete submissionData.europass_cv_status;
            delete submissionData.birth_certificate_status;
            delete submissionData.business_docs_status;
            delete submissionData.health_insurance_status;
            delete submissionData.flight_booking_status;
            delete submissionData.family_certificate_status;
          
            delete submissionData.fee_proof_status;
            delete submissionData.tuition_fee_proof;
            delete submissionData.appointment_letter_status;

            // Remove undefined/null values and prepare FormData
            Object.entries(submissionData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    if (value instanceof File) {
                        formDataToSend.append(key, value, value.name);
                    } else if (typeof value === "object") {
                        formDataToSend.append(key, JSON.stringify(value));
                    } else {
                        formDataToSend.append(key, value);
                    }
                }
            });

            // Find the current step to set its stage value to 1
            const currentStep = steps.find(step => step.key === activeStep);
            if (currentStep) {
                formDataToSend.append(currentStep.stageKey, 1);
            }

            // Debug: Log what's being sent
            const formDataObj = {};
            formDataToSend.forEach((value, key) => (formDataObj[key] = value));
            console.log("Form data being sent:", formDataObj);

            let response;

            if (activeStep === "application") {
                // First step - create new record with POST
                response = await api.post(
                    `${BASE_URL}createVisaProcess`,
                    formDataToSend,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (!response.data.id) {
                    throw new Error("No ID returned from server after creation");
                }

                setRecordId(response.data.id);
                setCompletedSteps((prev) => [...prev, "application"]);
            } else {
                // Subsequent steps - update existing record with PUT
                if (!recordId) {
                    throw new Error("No record ID available for update");
                }

                response = await api.put(
                    `${BASE_URL}createVisaProcess/${recordId}`,
                    formDataToSend,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (!completedSteps.includes(activeStep)) {
                    setCompletedSteps((prev) => [...prev, activeStep]);
                }
            }

            // Update form data with response
            setFormData((prev) => ({
                ...prev,
                ...response.data,
            }));

            setSuccess(
                `${steps.find((s) => s.key === activeStep).label
                } data saved successfully!`
            );

            // Auto-advance to next step if available
            const currentIndex = steps.findIndex((step) => step.key === activeStep);
            if (currentIndex < steps.length - 1) {
                setTimeout(() => {
                    setActiveStep(steps[currentIndex + 1].key);
                    setSuccess(null);
                }, 1500);
            }
        } catch (err) {
            console.error("Submission error:", err);

            let errorMessage = "Failed to save data";

            if (err.response) {
                // Handle MySQL syntax errors specifically
                if (
                    err.response.data?.error?.includes(
                        "You have an error in your SQL syntax"
                    )
                ) {
                    errorMessage = "Data format error. Please check your inputs.";
                } else if (err.response.data?.error?.includes("Unknown column")) {
                    errorMessage = "Invalid data field detected. Please contact support.";
                } else {
                    errorMessage =
                        err.response.data?.message ||
                        err.response.statusText ||
                        errorMessage;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderStepper = () => (
        <div className="p-4">
            <div className="mb-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                    {/* Heading */}
                    <h2 className="mb-0">Check Application Journey</h2>

                    {/* Select */}
                    <Form.Group className="mb-0 w-md-auto">
                        <Form.Select
                            name="university_id"
                            value={selectedUniversityId || ""}
                            onChange={handleUniversityChange}
                        >
                            <option value="">-- Select University For Status Check --</option>
                            {universities.map((uni) => (
                                <option key={uni.id} value={uni.id.toString()}>
                                    {uni.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            {/* Use selectedUniversityName state for the heading */}
            <h5 className="text-center mt-3">
                {selectedUniversityName
                    ? `${selectedUniversityName} - Visa Processing CRM Workflow`
                    : 'Select University'}
            </h5>

            <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center overflow-auto py-2">
                    {steps.map((step, index) => {
                        const isActive = activeStep === step.key;
                        const isCompleted = completedSteps.includes(step.key);
                        // const isDisabled =
                        //     index > 0 && !completedSteps.includes(steps[index - 1].key);

                        return (
                            <div
                                // className={`text-center position-relative flex-shrink-0 ${isDisabled ? "opacity-50" : ""
                                //     }`}
                                className="text-center position-relative flex-shrink-0"
                                style={{ minWidth: "80px" }}
                                key={step.key}
                            >
                                {index !== 0 && (
                                    <div
                                        className="position-absolute top-50 start-0 translate-middle-y w-100"
                                    />
                                )}

                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center mx-auto ${isActive
                                        ? "bg-primary"
                                        : isCompleted
                                            ? "bg-success"
                                            : "bg-light"
                                        }`}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        color: isActive || isCompleted ? "white" : "#858796",
                                        zIndex: 1,
                                        // cursor: isDisabled ? "not-allowed" : "pointer",
                                        cursor: "pointer",
                                        border: isActive ? "2px solid #4e73df" : "none",
                                        boxShadow: isActive
                                            ? "0 0 0 4px rgba(78, 115, 223, 0.25)"
                                            : "none",
                                        transition: "all 0.3s ease",
                                    }}
                                    // onClick={() => !isDisabled && setActiveStep(step.key)}
                                    onClick={() => setActiveStep(step.key)}
                                    role="button"
                                >
                                    {isCompleted ? (
                                        <i className="bi bi-check-lg fs-6"></i>
                                    ) : (
                                        <i className={`bi ${step.icon} fs-6`}></i>
                                    )}
                                </div>

                                <div
                                    className={`mt-2 small text-wrap ${isActive ? "text-primary fw-bold" : "text-muted"
                                        }`}
                                    style={{ fontSize: "0.75rem" }}
                                >
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card.Body>
        </div>
    );

    // Rest of the component functions remain the same
    const renderApplicationSection = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Student Registration Details</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {/* Add a hidden field for university_id */}
                    <Form.Control
                        type="hidden"
                        name="university_id"
                        value={selectedUniversityId || formData.university_id || ""}
                    />

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="full_name"
                                    onChange={handleChange}
                                    value={formData.full_name || ""}
                                    placeholder="Enter full name"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    onChange={handleChange}
                                    value={formData.email || ""}
                                    placeholder="Enter email address"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    onChange={handleChange}
                                    value={formData.phone || ""}
                                    placeholder="Enter phone number"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>                   
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Date of Birth</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date_of_birth"
                                    onChange={handleChange}
                                    value={formData.date_of_birth || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Passport No / NID</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="passport_no"
                                    onChange={handleChange}
                                    value={formData.passport_no}
                                    placeholder="Enter passport number or NID"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Applied Program</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="applied_program"
                                    onChange={handleChange}
                                    value={formData.applied_program || ""}
                                    placeholder="Enter program name"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Intake</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="intake"
                                    onChange={handleChange}
                                    value={formData.intake || ""}
                                    placeholder="Enter intake session"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Assigned Counselor</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="assigned_counselor"
                                    onChange={handleChange}
                                    value={formData.assigned_counselor || ""}
                                    placeholder="Enter counselor name"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Registration Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="registration_date"
                                    onChange={handleChange}
                                    value={
                                        formData.registration_date
                                            ? formData.registration_date.split("T")[0]
                                            : (() => {
                                                // Get current date in BST (Bangladesh Standard Time)
                                                const now = new Date();
                                                const bstOffset = 360; // BST is UTC+6
                                                const bstTime = new Date(now.getTime() + (bstOffset - now.getTimezoneOffset()) * 60000);
                                                
                                                const year = bstTime.getFullYear();
                                                const month = String(bstTime.getMonth() + 1).padStart(2, '0');
                                                const day = String(bstTime.getDate()).padStart(2, '0');
                                                
                                                return `${year}-${month}-${day}`;
                                            })()
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Source</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="source"
                                    onChange={handleChange}
                                    value={formData.source || ""}
                                    placeholder="Enter source of registration"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-save me-2"></i>Save Details
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    // ... rest of the component functions remain unchanged
    const renderInterviewSection = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Document Upload</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        {[
                            { name: "passport_doc", label: "Passport", statusName: "passport_doc_status" },
                            { name: "photo_doc", label: "Photo", statusName: "photo_doc_status" },
                            { name: "ssc_doc", label: "SSC Certificate", statusName: "ssc_doc_status" },
                            { name: "hsc_doc", label: "HSC Transcript", statusName: "hsc_doc_status" },
                            { name: "bachelor_doc", label: "Bachelor's Certificate", statusName: "bachelor_doc_status" },
                            { name: "ielts_doc", label: "IELTS/English Certificate", statusName: "ielts_doc_status" },
                            { name: "cv_doc", label: "CV", statusName: "cv_doc_status" },
                            { name: "sop_doc", label: "SOP", statusName: "sop_doc_status" },
                            { name: "medical_doc", label: "Medical Certificate", statusName: "medical_doc_status" },
                            { name: "other_doc", label: "Other Documents", statusName: "other_doc_status" },
                        ].map((item, index) => (
                            <Col md={6} key={index}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                        <div>
                                            <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                            {item.label}
                                        </div>
                                        <Form.Select
                                            name={item.statusName}
                                            onChange={handleChange}
                                            value={formData[item.name] ? (formData[item.statusName] || "Pending") : ""}
                                            className="w-50 border-0 border-bottom rounded-0"
                                            disabled={!formData[item.name] || userRole === "student"} // Disable for students or if no file
                                        >
                                            <option value="">Select status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </Form.Select>
                                    </Form.Label>
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center mb-2">
                                            <Form.Control
                                                type="file"
                                                name={item.name}
                                                onChange={handleFileChange}
                                                className="border-0 border-bottom rounded-0"
                                            />
                                            {formData[item.name] &&
                                                typeof formData[item.name] === "string" && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="ms-2 rounded-circle"
                                                        href={formData[item.name]}
                                                        target="_blank"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-upload me-2"></i>Upload Documents
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderVisaProcessSection = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">University Application Submission</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">University Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="university_name"
                                    onChange={handleChange}
                                    value={selectedUniversityName || formData.university_name || ""}
                                    placeholder="Enter university name"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Program</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="program_name"
                                    onChange={handleChange}
                                    value={formData.program_name || ""}
                                    placeholder="Enter program name"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Submission Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="submission_date"
                                    onChange={handleChange}
                                    value={
                                        formData.submission_date
                                            ? formData.submission_date.split("T")[0]
                                            : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Method</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="submission_method"
                                    onChange={handleChange}
                                    value={formData.submission_method || ""}
                                    placeholder="Online/Offline"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Proof of Submission
                                    </div>
                                    <Form.Select
                                        name="proof_submission_doc_status"
                                        onChange={handleChange}
                                        value={formData.application_proof ? (formData.proof_submission_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.application_proof || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="application_proof"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                        />
                                        {formData.application_proof &&
                                            typeof formData.application_proof === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.application_proof}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Application ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="application_id"
                                    onChange={handleChange}
                                    value={formData.application_id || ""}
                                    placeholder="Enter application ID"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="application_status"
                                    onChange={handleChange}
                                    value={formData.application_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Submitted">Submitted</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-send me-2"></i>Submit to University
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    // Updated Fee Payment Section with Currency Selection
    const renderFeePaymentSection = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Application Fee Payment</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Currency</Form.Label>
                                <Form.Select
                                    name="fee_currency"
                                    onChange={handleChange}
                                    value={formData.fee_currency || "USD"}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="BDT">BDT (৳)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Amount</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        {formData.fee_currency === "USD" ? "$" : 
                                         formData.fee_currency === "EUR" ? "€" : "৳"}
                                    </span>
                                    <Form.Control
                                        type="number"
                                        name="fee_amount"
                                        onChange={handleChange}
                                        value={formData.fee_amount || ""}
                                        placeholder="Enter amount paid"
                                        className="border-0 border-bottom rounded-0"
                                        required
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Payment Method</Form.Label>
                                <Form.Select
                                    name="fee_method"
                                    onChange={handleChange}
                                    value={formData.fee_method || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select method</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Credit Card">Credit Card</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fee_date"
                                    onChange={handleChange}
                                    value={
                                        formData.fee_date ? formData.fee_date.split("T")[0] : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Proof of Payment
                                    </div>
                                    <Form.Select
                                        name="proof_fees_payment_doc_status"
                                        onChange={handleChange}
                                        value={formData.fee_proof ? (formData.proof_fees_payment_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.fee_proof || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="fee_proof"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                        />
                                        {formData.fee_proof &&
                                            typeof formData.fee_proof === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.fee_proof}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="fee_status"
                                    onChange={handleChange}
                                    value={formData.fee_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Partial">Partial</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-credit-card me-2"></i>Process Payment
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    // Updated University Interview Details Form - Fixed workflow issue
    const renderZoomInterviewForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">University Interview Details</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Date / Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="interview_date"
                                    onChange={handleChange}
                                    value={
                                        formData.interview_date
                                            ? formData.interview_date
                                            : getCurrentBSTDateTime()
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Platform</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="interview_platform"
                                    onChange={handleChange}
                                    value={formData.interview_platform || ""}
                                    placeholder="e.g., Zoom, Google Meet"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="interview_status"
                                    onChange={handleChange}
                                    value={formData.interview_status || "Scheduled"}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Interviewer</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="interviewer_name"
                                    onChange={handleChange}
                                    value={formData.interviewer_name || ""}
                                    placeholder="Enter interviewer's name"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Recording
                                    </div>
                                    <Form.Select
                                        name="recording_doc_status"
                                        onChange={handleChange}
                                        value={formData.interview_recording ? (formData.recording_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.interview_recording || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="interview_recording"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                            disabled
                                        />
                                        {formData.interview_recording &&
                                            typeof formData.interview_recording === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.interview_recording}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Result</Form.Label>
                                <Form.Select
                                    name="interview_result"
                                    onChange={handleChange}
                                    value={formData.interview_result || "Pending"}
                                    className="border-0 border-bottom rounded-0"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Result Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="interview_result_date"
                                    onChange={handleChange}
                                    value={
                                        formData.interview_result_date
                                            ? formData.interview_result_date
                                            : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Feedback</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="interview_feedback"
                                    onChange={handleChange}
                                    value={formData.interview_feedback || ""}
                                    placeholder="Enter interview feedback"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Summary</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="interview_summary"
                                    onChange={handleChange}
                                    value={formData.interview_summary || ""}
                                    placeholder="Enter interview summary"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-calendar-check me-2"></i>Save Interview
                                    Details
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderConditionalOfferLetterForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Conditional Offer Letter</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Offer Letter Upload
                                    </div>
                                    <Form.Select
                                        name="offer_letter_upload_doc_status"
                                        onChange={handleChange}
                                        value={formData.conditional_offer_upload ? (formData.offer_letter_upload_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.conditional_offer_upload || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="conditional_offer_upload"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                            disabled
                                        />
                                        {formData.conditional_offer_upload &&
                                            typeof formData.conditional_offer_upload === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.conditional_offer_upload}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Issue Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="conditional_offer_date"
                                    onChange={handleChange}
                                    value={
                                        formData.conditional_offer_date
                                            ? formData.conditional_offer_date
                                            : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Conditions</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="conditional_conditions"
                                    onChange={handleChange}
                                    value={formData.conditional_conditions || ""}
                                    placeholder="Enter any conditions"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="conditional_offer_status"
                                    onChange={handleChange}
                                    value={formData.conditional_offer_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Received">Received</option>
                                    <option value="Declined">Declined</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-earmark-text me-2"></i>Save Offer
                                    Details
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    // Updated Tuition Fee Payment Section with Currency Selection
    const renderTuitionFeePaymentForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Tuition Fee Payment</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Currency</Form.Label>
                                <Form.Select
                                    name="tuition_fee_currency"
                                    onChange={handleChange}
                                    value={formData.tuition_fee_currency || "USD"}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="BDT">BDT (৳)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Amount</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">
                                        {formData.tuition_fee_currency === "USD" ? "$" : 
                                         formData.tuition_fee_currency === "EUR" ? "€" : "৳"}
                                    </span>
                                    <Form.Control
                                        type="number"
                                        name="tuition_fee_amount"
                                        onChange={handleChange}
                                        value={formData.tuition_fee_amount || ""}
                                        placeholder="Enter tuition fee amount"
                                        className="border-0 border-bottom rounded-0"
                                        required
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="tuition_fee_date"
                                    onChange={handleChange}
                                    value={
                                        formData.tuition_fee_date ? formData.tuition_fee_date : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Proof of Payment
                                    </div>
                                    <Form.Select
                                        name="proof_tuition_fees_payment_doc_status"
                                        onChange={handleChange}
                                        value={formData.tuition_fee_proof ? (formData.proof_tuition_fees_payment_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.tuition_fee_proof || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="tuition_fee_proof"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                        />
                                        {formData.tuition_fee_proof &&
                                            typeof formData.tuition_fee_proof === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.tuition_fee_proof}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="tuition_fee_status"
                                    onChange={handleChange}
                                    value={formData.tuition_fee_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Partial">Partial</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Comments</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="tuition_comments"
                                    onChange={handleChange}
                                    value={formData.tuition_comments || ""}
                                    placeholder="Enter any remarks or notes"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-cash-stack me-2"></i>Record Payment
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderMainOfferLetterForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Main Offer Letter</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Offer Letter Upload
                                    </div>
                                    <Form.Select
                                        name="main_offer_upload_doc_status"
                                        onChange={handleChange}
                                        value={formData.main_offer_upload ? (formData.main_offer_upload_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.main_offer_upload || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="main_offer_upload"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                            disabled
                                        />
                                        {formData.main_offer_upload &&
                                            typeof formData.main_offer_upload === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.main_offer_upload}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="main_offer_date"
                                    onChange={handleChange}
                                    value={
                                        formData.main_offer_date ? formData.main_offer_date : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="main_offer_status"
                                    onChange={handleChange}
                                    value={formData.main_offer_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Received">Received</option>
                                    <option value="Declined">Declined</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-earmark-check me-2"></i>Save Offer
                                    Letter
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderEmbassyDocumentPreparationForm = () => {
        const documentFields = [
            { name: "motivation_letter", label: "Motivation Letter", statusName: "motivation_letter_doc_status" },
            { name: "europass_cv", label: "Europass CV", statusName: "europass_cv_doc_status" },
            { name: "bank_statement", label: "Bank Statement", statusName: "bank_statement_doc_status" },
            { name: "birth_certificate", label: "Birth Certificate", statusName: "birth_certificate_doc_status" },
            { name: "tax_proof", label: "Tax Proof", statusName: "tax_proof_doc_status" },
            { name: "business_docs", label: "Business Documents", statusName: "business_documents_doc_status" },
            { name: "ca_certificate", label: "CA Certificate", statusName: "ca_certificate_doc_status" },
            { name: "health_insurance", label: "Health/Travel Insurance", statusName: "health_insurance_doc_status" },
            { name: "residence_form", label: "Residence Form", statusName: "residence_form_doc_status" },
            { name: "flight_booking", label: "Flight Booking", statusName: "flight_booking_doc_status" },
            { name: "police_clearance", label: "Police Clearance", statusName: "police_clearance_doc_status" },
            { name: "family_certificate", label: "Family Certificate", statusName: "family_certificate_doc_status" },
            { name: "application_form", label: "Application Form", statusName: "application_form_doc_status" },
        ];

        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white py-3">
                    <h5 className="mb-0">Embassy Document Preparation</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Row>
                            {documentFields.map((field, idx) => (
                                <Col md={6} key={idx}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="bi bi-file-earmark me-2 text-primary"></i>
                                                {field.label}
                                            </div>
                                            <Form.Select
                                                name={field.statusName}
                                                onChange={handleChange}
                                                value={formData[field.name] ? (formData[field.statusName] || "Pending") : ""}
                                                className="w-50 border-0 border-bottom rounded-0"
                                                disabled={!formData[field.name] || userRole === "student"} // Disable for students or if no file
                                            >
                                                <option value="">Select status</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </Form.Select>
                                        </Form.Label>
                                        <div className="d-flex flex-column">
                                            <div className="d-flex align-items-center mb-2">
                                                <Form.Control
                                                    type="file"
                                                    name={field.name}
                                                    onChange={handleFileChange}
                                                    className="border-0 border-bottom rounded-0"
                                                    disabled
                                                />
                                                {formData[field.name] &&
                                                    typeof formData[field.name] === "string" && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="ms-2 rounded-circle"
                                                            href={formData[field.name]}
                                                            target="_blank"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                variant="primary"
                                type="submit"
                                className="px-4 py-2 rounded-pill shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        <span className="ms-2">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-folder-check me-2"></i>Complete
                                        Documentation
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        );
    };

    const renderEmbassyAppointmentForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Embassy Appointment</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="appointment_location"
                                    onChange={handleChange}
                                    value={formData.appointment_location || ""}
                                    placeholder="Enter embassy location"
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Date / Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="appointment_datetime"
                                    onChange={handleChange}
                                    value={
                                        formData.appointment_datetime
                                            ? formData.appointment_datetime
                                            : getCurrentBSTDateTime()
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                        Appointment Letter
                                    </div>
                                    <Form.Select
                                        name="appointment_letter_doc_status"
                                        onChange={handleChange}
                                        value={formData.appointment_letter ? (formData.appointment_letter_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.appointment_letter || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="appointment_letter"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                        />
                                        {formData.appointment_letter &&
                                            typeof formData.appointment_letter === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.appointment_letter}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="appointment_status"
                                    onChange={handleChange}
                                    value={formData.appointment_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-calendar-plus me-2"></i>Schedule
                                    Appointment
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderEmbassyInterviewResultForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Embassy Interview Result</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Result Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="embassy_result_date"
                                    onChange={handleChange}
                                    value={
                                        formData.embassy_result_date
                                            ? formData.embassy_result_date
                                            : ""
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Result</Form.Label>
                                <Form.Select
                                    name="embassy_result"
                                    onChange={handleChange}
                                    value={formData.embassy_result || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select result</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Pending">Pending</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Feedback</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="embassy_feedback"
                                    onChange={handleChange}
                                    value={formData.embassy_feedback || ""}
                                    placeholder="Enter feedback from the embassy"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="embassy_notes"
                                    onChange={handleChange}
                                    value={formData.embassy_notes || ""}
                                    placeholder="Enter any additional notes"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Summary</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="embassy_summary"
                                    onChange={handleChange}
                                    value={formData.embassy_summary || ""}
                                    placeholder="Summary of the embassy interview"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-clipboard-check me-2"></i>Record Results
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    const renderVisaStatusForm = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Visa Status</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Status</Form.Label>
                                <Form.Select
                                    name="visa_status"
                                    onChange={handleChange}
                                    value={formData.visa_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Pending">Pending</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Decision Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="decision_date"
                                    onChange={handleChange}
                                    value={formData.decision_date ? formData.decision_date : ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                       Rejection Letter
                                    </div>
                                    <Form.Select
                                        name="visa_sticker_upload_doc_status"
                                        onChange={handleChange}
                                        value={formData.visa_sticker_upload ? (formData.visa_sticker_upload_doc_status || "Pending") : ""}
                                        className="w-50 border-0 border-bottom rounded-0"
                                        disabled={!formData.visa_sticker_upload || userRole === "student"} // Disable for students or if no file
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Label>
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="file"
                                            name="visa_sticker_upload"
                                            onChange={handleFileChange}
                                            className="border-0 border-bottom rounded-0"
                                            disabled
                                        />
                                        {formData.visa_sticker_upload &&
                                            typeof formData.visa_sticker_upload === "string" && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="ms-2 rounded-circle"
                                                    href={formData.visa_sticker_upload}
                                                    target="_blank"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Appeal Status</Form.Label>
                                <Form.Select
                                    name="appeal_status"
                                    onChange={handleChange}
                                    value={formData.appeal_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                >
                                    <option value="">Select appeal status</option>
                                    <option value="Not Required">Not Required</option>
                                    <option value="Appealed">Appealed</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Rejection Reason</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="rejection_reason"
                                    onChange={handleChange}
                                    value={formData.rejection_reason || ""}
                                    placeholder="Enter reason if rejected"
                                    className="border-0 border-bottom rounded-0"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="primary"
                            type="submit"
                            className="px-4 py-2 rounded-pill shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    <span className="ms-2">Updating...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-passport me-2"></i>Update Visa Status
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );

    return (
        <div className="">
            {renderStepper()}
            {loading && !formData && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading data...</p>
                </div>
            )}

            {!loading && (
                <>
                    {activeStep === "application" && renderApplicationSection()}
                    {activeStep === "interview" && renderInterviewSection()}
                    {activeStep === "visa" && renderVisaProcessSection()}
                    {activeStep === "fee" && renderFeePaymentSection()}
                    {activeStep === "zoom" && renderZoomInterviewForm()}
                    {activeStep === "conditionalOffer" &&
                        renderConditionalOfferLetterForm()}
                    {activeStep === "tuitionFee" && renderTuitionFeePaymentForm()}
                    {activeStep === "mainofferletter" && renderMainOfferLetterForm()}
                    {activeStep === "embassydocument" &&
                        renderEmbassyDocumentPreparationForm()}
                    {activeStep === "embassyappoint" && renderEmbassyAppointmentForm()}
                    {activeStep === "embassyinterview" &&
                        renderEmbassyInterviewResultForm()}
                    {activeStep === "visaStatus" && renderVisaStatusForm()}
                </>
            )}
        </div>
    );
};

export default VisaProcesingNew;







// import React, { useEffect, useState } from "react";
// import {
//     Form,
//     Button,
//     Card,
//     Container,
//     Row,
//     Col,
//     Alert,
//     Spinner,
// } from "react-bootstrap";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import api from "../../services/axiosInterceptor";
// import BASE_URL from "../../Config";
// import Swal from "sweetalert2";
// import { RiH2 } from "react-icons/ri";

// const VisaProcesingNew = () => {
//     const [activeStep, setActiveStep] = useState("application");
//     const [formData, setFormData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);
//     const [recordId, setRecordId] = useState(null);
//     const [completedSteps, setCompletedSteps] = useState([]);
//     const [universities, setUniversities] = useState([]);
//     const [selectedUniversityId, setSelectedUniversityId] = useState(null);
//     const [userRole, setUserRole] = useState(null); // To track user role

//     const steps = [
//         { key: "application", label: "Registration", icon: "bi-person", stageKey: "registration_visa_processing_stage" },
//         { key: "interview", label: "Documents", icon: "bi-file-earmark", stageKey: "documents_visa_processing_stage" },
//         { key: "visa", label: "University Application", icon: "bi-building", stageKey: "university_application_visa_processing_stage" },
//         { key: "fee", label: "Fee Payment", icon: "bi-credit-card", stageKey: "fee_payment_visa_processing_stage" },
//         { key: "zoom", label: "Interview", icon: "bi-camera-video", stageKey: "university_interview_visa_processing_stage" },
//         { key: "conditionalOffer", label: "Offer Letter", icon: "bi-file-text", stageKey: "offer_letter_visa_processing_stage" },
//         { key: "tuitionFee", label: "Tuition Fee", icon: "bi-cash-stack", stageKey: "tuition_fee_visa_processing_stage" },
//         { key: "mainofferletter", label: "Final Offer", icon: "bi-file-check", stageKey: "final_offer_visa_processing_stage" },
//         { key: "embassydocument", label: "Embassy Docs", icon: "bi-folder", stageKey: "embassy_docs_visa_processing_stage" },
//         { key: "embassyappoint", label: "Appointment", icon: "bi-calendar", stageKey: "appointment_visa_processing_stage" },
//         { key: "embassyinterview", label: "Interview", icon: "bi-mic", stageKey: "visa_approval_visa_processing_stage" },
//         { key: "visaStatus", label: "Visa Status", icon: "bi-passport", stageKey: "visa_rejection_visa_processing_stage" },
//     ];

//     // Function to load visa process data for a specific university
//     const loadVisaProcessData = async (universityId, studentId) => {
//         try {
//             console.log("Loading visa process data for university:", universityId, "and student:", studentId);
//             const visaProcessResponse = await api.get(
//                 `${BASE_URL}auth/getVisaProcessByuniversityidsss/${universityId}/${studentId}`
//             );
            
//             const visaData = visaProcessResponse.data[0];
//             console.log("Visa process data:", visaData);

//             if (visaData) {
//                 setRecordId(visaData.id);
//                 setFormData(visaData);

//                 // Set the selected university ID if it exists in the visa data
//                 if (visaData.university_id) {
//                     setSelectedUniversityId(visaData.university_id.toString());
//                 }

//                 // Determine completed steps based on stage values
//                 const completed = [];
//                 steps.forEach(step => {
//                     if (visaData[step.stageKey] === 1) {
//                         completed.push(step.key);
//                     }
//                 });
//                 setCompletedSteps(completed);
                
//                 return visaData;
//             }
//             return null;
//         } catch (e) {
//             console.log("No existing visa process record found for university:", universityId, "Error:", e);
//             return null;
//         }
//     };

//     // Function to reset form data when switching to a university with no data
//     const resetFormData = (universityId) => {
//         // Keep only basic student info and reset everything else
//         setFormData(prev => ({
//             ...prev,
//             university_id: universityId,
//             // Reset all stage-related fields
//             registration_visa_processing_stage: 0,
//             documents_visa_processing_stage: 0,
//             university_application_visa_processing_stage: 0,
//             fee_payment_visa_processing_stage: 0,
//             university_interview_visa_processing_stage: 0,
//             offer_letter_visa_processing_stage: 0,
//             tuition_fee_visa_processing_stage: 0,
//             final_offer_visa_processing_stage: 0,
//             embassy_docs_visa_processing_stage: 0,
//             appointment_visa_processing_stage: 0,
//             visa_approval_visa_processing_stage: 0,
//             visa_rejection_visa_processing_stage: 0,
//             // Reset document fields
//             passport_doc: "",
//             photo_doc: "",
//             ssc_doc: "",
//             hsc_doc: "",
//             bachelor_doc: "",
//             ielts_doc: "",
//             cv_doc: "",
//             sop_doc: "",
//             medical_doc: "",
//             other_doc: "",
//             // Reset university application fields
//             university_name: "",
//             program_name: "",
//             submission_date: "",
//             submission_method: "",
//             application_proof: "",
//             application_id: "",
//             application_status: "",
//             // Reset fee payment fields
//             fee_amount: "",
//             fee_method: "",
//             fee_date: "",
//             fee_proof: "",
//             fee_status: "",
//             // Reset interview fields
//             interview_date: "",
//             interview_platform: "",
//             interview_status: "",
//             interviewer_name: "",
//             interview_recording: "",
//             interview_result: "",
//             interview_feedback: "",
//             interview_summary: "",
//             interview_result_date: "",
//             // Reset offer letter fields
//             conditional_offer_upload: "",
//             conditional_offer_date: "",
//             conditional_conditions: "",
//             conditional_offer_status: "",
//             tuition_fee_amount: "",
//             tuition_fee_date: "",
//             tuition_fee_proof: "",
//             tuition_fee_status: "",
//             tuition_comments: "",
//             main_offer_upload: "",
//             main_offer_date: "",
//             main_offer_status: "",
//             // Reset embassy document fields
//             motivation_letter: "",
//             europass_cv: "",
//             bank_statement: "",
//             birth_certificate: "",
//             tax_proof: "",
//             business_docs: "",
//             ca_certificate: "",
//             health_insurance: "",
//             residence_form: "",
//             flight_booking: "",
//             police_clearance: "",
//             family_certificate: "",
//             application_form: "",
//             // Reset embassy appointment fields
//             appointment_location: "",
//             appointment_datetime: "",
//             appointment_letter: "",
//             appointment_status: "",
//             // Reset embassy result fields
//             embassy_result_date: "",
//             embassy_feedback: "",
//             embassy_result: "",
//             embassy_notes: "",
//             embassy_summary: "",
//             // Reset visa status fields
//             visa_status: "",
//             decision_date: "",
//             visa_sticker_upload: "",
//             rejection_reason: "",
//             appeal_status: "",
//             // Reset all status fields
//             passport_doc_status: "",
//             photo_doc_status: "",
//             ssc_doc_status: "",
//             hsc_doc_status: "",
//             bachelor_doc_status: "",
//             ielts_doc_status: "",
//             cv_doc_status: "",
//             sop_doc_status: "",
//             medical_doc_status: "",
//             other_doc_status: "",
//             proof_submission_doc_status: "",
//             proof_fees_payment_doc_status: "",
//             recording_doc_status: "",
//             offer_letter_upload_doc_status: "",
//             proof_tuition_fees_payment_doc_status: "",
//             motivation_letter_doc_status: "",
//             europass_cv_doc_status: "",
//             bank_statement_doc_status: "",
//             birth_certificate_doc_status: "",
//             tax_proof_doc_status: "",
//             business_documents_doc_status: "",
//             ca_certificate_doc_status: "",
//             health_travel_insurance_doc_status: "",
//             residence_form_doc_status: "",
//             flight_booking_doc_status: "",
//             police_clearance_doc_status: "",
//             family_certificate_doc_status: "",
//             application_form_doc_status: "",
//             appointment_letter_doc_status: "",
//             visa_sticker_upload_doc_status: "",
//             main_offer_upload_doc_status: "",
//             tuition_fee_proof_status: "",
//             fee_proof_status: ""
//         }));
        
//         // Reset completed steps
//         setCompletedSteps([]);
//         setRecordId(null);
//     };

//     // Load student data and check existing visa process record
//     useEffect(() => {
//         const loadInitialData = async () => {
//             try {
//                 setLoading(true);
//                 const studentId = localStorage.getItem("student_id");
//                 const role = localStorage.getItem("role"); // Get user role from localStorage
//                 setUserRole(role); // Set user role in state

//                 const universityID = localStorage.getItem("university_id");
//                 console.log("Initial load - studentId:", studentId, "universityID:", universityID);

//                 // Get student basic info
//                 const studentResponse = await api.get(
//                     `${BASE_URL}auth/getStudentById/${studentId}`
//                 );

//                 const studentData = studentResponse.data;
//                 console.log("Student data:", studentData);

//                 // Set initial form data with student info
//                 setFormData((prev) => ({
//                     ...prev,
//                     full_name: studentData.full_name || "",
//                     email: studentData.email || "",
//                     phone: studentData.mobile_number || "",
//                     date_of_birth: studentData.date_of_birth
//                         ? studentData.date_of_birth.split("T")[0]
//                         : "",
//                     passport_no: studentData.passport_no || prev.passport_no || "",
//                     university_id: universityID || prev.university_id || "", // Add university_id to form data
//                 }));

//                 // Set selected university ID from localStorage
//                 if (universityID) {
//                     setSelectedUniversityId(universityID.toString());
//                     // Load visa process data for the selected university
//                     await loadVisaProcessData(universityID, studentId);
//                 }
//             } catch (err) {
//                 console.error("Failed to load initial data:", err);
//                 setError("Failed to load initial data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadInitialData();
//     }, []);

//     // Handle university change
//     const handleUniversityChange = async (e) => {
//         const universityId = e.target.value;
//         console.log("University changed to:", universityId);
        
//         if (!universityId) {
//             // If no university is selected, reset form data
//             resetFormData("");
//             setSelectedUniversityId("");
//             return;
//         }
        
//         setSelectedUniversityId(universityId);
        
//         // Update form data with new university ID
//         setFormData((prev) => ({
//             ...prev,
//             university_id: universityId,
//         }));
        
//         // Load visa process data for the newly selected university
//         const studentId = localStorage.getItem("student_id");
//         if (studentId) {
//             setLoading(true);
//             try {
//                 const visaData = await loadVisaProcessData(universityId, studentId);
                
//                 // If no visa data exists for this university, reset the form
//                 if (!visaData) {
//                     resetFormData(universityId);
//                 }
//             } catch (err) {
//                 console.error("Failed to load visa process data for university:", universityId, err);
//                 setError("Failed to load visa process data for the selected university");
//                 // Reset form data if there's an error
//                 resetFormData(universityId);
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleFileChange = (e) => {
//         const { name, files } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: files[0],
//         }));

//         // When a file is uploaded, automatically set its status to "Pending"
//         const statusFieldName = `${name}_status`;
//         setFormData((prev) => ({
//             ...prev,
//             [statusFieldName]: "Pending"
//         }));
//     };

//     // Format JS Date -> MySQL DATE or DATETIME
//     const formatDateForMySQL = (date, includeTime = false) => {
//         if (!date) return null;
//         const d = new Date(date);
//         const pad = (n) => String(n).padStart(2, "0");
//         const yyyy = d.getFullYear();
//         const mm = pad(d.getMonth() + 1);
//         const dd = pad(d.getDate());
//         if (includeTime) {
//             const hh = pad(d.getHours());
//             const mi = pad(d.getMinutes());
//             const ss = pad(d.getSeconds());
//             return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
//         }
//         return `${yyyy}-${mm}-${dd}`;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);
//         setSuccess(null);
//         const studentId = localStorage.getItem("student_id");

//         try {
//             const formDataToSend = new FormData();

//             // Prepare the data object with proper formatting
//             const submissionData = {
//                 ...formData,
//                 // Convert dates to ISO string format if they exist
//                 date_of_birth: formData.date_of_birth
//                     ? new Date(formData.date_of_birth).toISOString()
//                     : null,
//                 registration_date: formData.registration_date
//                     ? new Date(formData.registration_date).toISOString()
//                     : null,
//                 embassy_result_date: formData.embassy_result_date
//                     ? formatDateForMySQL(formData.embassy_result_date, true) // if DATETIME
//                     : null,
//                 decision_date: formData.decision_date
//                     ? formatDateForMySQL(formData.decision_date, true) // if DATETIME
//                     : null,
//                 student_id: studentId,
//                 // Ensure university_id is included
//                 university_id: selectedUniversityId || formData.university_id || localStorage.getItem("university_id"),
//                 // Add other date fields if needed
//             };

//             // Remove the 'message' key if it exists
//             delete submissionData.message;
//             delete submissionData.affectedRows;
//             delete submissionData.updatedFields;
//             delete submissionData.created_at;
//             delete submissionData.motivation_letter_status;
//             delete submissionData.interview_recording_status;
//             delete submissionData.bank_statement_status;
//             delete submissionData.tax_proof_status;
//             delete submissionData.ca_certificate_status;
//             delete submissionData.residence_form_status;
//             delete submissionData.police_clearance_status;
//             delete submissionData.application_form_status;
//             delete submissionData.europass_cv_status;
//             delete submissionData.birth_certificate_status;
//             delete submissionData.business_docs_status;
//             delete submissionData.health_insurance_status;
//             delete submissionData.flight_booking_status;
//             delete submissionData.family_certificate_status;
//             delete submissionData.application_proof_status;
//             delete submissionData.fee_proof_status;
//             delete submissionData.tuition_fee_proof;
//             delete submissionData.appointment_letter_status;

//             // Remove undefined/null values and prepare FormData
//             Object.entries(submissionData).forEach(([key, value]) => {
//                 if (value !== null && value !== undefined && value !== "") {
//                     if (value instanceof File) {
//                         formDataToSend.append(key, value, value.name);
//                     } else if (typeof value === "object") {
//                         formDataToSend.append(key, JSON.stringify(value));
//                     } else {
//                         formDataToSend.append(key, value);
//                     }
//                 }
//             });

//             // Find the current step to set its stage value to 1
//             const currentStep = steps.find(step => step.key === activeStep);
//             if (currentStep) {
//                 formDataToSend.append(currentStep.stageKey, 1);
//             }

//             // Debug: Log what's being sent
//             const formDataObj = {};
//             formDataToSend.forEach((value, key) => (formDataObj[key] = value));
//             console.log("Form data being sent:", formDataObj);

//             let response;

//             if (activeStep === "application") {
//                 // First step - create new record with POST
//                 response = await api.post(
//                     `${BASE_URL}createVisaProcess`,
//                     formDataToSend,
//                     {
//                         headers: {
//                             "Content-Type": "multipart/form-data",
//                         },
//                     }
//                 );

//                 if (!response.data.id) {
//                     throw new Error("No ID returned from server after creation");
//                 }

//                 setRecordId(response.data.id);
//                 setCompletedSteps((prev) => [...prev, "application"]);
//             } else {
//                 // Subsequent steps - update existing record with PUT
//                 if (!recordId) {
//                     throw new Error("No record ID available for update");
//                 }

//                 response = await api.put(
//                     `${BASE_URL}createVisaProcess/${recordId}`,
//                     formDataToSend,
//                     {
//                         headers: {
//                             "Content-Type": "multipart/form-data",
//                         },
//                     }
//                 );

//                 if (!completedSteps.includes(activeStep)) {
//                     setCompletedSteps((prev) => [...prev, activeStep]);
//                 }
//             }

//             // Update form data with response
//             setFormData((prev) => ({
//                 ...prev,
//                 ...response.data,
//             }));

//             setSuccess(
//                 `${steps.find((s) => s.key === activeStep).label
//                 } data saved successfully!`
//             );

//             // Auto-advance to next step if available
//             const currentIndex = steps.findIndex((step) => step.key === activeStep);
//             if (currentIndex < steps.length - 1) {
//                 setTimeout(() => {
//                     setActiveStep(steps[currentIndex + 1].key);
//                     setSuccess(null);
//                 }, 1500);
//             }
//         } catch (err) {
//             console.error("Submission error:", err);

//             let errorMessage = "Failed to save data";

//             if (err.response) {
//                 // Handle MySQL syntax errors specifically
//                 if (
//                     err.response.data?.error?.includes(
//                         "You have an error in your SQL syntax"
//                     )
//                 ) {
//                     errorMessage = "Data format error. Please check your inputs.";
//                 } else if (err.response.data?.error?.includes("Unknown column")) {
//                     errorMessage = "Invalid data field detected. Please contact support.";
//                 } else {
//                     errorMessage =
//                         err.response.data?.message ||
//                         err.response.statusText ||
//                         errorMessage;
//                 }
//             } else if (err.message) {
//                 errorMessage = err.message;
//             }

//             setError(errorMessage);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         const fetchUniversities = async () => {
//             try {
//                 const res = await api.get(`${BASE_URL}universities`);
//                 setUniversities(res.data);
//                 console.log("Universities loaded:", res.data);

//                 // Get university_id from localStorage or formData
//                 const universityId = localStorage.getItem("university_id") || formData.university_id;

//                 if (universityId && res.data.length > 0) {
//                     // Convert to string for comparison since form values are strings
//                     setSelectedUniversityId(universityId.toString());
//                     console.log("Set selected university ID to:", universityId);
//                 } else if (res.data.length > 0) {
//                     // Fallback to first university if no ID in localStorage or formData
//                     setSelectedUniversityId(res.data[0].id.toString());
//                     console.log("Set selected university ID to first university:", res.data[0].id);
//                 }
//             } catch (err) {
//                 console.error("Error fetching universities:", err);
//             }
//         };

//         fetchUniversities();
//     }, [formData.university_id]); // Add formData.university_id as a dependency

//     const renderStepper = () => (
//         <div className="p-4">
//             <div className="mb-3">
//                 <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
//                     {/* Heading */}
//                     <h2 className="mb-0">Check Application Journey</h2>

//                     {/* Select */}
//                     <Form.Group className="mb-0 w-md-auto">
//                         <Form.Select
//                             name="university_id"
//                             value={selectedUniversityId || ""}
//                             onChange={handleUniversityChange}
//                         >
//                             <option value="">-- Select University For Status Check --</option>
//                             {universities.map((uni) => (
//                                 <option key={uni.id} value={uni.id.toString()}>
//                                     {uni.name}
//                                 </option>
//                             ))}
//                         </Form.Select>
//                     </Form.Group>
//                 </div>
//             </div>

//             <h5 className="text-center mt-3">
//                 {selectedUniversityId
//                     ? universities.find((uni) => uni.id.toString() === selectedUniversityId)?.name
//                         ? `${universities.find((uni) => uni.id.toString() === selectedUniversityId).name} - Visa Processing CRM Workflow`
//                         : 'Select University'
//                     : 'Select University'}
//             </h5>

//             <Card.Body className="p-3">
//                 <div className="d-flex justify-content-between align-items-center overflow-auto py-2">
//                     {steps.map((step, index) => {
//                         const isActive = activeStep === step.key;
//                         const isCompleted = completedSteps.includes(step.key);
//                         // const isDisabled =
//                         //     index > 0 && !completedSteps.includes(steps[index - 1].key);

//                         return (
//                             <div
//                                 // className={`text-center position-relative flex-shrink-0 ${isDisabled ? "opacity-50" : ""
//                                 //     }`}
//                                 className="text-center position-relative flex-shrink-0"
//                                 style={{ minWidth: "80px" }}
//                                 key={step.key}
//                             >
//                                 {index !== 0 && (
//                                     <div
//                                         className="position-absolute top-50 start-0 translate-middle-y w-100"
//                                     />
//                                 )}

//                                 <div
//                                     className={`rounded-circle d-flex align-items-center justify-content-center mx-auto ${isActive
//                                         ? "bg-primary"
//                                         : isCompleted
//                                             ? "bg-success"
//                                             : "bg-light"
//                                         }`}
//                                     style={{
//                                         width: "36px",
//                                         height: "36px",
//                                         color: isActive || isCompleted ? "white" : "#858796",
//                                         zIndex: 1,
//                                         // cursor: isDisabled ? "not-allowed" : "pointer",
//                                         cursor: "pointer",
//                                         border: isActive ? "2px solid #4e73df" : "none",
//                                         boxShadow: isActive
//                                             ? "0 0 0 4px rgba(78, 115, 223, 0.25)"
//                                             : "none",
//                                         transition: "all 0.3s ease",
//                                     }}
//                                     // onClick={() => !isDisabled && setActiveStep(step.key)}
//                                     onClick={() => setActiveStep(step.key)}
//                                     role="button"
//                                 >
//                                     {isCompleted ? (
//                                         <i className="bi bi-check-lg fs-6"></i>
//                                     ) : (
//                                         <i className={`bi ${step.icon} fs-6`}></i>
//                                     )}
//                                 </div>

//                                 <div
//                                     className={`mt-2 small text-wrap ${isActive ? "text-primary fw-bold" : "text-muted"
//                                         }`}
//                                     style={{ fontSize: "0.75rem" }}
//                                 >
//                                     {step.label}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </Card.Body>
//         </div>
//     );

//     // Rest of the component functions remain the same
//     const renderApplicationSection = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Student Registration Details</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     {/* Add a hidden field for university_id */}
//                     <Form.Control
//                         type="hidden"
//                         name="university_id"
//                         value={selectedUniversityId || formData.university_id || ""}
//                     />

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Full Name</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="full_name"
//                                     onChange={handleChange}
//                                     value={formData.full_name || ""}
//                                     placeholder="Enter full name"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Email</Form.Label>
//                                 <Form.Control
//                                     type="email"
//                                     name="email"
//                                     onChange={handleChange}
//                                     value={formData.email || ""}
//                                     placeholder="Enter email address"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Phone</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="phone"
//                                     onChange={handleChange}
//                                     value={formData.phone || ""}
//                                     placeholder="Enter phone number"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Date of Birth</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="date_of_birth"
//                                     onChange={handleChange}
//                                     value={formData.date_of_birth || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Passport No / NID</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="passport_no"
//                                     onChange={handleChange}
//                                     value={formData.passport_no}
//                                     placeholder="Enter passport number or NID"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Applied Program</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="applied_program"
//                                     onChange={handleChange}
//                                     value={formData.applied_program || ""}
//                                     placeholder="Enter program name"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Intake</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="intake"
//                                     onChange={handleChange}
//                                     value={formData.intake || ""}
//                                     placeholder="Enter intake session"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Assigned Counselor</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="assigned_counselor"
//                                     onChange={handleChange}
//                                     value={formData.assigned_counselor || ""}
//                                     placeholder="Enter counselor name"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Registration Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="registration_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.registration_date
//                                             ? formData.registration_date.split("T")[0]
//                                             : (() => {
//                                                 // Get current date in IST (Indian Standard Time)
//                                                 const now = new Date();
//                                                 const istOffset = 330; // IST is UTC+5:30
//                                                 const istTime = new Date(now.getTime() + (istOffset - now.getTimezoneOffset()) * 60000);
                                                
//                                                 const year = istTime.getFullYear();
//                                                 const month = String(istTime.getMonth() + 1).padStart(2, '0');
//                                                 const day = String(istTime.getDate()).padStart(2, '0');
                                                
//                                                 return `${year}-${month}-${day}`;
//                                             })()
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Source</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="source"
//                                     onChange={handleChange}
//                                     value={formData.source || ""}
//                                     placeholder="Enter source of registration"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-save me-2"></i>Save Details
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     // ... rest of the component functions remain unchanged
//     const renderInterviewSection = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Document Upload</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         {[
//                             { name: "passport_doc", label: "Passport", statusName: "passport_doc_status" },
//                             { name: "photo_doc", label: "Photo", statusName: "photo_doc_status" },
//                             { name: "ssc_doc", label: "SSC Certificate", statusName: "ssc_doc_status" },
//                             { name: "hsc_doc", label: "HSC Transcript", statusName: "hsc_doc_status" },
//                             { name: "bachelor_doc", label: "Bachelor's Certificate", statusName: "bachelor_doc_status" },
//                             { name: "ielts_doc", label: "IELTS/English Certificate", statusName: "ielts_doc_status" },
//                             { name: "cv_doc", label: "CV", statusName: "cv_doc_status" },
//                             { name: "sop_doc", label: "SOP", statusName: "sop_doc_status" },
//                             { name: "medical_doc", label: "Medical Certificate", statusName: "medical_doc_status" },
//                             { name: "other_doc", label: "Other Documents", statusName: "other_doc_status" },
//                         ].map((item, index) => (
//                             <Col md={6} key={index}>
//                                 <Form.Group className="mb-4">
//                                     <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                         <div>
//                                             <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                             {item.label}
//                                         </div>
//                                         <Form.Select
//                                             name={item.statusName}
//                                             onChange={handleChange}
//                                             value={formData[item.name] ? (formData[item.statusName] || "Pending") : ""}
//                                             className="w-50 border-0 border-bottom rounded-0"
//                                             disabled={!formData[item.name] || userRole === "student"} // Disable for students or if no file
//                                         >
//                                             <option value="">Select status</option>
//                                             <option value="Pending">Pending</option>
//                                             <option value="Approved">Approved</option>
//                                             <option value="Rejected">Rejected</option>
//                                         </Form.Select>
//                                     </Form.Label>
//                                     <div className="d-flex flex-column">
//                                         <div className="d-flex align-items-center mb-2">
//                                             <Form.Control
//                                                 type="file"
//                                                 name={item.name}
//                                                 onChange={handleFileChange}
//                                                 className="border-0 border-bottom rounded-0"
//                                             />
//                                             {formData[item.name] &&
//                                                 typeof formData[item.name] === "string" && (
//                                                     <Button
//                                                         variant="outline-primary"
//                                                         size="sm"
//                                                         className="ms-2 rounded-circle"
//                                                         href={formData[item.name]}
//                                                         target="_blank"
//                                                     >
//                                                         <i className="bi bi-eye"></i>
//                                                     </Button>
//                                                 )}
//                                         </div>
//                                     </div>
//                                 </Form.Group>
//                             </Col>
//                         ))}
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Uploading...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-upload me-2"></i>Upload Documents
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderVisaProcessSection = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">University Application Submission</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">University Name</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="university_name"
//                                     onChange={handleChange}
//                                     value={formData.university_name || ""}
//                                     placeholder="Enter university name"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Program</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="program_name"
//                                     onChange={handleChange}
//                                     value={formData.program_name || ""}
//                                     placeholder="Enter program name"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Submission Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="submission_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.submission_date
//                                             ? formData.submission_date.split("T")[0]
//                                             : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Method</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="submission_method"
//                                     onChange={handleChange}
//                                     value={formData.submission_method || ""}
//                                     placeholder="Online/Offline"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Proof of Submission
//                                     </div>
//                                     <Form.Select
//                                         name="proof_submission_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.application_proof ? (formData.proof_submission_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.application_proof || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="application_proof"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                         />
//                                         {formData.application_proof &&
//                                             typeof formData.application_proof === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.application_proof}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Application ID</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="application_id"
//                                     onChange={handleChange}
//                                     value={formData.application_id || ""}
//                                     placeholder="Enter application ID"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="application_status"
//                                     onChange={handleChange}
//                                     value={formData.application_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Pending">Pending</option>
//                                     <option value="Submitted">Submitted</option>
//                                     <option value="Approved">Approved</option>
//                                     <option value="Rejected">Rejected</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-send me-2"></i>Submit to University
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderFeePaymentSection = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Application Fee Payment</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Amount</Form.Label>
//                                 <div className="input-group">
//                                     <span className="input-group-text bg-light border-0">$</span>
//                                     <Form.Control
//                                         type="number"
//                                         name="fee_amount"
//                                         onChange={handleChange}
//                                         value={formData.fee_amount || ""}
//                                         placeholder="Enter amount paid"
//                                         className="border-0 border-bottom rounded-0"
//                                         required
//                                     />
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Payment Method</Form.Label>
//                                 <Form.Select
//                                     name="fee_method"
//                                     onChange={handleChange}
//                                     value={formData.fee_method || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select method</option>
//                                     <option value="Cash">Cash</option>
//                                     <option value="Online">Online</option>
//                                     <option value="Bank Transfer">Bank Transfer</option>
//                                     <option value="Credit Card">Credit Card</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Payment Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="fee_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.fee_date ? formData.fee_date.split("T")[0] : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Proof of Payment
//                                     </div>
//                                     <Form.Select
//                                         name="proof_fees_payment_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.fee_proof ? (formData.proof_fees_payment_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.fee_proof || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="fee_proof"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                         />
//                                         {formData.fee_proof &&
//                                             typeof formData.fee_proof === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.fee_proof}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="fee_status"
//                                     onChange={handleChange}
//                                     value={formData.fee_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Paid">Paid</option>
//                                     <option value="Pending">Pending</option>
//                                     <option value="Partial">Partial</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-credit-card me-2"></i>Process Payment
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderZoomInterviewForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">University Interview Details</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Date / Time</Form.Label>
//                                 <Form.Control
//                                     type="datetime-local"
//                                     name="interview_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.interview_date
//                                             ? new Date(formData.interview_date)
//                                                 .toISOString()
//                                                 .slice(0, 16)
//                                             : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Platform</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="interview_platform"
//                                     onChange={handleChange}
//                                     value={formData.interview_platform || ""}
//                                     placeholder="e.g., Zoom, Google Meet"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="interview_status"
//                                     onChange={handleChange}
//                                     value={formData.interview_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Scheduled">Scheduled</option>
//                                     <option value="Completed">Completed</option>
//                                     <option value="Pending">Pending</option>
//                                     <option value="Cancelled">Cancelled</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Interviewer</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="interviewer_name"
//                                     onChange={handleChange}
//                                     value={formData.interviewer_name || ""}
//                                     placeholder="Enter interviewer's name"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Recording
//                                     </div>
//                                     <Form.Select
//                                         name="recording_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.interview_recording ? (formData.recording_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.interview_recording || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="interview_recording"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                             disabled
//                                         />
//                                         {formData.interview_recording &&
//                                             typeof formData.interview_recording === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.interview_recording}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Result</Form.Label>
//                                 <Form.Select
//                                     name="interview_result"
//                                     onChange={handleChange}
//                                     value={formData.interview_result || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                 >
//                                     <option value="">Select result</option>
//                                     <option value="Accepted">Accepted</option>
//                                     <option value="Rejected">Rejected</option>
//                                     <option value="Pending">Pending</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Result Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="interview_result_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.interview_result_date
//                                             ? formData.interview_result_date.split("T")[0]
//                                             : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Feedback</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={2}
//                                     name="interview_feedback"
//                                     onChange={handleChange}
//                                     value={formData.interview_feedback || ""}
//                                     placeholder="Enter interview feedback"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Summary</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={2}
//                                     name="interview_summary"
//                                     onChange={handleChange}
//                                     value={formData.interview_summary || ""}
//                                     placeholder="Enter interview summary"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-calendar-check me-2"></i>Save Interview
//                                     Details
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderConditionalOfferLetterForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Conditional Offer Letter</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Offer Letter Upload
//                                     </div>
//                                     <Form.Select
//                                         name="offer_letter_upload_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.conditional_offer_upload ? (formData.offer_letter_upload_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.conditional_offer_upload || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="conditional_offer_upload"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                             disabled
//                                         />
//                                         {formData.conditional_offer_upload &&
//                                             typeof formData.conditional_offer_upload === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.conditional_offer_upload}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Issue Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="conditional_offer_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.conditional_offer_date
//                                             ? formData.conditional_offer_date
//                                             : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Conditions</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={3}
//                                     name="conditional_conditions"
//                                     onChange={handleChange}
//                                     value={formData.conditional_conditions || ""}
//                                     placeholder="Enter any conditions"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="conditional_offer_status"
//                                     onChange={handleChange}
//                                     value={formData.conditional_offer_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Pending">Pending</option>
//                                     <option value="Received">Received</option>
//                                     <option value="Declined">Declined</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-file-earmark-text me-2"></i>Save Offer
//                                     Details
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderTuitionFeePaymentForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Tuition Fee Payment</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Amount</Form.Label>
//                                 <div className="input-group">
//                                     <span className="input-group-text bg-light border-0">$</span>
//                                     <Form.Control
//                                         type="number"
//                                         name="tuition_fee_amount"
//                                         onChange={handleChange}
//                                         value={formData.tuition_fee_amount || ""}
//                                         placeholder="Enter tuition fee amount"
//                                         className="border-0 border-bottom rounded-0"
//                                         required
//                                     />
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Payment Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="tuition_fee_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.tuition_fee_date ? formData.tuition_fee_date : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Proof of Payment
//                                     </div>
//                                     <Form.Select
//                                         name="proof_tuition_fees_payment_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.tuition_fee_proof ? (formData.proof_tuition_fees_payment_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.tuition_fee_proof || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="tuition_fee_proof"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                         />
//                                         {formData.tuition_fee_proof &&
//                                             typeof formData.tuition_fee_proof === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.tuition_fee_proof}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="tuition_fee_status"
//                                     onChange={handleChange}
//                                     value={formData.tuition_fee_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Paid">Paid</option>
//                                     <option value="Pending">Pending</option>
//                                     <option value="Partial">Partial</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Comments</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={2}
//                                     name="tuition_comments"
//                                     onChange={handleChange}
//                                     value={formData.tuition_comments || ""}
//                                     placeholder="Enter any remarks or notes"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-cash-stack me-2"></i>Record Payment
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderMainOfferLetterForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Main Offer Letter</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Offer Letter Upload
//                                     </div>
//                                     <Form.Select
//                                         name="main_offer_upload_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.main_offer_upload ? (formData.main_offer_upload_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.main_offer_upload || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="main_offer_upload"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                             disabled
//                                         />
//                                         {formData.main_offer_upload &&
//                                             typeof formData.main_offer_upload === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.main_offer_upload}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="main_offer_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.main_offer_date ? formData.main_offer_date : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="main_offer_status"
//                                     onChange={handleChange}
//                                     value={formData.main_offer_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Pending">Pending</option>
//                                     <option value="Received">Received</option>
//                                     <option value="Declined">Declined</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-file-earmark-check me-2"></i>Save Offer
//                                     Letter
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderEmbassyDocumentPreparationForm = () => {
//         const documentFields = [
//             { name: "motivation_letter", label: "Motivation Letter", statusName: "motivation_letter_doc_status" },
//             { name: "europass_cv", label: "Europass CV", statusName: "europass_cv_doc_status" },
//             { name: "bank_statement", label: "Bank Statement", statusName: "bank_statement_doc_status" },
//             { name: "birth_certificate", label: "Birth Certificate", statusName: "birth_certificate_doc_status" },
//             { name: "tax_proof", label: "Tax Proof", statusName: "tax_proof_doc_status" },
//             { name: "business_docs", label: "Business Documents", statusName: "business_documents_doc_status" },
//             { name: "ca_certificate", label: "CA Certificate", statusName: "ca_certificate_doc_status" },
//             { name: "health_insurance", label: "Health/Travel Insurance", statusName: "health_insurance_doc_status" },
//             { name: "residence_form", label: "Residence Form", statusName: "residence_form_doc_status" },
//             { name: "flight_booking", label: "Flight Booking", statusName: "flight_booking_doc_status" },
//             { name: "police_clearance", label: "Police Clearance", statusName: "police_clearance_doc_status" },
//             { name: "family_certificate", label: "Family Certificate", statusName: "family_certificate_doc_status" },
//             { name: "application_form", label: "Application Form", statusName: "application_form_doc_status" },
//         ];

//         return (
//             <Card className="border-0 shadow-sm">
//                 <Card.Header className="bg-primary text-white py-3">
//                     <h5 className="mb-0">Embassy Document Preparation</h5>
//                 </Card.Header>
//                 <Card.Body>
//                     <Form onSubmit={handleSubmit}>
//                         {error && <Alert variant="danger">{error}</Alert>}
//                         {success && <Alert variant="success">{success}</Alert>}

//                         <Row>
//                             {documentFields.map((field, idx) => (
//                                 <Col md={6} key={idx}>
//                                     <Form.Group className="mb-3">
//                                         <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                             <div>
//                                                 <i className="bi bi-file-earmark me-2 text-primary"></i>
//                                                 {field.label}
//                                             </div>
//                                             <Form.Select
//                                                 name={field.statusName}
//                                                 onChange={handleChange}
//                                                 value={formData[field.name] ? (formData[field.statusName] || "Pending") : ""}
//                                                 className="w-50 border-0 border-bottom rounded-0"
//                                                 disabled={!formData[field.name] || userRole === "student"} // Disable for students or if no file
//                                             >
//                                                 <option value="">Select status</option>
//                                                 <option value="Pending">Pending</option>
//                                                 <option value="Approved">Approved</option>
//                                                 <option value="Rejected">Rejected</option>
//                                             </Form.Select>
//                                         </Form.Label>
//                                         <div className="d-flex flex-column">
//                                             <div className="d-flex align-items-center mb-2">
//                                                 <Form.Control
//                                                     type="file"
//                                                     name={field.name}
//                                                     onChange={handleFileChange}
//                                                     className="border-0 border-bottom rounded-0"
//                                                     disabled
//                                                 />
//                                                 {formData[field.name] &&
//                                                     typeof formData[field.name] === "string" && (
//                                                         <Button
//                                                             variant="outline-primary"
//                                                             size="sm"
//                                                             className="ms-2 rounded-circle"
//                                                             href={formData[field.name]}
//                                                             target="_blank"
//                                                         >
//                                                             <i className="bi bi-eye"></i>
//                                                         </Button>
//                                                     )}
//                                             </div>
//                                         </div>
//                                     </Form.Group>
//                                 </Col>
//                             ))}
//                         </Row>

//                         <div className="d-flex justify-content-end mt-4">
//                             <Button
//                                 variant="primary"
//                                 type="submit"
//                                 className="px-4 py-2 rounded-pill shadow-sm"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <Spinner
//                                             as="span"
//                                             animation="border"
//                                             size="sm"
//                                             role="status"
//                                             aria-hidden="true"
//                                         />
//                                         <span className="ms-2">Uploading...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <i className="bi bi-folder-check me-2"></i>Complete
//                                         Documentation
//                                     </>
//                                 )}
//                             </Button>
//                         </div>
//                     </Form>
//                 </Card.Body>
//             </Card>
//         );
//     };

//     const renderEmbassyAppointmentForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Embassy Appointment</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Location</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="appointment_location"
//                                     onChange={handleChange}
//                                     value={formData.appointment_location || ""}
//                                     placeholder="Enter embassy location"
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Date / Time</Form.Label>
//                                 <Form.Control
//                                     type="datetime-local"
//                                     name="appointment_datetime"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.appointment_datetime
//                                             ? new Date(formData.appointment_datetime)
//                                                 .toISOString()
//                                                 .slice(0, 16)
//                                             : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                         Appointment Letter
//                                     </div>
//                                     <Form.Select
//                                         name="appointment_letter_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.appointment_letter ? (formData.appointment_letter_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.appointment_letter || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="appointment_letter"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                         />
//                                         {formData.appointment_letter &&
//                                             typeof formData.appointment_letter === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.appointment_letter}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="appointment_status"
//                                     onChange={handleChange}
//                                     value={formData.appointment_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Scheduled">Scheduled</option>
//                                     <option value="Completed">Completed</option>
//                                     <option value="Cancelled">Cancelled</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-calendar-plus me-2"></i>Schedule
//                                     Appointment
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderEmbassyInterviewResultForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Embassy Interview Result</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Result Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="embassy_result_date"
//                                     onChange={handleChange}
//                                     value={
//                                         formData.embassy_result_date
//                                             ? formData.embassy_result_date
//                                             : ""
//                                     }
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Result</Form.Label>
//                                 <Form.Select
//                                     name="embassy_result"
//                                     onChange={handleChange}
//                                     value={formData.embassy_result || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select result</option>
//                                     <option value="Approved">Approved</option>
//                                     <option value="Rejected">Rejected</option>
//                                     <option value="Pending">Pending</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Feedback</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={3}
//                                     name="embassy_feedback"
//                                     onChange={handleChange}
//                                     value={formData.embassy_feedback || ""}
//                                     placeholder="Enter feedback from the embassy"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Notes</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={2}
//                                     name="embassy_notes"
//                                     onChange={handleChange}
//                                     value={formData.embassy_notes || ""}
//                                     placeholder="Enter any additional notes"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Summary</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={3}
//                                     name="embassy_summary"
//                                     onChange={handleChange}
//                                     value={formData.embassy_summary || ""}
//                                     placeholder="Summary of the embassy interview"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-clipboard-check me-2"></i>Record Results
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     const renderVisaStatusForm = () => (
//         <Card className="border-0 shadow-sm">
//             <Card.Header className="bg-primary text-white py-3">
//                 <h5 className="mb-0">Visa Status</h5>
//             </Card.Header>
//             <Card.Body>
//                 <Form onSubmit={handleSubmit}>
//                     {error && <Alert variant="danger">{error}</Alert>}
//                     {success && <Alert variant="success">{success}</Alert>}

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Status</Form.Label>
//                                 <Form.Select
//                                     name="visa_status"
//                                     onChange={handleChange}
//                                     value={formData.visa_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Approved">Approved</option>
//                                     <option value="Rejected">Rejected</option>
//                                     <option value="Pending">Pending</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Decision Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="decision_date"
//                                     onChange={handleChange}
//                                     value={formData.decision_date ? formData.decision_date : ""}
//                                     className="border-0 border-bottom rounded-0"
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
//                                     <div>
//                                         <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
//                                        Rejection Letter
//                                     </div>
//                                     <Form.Select
//                                         name="visa_sticker_upload_doc_status"
//                                         onChange={handleChange}
//                                         value={formData.visa_sticker_upload ? (formData.visa_sticker_upload_doc_status || "Pending") : ""}
//                                         className="w-50 border-0 border-bottom rounded-0"
//                                         disabled={!formData.visa_sticker_upload || userRole === "student"} // Disable for students or if no file
//                                     >
//                                         <option value="">Select status</option>
//                                         <option value="Pending">Pending</option>
//                                         <option value="Approved">Approved</option>
//                                         <option value="Rejected">Rejected</option>
//                                     </Form.Select>
//                                 </Form.Label>
//                                 <div className="d-flex flex-column">
//                                     <div className="d-flex align-items-center mb-2">
//                                         <Form.Control
//                                             type="file"
//                                             name="visa_sticker_upload"
//                                             onChange={handleFileChange}
//                                             className="border-0 border-bottom rounded-0"
//                                             disabled
//                                         />
//                                         {formData.visa_sticker_upload &&
//                                             typeof formData.visa_sticker_upload === "string" && (
//                                                 <Button
//                                                     variant="outline-primary"
//                                                     size="sm"
//                                                     className="ms-2 rounded-circle"
//                                                     href={formData.visa_sticker_upload}
//                                                     target="_blank"
//                                                 >
//                                                     <i className="bi bi-eye"></i>
//                                                 </Button>
//                                             )}
//                                     </div>
//                                 </div>
//                             </Form.Group>
//                         </Col>
//                         <Col md={6}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Appeal Status</Form.Label>
//                                 <Form.Select
//                                     name="appeal_status"
//                                     onChange={handleChange}
//                                     value={formData.appeal_status || ""}
//                                     className="border-0 border-bottom rounded-0"
//                                 >
//                                     <option value="">Select appeal status</option>
//                                     <option value="Not Required">Not Required</option>
//                                     <option value="Appealed">Appealed</option>
//                                     <option value="Under Review">Under Review</option>
//                                     <option value="Approved">Approved</option>
//                                     <option value="Rejected">Rejected</option>
//                                 </Form.Select>
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <Row>
//                         <Col md={12}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label className="fw-bold">Rejection Reason</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={2}
//                                     name="rejection_reason"
//                                     onChange={handleChange}
//                                     value={formData.rejection_reason || ""}
//                                     placeholder="Enter reason if rejected"
//                                     className="border-0 border-bottom rounded-0"
//                                 />
//                             </Form.Group>
//                         </Col>
//                     </Row>

//                     <div className="d-flex justify-content-end mt-4">
//                         <Button
//                             variant="primary"
//                             type="submit"
//                             className="px-4 py-2 rounded-pill shadow-sm"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Spinner
//                                         as="span"
//                                         animation="border"
//                                         size="sm"
//                                         role="status"
//                                         aria-hidden="true"
//                                     />
//                                     <span className="ms-2">Updating...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="bi bi-passport me-2"></i>Update Visa Status
//                                 </>
//                             )}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card.Body>
//         </Card>
//     );

//     return (
//         <div className="">
//             {renderStepper()}
//             {loading && !formData && (
//                 <div className="text-center py-5">
//                     <Spinner animation="border" variant="primary" />
//                     <p className="mt-2">Loading data...</p>
//                 </div>
//             )}

//             {!loading && (
//                 <>
//                     {activeStep === "application" && renderApplicationSection()}
//                     {activeStep === "interview" && renderInterviewSection()}
//                     {activeStep === "visa" && renderVisaProcessSection()}
//                     {activeStep === "fee" && renderFeePaymentSection()}
//                     {activeStep === "zoom" && renderZoomInterviewForm()}
//                     {activeStep === "conditionalOffer" &&
//                         renderConditionalOfferLetterForm()}
//                     {activeStep === "tuitionFee" && renderTuitionFeePaymentForm()}
//                     {activeStep === "mainofferletter" && renderMainOfferLetterForm()}
//                     {activeStep === "embassydocument" &&
//                         renderEmbassyDocumentPreparationForm()}
//                     {activeStep === "embassyappoint" && renderEmbassyAppointmentForm()}
//                     {activeStep === "embassyinterview" &&
//                         renderEmbassyInterviewResultForm()}
//                     {activeStep === "visaStatus" && renderVisaStatusForm()}
//                 </>
//             )}
//         </div>
//     );
// };

// export default VisaProcesingNew;