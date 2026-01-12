import React, { useEffect, useState } from "react";
import { Form, Row, Col, Modal, Button, InputGroup } from "react-bootstrap";
import Swal from 'sweetalert2';
import BASE_URL from "../../Config";
import api from "../../services/axiosInterceptor";

const CounselorAddLead = ({ isEditMode = false, editData = null, onClose, onSuccess }) => {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [getData, setData] = useState([]);
  
  // Initialize state with editData if in edit mode
  const [newInquiry, setNewInquiry] = useState(() => {
    if (isEditMode && editData) {
      return {
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "+880",
        city: editData.city || "",
        address: editData.address || "",
        course_name: editData.course_name || "",
        source: editData.source || "Whatsapp",
        inquiryType: editData.inquiryType || "",
        branch: editData.branch || "",
        country: editData.country || "",
        date_of_birth: editData.date_of_birth || "",
        gender: editData.gender || "",
        highestLevel: editData.highestLevel || "",
        education: editData.education || [],
        studyLevel: editData.studyLevel || "",
        studyField: editData.studyField || "",
        intake: editData.intake || "",
        budget: editData.budget || "",
        university: editData.university || "",
        testType: editData.testType || "",
        overallScore: editData.overallScore || "",
        readingScore: editData.readingScore || "",
        writingScore: editData.writingScore || "",
        speakingScore: editData.speakingScore || "",
        listeningScore: editData.listeningScore || "",
        companyName: editData.companyName || "",
        jobTitle: editData.jobTitle || "",
        jobDuration: editData.jobDuration || "",
        studyGap: editData.studyGap || "",
        visaRefused: editData.visaRefused || "",
        refusalReason: editData.refusalReason || "",
        presentAddress: editData.presentAddress || "",
        date_of_inquiry: editData.date_of_inquiry || "",
        additionalNotes: editData.additionalNotes || "",
        consent: true,
        countryCode: editData.countryCode || extractCountryCodeFromPhone(editData.phone || ""),
      };
    }
    
    // Default state for create mode
    return {
      name: "",
      email: "",
      phone: "+880",
      city: "",
      address: "",
      course_name: "",
      source: "Whatsapp",
      inquiryType: "",
      branch: "",
      country: "",
      date_of_birth: "",
      gender: "",
      highestLevel: "",
      education: [],
      studyLevel: "",
      studyField: "",
      intake: "",
      budget: "",
      university: "",
      testType: "",
      overallScore: "",
      readingScore: "",
      writingScore: "",
      speakingScore: "",
      listeningScore: "",
      companyName: "",
      jobTitle: "",
      jobDuration: "",
      studyGap: "",
      visaRefused: "",
      refusalReason: "",
      presentAddress: "",
      date_of_inquiry: "",
      additionalNotes: "",
      consent: true,
      countryCode: "+880",
    };
  });

  // Initialize education levels with editData if in edit mode
  const [educationLevels, setEducationLevels] = useState(() => {
    if (isEditMode && editData && editData.education && editData.education.length > 0) {
      return editData.education;
    }
    return [
      { level: "", institute: "", board: "", year: "", gpa: "" },
      { level: "", institute: "", board: "", year: "", gpa: "" },
      { level: "", institute: "", board: "", year: "", gpa: "" },
      { level: "", institute: "", board: "", year: "", gpa: "" }
    ];
  });

  // Get counselor ID from localStorage
  const [counselorId, setCounselorId] = useState(1);

  useEffect(() => {
    const storedCounselorId = localStorage.getItem('counselor_id');
    if (storedCounselorId) {
      const parsedId = Number(storedCounselorId);
      if (!isNaN(parsedId) && parsedId > 0) {
        setCounselorId(parsedId);
      }
    }
    
    // If in edit mode, populate the form with editData
    if (isEditMode && editData) {
      // Update education levels if editData has education
      if (editData.education && editData.education.length > 0) {
        setEducationLevels(editData.education);
      }
      
      // Set highest level and trigger education level setup
      if (editData.highestLevel) {
        handleHighestLevelChange({ target: { value: editData.highestLevel } }, true);
      }
    }
  }, [isEditMode, editData]);

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

  // Helper function to extract country code from phone
  function extractCountryCodeFromPhone(phone) {
    if (!phone) return "+880";
    if (phone.startsWith("+36")) return "+36";
    if (phone.startsWith("+44")) return "+44";
    if (phone.startsWith("+357")) return "+357";
    if (phone.startsWith("+1")) return "+1";
    if (phone.startsWith("+60")) return "+60";
    if (phone.startsWith("+370")) return "+370";
    if (phone.startsWith("+371")) return "+371";
    if (phone.startsWith("+49")) return "+49";
    if (phone.startsWith("+64")) return "+64";
    if (phone.startsWith("+372")) return "+372";
    if (phone.startsWith("+61")) return "+61";
    if (phone.startsWith("+82")) return "+82";
    if (phone.startsWith("+995")) return "+995";
    if (phone.startsWith("+45")) return "+45";
    if (phone.startsWith("+31")) return "+31";
    if (phone.startsWith("+46")) return "+46";
    if (phone.startsWith("+47")) return "+47";
    if (phone.startsWith("+32")) return "+32";
    if (phone.startsWith("+40")) return "+40";
    if (phone.startsWith("+7")) return "+7";
    if (phone.startsWith("+90")) return "+90";
    if (phone.startsWith("+353")) return "+353";
    if (phone.startsWith("+351")) return "+351";
    return "+880";
  }

  const handleInquiryInputChange = (e) => {
    const { name, value } = e.target;
    setNewInquiry((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // Handle education level change
  const handleEducationLevelChange = (index, field, value) => {
    const updatedLevels = [...educationLevels];
    updatedLevels[index][field] = value;
    setEducationLevels(updatedLevels);
    
    // Update the newInquiry education array
    setNewInquiry(prev => ({
      ...prev,
      education: updatedLevels.filter(level => level.level !== "")
    }));
  };

  // Handle highest level selection
  const handleHighestLevelChange = (e, isInitialSetup = false) => {
    const selectedLevel = e.target.value;
    
    // Reset education levels
    let resetLevels = [
      { level: "", institute: "", board: "", year: "", gpa: "" },
      { level: "", institute: "", board: "", year: "", gpa: "" },
      { level: "", institute: "", board: "", year: "", gpa: "" },
      { level: "", institute: "", board: "", year: "", gpa: "" }
    ];
    
    // If in edit mode and initial setup, preserve existing education data
    if (isInitialSetup && isEditMode && editData && editData.education) {
      editData.education.forEach((edu, index) => {
        if (index < resetLevels.length) {
          resetLevels[index] = { ...edu };
        }
      });
    } else {
      // Set required education levels based on selection for new entries
      if (selectedLevel === "master") {
        resetLevels[0] = { level: "master", institute: "", board: "", year: "", gpa: "" };
        resetLevels[1] = { level: "bachelor", institute: "", board: "", year: "", gpa: "" };
        resetLevels[2] = { level: "hsc", institute: "", board: "", year: "", gpa: "" };
      } else if (selectedLevel === "bachelor") {
        resetLevels[0] = { level: "bachelor", institute: "", board: "", year: "", gpa: "" };
        resetLevels[1] = { level: "hsc", institute: "", board: "", year: "", gpa: "" };
        resetLevels[2] = { level: "ssc", institute: "", board: "", year: "", gpa: "" };
      } else if (selectedLevel === "hsc") {
        resetLevels[0] = { level: "hsc", institute: "", board: "", year: "", gpa: "" };
        resetLevels[1] = { level: "ssc", institute: "", board: "", year: "", gpa: "" };
      } else if (selectedLevel === "ssc") {
        resetLevels[0] = { level: "ssc", institute: "", board: "", year: "", gpa: "" };
      }
    }
    
    setEducationLevels(resetLevels);
    setNewInquiry(prev => ({
      ...prev,
      highestLevel: selectedLevel,
      education: resetLevels.filter(level => level.level !== "")
    }));
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();

    // Validate that all required education levels are filled
    const educationValidation = educationLevels.filter(level => level.level !== "").every(
      level => level.institute && level.board && level.year && level.gpa
    );
    
    if (!educationValidation) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all required education details',
        icon: 'error',
        confirmButtonText: 'Close',
      });
      return;
    }

    // Prepare request data
    const requestData = {
      counselor_id: counselorId,
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
      english_proficiency: newInquiry.englishProficiency || [],
      course_name: newInquiry.course_name,
      study_level: newInquiry.studyLevel,
      study_field: newInquiry.studyField,
      intake: newInquiry.intake,
      budget: newInquiry.budget,
      consent: newInquiry.consent,
      preferred_countries: newInquiry.preferredCountries || [],
      highest_level: newInquiry.highestLevel,
      university: newInquiry.university,
      medium: newInquiry.medium || "",
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
      date_of_inquiry: newInquiry.date_of_inquiry,
      additional_notes: newInquiry.additionalNotes,
      lead_status: "Converted to Lead",
    };

    try {
      let response;
      
      if (isEditMode && editData && editData.id) {
        // Update existing lead
        console.log("Updating lead with ID:", editData.id);
        console.log("Update data:", requestData);
        
        response = await api.patch(`${BASE_URL}inquiries/${editData.id}`, requestData);
        
        if (response.status === 200) {
          Swal.fire({
            title: 'Success!',
            text: 'Lead updated successfully!',
            icon: 'success',
            confirmButtonText: 'Ok',
          }).then(() => {
            if (onSuccess) onSuccess();
            if (onClose) onClose();
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update lead. Please try again.',
            icon: 'error',
            confirmButtonText: 'Close',
          });
        }
      } else {
        // Create new lead
        console.log("Creating new lead...");
        response = await api.post(`${BASE_URL}inquiries`, requestData);
        
        if (response.status === 201 || response.status === 200) {
          const inquiryId = response.data.inquiryId;
          
          if (inquiryId) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const updateData = {
              id: inquiryId,
              lead_status: "Converted to Lead"
            };
            
            const putResponse = await api.patch(`${BASE_URL}fee/update-lesd-status`, updateData);
            
            if (putResponse.status === 200 || putResponse.status === 201) {
              Swal.fire({
                title: 'Success!',
                text: 'Lead created and status updated successfully!',
                icon: 'success',
                confirmButtonText: 'Ok',
              }).then(() => {
                if (onSuccess) onSuccess();
                if (onClose) onClose();
              });
            } else {
              Swal.fire({
                title: 'Partial Success!',
                text: 'Lead created but status update may not have completed.',
                icon: 'warning',
                confirmButtonText: 'Ok',
              }).then(() => {
                if (onSuccess) onSuccess();
                if (onClose) onClose();
              });
            }
          }
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create lead. Please try again.',
            icon: 'error',
            confirmButtonText: 'Close',
          });
        }
      }
    } catch (error) {
      console.error("Error during lead submission:", error);
      
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonText: 'Close',
      });
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmitInquiry}>
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

        {/* Personal Information */}
        <h5 className="mt-4 mb-3">Personal Information</h5>
        <Row className="mb-3">
          <Col md={6}>
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
          <Col md={6}>
            <Form.Group controlId="phone">
              <Form.Label style={{ fontWeight: "bold" }}>Phone Number</Form.Label>
              <InputGroup>
                {/* Country Code Selector */}
                <Form.Select
                  name="countryCode"
                  value={newInquiry.countryCode}
                  onChange={(e) => {
                    const newCountryCode = e.target.value;
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
                  onChange={(e) => {
                    const fullPhone = e.target.value;
                    let countryCode = newInquiry.countryCode;
                    let phoneNumber = fullPhone;
                    
                    if (fullPhone.startsWith(countryCode)) {
                      phoneNumber = fullPhone.substring(countryCode.length);
                    } else {
                      const countryCodes = ["+36", "+44", "+357", "+1", "+60", "+370", "+371", "+49", "+64", "+372", "+61", "+82", "+995", "+45", "+31", "+46", "+47", "+32", "+40", "+7", "+90", "+353", "+351"];
                      let found = false;
                      
                      for (const code of countryCodes) {
                        if (fullPhone.startsWith(code)) {
                          countryCode = code;
                          phoneNumber = fullPhone.substring(code.length);
                          found = true;
                          break;
                        }
                      }
                      
                      if (!found) {
                        countryCode = newInquiry.countryCode;
                        phoneNumber = fullPhone;
                      }
                    }
                    
                    setNewInquiry({
                      ...newInquiry,
                      countryCode: countryCode,
                      phone: countryCode + phoneNumber
                    });
                  }}
                  required
                  style={{ fontSize: "16px" }}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email"
                placeholder="Enter email"
                name="email"
                value={newInquiry.email}
                onChange={handleInquiryInputChange}
                required 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
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
                required 
              />
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
                required 
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="gender">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={newInquiry.gender}
                onChange={handleInquiryInputChange}
                required
              >
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
                value={newInquiry.highestLevel}
                onChange={handleHighestLevelChange}
                required
              >
                <option value="">Select</option>
                <option value="ssc">SSC</option>
                <option value="hsc">HSC</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Education Details */}
        {educationLevels.map((edu, index) => (
          edu.level && (
            <div key={index} className="mb-4 p-3 border rounded">
              <h5 className="mb-3">{edu.level.charAt(0).toUpperCase() + edu.level.slice(1)} Details</h5>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Institute Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter institute name"
                      value={edu.institute}
                      onChange={(e) => handleEducationLevelChange(index, "institute", e.target.value)}
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
                      onChange={(e) => handleEducationLevelChange(index, "board", e.target.value)}
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
                      onChange={(e) => handleEducationLevelChange(index, "year", e.target.value)}
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
                      onChange={(e) => handleEducationLevelChange(index, "gpa", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )
        ))}

        {/* Course & Program Info */}
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

          <Col md={5}>
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
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group controlId="overallScore">
              <Form.Label>Overall Band Score</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 6.5"
                value={newInquiry.overallScore}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, overallScore: e.target.value })
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
                  setNewInquiry({ ...newInquiry, readingScore: e.target.value })
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
                  setNewInquiry({ ...newInquiry, writingScore: e.target.value })
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Group controlId="speakingScore">
              <Form.Label>Speaking Score</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 7.0"
                value={newInquiry.speakingScore}
                onChange={(e) =>
                  setNewInquiry({ ...newInquiry, speakingScore: e.target.value })
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
                  setNewInquiry({ ...newInquiry, listeningScore: e.target.value })
                }
              />
            </Form.Group>
          </Col>
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
                name="date_of_inquiry"
                value={newInquiry.date_of_inquiry}
                onChange={handleInquiryInputChange}
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
          <Button variant="danger" onClick={onClose} className="me-2">
            Cancel
          </Button>
          <Button variant={isEditMode ? "warning" : "secondary"} type="submit">
            {isEditMode ? 'Update Lead' : 'Submit Inquiry'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CounselorAddLead;