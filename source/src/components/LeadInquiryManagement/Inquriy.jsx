import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Form,
  Badge,
  Modal,
  Pagination,
  Row,
  Col,
  Dropdown,
  DropdownButton,
  InputGroup,
} from "react-bootstrap";

import {
  BsEnvelope,
  BsTelephone,
  BsPencil // Added edit icon
} from "react-icons/bs";
import BASE_URL from "../../Config";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import TodaysInqiury from "./TodaysInqiury";
import Followup from "./Followup";
import { MdDelete } from "react-icons/md";
import api from "../../services/axiosInterceptor";
import { hasPermission } from "../../auth/permissionUtils";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import axios from "axios";

const Inquiry = ({ inq }) => {
  // Added refs for table and fake scrollbar
  const tableContainerRef = useRef(null);
  const fakeScrollbarRef = useRef(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFakeScrollbar, setShowFakeScrollbar] = useState(false);
  // State for modals
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showInquiryDetailsModal, setInquiryDetailsModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [BranchOptions, setBranchOptions] = useState([]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInquiries, setSelectedInquiries] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [counselors, setCounselors] = useState([]); // Counselor list
  const [inquiries, setInquiries] = useState([]); // Inquiries data
  const role = localStorage.getItem("role");
  const [bulkAction, setBulkAction] = useState("");
  const [userBranch, setUserBranch] = useState(""); // Added to store user's branch
  const [staffData, setStaffData] = useState(null); // Store staff data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState(""); // New state for phone error
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're editing
  const [editingInquiryId, setEditingInquiryId] = useState(null); // ID of inquiry being edited

  // State for new inquiry form data
  const [newInquiry, setNewInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    course: "Maths",
    source: "Whatsapp",
    inquiryType: "",
    priority: "Low",
    gender: "",
    branch: "",
    country: "",
    date_of_birth: "",
    preferredCountries: [],
    course_name: "",
    studyLevel: "",
    studyField: "",
    intake: "",
    budget: "",
    consent: false,
    highestLevel: "",
    education: [], // This will store all education levels
    testType: "",
    test_name: "",
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
    address: "",
    presentAddress: "",
    date_of_inquiry: new Date().toISOString().split("T")[0],
    additionalNotes: "",
    medium: "",
    university: "",
  });

  const [councolerid, setCouncolerId] = useState("");

  const user_id = localStorage.getItem("user_id");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [getData, setData] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    source: "",
    startDate: "",
    endDate: "",
    Branch: "",
    inquiryType: "",
    status: "",
    priority: "",
    sortBy: "",
    country: "",
    counselor: "",
  });

  useEffect(() => {
    const savedFilters = sessionStorage.getItem('inquiryFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsedFilters }));
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, []);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      sessionStorage.setItem('inquiryFilters', JSON.stringify(filters));
    }
  }, [filters]);

  // Modify the handleResetFilters function
  const handleResetFilters = () => {
    setFilters({
      search: "",
      branch: "",
      source: "",
      startDate: "",
      endDate: "",
      country: "",
      counselor: "",
      inquiryType: "",
      status: "",
      sortBy: "",
      Branch: role === "admin" ? "" : userBranch || "",
    });
    // Clear the saved filters from sessionStorage
    sessionStorage.removeItem('inquiryFilters');
  };

  const [Branchfilters, BranchsetFilters] = useState({
    farhabn: "",
    newfarhan: "",
  });

  const [filteredData, setFilteredData] = useState([]);

  // Function to fetch staff data by ID
  const fetchStaffById = async () => {
    try {
      const response = await api.get(`${BASE_URL}getStaffById/${user_id}`);
      if (response.status === 200 && response.data?.length > 0) {
        const staff = response.data[0];
        const branch = staff.branch || null;
        const created_at = staff.created_at
          ? new Date(staff.created_at).toISOString().split("T")[0]
          : null;
        return { branch, created_at };
      } else {
        console.error("Unexpected response status:", response.status);
        return { branch: null, created_at: null };
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
      if (error.response && error.response.status === 404) {
        console.error("Staff not found with ID:", user_id);
        setError("Staff data not found. Using default settings.");
      }
      return { branch: null, created_at: null };
    }
  };

  // Function to fetch inquiries based on branch availability
  const fetchInquiries = async () => {
    try {
      let response;
      const { branch, created_at } = await fetchStaffById();

      if (branch) {
        console.log(`Fetching inquiries for branch: ${branch} on ${created_at}`);
        response = await api.get(
          `${BASE_URL}inquiries?branch=${branch}&created_at=${created_at}`
        );
      } else {
        console.log("Branch not found. Fetching all inquiries.");
        response = await api.get(`${BASE_URL}inquiries`);
      }

      if (response.data && Array.isArray(response.data)) {
        setInquiries(response.data);

        // Extract unique countries
        const uniqueCountries = [
          ...new Set(
            response.data
              .map((inq) => inq.country)
              .filter((country) => country && country.trim() !== "")
          ),
        ];
        setCountryOptions(uniqueCountries);

        console.log(`Fetched ${response.data.length} inquiries`);
      } else {
        console.error("Invalid response data:", response.data);
        setInquiries([]);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to fetch inquiries. Please try again.");
      setInquiries([]);
    }
  };

  // Initialize component - fetch staff data and then inquiries
  useEffect(() => {
    const initializeComponent = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          setError("User ID not found. Please login again.");
          setLoading(false);
          return;
        }

        setCouncolerId(userId);

        // Fetch staff data
        const staffInfo = await fetchStaffById(userId);

        if (staffInfo) {
          console.log("Staff info fetched:", staffInfo);
          setStaffData(staffInfo);

          // Set user branch from staff data
          if (staffInfo.branch) {
            const branch = staffInfo.branch;
            console.log("Setting user branch to:", branch);
            setUserBranch(branch);

            // For staff, set the branch filter to staff's branch
            // For admin, don't set any branch filter by default
            if (role !== "admin") {
              setFilters((prev) => ({ ...prev, Branch: branch }));
            }
          } else {
            // Handle case when branch is not set in staff data
            console.warn("Branch not set for staff, using default 'Sylhet'");
            setUserBranch("Sylhet");
            if (role !== "admin") {
              setFilters((prev) => ({ ...prev, Branch: "Sylhet" }));
            }
          }
        } else {
          // Handle case when staff data is not found
          setError("Staff data not found. Using default settings.");
          setUserBranch("Sylhet");
          if (role !== "admin") {
            setFilters((prev) => ({ ...prev, Branch: "Sylhet" }));
          }
        }

        // Fetch inquiries based on role
        await fetchInquiries();
      } catch (err) {
        console.error("Error in initializeComponent:", err);
        setError("Failed to initialize component. Using default settings.");
        setUserBranch("Sylhet");
        if (role !== "admin") {
          setFilters((prev) => ({ ...prev, Branch: "Sylhet" }));
        }
        await fetchInquiries();
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [role]);

  // State for new follow-up form data
  const [newFollowUp, setNewFollowUp] = useState({
    name: "",
    title: "",
    followUpDate: new Date().toISOString().split("T")[0],
    status: "New",
    urgency: "WhatsApp",
    department: "",
    responsible: "👤",
  });

  // CSV Headers for export
  const csvHeaders = [
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone_number" },
    { label: "Source", key: "source" },
    { label: "Branch", key: "branch" },
    { label: "Inquiry Type", key: "inquiry_type" },
    { label: "Date", key: "date_of_inquiry" },
    { label: "Priority", key: "priority" },
    { label: "Country", key: "country" },
    { label: "Counselor", key: "counselor_name" },
    { label: "Status", key: "lead_status" },
  ];

  // Excel Export
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "inquiries.xlsx");
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inquiries Report", 14, 15);
    const tableColumn = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Source",
      "Branch",
      "Inquiry Type",
      "Date",
      "Country",
      "Status",
    ];
    const tableRows = [];
    filteredData.forEach((inq, index) => {
      const rowData = [
        index + 1,
        inq.full_name,
        inq.email,
        inq.phone_number,
        inq.source,
        inq.branch,
        inq.inquiry_type,
        new Date(inq.date_of_inquiry).toISOString().split("T")[0],
        inq.country,
        inq.lead_status,
      ];
      tableRows.push(rowData);
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });
    doc.save("inquiries.pdf");
  };

  // Fetch all branches
  const fetchBranchData = async () => {
    try {
      const response = await api.get(`${BASE_URL}branch`);
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Call on component mount
  useEffect(() => {
    fetchBranchData();
  }, []);

  // Check if we need to show the fake scrollbar
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (tableContainerRef.current) {
        const hasHorizontalScroll =
          tableContainerRef.current.scrollWidth >
          tableContainerRef.current.clientWidth;
        setShowFakeScrollbar(hasHorizontalScroll);
      }
    };

    // Initial check
    checkScrollNeeded();

    // Check on window resize
    window.addEventListener("resize", checkScrollNeeded);

    // Cleanup
    return () => window.removeEventListener("resize", checkScrollNeeded);
  }, [filteredData]);

  // Sync scroll between table and fake scrollbar
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const fakeScrollbar = fakeScrollbarRef.current;

    if (!tableContainer || !fakeScrollbar) return;

    const handleTableScroll = () => {
      if (fakeScrollbar) {
        fakeScrollbar.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const handleFakeScrollbarScroll = () => {
      if (tableContainer) {
        tableContainer.scrollLeft = fakeScrollbar.scrollLeft;
      }
    };

    tableContainer.addEventListener("scroll", handleTableScroll);
    fakeScrollbar.addEventListener("scroll", handleFakeScrollbarScroll);

    // Cleanup
    return () => {
      tableContainer.removeEventListener("scroll", handleTableScroll);
      fakeScrollbar.removeEventListener("scroll", handleFakeScrollbarScroll);
    };
  }, [showFakeScrollbar]);

  // Modal handlers
  const handleShowInquiryModal = () => {
    setIsEditMode(false);
    setEditingInquiryId(null);
    setShowInquiryModal(true);
    setPhoneError(""); // Reset phone error when opening modal
  };

  const handleCloseInquiryModal = () => {
    setShowInquiryModal(false);
    setIsEditMode(false);
    setEditingInquiryId(null);
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
      assignee: "",
      country: "",
      dateOfInquiry: "",
      presentAddress: "",
      education: [],
      englishProficiency: [],
      test_name: "",
      jobExperience: {
        company: "",
        jobTitle: "",
        duration: "",
      },
      preferredCountries: [],
      countryCode: "",
      date_of_birth: "",
      gender: "",
      course_name: "",
      studyLevel: "",
      studyField: "",
      intake: "",
      budget: "",
      consent: false,
      highestLevel: "",
      medium: "",
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
      date_of_inquiry: new Date().toISOString().split("T")[0],
      additionalNotes: "",
      priority: "Low",
    });
  };

  // Function to check if phone number already exists (for edit mode, exclude current inquiry)
  const checkDuplicatePhone = async (phoneNumber, excludeId = null) => {
    try {
      const response = await api.get(`${BASE_URL}inquiries/check-phone?phone=${encodeURIComponent(phoneNumber)}`);
      const data = response.data;
      
      // If checking for edit mode and we have an excludeId
      if (excludeId && data.exists) {
        // Check if the duplicate is the same inquiry (self-check)
        return data.inquiryId !== excludeId;
      }
      
      return data.exists;
    } catch (error) {
      console.error("Error checking phone number:", error);
      return false;
    }
  };

  // Handle input changes for new inquiry
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
        const isDuplicate = await checkDuplicatePhone(value, isEditMode ? editingInquiryId : null);
        if (isDuplicate) {
          setPhoneError("This phone number already exists in our system.");
        } else {
          setPhoneError("");
        }
      } else {
        setPhoneError("");
      }
    } else {
      setNewInquiry({
        ...newInquiry,
        [name]: value,
      });
    }
  };

  // Handle checkbox changes for arrays
  const handleCheckboxChange = (field, value, isChecked) => {
    setNewInquiry((prev) => {
      const newArray = isChecked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value);
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  // Handle job experience changes
  const handleJobExpChange = (field, value) => {
    setNewInquiry({
      ...newInquiry,
      jobExperience: {
        ...newInquiry.jobExperience,
        [field]: value,
      },
    });
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

  // Fetch inquiries when branch filter changes (only for admin)
  useEffect(() => {
    if (filters.Branch) {
      console.log("Branch filter changed to:", filters.Branch);
      const userRole = localStorage.getItem("role");

      if (userRole === "admin") {
        // For admin, fetch inquiries for the selected branch
        const fetchInquiriesByBranch = async (branch) => {
          try {
            console.log("Fetching inquiries for branch:", branch);
            const response = await api.get(
              `${BASE_URL}inquiries?branch=${encodeURIComponent(branch)}`
            );

            if (response.data && Array.isArray(response.data)) {
              setInquiries(response.data);

              // Extract unique countries from inquiries
              const uniqueCountries = [
                ...new Set(
                  response.data
                    .map((inq) => inq.country)
                    .filter((country) => country && country.trim() !== "")
                ),
              ];
              setCountryOptions(uniqueCountries);

              console.log(
                `Fetched ${response.data.length} inquiries for branch: ${branch}`
              );
            } else {
              console.error("Invalid response data:", response.data);
              setInquiries([]);
            }
          } catch (error) {
            console.error("Error fetching inquiries:", error);
            toast.error("Failed to fetch inquiries. Please try again.");
            setInquiries([]);
          }
        };

        fetchInquiriesByBranch(filters.Branch);
      } else {
        // For staff, just refresh the inquiries for their own branch
        fetchInquiries();
      }
    } else if (role === "admin") {
      // If admin clears the branch filter, fetch all inquiries
      fetchInquiries();
    }
  }, [filters.Branch, role]);

  // Apply filters to inquiries
  useEffect(() => {
    let result = [...inquiries];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (inq) =>
          inq.full_name?.toLowerCase().includes(searchLower) ||
          inq.email?.toLowerCase().includes(searchLower) ||
          inq.phone_number?.includes(filters.search)
      );
    }

    // Apply country filter
    if (filters.country) {
      result = result.filter((inq) => inq.country === filters.country);
    }

    // Apply source filter
    if (filters.source) {
      result = result.filter((inq) => inq.source === filters.source);
    }

    // Apply date range filters
    if (filters.startDate) {
      result = result.filter((inq) => {
        const inquiryDate = new Date(inq.date_of_inquiry);
        const startDate = new Date(filters.startDate);
        return inquiryDate >= startDate;
      });
    }

    if (filters.endDate) {
      result = result.filter((inq) => {
        const inquiryDate = new Date(inq.date_of_inquiry);
        const endDate = new Date(filters.endDate);
        // Add one day to endDate to include the entire end date
        endDate.setDate(endDate.getDate() + 1);
        return inquiryDate <= endDate;
      });
    }

    // Apply branch filter
    if (filters.Branch) {
      result = result.filter((inq) => inq.branch === filters.Branch);
    }

    // Apply inquiry type filter
    if (filters.inquiryType) {
      result = result.filter((inq) => inq.inquiry_type === filters.inquiryType);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((inq) => {
        if (filters.status === "0") {
          return inq.lead_status === "0" || inq.lead_status === "New";
        }
        return inq.lead_status === filters.status;
      });
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter((inq) => {
        // Normalize priority values to string for comparison
        return (inq.priority || "").toString() === filters.priority;
      });
    }

    // Apply counselor filter
    if (filters.counselor) {
      result = result.filter((inq) => inq.counselor_id == filters.counselor);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "newToOld":
          result.sort(
            (a, b) => new Date(b.date_of_inquiry) - new Date(a.date_of_inquiry)
          );
          break;
        case "oldToNew":
          result.sort(
            (a, b) => new Date(a.date_of_inquiry) - new Date(b.date_of_inquiry)
          );
          break;
        case "aToZ":
          result.sort((a, b) => a.full_name?.localeCompare(b.full_name));
          break;
        case "zToA":
          result.sort((a, b) => b.full_name?.localeCompare(a.full_name));
          break;
        default:
          break;
      }
    }

    setFilteredData(result);
  }, [inquiries, filters]);

  // Function to handle edit inquiry
  const handleEditInquiry = async (inquiry) => {
    try {
      setIsEditMode(true);
      setEditingInquiryId(inquiry.id);
      
      // Format date for input field
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      // Set form data from the inquiry
      setNewInquiry({
        name: inquiry.full_name || "",
        email: inquiry.email || "",
        phone: inquiry.phone_number || "",
        city: inquiry.city || "",
        source: inquiry.source || "Whatsapp",
        inquiryType: inquiry.inquiry_type || "",
        priority: inquiry.priority || "Low",
        gender: inquiry.gender || "",
        branch: inquiry.branch || "",
        country: inquiry.country || "",
        date_of_birth: formatDateForInput(inquiry.date_of_birth) || "",
        course_name: inquiry.course_name || "",
        studyLevel: inquiry.study_level || "",
        studyField: inquiry.study_field || "",
        intake: inquiry.intake || "",
        budget: inquiry.budget || "",
        consent: inquiry.consent || false,
        highestLevel: inquiry.highest_level || "",
        education: inquiry.education_background || [],
        testType: inquiry.test_type || "",
        test_name: inquiry.test_name || "",
        overallScore: inquiry.overall_score || "",
        readingScore: inquiry.reading_score || "",
        writingScore: inquiry.writing_score || "",
        speakingScore: inquiry.speaking_score || "",
        listeningScore: inquiry.listening_score || "",
        companyName: inquiry.company_name || "",
        jobTitle: inquiry.job_title || "",
        jobDuration: inquiry.job_duration || "",
        studyGap: inquiry.study_gap || "",
        visaRefused: inquiry.visa_refused || "",
        refusalReason: inquiry.refusal_reason || "",
        address: inquiry.address || "",
        presentAddress: inquiry.present_address || "",
        date_of_inquiry: formatDateForInput(inquiry.date_of_inquiry) || new Date().toISOString().split("T")[0],
        additionalNotes: inquiry.additional_notes || "",
        medium: inquiry.medium || "",
        university: inquiry.university || "",
      });

      setShowInquiryModal(true);
      setPhoneError(""); // Reset phone error
    } catch (error) {
      console.error("Error preparing edit form:", error);
      toast.error("Failed to load inquiry for editing");
    }
  };

  // Function to handle update inquiry
  const handleUpdateInquiry = async (e) => {
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

    // Set test_name based on testType
    let testNameValue = newInquiry.testType;
    if (newInquiry.testType === "OtherText") {
      testNameValue = newInquiry.customTestType || "";
    }

    const requestData = {
      inquiry_type: newInquiry.inquiryType,
      source: newInquiry.source,
      branch: newInquiry.branch || userBranch,
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
      test_name: testNameValue,
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
      priority: newInquiry.priority,
    };

    try {
      const response = await api.put(`${BASE_URL}inquiries/${editingInquiryId}`, requestData);
      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Inquiry updated successfully.",
          icon: "success",
          confirmButtonText: "Ok",
        }).then(() => {
          handleCloseInquiryModal();
          fetchInquiries();
        });
      }
    } catch (error) {
      console.error("Error during inquiry update:", error);

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
          title: "Error!",
          text: "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Close",
        });
      }
    }
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

    // Set test_name based on testType
    let testNameValue = newInquiry.testType;
    if (newInquiry.testType === "OtherText") {
      testNameValue = newInquiry.customTestType || "";
    }

    const requestData = {
      inquiry_type: newInquiry.inquiryType,
      source: newInquiry.source,
      branch: newInquiry.branch || userBranch,
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
      test_name: testNameValue,
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
      priority: newInquiry.priority,
    };

    try {
      const response = await api.post(`${BASE_URL}inquiries`, requestData);
      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Inquiry submitted successfully.",
          icon: "success",
          confirmButtonText: "Ok",
        }).then(() => {
          handleCloseInquiryModal();
          fetchInquiries();
        });
      } else {
        Swal.fire({
          title: "Success!",
          text: "Inquiry added successfully.",
          icon: "success",
          confirmButtonText: "Ok",
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
          title: "Error!",
          text: "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Close",
        });
      }
    }
  };

  // Combined submit handler
  const handleSubmitInquiry = async (e) => {
    if (isEditMode) {
      await handleUpdateInquiry(e);
    } else {
      await handleAddInquiry(e);
    }
  };

  const handleOpenAssignModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedCounselor(null);
  };

  const handleAssignCounselor = async () => {
    if (!selectedCounselor) {
      alert("Please select a counselor.");
      return;
    }
    try {
      const payload = {
        inquiry_id: selectedInquiry.id,
        counselor_id: selectedCounselor.id,
        follow_up_date: followUpDate,
        notes: notes,
      };
      const response = await api.post(`${BASE_URL}assign-inquiry`, payload);
      if (response.status === 200) {
        alert("Counselor assigned successfully.");
        setShowAssignModal(false);
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error assigning counselor:", error);
      alert("Failed to assign counselor.");
    }
  };

  // Handle inquiry detail view
  const handleViewDetail = async (id) => {
    try {
      const response = await api.get(`${BASE_URL}inquiries/${id}`);
      setSelectedInquiry(response.data);
      setInquiryDetailsModal(true);
    } catch (error) {
      console.error("Error fetching inquiry details:", error);
    }
  };

  // Handle delete inquiry
  const handleDeleteInquiry = async (id) => {
    try {
      const res = await api.delete(`${BASE_URL}inquiries/${id}`);
      console.log(res);
      await fetchInquiries();
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const handleShowAssignModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setSelectedCounselor(null);
    setShowAssignModal(true);
  };

  const handleStatusChange = async (status) => {
    try {
      const response = await api.patch(`${BASE_URL}fee/update-lesd-status`, {
        id: selectedInquiry?.id,
        lead_status: status,
      });
      await fetchInquiries();
      setInquiryDetailsModal(false);
      console.log(response.data);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleSelectInquiry = (id) => {
    setSelectedInquiries((prev) =>
      prev.includes(id)
        ? prev.filter((inquiryId) => inquiryId !== id)
        : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status) => {
    try {
      await Promise.all(
        selectedInquiries.map(async (id) => {
          await api.patch(`${BASE_URL}fee/update-lesd-status`, {
            id,
            lead_status: status,
          });
        })
      );
      fetchInquiries();
      setSelectedInquiries([]);
    } catch (err) {
      console.error(err);
      alert("Bulk update failed.");
    }
  };

  const handleBulkApply = () => {
    if (bulkAction) {
      handleBulkStatusChange(bulkAction);
    } else {
      alert("Please select an action.");
    }
  };

  useEffect(() => {
    if (selectedInquiry) {
      console.log("Selected Inquiry:", selectedInquiry);
    }
  }, [selectedInquiry]);

  const handleStatusChangeFromTable = async (id, status) => {
    try {
      const response = await api.patch(`${BASE_URL}fee/update-lesd-status`, {
        id: id,
        lead_status: status,
      });
      await fetchInquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleShowFollowUpModal = () => setShowFollowUpModal(true);

  const handleCloseFollowUpModal = () => {
    setShowFollowUpModal(false);
    setNewFollowUp({
      name: "",
      title: "",
      followUpDate: new Date().toISOString().split("T")[0],
      status: "New",
      urgency: "",
      department: "",
      responsible: "👤",
    });
  };

  const handlePriorityChangeFromTable = async (id, priority) => {
    try {
      // backend expects inquiry_id and priority
      const payload = {
        inquiry_id: id,
        priority: priority,
      };
      const res = await api.patch(`${BASE_URL}priority`, payload);
      if (res.status === 200 || res.status === 204) {
        // Refresh data to reflect updated priority
        fetchInquiries();
      } else {
        console.warn('Unexpected response updating priority', res);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  const handleSendMail = async (inquiryData) => {
    try {
      console.log("📤 Sending lead data:", inquiryData);

      // ✅ Make sure lead has required fields
      if (!inquiryData?.full_name || !inquiryData?.email) {
        alert("⚠️ Missing name or email in lead data!");
        return;
      }

      const res = await axios.post(
        `${BASE_URL}send-inquiry-mail`,
        {
          full_name: inquiryData.full_name,
          phone_number: inquiryData.phone_number,
          email: inquiryData.email,
          inquiry_type: inquiryData.inquiry_type,
          source: inquiryData.source,
          branch: inquiryData.branch,
          counselor_name: inquiryData.counselor_name,
          country: inquiryData.country,
          created_at: inquiryData.created_at,
          new_leads: inquiryData.new_leads,
        },
        {
          headers: {
            "Content-Type": "application/json", // ✅ Ensure backend gets JSON
          },
        }
      );

      console.log("✅ Mail API Response:", res.data);
      alert("✅ Mail sent successfully!");
    } catch (error) {
      console.error("❌ Mail send failed:", error.response?.data || error.message);
      alert("❌ Mail send failed! Check console for details.");
    }
  };

  return (
    <div
      className="p-4"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="mb-4">
        <div className="row align-items-center gy-3">
          {/* Heading */}
          <div className="col-12 col-md-6">
            <h2 className="mb-0">Today's Inquiries</h2>
            {staffData && (
              <p className="text-muted mb-0">
                Welcome, {staffData.full_name} ({staffData.branch} Branch)
              </p>
            )}
          </div>
          {/* Buttons & Actions */}
          <div className="col-12 col-md-6">
            <div className="d-flex flex-wrap justify-content-md-end gap-2">
              {/* Export Buttons Group */}
              <div className="btn-group">
                <Button variant="outline-success">
                  <CSVLink
                    data={filteredData}
                    headers={csvHeaders}
                    filename={"inquiries.csv"}
                    style={{ color: "#000", textDecoration: "none" }}
                  >
                    Export CSV
                  </CSVLink>
                </Button>
                <Button variant="outline-info" onClick={handleExportExcel}>
                  Export Excel
                </Button>
                {role !== "staff" && (
                  <Button variant="outline-danger" onClick={handleExportPDF}>
                    Export PDF
                  </Button>
                )}
              </div>
              {/* Add Inquiry Button */}
              <Button
                variant="secondary"
                onClick={handleShowInquiryModal}
                style={{ border: "none" }}
              >
                Add Inquiry
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
      /* Make all filters uniform */
      .filter-input,
      .filter-select {
        height: 32px !important;
        border-radius: 4px !important;
      }

      /* Remove rounded border from date input (browser default) */
      input[type="date"].filter-input {
        border-radius: 4px !important;
      }
    `}
      </style>
      {/* Row 1: Search, Country, Source */}
      <Row className="mb-3">
        <Col md={4}>
          <label>
            <Form.Label className="small fw-semibold">Search</Form.Label>
          </label>
          <Form.Control
            style={{ height: "40px" }}
            placeholder="Search by Name, Phone or Email"
            value={filters.search}
            className="filter-input"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </Col>
        <Col md={4}>
          <label>
            <Form.Label className="small fw-semibold">Country</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.country}
            className="filter-input"
            onChange={(e) =>
              setFilters({ ...filters, country: e.target.value })
            }
          >
            <option value="">All Countries</option>
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
        </Col>
        <Col md={4}>
          <label>
            <Form.Label className="small fw-semibold">Source</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.source}
            className="filter-input"
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">All Sources</option>
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
        </Col>
      </Row>

      {/* Row 2: Dates, Counselor, Reset */}
      <Row className="mb-4">
        <Col md={4}>
          <label>
            <Form.Label className="small fw-semibold"> Inquiry Start Date</Form.Label>
          </label>
          <Form.Control
            type="date"
            style={{ height: "40px" }}
            value={filters.startDate}
            className="filter-input"
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </Col>
        <Col md={4}>
          <label>
            <Form.Label className="small fw-semibold"> Inquiry End Date</Form.Label>
          </label>
          <Form.Control
            type="date"
            style={{ height: "40px" }}
            value={filters.endDate}
            className="filter-input"
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </Col>
        <Col md={3}>
          <label>
            <Form.Label className="small fw-semibold"> Counselor Name</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.counselor}
            className="filter-input"
            onChange={(e) =>
              setFilters({ ...filters, counselor: e.target.value })
            }
          >
            <option value="">All Counselors</option>
            {counselors?.map((counselor) => (
              <option key={counselor.id} value={counselor.id}>
                {counselor.full_name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={1} className="d-flex align-items-end">
          <Button
            variant="secondary"
            className="w-100"
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </Col>
        <Col md={3} className="mt-2">
          <label>
            <Form.Label className="small fw-semibold">Branch</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.Branch}
            className="filter-input"
            onChange={(e) => setFilters({ ...filters, Branch: e.target.value })}
            disabled={role !== "admin"}
          >
            <option value="">All Branch</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Sylhet">Sylhet</option>
          </Form.Select>
        </Col>
        <Col md={3} className="mt-2">
          <label>
            <Form.Label className="small fw-semibold">Inquiry Type</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.inquiryType}
            className="filter-input"
            onChange={(e) =>
              setFilters({ ...filters, inquiryType: e.target.value })
            }
          >
            <option value="">Select Inquiry Type</option>
            <option value="student_visa">Student Visa</option>
            <option value="visit_visa">Visit Visa</option>
            <option value="work_visa">Work Visa</option>
            <option value="short_visa">Short Visa</option>
            <option value="german_course">German Course</option>
            <option value="english_course">English Course</option>
            <option value="others">Others</option>
          </Form.Select>
        </Col>
        <Col md={3} className="mt-2">
          <label>
            <Form.Label className="small fw-semibold">Status</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.status}
            className="filter-input"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value={"0"}>New</option>
            <option value="Check Eligibility">Check Eligibility</option>
            <option value="Converted to Lead">Converted to Lead</option>
            <option value="Not Eligible">Not Eligible</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Duplicate">Duplicate</option>
          </Form.Select>
        </Col>
        <Col md={3} className="mt-2">
          <label>
            <Form.Label className="small fw-semibold">Priority</Form.Label>
          </label>
          <Form.Select
            style={{ height: "40px" }}
            value={filters.priority}
            className="filter-input"
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Form.Select>
        </Col>
        <Col md={3} className="mt-2">
          <Form.Label className="small fw-semibold">Sort By</Form.Label>

          <Form.Select
            value={filters.sortBy}
            className="filter-input"
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="newToOld">Newest First</option>
            <option value="oldToNew">Oldest First</option>
            <option value="aToZ">Name A → Z</option>
            <option value="zToA">Name Z → A</option>
          </Form.Select>
        </Col>
        <Col md={3} className="mt-2">
          <Form.Label className="small fw-semibold">Bulk</Form.Label>
          <div className="d-flex gap-2 mb-3">
            <Form.Select
              style={{ width: "200px" }}
              value={bulkAction}
              className="filter-input"
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="Converted to Lead">Convert to Lead</option>
              <option value="Not Eligible">Not Eligible</option>
              <option value="Not Interested">Not Interested</option>
            </Form.Select>
            <Button variant="outline-primary" onClick={handleBulkApply}>
              Apply
            </Button>
          </div>
        </Col>
      </Row>

      {/* Modal for assigning counselor */}
      <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Counselor to Inquiry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInquiry && (
            <div>
              <p>
                <strong>Inquiry Name:</strong> {selectedInquiry.full_name}
              </p>
              <p>
                <strong>Course:</strong> {selectedInquiry.course_name}
              </p>
              <Form.Group controlId="counselorSelect" className="mb-3">
                <Form.Label>Counselor *</Form.Label>
                <Form.Select
                  className="form-select"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selected = counselors.find(
                      (c) => c.id.toString() === selectedId
                    );
                    setSelectedCounselor(selected);
                  }}
                  value={selectedCounselor ? selectedCounselor.id : ""}
                >
                  <option value="">Select Counselor</option>
                  {counselors?.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.full_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="followUpDate" className="mb-3">
                <Form.Label>Follow-Up Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="notes" className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter any notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAssignModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignCounselor}>
            Assign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Today's Inquiries */}
      <div
        className="table-responsive"
        ref={tableContainerRef}
        style={{ flex: "1 1 auto", overflowX: "hidden", width: '100%' }}
      >
        <div
          className="table-responsive-wrapper"
        >
          <style>
            {`
            /* Table container styling */
            .table-responsive-wrapper {
              position: relative;
              height: 70vh;
              overflow-y: auto;
              overflow-x: auto;
              border: 1px solid #dee2e6;
            }
            
            /* Table styling */
            .freeze-columns-table {
              position: relative;
              min-width: 1200px;
            }
            
            /* Freeze columns for both header and body cells */
            .freeze-column {
              position: sticky;
              background-color: white;
              z-index: 10;
              box-sizing: border-box;
              white-space: normal;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            /* Individual column positioning to prevent overlap */
            /* Explicit left positions for frozen columns (header + body) */
            .freeze-column-1 {
              left: 0;
              z-index: 30;
              min-width: 50px;
              width: 50px;
            }

            .freeze-column-2 {
              left: 50px;
              z-index: 28;
              min-width: 150px;
              width: 150px;
            }

            .freeze-column-3 {
              left: 200px;
              z-index: 26;
              min-width: 200px;
              width: 200px;
            }

            .freeze-column-4 {
              left: 400px;
              z-index: 24;
              min-width: 120px;
              width: 120px;
            }
            
            /* Header styling */
            .freeze-columns-table thead th {
              position: sticky;
              top: 0;
              background-color: #f8f9fa;
              z-index: 20;
            }
            
            /* Higher z-index for frozen header columns */
            .freeze-columns-table thead th.freeze-column-1 {
              z-index: 50;
            }
            
            .freeze-columns-table thead th.freeze-column-2 {
              z-index: 49;
            }
            
            .freeze-columns-table thead th.freeze-column-3 {
              z-index: 48;
            }
            
            .freeze-columns-table thead th.freeze-column-4 {
              z-index: 47;
            }
            
            /* Border styling for frozen columns */
            .freeze-columns-table thead th.freeze-column,
            .freeze-columns-table tbody td.freeze-column {
              border-right: 2px solid #dee2e6;
            }
            
            /* Custom scrollbar styling */
            .table-responsive-wrapper::-webkit-scrollbar {
              width: 12px;
              height: 12px;
            }
            
            .table-responsive-wrapper::-webkit-scrollbar-track {
              background: #f1f1f1;
            }
            
            .table-responsive-wrapper::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 6px;
            }
            
            .table-responsive-wrapper::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}
          </style>
          <Table bordered hover className="freeze-columns-table" >
            <thead
              className="table-light "
            >
              <tr className="text-center">
                <th>#</th>
                <th className="freeze-column freeze-column-1">Inquiry ID</th>
                <th className="freeze-column freeze-column-2">Name</th>
                <th className="freeze-column freeze-column-3">Email</th>
                <th className="freeze-column freeze-column-4">Phone</th>
                <th>Source</th>
                <th>Branch</th>
                <th>Inquiry Type</th>
                <th>Date of Inquiry</th>
                <th>Country</th>
                <th>Counselor Name </th>
                <th>Priority</th>
                <th>Status</th>
                <th>Check Eligibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentItems) && currentItems.length > 0 ? (
                currentItems?.map((inq, index) => (
                  <tr key={inq.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedInquiries.includes(inq.id)}
                        onChange={() => handleSelectInquiry(inq.id)}
                      />
                    </td>
                    <td className="freeze-column freeze-column-1">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="freeze-column freeze-column-2">
                      {inq.full_name}
                    </td>
                    <td className="freeze-column freeze-column-3">
                      {inq.email}
                    </td>
                    <td className="freeze-column freeze-column-4">
                      {inq.phone_number}
                    </td>
                    <td>{inq.source}</td>
                    <td>{inq.branch}</td>
                    <td>{inq.inquiry_type}</td>
                    <td>
                      {new Date(inq.date_of_inquiry)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, ".")}
                    </td>
                    <td>{inq.country}</td>
                    <td>
                      {inq.counselor_id === null ||
                        inq.counselor_id === 0 ||
                        inq.counselor_id === "0" ? (
                        <Badge bg="warning">Not Assigned</Badge>
                      ) : (
                        inq.counselor_name || <Badge bg="secondary">N/A</Badge>
                      )}
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        className="me-2"
                        style={{ width: "110px" }}
                        value={inq.priority || ""}
                        onChange={(e) =>
                          handlePriorityChangeFromTable(inq.id, e.target.value)
                        }
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Form.Select>
                    </td>
                    {/* Status Column */}
                    <td>
                      {inq.lead_status === "0" || inq.lead_status === "New" ? (
                        <Badge bg="success">New</Badge>
                      ) : inq.lead_status === "In Review" ? (
                        <Badge bg="warning text-dark">In Review</Badge>
                      ) : inq.lead_status === "Check Eligibility" ? (
                        <Badge bg="info text-dark">Check Eligibility</Badge>
                      ) : inq.lead_status === "Converted to Lead" ? (
                        <Badge bg="primary">Converted to Lead</Badge>
                      ) : inq.lead_status === "Not Eligible" ? (
                        <Badge bg="danger">Not Eligible</Badge>
                      ) : inq.lead_status === "Not Interested" ? (
                        <Badge bg="secondary">Not Interested</Badge>
                      ) : inq.lead_status === "Duplicate" ? (
                        <Badge
                          style={{ backgroundColor: "#fd7e14", color: "#fff" }}
                        >
                          Duplicate
                        </Badge>
                      ) : (
                        <Badge bg="dark">Unknown</Badge>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          display: "inline-block",
                          fontSize: "13px",
                          padding: "0px 7px",
                          borderRadius: "5px",
                          color:
                            inq.lead_status === "In Review"
                              ? "#000"
                              : inq.lead_status === "Check Eligibility" ||
                                inq.lead_status === "0"
                                ? "#0d6efd"
                                : "#fff",
                          backgroundColor:
                            inq.lead_status === "New"
                              ? "#198754"
                              : inq.lead_status === "In Review"
                                ? "#ffc107"
                                : inq.lead_status === "Converted to Lead"
                                  ? "#0d6efd"
                                  : inq.lead_status === "Not Eligible"
                                    ? "#dc3545"
                                    : inq.lead_status === "Not Interested"
                                      ? "#6c757d"
                                      : inq.lead_status === "Duplicate"
                                        ? "#fd7e14"
                                        : "transparent",
                        }}
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setInquiryDetailsModal(true);
                        }}
                      >
                        {inq.lead_status === "0"
                          ? "Check Eligibility"
                          : inq.lead_status || "-"}
                      </span>
                    </td>
                    <td>
                      {inq.status === "0" &&
                        inq.lead_status !== "0" &&
                        inq.lead_status !== "New" ? (
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleOpenAssignModal(inq)}
                        >
                          Assign Counselor
                        </Button>
                      ) : (
                        <Button variant="info" size="sm" disabled>
                          Assign Counselor
                        </Button>
                      )}

                      <Dropdown className="d-inline ms-2">
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          Action
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              handleStatusChangeFromTable(inq.id, "In Review")
                            }
                          >
                            In Review
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              handleStatusChangeFromTable(
                                inq.id,
                                "Converted to Lead"
                              )
                            }
                          >
                            Convert to Lead
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              handleStatusChangeFromTable(
                                inq.id,
                                "Not Interested"
                              )
                            }
                          >
                            Not Interested
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              handleStatusChangeFromTable(
                                inq.id,
                                "Not Eligible"
                              )
                            }
                          >
                            Not Eligible
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <a
                        href={`https://wa.me/${inq.phone_number
                          }?text=${encodeURIComponent(
                            `Dear ${inq.full_name},

Here are your inquiry details:
- Name: ${inq.full_name}
- Phone: ${inq.phone_number}
- Email: ${inq.email}
- Inquiry Type: ${inq.inquiry_type}
- Source: ${inq.source}
- Branch: ${inq.branch}
- Counselor: ${inq.counselor_name || "Not Assigned"}
- Country: ${inq.country}
- Date of Inquiry: ${new Date(inq.date_of_inquiry).toLocaleDateString()}
- Status: ${inq.lead_status}

Thank you for your interest.
Regards,
Study First Info Team`
                          )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        <button className="btn btn-sm btn-outline-success me-2">
                          <i className="bi bi-whatsapp"></i>
                        </button>
                      </a>

                      {/* Edit Button - Changed to call handleEditInquiry */}
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditInquiry(inq)}
                        className="ms-2 me-2"
                        title="Edit Inquiry"
                      >
                        <BsPencil />
                      </Button>
                      
                      <button onClick={() => handleSendMail(inq)} className="btn btn-sm btn-outline-dark">
                        <BsEnvelope className="me-1" /> Send Mail
                      </button>
                      {/* Only show delete button for admin users */}
                      {role === "admin" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="ms-2"
                        >
                          <MdDelete />
                        </Button>
                      )}
                      <a
                        href={`tel:${inq.phone_number}`}
                        className="btn btn-sm btn-outline-primary ms-2"
                        title="Call"
                      >
                        <BsTelephone className="me-1" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15">No inquiries available.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination Component */}
      {filteredData.length > itemsPerPage && (
  <div className="d-flex justify-content-center mt-4">
    <Pagination>
      {/* First Page Button */}
      <Pagination.First
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      />
      
      {/* Previous Button */}
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      
      {/* Always show first page */}
      <Pagination.Item
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
      
      {/* Show ellipsis after first page if current page is > 4 */}
      {currentPage > 4 && <Pagination.Ellipsis disabled />}
      
      {/* Show pages around current page */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        // Show page if:
        // 1. It's page 1 (already shown above)
        // 2. It's the last page (will be shown below)
        // 3. It's within 2 pages of current page
        if (
          page !== 1 &&
          page !== totalPages &&
          Math.abs(page - currentPage) <= 2
        ) {
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          );
        }
        return null;
      })}
      
      {/* Show ellipsis before last page if current page is < totalPages - 3 */}
      {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}
      
      {/* Always show last page if there is more than 1 page */}
      {totalPages > 1 && (
        <Pagination.Item
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      )}
      
      {/* Next Button */}
      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      
      {/* Last Page Button */}
      <Pagination.Last
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  </div>
)}
      </div>

      {/* Modal for Adding/Editing New Inquiry */}
      <Modal
        show={showInquiryModal}
        onHide={handleCloseInquiryModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Edit Inquiry" : "New Inquiry Form"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                    required
                  >
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
                    required
                  >
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
                    value={newInquiry.branch || userBranch}
                    onChange={handleInquiryInputChange}
                    disabled={role !== "admin"}
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
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    name="name"
                    value={newInquiry.name}
                    onChange={handleInquiryInputChange}
                    required
                  />
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
                <Form.Group controlId="inquiryType">
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
                <Form.Group controlId="medium">
                  <Form.Label>Medium of Instruction</Form.Label>
                  <Form.Select
                    name="medium"
                    value={newInquiry.medium}
                    onChange={handleInquiryInputChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="english">English</option>
                    <option value="bangla">Bangla</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="university">
                  <Form.Label>University (if applicable)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter university name"
                    name="university"
                    value={newInquiry.university}
                    onChange={handleInquiryInputChange}
                  />
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
                      setNewInquiry({
                        ...newInquiry,
                        course_name: e.target.value,
                      })
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
                      setNewInquiry({
                        ...newInquiry,
                        studyLevel: e.target.value,
                      })
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
                      setNewInquiry({
                        ...newInquiry,
                        studyField: e.target.value,
                      })
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
                  <Form.Label>
                    Initial Budget (1-Year Tuition + Living Cost)
                  </Form.Label>
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
                    onChange={(e) => {
                      const testType = e.target.value;
                      setNewInquiry({
                        ...newInquiry,
                        testType: testType,
                        ...(testType !== "OtherText" && { customTestType: "" }),
                      });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="ielts">IELTS</option>
                    <option value="toefl">TOEFL</option>
                    <option value="duolingo">Duolingo</option>
                    <option value="no_test">No Test Yet</option>
                    <option value="PTE">PTE</option>
                    <option value="OtherText">Other Test</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {newInquiry.testType === "OtherText" && (
                <Col md={3}>
                  <Form.Group controlId="customTestType">
                    <Form.Label>Enter Test Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter custom test name"
                      value={newInquiry.customTestType || ""}
                      onChange={(e) => {
                        const customValue = e.target.value;
                        setNewInquiry({
                          ...newInquiry,
                          customTestType: customValue,
                          test_name: customValue,
                        });
                      }}
                    />
                  </Form.Group>
                </Col>
              )}
              {newInquiry.testType && newInquiry.testType !== "OtherText" && (
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
                      setNewInquiry({
                        ...newInquiry,
                        companyName: e.target.value,
                      })
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
                      setNewInquiry({
                        ...newInquiry,
                        jobDuration: e.target.value,
                      })
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
                    setNewInquiry({
                      ...newInquiry,
                      visaRefused: e.target.value,
                    })
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
                    setNewInquiry({
                      ...newInquiry,
                      visaRefused: e.target.value,
                    })
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
                  setNewInquiry({
                    ...newInquiry,
                    refusalReason: e.target.value,
                  })
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
                  setNewInquiry({
                    ...newInquiry,
                    presentAddress: e.target.value,
                  })
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
                  setNewInquiry({
                    ...newInquiry,
                    additionalNotes: e.target.value,
                  })
                }
              />
            </Form.Group>

            {!isEditMode && (
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
            )}

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="danger"
                onClick={handleCloseInquiryModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="secondary" type="submit">
                {isEditMode ? "Update Inquiry" : "Submit Inquiry"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showInquiryDetailsModal}
        onHide={() => setInquiryDetailsModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Inquiry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInquiry && (
            <div>
              {/* Personal Information */}
              <h5>Personal Information</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Name:</strong> {selectedInquiry.full_name}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Email:</strong> {selectedInquiry.email}
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Phone:</strong> {selectedInquiry.phone_number}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>City:</strong> {selectedInquiry.city}
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Country:</strong> {selectedInquiry.country}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Inquiry Date:</strong>{" "}
                    {new Date(
                      selectedInquiry.date_of_inquiry
                    ).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Address:</strong> {selectedInquiry.address}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Present Address:</strong>{" "}
                    {selectedInquiry.present_address}
                  </p>
                </Col>
              </Row>

              {/* Education */}
              <h5 className="mt-4">Education & Background</h5>
              <Row className="mb-3">
                <Col md={12}>
                  <p>
                    <strong>Education:</strong>{" "}
                    {selectedInquiry?.education_background?.length > 0
                      ? selectedInquiry.education_background.map(
                        (edu, index) => (
                          <span key={index}>
                            {edu.level?.toUpperCase()} (Institute: {edu.institute}, Board: {edu.board}, GPA: {edu.gpa}, Year:{" "}
                            {edu.year})
                            {index !==
                              selectedInquiry.education_background.length -
                              1 && " | "}
                          </span>
                        )
                      )
                      : "No data"}
                  </p>
                </Col>
              </Row>

              {/* English Proficiency */}
              <Row className="mb-3">
                <Col md={12}>
                  <p>
                    <strong>English Proficiency:</strong>
                    <br />
                    <strong>Test:</strong>{" "}
                    {selectedInquiry.test_name ||
                      selectedInquiry.test_type ||
                      "N/A"}
                    <br />
                    <strong>Overall:</strong>{" "}
                    {selectedInquiry.overall_score || "N/A"}
                    <br />
                    <strong>Reading:</strong>{" "}
                    {selectedInquiry.reading_score || "N/A"} |{" "}
                    <strong>Writing:</strong>{" "}
                    {selectedInquiry.writing_score || "N/A"} |{" "}
                    <strong>Speaking:</strong>{" "}
                    {selectedInquiry.speaking_score || "N/A"} |{" "}
                    <strong>Listening:</strong>{" "}
                    {selectedInquiry.listening_score || "N/A"}
                  </p>
                </Col>
              </Row>

              {/* Job Experience */}
              {selectedInquiry?.job_title && (
                <>
                  <h5 className="mt-4">Job Experience</h5>
                  <Row className="mb-3">
                    <Col md={4}>
                      <p>
                        <strong>Company:</strong> {selectedInquiry.company_name}
                      </p>
                    </Col>
                    <Col md={4}>
                      <p>
                        <strong>Job Title:</strong> {selectedInquiry.job_title}
                      </p>
                    </Col>
                    <Col md={4}>
                      <p>
                        <strong>Duration:</strong>{" "}
                        {selectedInquiry.job_duration}
                      </p>
                    </Col>
                  </Row>
                </>
              )}

              {/* Course & Program Info */}
              <h5 className="mt-4">Course & Program Info</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Course Name:</strong>{" "}
                    {selectedInquiry.course_name || "No data"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Study Level:</strong>{" "}
                    {selectedInquiry.study_level || "No data"}
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Field of Study:</strong>{" "}
                    {selectedInquiry.study_field || "No data"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Intake:</strong>{" "}
                    {selectedInquiry.intake || "No data"}
                  </p>
                </Col>
              </Row>

              {/* Budget & Study Gap */}
              <h5 className="mt-4">Budget & Gaps</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Initial Budget:</strong>{" "}
                    {selectedInquiry.budget
                      ? `$${selectedInquiry.budget}`
                      : "No data"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Study Gap:</strong>{" "}
                    {selectedInquiry.study_gap || "No gap"}
                  </p>
                </Col>
              </Row>

              {/* Visa History */}
              <h5 className="mt-4">Visa History</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Visa Refused Before?:</strong>{" "}
                    {selectedInquiry.visa_refused
                      ? selectedInquiry.visa_refused.charAt(0).toUpperCase() +
                      selectedInquiry.visa_refused.slice(1)
                      : "No"}
                  </p>
                </Col>
                {selectedInquiry.visa_refused?.toLowerCase() === "yes" && (
                  <Col md={6}>
                    <p>
                      <strong>Refusal Reason:</strong>{" "}
                      {selectedInquiry.refusal_reason || "Not specified"}
                    </p>
                  </Col>
                )}
              </Row>

              {/* Other Details */}
              <h5 className="mt-4">Other Details</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Medium:</strong>{" "}
                    {selectedInquiry.medium || "No data"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>University:</strong>{" "}
                    {selectedInquiry.university || "No data"}
                  </p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Highest Level Completed:</strong>{" "}
                    {selectedInquiry.highest_level?.toUpperCase() || "No data"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Source:</strong>{" "}
                    {selectedInquiry.source || "No data"}
                  </p>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Row className="mb-3">
                <Col className="d-flex gap-3">
                  <Button
                    variant="danger"
                    onClick={() => handleStatusChange("Not Eligible")}
                  >
                    Not Eligible
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => handleStatusChange("Not Interested")}
                  >
                    Not Interested
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleStatusChange("Converted to Lead")}
                  >
                    Convert to Lead
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setInquiryDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Fake Scrollbar */}
      {showFakeScrollbar && (
        <div
          ref={fakeScrollbarRef}
          className="fake-scrollbar"
          style={{
            width: "100%",
            height: "20px",
            position: "fixed",
            bottom: "0px",
            overflowX: "scroll",
            overflowY: "hidden",
            backgroundColor: "#f1f1f1",
            borderTop: "1px solid #ddd",
            marginTop: "20px",
            boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: tableContainerRef.current?.scrollWidth || "100%",
              height: "1px",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Inquiry;