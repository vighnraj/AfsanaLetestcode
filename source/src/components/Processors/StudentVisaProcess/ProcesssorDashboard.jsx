import React, { useEffect, useState } from "react";
import { Card, Table, Button, Container, Row, Col, Form, Spinner, Alert, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axiosInterceptor";
import BASE_URL from "../../../Config";
import StudentVisaProcessing from "./VisaProcessingNew";

// Country options
const countryOptions = [
  "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", "Latvia", 
  "Germany", "New Zealand", "Estonia", "Australia", "South Korea", "Georgia", 
  "Denmark", "Netherlands", "Sweden", "Norway", "Belgium", "Romania", "Russia", 
  "Turkey", "Ireland", "USA", "Portugal", "Others"
];

const ProcessorDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [universityFilter, setUniversityFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState(""); // New state for country filter
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Fetch all applications for the processor
    const fetchAllApplications = async () => {
        const processor_id = localStorage.getItem("user_id");
        
        try {
            const response = await api.get(
                `${BASE_URL}getvisaprocessbyprocessorid/VisaProcess/${processor_id}`
            );
            console.log("Api Response:", response.data);

            // Agar API array return kare
            if (Array.isArray(response.data)) {
                setApplications(response.data);
                setFilteredApplications(response.data);
            }
            // Agar API single object return kare
            else if (response.data && typeof response.data === "object") {
                setApplications([response.data]);
                setFilteredApplications([response.data]);
            } else {
                setApplications([]);
                setFilteredApplications([]);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            setError("Failed to fetch student data");
            setApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch applications by stage
    const fetchApplicationsByStage = async (stage) => {
        const processor_id = localStorage.getItem("user_id");
        
        try {
            let url = `${BASE_URL}getvisaprocessbyprocessorid/VisaProcess/${processor_id}`;
            
            // Add stage filter if provided
            if (stage) {
                url += `?${stage}_visa_processing_stage=1`;
            }

            const response = await api.get(url);
            console.log("Filtered Api Response:", response.data);

            // Agar API array return kare
            if (Array.isArray(response.data)) {
                setApplications(response.data);
                setFilteredApplications(response.data);
            }
            // Agar API single object return kare
            else if (response.data && typeof response.data === "object") {
                setApplications([response.data]);
                setFilteredApplications([response.data]);
            } else {
                setApplications([]);
                setFilteredApplications([]);
            }
        } catch (error) {
            console.error("Error fetching filtered applications:", error);
            setError("No data Found");
            setApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllApplications();
    }, []);

    // Handle stage filter change
    useEffect(() => {
        if (stageFilter) {
            setLoading(true);
            fetchApplicationsByStage(stageFilter);
        } else {
            setLoading(true);
            fetchAllApplications();
        }
    }, [stageFilter]);

    // Get unique universities for filter dropdown
    const uniqueUniversities = [
        ...new Set(applications.map(app => app.university_name).filter(Boolean))
    ];

    // Filter applications based on search term, date, stage, university, and country
    useEffect(() => {
        let filtered = applications;

        if (searchTerm !== "") {
            filtered = filtered.filter(
                (app) =>
                    (app.full_name && app.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (app.phone && app.phone.includes(searchTerm)) ||
                    (app.identifying_name && app.identifying_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (typeof app.university_id === "string" && app.university_id.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (dateFilter !== "") {
            filtered = filtered.filter(
                (app) =>
                    app.created_at &&
                    new Date(app.created_at).toISOString().slice(0, 10) === dateFilter
            );
        }

        if (universityFilter !== "") {
            filtered = filtered.filter(
                (app) =>
                    app.university_name === universityFilter
            );
        }

        if (countryFilter !== "") {
            filtered = filtered.filter(
                (app) =>
                    app.country === countryFilter
            );
        }

        setFilteredApplications(filtered);
        setCurrentPage(1); // Reset to first page when searching/filtering
    }, [searchTerm, dateFilter, universityFilter, countryFilter, applications]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredApplications.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Generate pagination items
    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5; // Number of page numbers to show
        
        // Always show first page
        items.push(
            <Pagination.Item 
                key={1} 
                active={currentPage === 1}
                onClick={() => paginate(1)}
            >
                1
            </Pagination.Item>
        );

        // Show ellipsis if needed
        if (currentPage > maxVisiblePages - 1) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }

        // Calculate start and end of page numbers to show
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Adjust if we're near the beginning
        if (currentPage <= maxVisiblePages - 1) {
            startPage = 2;
            endPage = Math.min(totalPages - 1, maxVisiblePages);
        }

        // Adjust if we're near the end
        if (currentPage > totalPages - (maxVisiblePages - 1)) {
            startPage = Math.max(2, totalPages - (maxVisiblePages - 1));
            endPage = totalPages - 1;
        }

        // Add page numbers
        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item 
                    key={number} 
                    active={number === currentPage}
                    onClick={() => paginate(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        // Show ellipsis if needed
        if (endPage < totalPages - 1) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }

        // Always show last page if there's more than 1 page
        if (totalPages > 1) {
            items.push(
                <Pagination.Item 
                    key={totalPages} 
                    active={currentPage === totalPages}
                    onClick={() => paginate(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    const handleStudentSelect = (student) => {
        localStorage.setItem("selected_univercity_id_new", student.university_id);
        setSelectedStudent(student);
    };

    const handleBackToList = () => {
        setSelectedStudent(null);
    };

    if (selectedStudent) {
        // Store the selected student ID in localStorage for the StudentVisaProcessing component
        localStorage.setItem("student_id", selectedStudent?.student_id);

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2></h2>
                    <Button variant="outline-primary" onClick={handleBackToList}>
                        <i className="bi bi-arrow-left me-2"></i>Back to Student List
                    </Button>
                </div>
                <StudentVisaProcessing />
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header className=" text-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Student Applications</h4>
                                {/* <Button variant="outline-light" onClick={fetchAllApplications}>
                                    <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                                </Button> */}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="success">{error}</Alert>}

                            <Row className="mb-3">
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name, mobile, ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Control
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            placeholder="Filter by Created Date"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <select
                                        className="form-select"
                                        value={universityFilter}
                                        onChange={(e) => setUniversityFilter(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    >
                                        <option value="">All Universities</option>
                                        {uniqueUniversities.map((university, index) => (
                                            <option key={index} value={university}>{university}</option>
                                        ))}
                                    </select>
                                </Col>
                                <Col md={2}>
                                    <select
                                        className="form-select"
                                        value={countryFilter}
                                        onChange={(e) => setCountryFilter(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    >
                                        <option value="">All Countries</option>
                                        {countryOptions.map((country, index) => (
                                            <option key={index} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </Col>
                                <Col md={2}>
                                    <select
                                        className="form-select"
                                        value={stageFilter}
                                        onChange={(e) => setStageFilter(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    >
                                        <option value="">All Stages</option>
                                        <option value="registration">Registration</option>
                                        <option value="documents">Document</option>
                                        <option value="university_application">University Application</option>
                                        <option value="fee_payment">Fee Payment</option>
                                        <option value="university_interview">University Interview</option>
                                        <option value="offer_letter">Offer Letter</option>
                                        <option value="tuition_fee">Tuition Fee</option>
                                        <option value="final_offer">Final Offer</option>
                                        <option value="embassy_docs">Embassy Document</option>
                                        <option value="appointment">Appointment</option>
                                        <option value="visa_approval">Visa Approval</option>
                                        <option value="visa_rejection">Visa Rejection</option>
                                    </select>
                                </Col>
                              
                            </Row>

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Loading student data...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr className="text-center">
                                                    <th className="freeze-column freeze-column-1">#</th>
                                                    <th className="freeze-column freeze-column-2">Student Name</th>
                                                    <th className="freeze-column freeze-column-3">Mobile Number</th>
                                                    <th>Email</th>
                                                    <th>University Name</th>
                                                    <th>Country</th>
                                                    <th>Program Name</th>
                                                    <th>Date of Birth</th>
                                                    <th>Created Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.length > 0 ? (
                                                    currentItems.map((app, index) => (
                                                        <tr key={app.id}>
                                                            <td className="freeze-column freeze-column-1">{indexOfFirstItem + index + 1}</td>
                                                            <td className="freeze-column freeze-column-2">{app.full_name}</td>
                                                            <td className="freeze-column freeze-column-3">{app.phone}</td>
                                                            <td>{app.email}</td>
                                                            <td>{app.university_name}</td>
                                                            <td>{app.country || "N/A"}</td>
                                                            <td>{app.program_name}</td>
                                                            <td>
                                                                {app.date_of_birth
                                                                    ? new Date(app.date_of_birth).toLocaleDateString("en-GB")
                                                                    : "N/A"}
                                                            </td>
                                                            <td>
                                                                {app.created_at
                                                                    ? new Date(app.created_at).toLocaleDateString("en-GB")
                                                                    : "N/A"}
                                                            </td>
                                                            <td className="text-center">
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => handleStudentSelect(app)}
                                                                >
                                                                    Process Visa
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center">
                                                            No applications found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-4">
                                            <Pagination>
                                                <Pagination.First 
                                                    onClick={() => paginate(1)}
                                                    disabled={currentPage === 1}
                                                />
                                                <Pagination.Prev 
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                />
                                                
                                                {getPaginationItems()}
                                                
                                                <Pagination.Next 
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                />
                                                <Pagination.Last 
                                                    onClick={() => paginate(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                />
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProcessorDashboard;