import React, { useEffect, useState } from "react";
import { Form, Row, Col, Modal, Button, InputGroup } from "react-bootstrap";
import Swal from 'sweetalert2';
import BASE_URL from "../Config";
import api from "../services/axiosInterceptor";

const InquiryForm = () => {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [getData, setData] = useState([]);
  const [phoneError, setPhoneError] = useState(""); // New state for phone error

  const [newInquiry, setNewInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    course: "",
    source: "Whatsapp",
    inquiryType: "",
    priority: "Low",
    branch: "",
    assignee: "",
    country: "",
    dateOfInquiry: "",
    presentAddress: "",
    education: [],
    englishProficiency: [],
    jobExperience: {
      company: "",
      jobTitle: "",
      duration: "",
    },
    preferredCountries: [],
    countryCode: "+880", // Default country code
  });

  const fetchBranchData = async () => {
    try {
      const response = await api.get(`${BASE_URL}branch`);
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBranchData();
  }, []);

  // Function to check if phone number already exists
  const checkDuplicatePhone = async (phoneNumber) => {
    try {
      const response = await api.get(`${BASE_URL}inquiries/check-phone?phone=${encodeURIComponent(phoneNumber)}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking phone number:", error);
      return false;
    }
  };

  const handleCloseInquiryModal = () => {
    setShowInquiryModal(false);
    setPhoneError(""); // Reset phone error when closing modal
    setNewInquiry({
      name: "",
      email: "",
      phone: "",
      city: "",
      address: "",
      course: "",
      source: "Whatsapp",
      inquiryType: "",
      branch: "",
      priority: "Low",
      assignee: "",
      country: "",
      dateOfInquiry: "",
      presentAddress: "",
      education: [],
      englishProficiency: [],
      jobExperience: {
        company: "",
        jobTitle: "",
        duration: "",
      },
      preferredCountries: [],
      countryCode: "+880", // Reset to default country code
    });
  };

  const handleInquiryInputChange = async (e) => {
    const { name, value } = e.target;
    
    // If the phone field is being changed, check for duplicates
    if (name === 'phone') {
      setNewInquiry({
        ...newInquiry,
        [name]: value,
      });
      
      // Only check for duplicates if the phone number is not empty
      if (value.trim() !== '') {
        const isDuplicate = await checkDuplicatePhone(value);
        if (isDuplicate) {
          setPhoneError("This phone number already exists in our system.");
        } else {
          setPhoneError("");
        }
      } else {
        setPhoneError("");
      }
    } else {
      setNewInquiry((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (name, value, checked) => {
    setNewInquiry((prev) => {
      const newArray = checked
        ? [...prev[name], value]
        : prev[name].filter((item) => item !== value);
      return { ...prev, [name]: newArray };
    });
  };

  const handleJobExpChange = (field, value) => {
    setNewInquiry((prev) => ({
      ...prev,
      jobExperience: { ...prev.jobExperience, [field]: value },
    }));
  };

  // Function to handle education level change
  const handleHighestLevelChange = (e) => {
    const selectedLevel = e.target.value;
    
    // Initialize education array based on selected level
    let educationArray = [];
    
    if (selectedLevel === "master") {
      educationArray = [
        { level: "master", institute: "", board: "", year: "", gpa: "" },
        { level: "bachelor", institute: "", board: "", year: "", gpa: "" },
        { level: "hsc", institute: "", board: "", year: "", gpa: "" },
        { level: "ssc", institute: "", board: "", year: "", gpa: "" }
      ];
    } else if (selectedLevel === "bachelor") {
      educationArray = [
        { level: "bachelor", institute: "", board: "", year: "", gpa: "" },
        { level: "hsc", institute: "", board: "", year: "", gpa: "" },
        { level: "ssc", institute: "", board: "", year: "", gpa: "" }
      ];
    } else if (selectedLevel === "hsc") {
      educationArray = [
        { level: "hsc", institute: "", board: "", year: "", gpa: "" },
        { level: "ssc", institute: "", board: "", year: "", gpa: "" }
      ];
    } else if (selectedLevel === "ssc") {
      educationArray = [
        { level: "ssc", institute: "", board: "", year: "", gpa: "" }
      ];
    } else if (selectedLevel === "diploma") {
      educationArray = [
        { level: "diploma", institute: "", board: "", year: "", gpa: "" },
        { level: "hsc", institute: "", board: "", year: "", gpa: "" },
        { level: "ssc", institute: "", board: "", year: "", gpa: "" }
      ];
    }
    
    setNewInquiry({
      ...newInquiry,
      highestLevel: selectedLevel,
      education: educationArray
    });
  };

  // Function to handle education field changes
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...newInquiry.education];
    updatedEducation[index][field] = value;
    
    setNewInquiry({
      ...newInquiry,
      education: updatedEducation
    });
  };

  const handleAddInquiry = async (e) => {
    e.preventDefault();

    // Check if phone number is duplicated before submitting
    if (phoneError) {
      Swal.fire({
        title: "Error!",
        text: "Please resolve the errors before submitting.",
        icon: "error",
        confirmButtonText: "Close",
      });
      return;
    }

    const requestData = {
      counselor_id: 1,
      inquiry_type: newInquiry.inquiryType,
      source: newInquiry.source,
      branch: newInquiry.branch,
      full_name: newInquiry.name,
      phone_number: newInquiry.phone,
      email: newInquiry.email,
      country: newInquiry.country,
      city: newInquiry.city,
      date_of_birth: newInquiry.date_of_birth,
      gender: newInquiry.gender,
      education_background: newInquiry.education,
      english_proficiency: newInquiry.englishProficiency,
      course_name: newInquiry.course_name,
      study_level: newInquiry.studyLevel,
      study_field: newInquiry.studyField,
      intake: newInquiry.intake,
      budget: newInquiry.budget,
      consent: newInquiry.consent,
      preferred_countries: newInquiry.preferredCountries,
      highest_level: newInquiry.highestLevel,
      university: newInquiry.university,
      medium: newInquiry.medium,
      test_type: newInquiry.testType,
      overall_score: newInquiry.overallScore,
      reading_score: newInquiry.readingScore,
      writing_score: newInquiry.writingScore,
      speaking_score: newInquiry.speakingScore,
      listening_score: newInquiry.listeningScore,
      company_name: newInquiry.companyName,
      job_title: newInquiry.jobTitle,
      job_duration: newInquiry.jobDuration,
      study_gap: newInquiry.studyGap,
      visa_refused: newInquiry.visaRefused,
      refusal_reason: newInquiry.refusalReason,
      address: newInquiry.address,
      present_address: newInquiry.presentAddress,
      date_of_inquiry: newInquiry.dateOfInquiry,
      additional_notes: newInquiry.additionalNotes,
      priority: newInquiry.priority,
    };

    try {
      const response = await api.post(`${BASE_URL}inquiries`, requestData);

      if (response.status === 201) {
        Swal.fire({
          title: 'Success!',
          text: 'Inquiry submitted successfully.',
          icon: 'success',
          confirmButtonText: 'Ok',
        }).then(() => {
          handleCloseInquiryModal();
          fetchInquiries();
        });
      } else {
        Swal.fire({
          title: 'Success!',
          text: 'Inquiry added successfully.',
          icon: 'success',
          confirmButtonText: 'Ok',
        }).then(() => {
          handleCloseInquiryModal();
          setCurrentPage(1);
          fetchInquiries();
        });
      }
    } catch (error) {
      console.error("Error during inquiry submission:", error);
      
      // Check if error is due to duplicate phone number
      if (error.response && error.response.status === 400 && 
          error.response.data && error.response.data.message && 
          error.response.data.message.includes("phone number already exists")) {
        setPhoneError("This phone number already exists in our system.");
        Swal.fire({
          title: "Error!",
          text: "This phone number already exists in our system.",
          icon: "error",
          confirmButtonText: "Close",
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonText: 'Close',
        });
      }
    }
  };

  return (
    <div>
      <Form onSubmit={handleAddInquiry}>
        {/* Inquiry Info */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="inquiryType">
              <Form.Label>Inquiry Type</Form.Label>
              <Form.Select
                name="inquiryType"
                value={newInquiry.inquiryType}
                onChange={handleInquiryInputChange}
                required>
                <option value="">Select Inquiry Type</option>
                <option value="student_visa">Student Visa</option>
                <option value="visit_visa">Visit Visa</option>
                <option value="work_visa">Work Visa</option>
                <option value="short_visa">Short Visa</option>
                <option value="german_course">German Course</option>
                <option value="english_course">English Course</option>
                <option value="others">Others</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="source">
              <Form.Label>Source</Form.Label>
              <Form.Select
                name="source"
                value={newInquiry.source}
                onChange={handleInquiryInputChange}
                required>
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
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="branch">
              <Form.Label>Branch</Form.Label>
              <Form.Select
                name="branch"
                value={newInquiry.branch}
                onChange={handleInquiryInputChange}
                required
              >
                <option value="">Select Branch</option>
                {getData.map((item) => (
                  <option key={item.id} value={item.branch_name}>
                    {item.branch_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                name="priority"
                value={newInquiry.priority}
                onChange={(e) => setNewInquiry({ ...newInquiry, priority: e.target.value })}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Personal Information */}
        <h5 className="mt-4 mb-3">Personal Information</h5>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                name="name"
                value={newInquiry.name}
                onChange={handleInquiryInputChange}
                required />
            </Form.Group>
          </Col>
         <Col md={4}>
  <Form.Group controlId="phone">
    <Form.Label style={{ fontWeight: "bold" }}>Phone Number</Form.Label>
    <InputGroup>
      {/* Country Code Selector */}
      <Form.Select
        name="countryCode"
        value={newInquiry.countryCode}
        onChange={(e) => {
          const newCountryCode = e.target.value;
          // Update country code and prepend it to the existing phone number
          setNewInquiry({
            ...newInquiry,
            countryCode: newCountryCode,
            phone: newCountryCode + (newInquiry.phone.replace(newInquiry.countryCode, "") || "")
          });
        }}
        style={{ maxWidth: "110px", fontSize: "16px" }}
      >
        <option value="+880">+880 🇧🇩</option>
        <option value="+36">+36 🇭🇺</option>
        <option value="+44">+44 🇬🇧</option>
        <option value="+357">+357 🇨🇾</option>
        <option value="+1">+1 🇨🇦</option>
        <option value="+60">+60 🇲🇾</option>
        <option value="+370">+370 🇱🇹</option>
        <option value="+371">+371 🇱🇻</option>
        <option value="+49">+49 🇩🇪</option>
        <option value="+64">+64 🇳🇿</option>
        <option value="+372">+372 🇪🇪</option>
        <option value="+61">+61 🇦🇺</option>
        <option value="+82">+82 🇰🇷</option>
        <option value="+995">+995 🇬🇪</option>
        <option value="+45">+45 🇩🇰</option>
        <option value="+31">+31 🇳🇱</option>
        <option value="+46">+46 🇸🇪</option>
        <option value="+47">+47 🇳🇴</option>
        <option value="+32">+32 🇧🇪</option>
        <option value="+40">+40 🇷🇴</option>
        <option value="+7">+7 🇷🇺</option>
        <option value="+90">+90 🇹🇷</option>
        <option value="+353">+353 🇮🇪</option>
        <option value="+1">+1 🇺🇸</option>
        <option value="+351">+351 🇵🇹</option>
        <option value="">🌍 Others</option>
      </Form.Select>

      {/* Combined Phone Input */}
      <Form.Control
        type="tel"
        placeholder="Enter phone number"
        name="phone"
        value={newInquiry.phone}
        onChange={handleInquiryInputChange}
        required
        style={{ fontSize: "16px" }}
        isInvalid={!!phoneError}
      />
      <Form.Control.Feedback type="invalid">
        {phoneError}
      </Form.Control.Feedback>
    </InputGroup>
  </Form.Group>
</Col>
          <Col md={4}>
            <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email"
                placeholder="Enter email"
                name="email"
                value={newInquiry.email}
                onChange={handleInquiryInputChange}
                required />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="country">
              <Form.Label>Interested Country</Form.Label>
              <Form.Select
                name="country"
                value={newInquiry.country}
                onChange={handleInquiryInputChange}
                required
              >
                <option value="">Select Country</option>
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
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city"
                name="city"
                value={newInquiry.city}
                onChange={handleInquiryInputChange}
                required />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="dateOfInquiry">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="date_of_birth"
                value={newInquiry.date_of_birth}
                onChange={handleInquiryInputChange}
                required />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="inquiryType">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={newInquiry.gender}
                onChange={handleInquiryInputChange}
                required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Educational Background */}
        <h4 className="mt-4">Academic Background</h4>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group controlId="highestLevel">
              <Form.Label>Highest Level Completed</Form.Label>
              <Form.Select
                value={newInquiry.highestLevel || ""}
                onChange={handleHighestLevelChange}
                required
              >
                <option value="">Select</option>
                <option value="ssc">SSC</option>
                <option value="hsc">HSC</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Education Details */}
        {newInquiry.highestLevel && newInquiry.education.map((edu, index) => (
          <div key={index} className="mb-4 p-3 border rounded">
            <h5 className="mb-3">
              {edu.level === "ssc" && "SSC (10th) Details"}
              {edu.level === "hsc" && "HSC (12th) Details"}
              {edu.level === "diploma" && "Diploma Details"}
              {edu.level === "bachelor" && "Bachelor's Degree Details"}
              {edu.level === "master" && "Master's Degree Details"}
            </h5>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Institute/School Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter institute name"
                    value={edu.institute}
                    onChange={(e) => handleEducationChange(index, "institute", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Board/University</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter board/university"
                    value={edu.board}
                    onChange={(e) => handleEducationChange(index, "board", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Passing Year</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter passing year"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>GPA/Grade</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter GPA/Grade"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(index, "gpa", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="university">
              <Form.Label>Board/University Name</Form.Label>
              <Form.Control type="text" value={newInquiry.university}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, university: e.target.value })
                } />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="medium">
              <Form.Label>Medium of Instruction</Form.Label>
              <Form.Select
                value={newInquiry.medium}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, medium: e.target.value })
                }
                required>
                <option value="">Select</option>
                <option value="english">English</option>
                <option value="bangla">Bangla</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* English Proficiency */}
        <h5 className="mt-4 mb-3">Course & Program Info</h5>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="course_name">
              <Form.Label>Interested Program/Course Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Course Name"
                value={newInquiry.course_name}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, course_name: e.target.value })
                }
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="study_level">
              <Form.Label>Preferred Study Level</Form.Label>
              <Form.Select
                value={newInquiry.studyLevel}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, studyLevel: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="study_field">
              <Form.Label>Preferred Study Field</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Business, Engineering"
                value={newInquiry.studyField}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, studyField: e.target.value })
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="intake">
              <Form.Label>Preferred Intake</Form.Label>
              <Form.Select
                value={newInquiry.intake}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, intake: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="february">February</option>
                <option value="september">September</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="budget">
              <Form.Label>Initial Budget (1-Year Tuition + Living Cost)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter estimated budget"
                value={newInquiry.budget}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, budget: e.target.value })
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <h5 className="mt-4 mb-3">English Proficiency</h5>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group controlId="testType">
              <Form.Label>Test Type</Form.Label>
              <Form.Select
                value={newInquiry.testType}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, testType: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="ielts">IELTS</option>
                <option value="toefl">TOEFL</option>
                <option value="duolingo">Duolingo</option>
                <option value="no_test">No Test Yet</option>
                <option value="PTE">PTE</option>
                <option value="OtherText">Other Text</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Agar OtherText hai to sirf custom input show kare */}
          {newInquiry.testType === "OtherText" && (
            <Col md={3}>
              <Form.Group controlId="customTestType">
                <Form.Label>Enter Test Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter custom test name"
                  value={newInquiry.customTestType || ""}
                  onChange={(e) =>
                    setNewInquiry({
                      ...newInquiry,
                      customTestType: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          )}

          {/* Agar OtherText nahi hai lekin koi aur option select hai to score inputs show kare */}
          {newInquiry.testType &&
            newInquiry.testType !== "OtherText" && (
              <>
                <Col md={3}>
                  <Form.Group controlId="overallScore">
                    <Form.Label>Overall Band Score</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 6.5"
                      value={newInquiry.overallScore}
                      onChange={(e) =>
                        setNewInquiry({
                          ...newInquiry,
                          overallScore: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="readingScore">
                    <Form.Label>Reading Score</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 6.5"
                      value={newInquiry.readingScore}
                      onChange={(e) =>
                        setNewInquiry({
                          ...newInquiry,
                          readingScore: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="writingScore">
                    <Form.Label>Writing Score</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 6.0"
                      value={newInquiry.writingScore}
                      onChange={(e) =>
                        setNewInquiry({
                          ...newInquiry,
                          writingScore: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group controlId="speakingScore">
                      <Form.Label>Speaking Score</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. 7.0"
                        value={newInquiry.speakingScore}
                        onChange={(e) =>
                          setNewInquiry({
                            ...newInquiry,
                            speakingScore: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group controlId="listeningScore">
                      <Form.Label>Listening Score</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. 6.5"
                        value={newInquiry.listeningScore}
                        onChange={(e) =>
                          setNewInquiry({
                            ...newInquiry,
                            listeningScore: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
        </Row>

        <h5 className="mt-4 mb-3">Work & Visa History</h5>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="companyName">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Company Name"
                value={newInquiry.companyName}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, companyName: e.target.value })
                }
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="jobTitle">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Job Title"
                value={newInquiry.jobTitle}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, jobTitle: e.target.value })
                }
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="jobDuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Jan 2020 - Dec 2022"
                value={newInquiry.jobDuration}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, jobDuration: e.target.value })
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="studyGap">
          <Form.Label>Study Gap (if any)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Explain any study gaps"
            value={newInquiry.studyGap}
            onChange={(e) =>
              setNewInquiry({ ...newInquiry, studyGap: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="visaRefused">
          <Form.Label>Any Previous Visa Refusal?</Form.Label>
          <div>
            <Form.Check
              inline
              label="Yes"
              name="visaRefusal"
              type="radio"
              id="visaYes"
              value="yes"
              checked={newInquiry.visaRefused === "yes"}
              onChange={(e) =>
                setNewInquiry({ ...newInquiry, visaRefused: e.target.value })
              }
            />
            <Form.Check
              inline
              label="No"
              name="visaRefusal"
              type="radio"
              id="visaNo"
              value="no"
              checked={newInquiry.visaRefused === "no"}
              onChange={(e) =>
                setNewInquiry({ ...newInquiry, visaRefused: e.target.value })
              }
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="refusalReason">
          <Form.Label>Visa Refusal Reason (if yes)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter reason if any"
            value={newInquiry.refusalReason}
            onChange={(e) =>
              setNewInquiry({ ...newInquiry, refusalReason: e.target.value })
            }
          />
        </Form.Group>

        <h5 className="mt-4 mb-3">Address</h5>
        <Form.Group className="mb-3" controlId="permanentAddress">
          <Form.Label>Permanent Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Permanent Address"
            value={newInquiry.address}
            onChange={(e) =>
              setNewInquiry({ ...newInquiry, address: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="presentAddress">
          <Form.Label>Present Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Present Address"
            value={newInquiry.presentAddress}
            onChange={(e) =>
              setNewInquiry({ ...newInquiry, presentAddress: e.target.value })
            }
          />
        </Form.Group>

        <h5 className="mt-4 mb-3">Final Details</h5>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="inquiryDate">
              <Form.Label>Date of Inquiry</Form.Label>
              <Form.Control
                type="date"
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, dateOfInquiry: e.target.value })
                }
                name="dateOfInquiry"
                value={newInquiry.dateOfInquiry}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="additionalNotes">
          <Form.Label>Additional Notes (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Any additional comments..."
            value={newInquiry.additionalNotes}
            onChange={(e) =>
              setNewInquiry({ ...newInquiry, additionalNotes: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group controlId="consentCheckbox" className="mb-3">
          <Form.Check
            type="checkbox"
            required
            label="I confirm all information is correct and give permission to Study First Info to contact me."
            checked={newInquiry.consent}
            onChange={(e) =>
              setNewInquiry({ ...newInquiry, consent: e.target.checked })
            }
          />
        </Form.Group>

        <div className="d-flex justify-content-end mt-4">
          <Button variant="danger" onClick={handleCloseInquiryModal} className="me-2">
            Cancel
          </Button>
          <Button variant="secondary" type="submit">
            Submit Inquiry
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InquiryForm;