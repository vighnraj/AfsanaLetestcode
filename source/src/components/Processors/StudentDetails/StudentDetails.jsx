import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { saveAs } from "file-saver";
import api from "../../../services/axiosInterceptor";
import BASE_URL from "../../../Config";

// Fixed list of countries
const countryOptions = [
  "Hungary", "UK", "Cyprus", "Canada", "Malaysia", "Lithuania", 
  "Latvia", "Germany", "New Zealand", "Estonia", "Australia", 
  "South Korea", "Georgia", "Denmark", "Netherlands", "Sweden", 
  "Norway", "Belgium", "Romania", "Russia", "Turkey", "Ireland", 
  "USA", "Portugal", "Others"
];   

const ProcessorStudentDetails = () => {
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

  // Helper function to format date
  // Helper function to format date/time to 'YYYY-MM-DD HH:MM:SS'
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Fetch data
  const fetchApplications = async () => {
    const processor_id = localStorage.getItem("user_id");

    try {
      const response = await api.get(
        `auth/getAssignedStudentsinProcessordashboard?processor_id=${processor_id}`
      );
      console.log("Api Response:", response.data);

      if (response.data) {
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

  // Unique Universities & Students
  const uniqueUniversities = [
    ...new Set(applications.map((app) => app?.university_name || "")),
  ].filter(Boolean);

  const uniqueStudents = [
    ...new Set(applications.map((app) => app?.student_name || "")),
  ].filter(Boolean);

  // Filter Change
  useEffect(() => {
    let filtered = [...applications];

    // Search filter - now includes email and university name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app?.full_name?.toLowerCase().includes(query) ||
        app?.student_email?.toLowerCase().includes(query) ||
        app?.university_name?.toLowerCase().includes(query) ||
        app?.identifying_name?.toLowerCase().includes(query) ||
        app?.mobile_number?.includes(query) ||
        app?.unique_id?.toLowerCase().includes(query)
      );
    }
    
    // University filter
    if (selectedUniversity) {
      filtered = filtered.filter(
        (app) => app?.university_name === selectedUniversity
      );
    }
    
    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(
        (app) => app?.country === selectedCountry
      );
    }

    if (selectedStudent) {
      filtered = filtered.filter(
        (app) => app?.student_name === selectedStudent
      );
    }

    if (travelInsuranceStatus) {
      filtered = filtered.filter((app) => {
        const travelProof = app?.travel_insurance;
        const status =
          travelProof && !travelProof.includes("null") ? "Complete" : "Pending";
        return status === travelInsuranceStatus;
      });
    }

    if (stepStatus === "Application") {
      filtered = filtered.filter((app) => app?.Application_stage === "1");
    } else if (stepStatus === "Interview") {
      filtered = filtered.filter((app) => app?.Interview === "1");
    } else if (stepStatus === "Visa") {
      filtered = filtered.filter((app) => app?.Visa_process === "1");
    }

    setFilteredApplications(filtered);
  }, [
    selectedUniversity,
    selectedStudent,
    travelInsuranceStatus,
    stepStatus,
    applications,
    searchQuery,
    selectedCountry
  ]);

  // Status Badge Color Function
  const getStatusBadge = (value) => {
    const status = value && !value.includes("null") ? "Complete" : "Pending";
    const colorClass =
      status === "Complete" ? "badge bg-success" : "badge bg-danger";
    return <span className={colorClass}>{status}</span>;
  };

  const HandleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/application/${id}`);
        await Swal.fire(
          "Deleted!",
          "Your application has been deleted.",
          "success"
        );
        fetchApplications();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    } else {
      Swal.fire("Cancelled", "Your application is safe :)", "info");
    }
  };

  // Calculate indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
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
                placeholder="Search by name, email, university, ID, or mobile"
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
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr className="text-center">
              <th className="freeze-column freeze-column-1">#</th>
              <th className="freeze-column freeze-column-2">Student Name</th>
              <th className="freeze-column freeze-column-3">Student Email</th>
              <th className="freeze-column freeze-column-4">University Name</th>
              <th className="freeze-column freeze-column-5">Mobile Number</th>
              <th>Identifying Name</th>
              <th>Mother Name</th>
              <th>Country</th>
              <th>Father Name</th>
              <th>Date of Birth</th>
              <th>Gender </th>
              <th>Category </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems?.map((app, index) => (
                <tr key={app.id}>
                  <td className="freeze-column freeze-column-1">{index + 1}</td>
                  <td className="freeze-column freeze-column-2"
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => navigate(`/processorDetailsTable/${app.id}`)}
                  >
                    {app.full_name}
                  </td>
                  <td className="freeze-column freeze-column-3">{app.student_email || "-"}</td>
                  <td className="freeze-column freeze-column-4">{app.university_name || "-"}</td>
                  <td className="freeze-column freeze-column-5">{app.mobile_number}</td>
                  <td>{app.identifying_name}</td>
                  <td>{app.mother_name}</td>
                  <td>{app.country || "-"}</td>
                  <td>{app.father_name}</td>
                  <td>{formatDate(app.date_of_birth)}</td>
                  <td>{app.gender}</td>
                  <td>{app.category}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="text-center">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
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

export default ProcessorStudentDetails;