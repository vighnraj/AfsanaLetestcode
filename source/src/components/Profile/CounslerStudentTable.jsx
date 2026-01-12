import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../../Config";
import { FaTrash } from "react-icons/fa";
import api from "../../services/axiosInterceptor";
import { hasPermission } from "../../auth/permissionUtils";
import { CiEdit } from "react-icons/ci";
import { Button, Modal, Form, Col } from "react-bootstrap";
import Swal from "sweetalert2";

const CounslerStudentTable = () => {
  const [show, setShow] = useState(false); // State for modal visibility
  const [selectedStudent, setSelectedStudent] = useState(null); // State for selected student
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedCourse, setSelectedCourse] = useState(""); // State for selected class
  const [student, setStudentsData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [counselors, setCounselors] = useState([]); // Counselor list
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sortOption, setSortOption] = useState(""); // Sorting option state
  const [filteredData, setFilteredData] = useState([]); // State for filtered and sorted data

  // Fetch universities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`${BASE_URL}universities`);
        setUniversities(response.data); // Ensure the data is passed correctly
      } catch (error) {
        console.log("Error fetching universities:", error);
      }
    };
    fetchData();
  }, []);

  const user_id = localStorage.getItem("user_id");
  const counselor_id = localStorage.getItem("counselor_id");

  const [formData, setFormData] = useState({
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
    email: ""
  });

  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Fetch students assigned to counselor
  useEffect(() => {
    const fetchStudents = async () => {
      if (!counselor_id) return; // Don't fetch if counselor_id is not available

      try {
        const response = await api.get(`${BASE_URL}auth/students/by-counselor/${counselor_id}`);
        setStudentsData(response.data);
        setFilteredData(response.data); // Initialize filtered data
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [counselor_id]);

  // Fetch counselors
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await api.get(`${BASE_URL}counselor`);
        setCounselors(res.data);
      } catch (err) {
        console.error("Failed to fetch counselors", err);
      }
    };
    fetchCounselors();
  }, []);

  // Handle sorting and filtering
  useEffect(() => {
    let data = [...student];

    // Apply search filter
    if (searchQuery) {
      data = data.filter(item =>
        item?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply university filter
    if (selectedCourse) {
      data = data.filter(item => item?.university_id == selectedCourse);
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
    }

    setFilteredData(data);
  }, [searchQuery, selectedCourse, sortOption, student]);

  const resetForm = () => {
    setIsEditing(false);
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
    setSelectedStudent(null);
    setShow(false);
  };

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

      Swal.fire({
        icon: 'success',
        title: isEditing ? "Student updated" : "Student created",
        showConfirmButton: false,
        timer: 1500
      });

      resetForm();

      // Refresh students list
      if (counselor_id) {
        const response = await api.get(`${BASE_URL}auth/students/by-counselor/${counselor_id}`);
        setStudentsData(response.data);
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: 'Please try again',
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await api.delete(`${BASE_URL}auth/deleteStudent/${id}`);

          if (response.status === 200) {
            setStudentsData(student.filter((item) => item.id !== id));
            Swal.fire(
              'Deleted!',
              'Student has been deleted.',
              'success'
            );
          }
        } catch (error) {
          console.error("Error occurred while deleting the student:", error);
          Swal.fire(
            'Error!',
            'Failed to delete student.',
            'error'
          );
        }
      }
    });
  };

  const handleAssignCounselor = async () => {
    if (!selectedCounselor || !selectedApplication) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select all required fields.',
      });
      return;
    }

    const payload = {
      student_id: selectedApplication.id,
      counselor_id: selectedCounselor.id,
      follow_up: followUpDate,
      notes: notes
    };

    try {
      const res = await api.patch(`${BASE_URL}auth/StudentAssignToCounselor`, payload);

      if (res.status === 200) {
        Swal.fire("Success", "Counselor assigned successfully!", "success");
        setShowAssignModal(false);

        // Refresh students list
        if (counselor_id) {
          const response = await api.get(`${BASE_URL}auth/students/by-counselor/${counselor_id}`);
          setStudentsData(response.data);
        }
      }
    } catch (error) {
      console.error("Assignment error:", error);
      Swal.fire("Error", "Failed to assign counselor.", "error");
    }
  };

  const handleOpenAssignModal = (student) => {
    setSelectedApplication({
      id: student.id,
      student_name: student.full_name,
      university_name: student.university_name
    });
    setSelectedCounselor(null);
    setFollowUpDate("");
    setNotes("");
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedCounselor(null);
  };

  const handleEditStudent = (student) => {
    setFormData({
      ...student,
      user_id: user_id // Keep the current user_id
    });
    setEditStudentId(student.id);
    setIsEditing(true);
    setPhoto(null);
    setDocuments([]);
    setShow(true);
  };

  return (
    <div className="p-4">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h2 className="">All Students</h2>
        </div>

        <div className="d-flex gap-3">
          <div className="col-md-3">
            <select
              className="form-select"
              style={{ height: "38px" }}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All University</option>
              {universities?.map((item) => (
                <option key={item?.id} value={item?.id}>{item?.name}</option>
              ))}
            </select>
          </div>

          <Col md={2}>
            <Form.Select
              style={{ height: "38px" }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Default</option>
              <option value="new-old">New → Old</option>
              <option value="old-new">Old → New</option>
              <option value="a-z">A → Z</option>
              <option value="z-a">Z → A</option>
              <option value="latest">Date → Latest</option>
            </Form.Select>
          </Col>

          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              style={{ height: "38px" }}
              placeholder="Search By Student Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <Link className="nav-link active">
            List View
          </Link>
        </li>
      </ul>

      <div className="table-responsive-wrapper">
        <div className="table-responsive">
          <table className="table table-bordered table-hover freeze-columns-table">
            <thead className="table-light">
              <tr>
                <th className="freeze-column freeze-column-1">#</th>
                <th className="freeze-column freeze-column-2">Student Name</th>
                <th className="freeze-column freeze-column-3">Identifying Name</th>
                <th>Unique ID</th>
                <th>Mother Name</th>
                <th>University Name</th>
                <th>Father Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Category</th>
                <th>Mobile Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((student, index) => (
                <tr key={student.id || index} className="text-nowrap">
                  <td className="freeze-column freeze-column-1">{index + 1}</td>
                  <td className="freeze-column freeze-column-2">
                    <Link
                      to={`/studentProfile/${student?.id}`}
                      className="text-decoration-none text-nowrap"
                    >
                      {student?.full_name}
                    </Link>
                  </td>
                  <td className="freeze-column freeze-column-3">{student?.identifying_name}</td>
                  <td>{student?.unique_id}</td>
                  <td>{student?.mother_name}</td>
                  <td>{student?.university_name}</td>
                  <td>{student?.father_name}</td>
                  <td>{student?.date_of_birth ? new Date(student?.date_of_birth).toLocaleDateString() : ''}</td>
                  <td>{student?.gender}</td>
                  <td>{student?.category}</td>
                  <td>{student?.mobile_number}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditStudent(student)}
                        title="Edit Student"
                      >
                        <CiEdit />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(student?.id)}
                        title="Delete Student"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData?.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center py-3">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Counselor Modal */}
      <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Counselor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <>
              <p><strong>Student:</strong> {selectedApplication.student_name}</p>
              <p><strong>University:</strong> {selectedApplication.university_name}</p>
              <Form.Group className="mb-3">
                <Form.Label>Select Counselor *</Form.Label>
                <Form.Select
                  value={selectedCounselor?.id || ""}
                  onChange={(e) => {
                    const selected = counselors.find(c => c.id.toString() === e.target.value);
                    setSelectedCounselor(selected);
                  }}
                >
                  <option value="">-- Select Counselor --</option>
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAssignModal}>Cancel</Button>
          <Button variant="primary" onClick={handleAssignCounselor}>Assign</Button>
        </Modal.Footer>
      </Modal>

      {/* Student Form Modal */}
      <Modal show={show} onHide={resetForm} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Student Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="studentName" className="form-label">
                  Student Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="studentName"
                  placeholder="Enter student name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="fatherName" className="form-label">
                  Father Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fatherName"
                  placeholder="Enter father name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter student's email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEditing} // Password is required only for new students
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="admissionNo" className="form-label">
                  Admission No
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="admissionNo"
                  placeholder="Enter admission number"
                  value={formData.admission_no}
                  onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="idNo" className="form-label">
                  ID No.
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="idNo"
                  placeholder="Enter ID number"
                  value={formData.id_no}
                  onChange={(e) => setFormData({ ...formData, id_no: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="mobileNumber" className="form-label">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="mobileNumber"
                  placeholder="Enter mobile number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="university" className="form-label">
                  University Name
                </label>
                <select
                  className="form-select"
                  id="university"
                  value={formData.university_id}
                  onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                  required
                >
                  <option value="">Select university</option>
                  {universities?.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="dob" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="dob"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Gender</label>
                <div>
                  {["Male", "Female", "Other"].map((g) => (
                    <div key={g} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        required
                      />
                      <label className="form-check-label">{g}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  className="form-select"
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  rows={3}
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? "Update" : "Submit"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CounslerStudentTable;