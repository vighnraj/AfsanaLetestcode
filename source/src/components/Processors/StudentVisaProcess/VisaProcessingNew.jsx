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

import Swal from "sweetalert2";
import { RiH2 } from "react-icons/ri";
import BASE_URL from "../../../Config";
import api from "../../../services/axiosInterceptor";

const StudentVisaProcessing = () => {
    const [activeStep, setActiveStep] = useState("application");
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [recordId, setRecordId] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [selectedUniversityId, setSelectedUniversityId] = useState(null);
    console.log("Selected University ID:", selectedUniversityId);
    const [studentData, setStudentData] = useState(null);
    const [userRole, setUserRole] = useState(null); // To track user role

    const steps = [
        { key: "application", label: "Registration", icon: "bi-person" },
        { key: "interview", label: "Documents", icon: "bi-file-earmark" },
        { key: "visa", label: "University Application", icon: "bi-building" },
        { key: "fee", label: "Fee Payment", icon: "bi-credit-card" },
        { key: "zoom", label: "Interview", icon: "bi-camera-video" },
        { key: "conditionalOffer", label: "Offer Letter", icon: "bi-file-text" },
        { key: "tuitionFee", label: "Tuition Fee", icon: "bi-cash-stack" },
        { key: "mainofferletter", label: "Final Offer", icon: "bi-file-check" },
        { key: "embassydocument", label: "Embassy Docs", icon: "bi-folder" },
        { key: "embassyappoint", label: "Appointment", icon: "bi-calendar" },
        { key: "embassyinterview", label: "Interview", icon: "bi-mic" },
        { key: "visaStatus", label: "Visa Status", icon: "bi-passport" },
    ];

    // Function to get current Bangladesh Standard Time (BST)
    const getCurrentBSTTime = () => {
        // Create a new Date object
        const now = new Date();
        
        // Get UTC time in milliseconds
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        
        // Bangladesh is UTC+6
        const bstTime = new Date(utcTime + (3600000 * 6));
        
        return bstTime;
    };

    // Format date for datetime-local input
    const formatDateTimeForInput = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Load student data and universities
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const studentId = localStorage.getItem("student_id");
                const role = localStorage.getItem("role"); // Get user role from localStorage
                setUserRole(role); // Set user role in state

                // Get student basic info
                const studentResponse = await api.get(
                    `${BASE_URL}auth/getStudentById/${studentId}`
                );

                const studentData = studentResponse.data;
                setStudentData(studentData);

                // Fetch universities
                const universitiesResponse = await api.get(`${BASE_URL}universities`);
                console.log("Universities fetched:", universitiesResponse.data);
                
                setUniversities(universitiesResponse.data);
                
                // Check if there's a pre-selected university ID from the dashboard
                const preSelectedUniversityId = localStorage.getItem("selected_univercity_id_new");
                if (preSelectedUniversityId) {
                    setSelectedUniversityId(parseInt(preSelectedUniversityId));
                    console.log("Using pre-selected university ID:", preSelectedUniversityId);
                } else if (universitiesResponse.data.length > 0) {
                    setSelectedUniversityId(universitiesResponse.data[0].id); // Default to first university
                    console.log("Defaulting to first university ID:", universitiesResponse.data[0].id);
                }

                // Set initial form data
                setFormData((prev) => ({
                    ...prev,
                    full_name: studentData.full_name || "",
                    email: studentData.email || "",
                    phone: studentData.mobile_number || "",
                    date_of_birth: studentData.date_of_birth
                        ? studentData.date_of_birth.split("T")[0]
                        : "",
                    passport_no: studentData.passport_no || prev.passport_no || "",
                }));
            } catch (err) {
                console.error("Failed to load initial data:", err);
                setError("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Load visa process data when university selection changes
    useEffect(() => {
        const loadVisaProcessForUniversity = async () => {
            if (!selectedUniversityId || !studentData) return;
            
            try {
                setLoading(true);
                const studentId = localStorage.getItem("student_id");
                
                // Clear previous data
                setFormData(prev => ({
                    ...prev,
                    full_name: studentData.full_name || "",
                    email: studentData.email || "",
                    phone: studentData.mobile_number || "",
                    date_of_birth: studentData.date_of_birth
                        ? studentData.date_of_birth.split("T")[0]
                        : "",
                    passport_no: studentData.passport_no || "",
                }));
                setRecordId(null);
                setCompletedSteps([]);
                
                // Check if visa process record exists for the selected university
                console.log(`Fetching visa process for student ${studentId} and university ${selectedUniversityId}`);
                const visaProcessResponse = await api.get(
                    `${BASE_URL}getVisaProcessByStudentId/VisaProcess/${studentId}/${selectedUniversityId}`
                );

                const visaData = visaProcessResponse.data;
                console.log("Visa process data received:", visaData);

                if (visaData && Object.keys(visaData).length > 0) {
                    setRecordId(visaData.id);
                    setFormData(visaData);

                    // Determine completed steps
                    const completed = [];
                    if (visaData.full_name) completed.push("application");
                    if (visaData.passport_doc) completed.push("interview");
                    if (visaData.university_name) completed.push("visa");
                    if (visaData.fee_amount) completed.push("fee");
                    if (visaData.interview_date) completed.push("zoom");
                    if (visaData.conditional_offer_upload)
                        completed.push("conditionalOffer");
                    if (visaData.tuition_fee_amount) completed.push("tuitionFee");
                    if (visaData.main_offer_upload) completed.push("mainofferletter");
                    if (visaData.motivation_letter) completed.push("embassydocument");
                    if (visaData.appointment_location) completed.push("embassyappoint");
                    if (visaData.embassy_result) completed.push("embassyinterview");
                    if (visaData.visa_status) completed.push("visaStatus");

                    setCompletedSteps(completed);
                }
            } catch (err) {
                console.log("No existing visa process record found for this university");
                // Reset form data if no record exists for this university
                setFormData(prev => ({
                    ...prev,
                    full_name: studentData?.full_name || "",
                    email: studentData?.email || "",
                    phone: studentData?.mobile_number || "",
                    date_of_birth: studentData?.date_of_birth
                        ? studentData.date_of_birth.split("T")[0]
                        : "",
                    passport_no: studentData?.passport_no || "",
                }));
                setRecordId(null);
                setCompletedSteps([]);
            } finally {
                setLoading(false);
            }
        };

        loadVisaProcessForUniversity();
    }, [selectedUniversityId, studentData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle status change separately
    const handleStatusChange = async (fieldName, statusValue) => {
        try {
            setLoading(true);

            // Call the status update API
            const response = await api.put(
                `${BASE_URL}VisaProcess/status/${recordId}`,
                {
                    field: fieldName,
                    status: statusValue
                }
            );

            // Update form data with the new status
            setFormData((prev) => ({
                ...prev,
                [fieldName]: statusValue
            }));

            setSuccess("Status updated successfully!");

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            console.error("Status update error:", err);
            setError("Failed to update status");

            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setLoading(false);
        }
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
                university_id: selectedUniversityId, // Add university ID to submission
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
            delete submissionData.conditional_offer_upload_status;
            delete submissionData.main_offer_upload_status;
            delete submissionData.appointment_letter_status;
            delete submissionData.visa_sticker_upload_status;

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
                    {/* Student info */}
                    <div>
                        <h2 className="mb-0">Student Visa Processing</h2>
                        {studentData && (
                            <p className="mb-0 text-muted">
                                Processing for: {studentData.full_name} ({studentData.mobile_number})
                            </p>
                        )}
                    </div>

                    {/* Select */}
                    <Form.Group className="mb-0 w-md-auto">
                        <Form.Select
                            name="university_id"
                            value={selectedUniversityId || ""}
                            onChange={(e) => setSelectedUniversityId(parseInt(e.target.value))}
                        >
                            <option value="">-- Select University For Status Check --</option>
                            {universities.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            <h5 className="text-center mt-3">
                {selectedUniversityId
                    ? universities.find((uni) => uni.id === selectedUniversityId)?.name
                        ? `${universities.find((uni) => uni.id === selectedUniversityId).name} - Visa Processing CRM Workflow`
                        : 'Select University'
                    : 'Select University'}
            </h5>

            <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center overflow-auto py-2">
                    {steps.map((step, index) => {
                        const isActive = activeStep === step.key;
                        const isCompleted = completedSteps.includes(step.key);

                        return (
                            <div
                                className={`text-center position-relative flex-shrink-0`}
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
                                        cursor: "pointer",
                                        border: isActive ? "2px solid #4e73df" : "none",
                                        boxShadow: isActive
                                            ? "0 0 0 4px rgba(78, 115, 223, 0.25)"
                                            : "none",
                                        transition: "all 0.3s ease",
                                    }}
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

    const renderApplicationSection = () => (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
                <h5 className="mb-0">Student Registration Details</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

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
                                            : ""
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
                                            onChange={(e) => handleStatusChange(item.statusName, e.target.value)}
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
                                    value={formData.university_name || ""}
                                    placeholder="Enter university name"
                                    className="border-0 border-bottom rounded-0"
                                    required
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
                                        onChange={(e) => handleStatusChange("proof_submission_doc_status", e.target.value)}
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
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Currency</Form.Label>
                        <div className="input-group">
                            <Form.Select
                                name="fee_currency"
                                onChange={handleChange}
                                value={formData.fee_currency || "€"}
                                className="border-0 border-bottom rounded-0"
                                style={{ maxWidth: "120px" }}
                            >
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                                <option value="৳">BDT (৳)</option>
                            </Form.Select>
                            <Form.Control
                                type="number"
                                name="fee_amount"
                                onChange={handleChange}
                                value={formData.fee_amount || "34.00"}
                                placeholder="Enter amount paid"
                                className="border-0 border-bottom rounded-0"
                                required
                            />
                        </div>
                    </Form.Group>
                </Col>
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
            </Row>

            <Row>
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
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold d-flex justify-content-between align-items-center">
                            <div>
                                <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                Proof of Payment
                            </div>
                            <Form.Select
                                name="proof_fees_payment_doc_status"
                                onChange={(e) => handleStatusChange("proof_fees_payment_doc_status", e.target.value)}
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
            </Row>

            <Row>
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
                            <span className="ms-2">Processing...</span>
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
                                            ? formatDateTimeForInput(new Date(formData.interview_date))
                                            : formatDateTimeForInput(getCurrentBSTTime())
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Time is set to Bangladesh Standard Time (BST)
                                </Form.Text>
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
                                    value={formData.interview_status || ""}
                                    className="border-0 border-bottom rounded-0"
                                    required
                                >
                                    <option value="">Select status</option>
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
                                        onChange={(e) => handleStatusChange("recording_doc_status", e.target.value)}
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
                                    value={formData.interview_result || ""}
                                    className="border-0 border-bottom rounded-0"
                                >
                                    <option value="">Select result</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Pending">Pending</option>
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
                                            ? formData.interview_result_date.split("T")[0]
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
                                        onChange={(e) => handleStatusChange("offer_letter_upload_doc_status", e.target.value)}
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
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Amount</Form.Label>
                                <div className="input-group">
                                    <Form.Select
                                        name="tuition_fee_currency"
                                        onChange={handleChange}
                                        value={formData.tuition_fee_currency || "$"}
                                        className="border-0 border-bottom rounded-0"
                                        style={{ maxWidth: "80px" }}
                                    >
                                        <option value="$">$</option>
                                        <option value="€">€</option>
                                        <option value="Tk">Tk</option>
                                    </Form.Select>
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
                                        name="proof_tuition_fees_payment_doc_status"
                                        onChange={(e) => handleStatusChange("proof_tuition_fees_payment_doc_status", e.target.value)}
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
                                    <span className="ms-2">Processing...</span>
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
                                        onChange={(e) => handleStatusChange("main_offer_upload_doc_status", e.target.value)}
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
            { name: "health_insurance", label: "Health/Travel Insurance", statusName: "health_travel_insurance_doc_status" },
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
                                                onChange={(e) => handleStatusChange(field.statusName, e.target.value)}
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
                                            ? formatDateTimeForInput(new Date(formData.appointment_datetime))
                                            : formatDateTimeForInput(getCurrentBSTTime())
                                    }
                                    className="border-0 border-bottom rounded-0"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Time is set to Bangladesh Standard Time (BST)
                                </Form.Text>
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
                                        onChange={(e) => handleStatusChange("appointment_letter_doc_status", e.target.value)}
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
                                        Visa Sticker Upload
                                    </div>
                                    <Form.Select
                                        name="visa_sticker_upload_doc_status"
                                        onChange={(e) => handleStatusChange("visa_sticker_upload_doc_status", e.target.value)}
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

export default StudentVisaProcessing;