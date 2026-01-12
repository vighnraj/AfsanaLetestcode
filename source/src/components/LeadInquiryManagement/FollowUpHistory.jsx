import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { ArrowLeft, Pencil, Trash } from "react-bootstrap-icons";
import axios from "axios";
import BASE_URL from "../../Config";

const FollowUpHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowDate, setNextFollowDate] = useState("");
  const [lastFollowUpDate, setLastFollowUpDate] = useState(""); // Added state for last_followup_date
  const [status, setStatus] = useState("");
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [editFollowUp, setEditFollowUp] = useState(null);

  // Fetch lead details
  const fetchLead = async () => {
    try {
      const response = await axios.get(`${BASE_URL}inquiries/${id}`);
      if (response.data) {
        setLead(response.data);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
    }
  };

  // Fetch follow-up history
  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getFollowUpHistoryByInquiryId/${id}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setHistory(response.data.data);
      }
      else if (Array.isArray(response.data)) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const login = localStorage.getItem("login");

  // Create new follow-up
  const handleAddFollowUp = async () => {
    if (!followUpDate || !followUpType || !notes || !nextFollowDate || !lastFollowUpDate || !status) {
      alert("Please fill all fields");
      return;
    }
    try {
      const payload = {
        inquiry_id: id,
        counselor_id: lead.counselor_id,
        date: followUpDate,
        type: followUpType,
        notes,
        next_followup_date: nextFollowDate,
        last_followup_date: lastFollowUpDate, // Added last_followup_date to payload
        status,
      };

      const response = await axios.post(`${BASE_URL}followup-history`, payload);
      if (response.data) {
        setHistory([...history, response.data]);
        setShowModal(false);
        // reset fields
        setFollowUpDate("");
        setFollowUpType("");
        setNotes("");
        setNextFollowDate("");
        setLastFollowUpDate(""); // Reset lastFollowUpDate
        setStatus("");
        fetchHistory();
      }
    } catch (error) {
      console.error("Error adding follow-up:", error);
    }
  };

  // Update follow-up status
  const handleUpdateStatus = async () => {
    if (!updatedStatus || !selectedFollowUp) return;

    try {
      const payload = {
        id: selectedFollowUp.id,
        counselor_id: lead.counselor_id,
        status: updatedStatus.toLowerCase()
      };

      const response = await axios.put(`${BASE_URL}updateFollowUpStatus`, payload);
      if (response.data) {
        // Update the status in local state
        const updatedHistory = history.map(item =>
          item.id === selectedFollowUp.id ? { ...item, status: updatedStatus } : item
        );
        setHistory(updatedHistory);
        setShowStatusModal(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Edit follow-up
  const handleEditFollowUp = async () => {
    if (!editFollowUp || !followUpDate || !followUpType || !notes || !nextFollowDate || !lastFollowUpDate || !status) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        inquiry_id: id,
        counselor_id: lead.counselor_id,
        date: followUpDate,
        type: followUpType,
        notes,
        next_followup_date: nextFollowDate,
        last_followup_date: lastFollowUpDate, // Added last_followup_date to payload
        status,
      };

      // Updated API endpoint for editing follow-up
      const response = await axios.put(`${BASE_URL}updateFollowUp/${editFollowUp.id}`, payload);
      if (response.data) {
        // Update the follow-up in local state
        const updatedHistory = history.map(item =>
          item.id === editFollowUp.id ? response.data : item
        );
        setHistory(updatedHistory);
        setShowEditModal(false);
        // reset fields
        setFollowUpDate("");
        setFollowUpType("");
        setNotes("");
        setNextFollowDate("");
        setLastFollowUpDate(""); // Reset lastFollowUpDate
        setStatus("");
        setEditFollowUp(null);
      }
    } catch (error) {
      console.error("Error updating follow-up:", error);
      alert("Error updating follow-up. Please try again.");
    }
  };

  // Delete follow-up
  const handleDeleteFollowUp = async (followUpId) => {
    if (window.confirm("Are you sure you want to delete this follow-up?")) {
      try {
        // Updated API endpoint for deleting follow-up
        await axios.delete(`${BASE_URL}deletefollowup-history/${followUpId}`);
        // Remove the follow-up from local state
        const updatedHistory = history.filter(item => item.id !== followUpId);
        setHistory(updatedHistory);
      } catch (error) {
        console.error("Error deleting follow-up:", error);
        alert("Error deleting follow-up. Please try again.");
      }
    }
  };



   const nextformatDateTime = (value) => {
    if (!value) return "";
    try {
      if (typeof value === "string") {
        // remove trailing Z if present, replace T with space, keep up to seconds
        return value.replace("T", " ").replace("Z", "").slice(0, 19);
      }
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toISOString().replace("T", " ").slice(0, 19);
    } catch (err) {
      return String(value);
    }
  };


  const lastformatDateTime = (value) => {
    if (!value) return "";
    try {
      if (typeof value === "string") {
        // remove trailing Z if present, replace T with space, keep up to seconds
        return value.replace("T", " ").replace("Z", "").slice(0, 19);
      }
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toISOString().replace("T", " ").slice(0, 19);
    } catch (err) {
      return String(value);
    }
  };
  // Open status update modal
  const openStatusModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setUpdatedStatus(followUp.status);
    setShowStatusModal(true);
  };

  // Open edit modal
  const openEditModal = (followUp) => {
    setEditFollowUp(followUp);
    setFollowUpDate(followUp.date ? new Date(followUp.date).toISOString().split('T')[0] : "");
    setFollowUpType(followUp.type);
    setNotes(followUp.notes);
    setNextFollowDate(followUp.next_followup_date ? new Date(followUp.next_followup_date).toISOString().split('T')[0] : "");
    setLastFollowUpDate(followUp.last_followup_date ? new Date(followUp.last_followup_date).toISOString().split('T')[0] : ""); // Set lastFollowUpDate
    setStatus(followUp.status);
    setShowEditModal(true);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLead();
      await fetchHistory();
      setLoading(false);
    };
    init();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            if (login == "counselor") {
              navigate("/NewLead")
            } else {
              navigate("/lead")
            }
          }}
          style={{ alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Back to Lead
        </Button>

        <Button size="sm" onClick={() => setShowModal(true)}>
          Add Follow-Up
        </Button>
      </div>

      {/* Follow-Up History Table */}
      <h4>Follow-Up History</h4>
      <Table bordered striped>
        <thead>
          <tr className="text-center">
            <th>Counselor</th>
            <th>Date</th>
            <th>Type</th>
            <th>Notes</th>
            <th>Next Follow-Up</th>
            <th>Last Follow-Up Date</th> {/* Added column for last_followup_date */}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            [...history].reverse().map((h, i) => (
              <tr key={i}>
                <td>{h?.counselor_name}</td>
                <td>{new Date(h.date).toLocaleDateString()}</td>
                <td>{h.type}</td>
                <td>{h.notes}</td>
                {/* <td>
                  {h.next_followup_date}
                </td> */}
                <td>{h.next_followup_date ? nextformatDateTime(h.next_followup_date) : "N/A"}</td>
                <td> {/* Added cell for last_followup_date */}
                  {h.last_followup_date ? lastformatDateTime(h.last_followup_date) : "N/A"}
                </td>
                
                <td className="text-center">
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => openStatusModal(h)}
                  >
                    <Badge
                      bg={
                        h.status === "Converted to Client"
                          ? "success"
                          : h.status === "Not Interested"
                            ? "danger"
                            : h.status === "Interested"
                              ? "primary"
                              : "warning"
                      }
                    >
                      {h.status}
                    </Badge>
                  </Button>
                </td>
                <td className="text-center">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => openEditModal(h)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteFollowUp(h.id)}
                  >
                    <Trash size={14} />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center"> {/* Updated colspan to 8 */}
                <em>No follow-up history found</em>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for adding follow-up */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Follow-Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={followUpType}
                onChange={(e) => setFollowUpType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Office Visit">Office Visit</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Next Follow-Up Date</Form.Label>
              <Form.Control
                type="date"
                value={nextFollowDate}
                onChange={(e) => setNextFollowDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Follow-Up Date</Form.Label>
              <Form.Control
                type="date"
                value={lastFollowUpDate}
                onChange={(e) => setLastFollowUpDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="Follow-Up Scheduled">Follow-Up Scheduled</option>
                <option value="Awaiting Response">Awaiting Response</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted to Client">Converted to Client</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddFollowUp}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for editing follow-up */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Follow-Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={followUpType}
                onChange={(e) => setFollowUpType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Office Visit">Office Visit</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Next Follow-Up Date</Form.Label>
              <Form.Control
                type="date"
                value={nextFollowDate}
                onChange={(e) => setNextFollowDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Follow-Up Date</Form.Label>
              <Form.Control
                type="date"
                value={lastFollowUpDate}
                onChange={(e) => setLastFollowUpDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="Follow-Up Scheduled">Follow-Up Scheduled</option>
                <option value="Awaiting Response">Awaiting Response</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted to Client">Converted to Client</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditFollowUp}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for updating status */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Status</Form.Label>
              <Form.Control
                type="text"
                value={selectedFollowUp?.status || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="Follow-Up Scheduled">Follow-Up Scheduled</option>
                <option value="Awaiting Response">Awaiting Response</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted to Client">Converted to Client</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FollowUpHistory;