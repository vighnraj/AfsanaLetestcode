import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { saveAs } from "file-saver";
import api from "../../services/axiosInterceptor";
import BASE_URL from "../../Config";

// Fixed list of countries
const countryOptions = [
  "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", 
  "Latvia", "Germany", "New Zealand", "Estonia", "Australia", 
  "South Korea", "Georgia", "Denmark", "Netherlands", "Sweden", 
  "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", 
  "USA", "Portugal", "Others"
];

const CounselorStudentDetails = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [travelInsuranceStatus, setTravelInsuranceStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stepStatus, setStepStatus] = useState("");
  const [counselors, setCounselors] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assignType, setAssignType] = useState("counselor");
  const navigate = useNavigate();
  
  // New states for search and country filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  // Fetch data
  const fetchApplications = async () => {
    const processor_id = localStorage.getItem("counselor_id");
    
    try {
      const response = await api.get(`auth/getAssignedStudentsincounserdashboard?counselor_id=${processor_id}`);
      console.log("Api Response:", response.data);
      
      if (response.data && response.data.users) {
        setApplications(response.data.users);
        setFilteredApplications(response.data.users);
      } else {
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
      setFilteredApplications([]);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Format DOB to show only date (dd-mm-yyyy) without time
  const formatDateOnly = (value) => {
    if (!value) return "-";
    try {
      // Extract YYYY-MM-DD if present to avoid timezone shifts
      const match = value.toString().match(/\d{4}-\d{2}-\d{2}/);
      const datePart = match ? match[0] : value.toString().split(" ")[0];
      const [y, m, d] = datePart.split("-");
      if (!y || !m || !d) return value;
      return `${d}-${m}-${y}`;
    } catch (e) {
      return value;
    }
  };
  
  // Unique Universities & Students
  const uniqueUniversities = [
    ...new Set(applications.map((app) => app?.university_name || ""))
  ].filter(Boolean);
  
  const uniqueStudents = [
    ...new Set(applications.map((app) => app?.student_name || ""))
  ].filter(Boolean);

  // Filter Change
  useEffect(() => {
    let filtered = [...applications];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app?.full_name?.toLowerCase().includes(query) ||
        app?.identifying_name?.toLowerCase().includes(query) ||
        app?.mobile_number?.includes(query) ||
        app?.unique_id?.toLowerCase().includes(query)
      );
    }
    
    // University filter
    if (selectedUniversity) {
      filtered = filtered.filter(app => app?.university_name === selectedUniversity);
    }
    
    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(app => app?.country === selectedCountry);
    }
    
    if (selectedStudent) {
      filtered = filtered.filter(app => app?.student_name === selectedStudent);
    }
    
    if (travelInsuranceStatus) {
      filtered = filtered.filter(app => {
        const travelProof = app?.travel_insurance;
        const status = travelProof && !travelProof.includes("null") ? "Complete" : "Pending";
        return status === travelInsuranceStatus;
      });
    }
    
    if (stepStatus === "Application") {
      filtered = filtered.filter(app => app?.Application_stage === "1");
    } else if (stepStatus === "Interview") {
      filtered = filtered.filter(app => app?.Interview === "1");
    } else if (stepStatus === "Visa") {
      filtered = filtered.filter(app => app?.Visa_process === "1");
    }
    
    setFilteredApplications(filtered);
  }, [selectedUniversity, selectedStudent, travelInsuranceStatus, stepStatus, applications, searchQuery, selectedCountry]);

  // Status Badge Color Function
  const getStatusBadge = (value) => {
    const status = value && !value.includes("null") ? "Complete" : "Pending";
    const colorClass = status === "Complete" ? "badge bg-success" : "badge bg-danger";
    return <span className={colorClass}>{status}</span>;
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/application/${id}`);
        await Swal.fire('Deleted!', 'Your application has been deleted.', 'success');
        fetchApplications();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire('Error!', 'Something went wrong.', 'error');
      }
    } else {
      Swal.fire('Cancelled', 'Your application is safe :)', 'info');
    }
  };

  // Calculate indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const handleStatusToggle = async (appId, currentStatus) => {
    try {
      const newStatus = currentStatus === 0 ? 1 : 0;
      await api.patch(`application/${appId}`, { status: newStatus });
      fetchApplications();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await api.get(`${BASE_URL}counselor`);
        setCounselors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch counselors", err);
        setCounselors([]);
      }
    };

    const fetchProcessors = async () => {
      try {
        const res = await api.get(`${BASE_URL}getAllProcessors`);
        setProcessors(res.data || []);
      } catch (err) {
        console.error("Failed to fetch processors", err);
        setProcessors([]);
      }
    };

    fetchCounselors();
    fetchProcessors();
  }, []);
 
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedCounselor(null);
    setSelectedProcessor(null);
  };
  
  return (
    <div className="p-4">
      <h3 className="mb-4">Assign Student Details</h3>
      
      {/* Filters Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, ID, or mobile"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label">University</label>
              <select
                className="form-select"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="">All Universities</option>
                {uniqueUniversities.map((uni, index) => (
                  <option key={index} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Country</label>
              <select
                className="form-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {countryOptions.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="table-responsive-wrapper">
        <div className="table-responsive">
          <table className="table table-bordered freeze-columns-table">
            <thead className="table-light">
              <tr className="text-center">
                <th className="freeze-column freeze-column-1">#</th>
                <th className="freeze-column freeze-column-2">Student Name</th>
                <th className="freeze-column freeze-column-3">Identifying Name</th>
                <th>Mother Name</th>
                <th>University Name</th>
                <th>Father Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Category</th>
                <th>Mobile Number</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((app, index) => (
                  <tr key={app.id}>
                    <td className="freeze-column freeze-column-1">{index + 1}</td>
                    <td 
                      style={{ cursor: "pointer", color: "blue" }} 
                      onClick={() => navigate(`/counselorDetailsTable/${app.id}`)}
                      className="freeze-column freeze-column-2"
                    >
                      {app.full_name}
                    </td>
                    <td className="freeze-column freeze-column-3">{app.identifying_name}</td>
                    <td>{app.mother_name}</td>
                    <td>{app.university_name}</td>
                    <td>{app.father_name}</td>
                    <td>{app.date_of_birth ? formatDateOnly(app.date_of_birth) : ""}</td>
                    <td>{app.gender}</td>
                    <td>{app.category}</td>
                    <td>{app.mobile_number}</td>
                    <td>{app.country || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default CounselorStudentDetails;