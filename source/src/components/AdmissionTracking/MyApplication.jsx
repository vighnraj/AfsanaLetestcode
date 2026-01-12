import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import BASE_URL from "../../Config";

const MyApplication = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [studentid, setStudentId] = useState("");
      
  useEffect(() => {
    const is_id = localStorage.getItem("student_id");
    if (is_id) {
      setStudentId(is_id);
    }
  }, []);

  // Fetch applications when studentid is set
  useEffect(() => {
    if (studentid) {
      fetchApplications();
    }
  }, [studentid]);

  // Fetch data using the new API
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}auth/getVisaProcessBystudentidsss/${studentid}`);
      if (response.data.success) {
        setApplications(response.data.data);
        setFilteredApplications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch applications!',
      });
    }
  };

  // Unique Universities
  const uniqueUniversities = [
    ...new Set(applications.map((app) => app.university_names || app.university_name)),
  ];

  // Filter Change
  useEffect(() => {
    let filtered = [...applications];

    if (selectedUniversity) {
      filtered = filtered.filter(
        (app) => (app.university_names || app.university_name) === selectedUniversity
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((app) => {
        // Determine overall status based on visa processing stages
        const stages = [
          app.registration_visa_processing_stage,
          app.documents_visa_processing_stage,
          app.university_application_visa_processing_stage,
          app.fee_payment_visa_processing_stage,
          app.university_interview_visa_processing_stage,
          app.offer_letter_visa_processing_stage,
          app.tuition_fee_visa_processing_stage,
          app.final_offer_visa_processing_stage,
          app.embassy_docs_visa_processing_stage,
          app.appointment_visa_processing_stage,
          app.visa_approval_visa_processing_stage
        ];
        
        // If all stages are 1, it's approved
        const isApproved = stages.every(stage => stage === 1);
        // If any stage is 0, it's pending
        const isPending = stages.some(stage => stage === 0);
        
        const status = isApproved ? "Approve" : (isPending ? "Pending" : "Rejected");
        return status === selectedStatus;
      });
    }

    setFilteredApplications(filtered);
  }, [selectedUniversity, selectedStatus, applications]);

  // Status Badge Color Function
  const getStatusBadge = (status) => {
    let colorClass;
    if (status === "Approve") {
      colorClass = "badge bg-success";
    } else if (status === "Pending") {
      colorClass = "badge bg-warning";
    } else {
      colorClass = "badge bg-danger";
    }
    return <span className={colorClass}>{status}</span>;
  };

  // Get document status badge
  const getDocumentStatus = (doc, statusField) => {
    if (!doc || doc === "null") {
      return <span className="badge bg-secondary">N/A</span>;
    }
    
    const status = applications[0] && applications[0][statusField] 
      ? applications[0][statusField] 
      : "Pending";
    
    let colorClass;
    if (status === "Approved") {
      colorClass = "badge bg-success";
    } else if (status === "Pending") {
      colorClass = "badge bg-warning";
    } else {
      colorClass = "badge bg-danger";
    }
    
    return <span className={colorClass}>{status}</span>;
  };

  // Get document link
  const getDocumentLink = (doc) => {
    if (!doc || doc === "null") {
      return "N/A";
    }
    return <a href={doc} target="_blank" rel="noopener noreferrer">Download</a>;
  };

  // Calculate overall status for an application
  const getApplicationStatus = (app) => {
    const stages = [
      app.registration_visa_processing_stage,
      app.documents_visa_processing_stage,
      app.university_application_visa_processing_stage,
      app.fee_payment_visa_processing_stage,
      app.university_interview_visa_processing_stage,
      app.offer_letter_visa_processing_stage,
      app.tuition_fee_visa_processing_stage,
      app.final_offer_visa_processing_stage,
      app.embassy_docs_visa_processing_stage,
      app.appointment_visa_processing_stage,
      app.visa_approval_visa_processing_stage
    ];
    
    // If all stages are 1, it's approved
    const isApproved = stages.every(stage => stage === 1);
    // If any stage is 0, it's pending
    const isPending = stages.some(stage => stage === 0);
    
    return isApproved ? "Approve" : (isPending ? "Pending" : "Rejected");
  };

  // Calculate indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  return (
    <div className="p-4">
      <h2 className="mb-4">My Application</h2>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label>University</label>
          <select
            className="form-select"
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}>
            <option value="">All</option>
            {uniqueUniversities.map((uni, index) => (
              <option key={index} value={uni}>
                {uni}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label>Status</label>
          <select className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">All</option>
            <option value="Approve">Approve</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>University Name</th>
              <th>Program</th>
              <th>Intake</th>
              <th>Application Date</th>
              <th>Application Status</th>
              <th>Fee Status</th>
              <th>Interview Status</th>
              <th>Offer Letter Status</th>
              <th>Visa Status</th>
              <th>Passport Doc</th>
              <th>Photo Doc</th>
              <th>SSC Doc</th>
              <th>HSC Doc</th>
              <th>Bachelor Doc</th>
              <th>IELTS Doc</th>
              <th>CV Doc</th>
              <th>SOP Doc</th>
              <th>Medical Doc</th>
              <th>Other Doc</th>
              <th>Overall Status</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {currentItems?.length > 0 ? (
              currentItems?.map((app, index) => (
                <tr key={app.id}>
                  <td>{index + 1}</td>
                  <td>{app.full_name || "N/A"}</td>
                  <td>{app.university_names || app.university_name || "N/A"}</td>
                  <td>{app.program_name || app.applied_program || "N/A"}</td>
                  <td>{app.intake || "N/A"}</td>
                  <td>{app.registration_date ? new Date(app.registration_date).toLocaleDateString() : "N/A"}</td>
                  <td>{app.application_status || "N/A"}</td>
                  <td>{app.fee_status || "N/A"}</td>
                  <td>{app.interview_status || "N/A"}</td>
                  <td>{app.conditional_offer_status || app.main_offer_status || "N/A"}</td>
                  <td>{app.visa_status || "N/A"}</td>
                  <td>
                    {getDocumentLink(app.passport_doc)}
                    <br />
                    {getDocumentStatus(app.passport_doc, "passport_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.photo_doc)}
                    <br />
                    {getDocumentStatus(app.photo_doc, "photo_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.ssc_doc)}
                    <br />
                    {getDocumentStatus(app.ssc_doc, "ssc_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.hsc_doc)}
                    <br />
                    {getDocumentStatus(app.hsc_doc, "hsc_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.bachelor_doc)}
                    <br />
                    {getDocumentStatus(app.bachelor_doc, "bachelor_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.ielts_doc)}
                    <br />
                    {getDocumentStatus(app.ielts_doc, "ielts_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.cv_doc)}
                    <br />
                    {getDocumentStatus(app.cv_doc, "cv_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.sop_doc)}
                    <br />
                    {getDocumentStatus(app.sop_doc, "sop_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.medical_doc)}
                    <br />
                    {getDocumentStatus(app.medical_doc, "medical_doc_status")}
                  </td>
                  <td>
                    {getDocumentLink(app.other_doc)}
                    <br />
                    {getDocumentStatus(app.other_doc, "other_doc_status")}
                  </td>
                  <td>{getStatusBadge(getApplicationStatus(app))}</td>
                  {/* <td>
                    <Link to={`/student/${app.id}`}>
                      <button className="btn btn-primary btn-sm">View</button>
                    </Link>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="23" className="text-center">
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
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default MyApplication;