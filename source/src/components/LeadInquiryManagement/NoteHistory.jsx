import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { ArrowLeft, Pencil, Trash } from "react-bootstrap-icons";
import axios from "axios";
import BASE_URL from "../../Config";

const NoteHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [noteType, setNoteType] = useState("");
    const [editingNote, setEditingNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(""); // New state to track user role
    const login = localStorage.getItem("login");
    
    const staffid = JSON.parse(localStorage.getItem("login_detail"))
    const staff_id = staffid.staff_id
    
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

    // Fetch notes history
    const fetchNotes = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}getNotesByInquiryId/${id}`
            );
            if (response.data && Array.isArray(response.data.data)) {
                setNotes(response.data.data);
            }
            else if (Array.isArray(response.data)) {
                setNotes(response.data);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    };

    // Create new note
    const handleAddNote = async () => {
        if (!noteText || !noteType) {
            alert("Please fill all fields");
            return;
        }
        try {
            const payload = {
                inquiry_id: id,
                counselor_id: lead.counselor_id,
                staff_id: staff_id,
                note: noteText,
                noteType: noteType
            };

            await axios.post(`${BASE_URL}createNote`, payload);
            setShowModal(false);
            setNoteText("");
            setNoteType("");
            fetchNotes();
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    // Update existing note
    const handleUpdateNote = async () => {
        if (!noteText || !noteType || !editingNote) return;

        try {
            const payload = {
                inquiry_id: id,
                counselor_id: lead.counselor_id,
                note: noteText,
                noteType: noteType
            };

            await axios.patch(`${BASE_URL}updateNote/${editingNote.id}`, payload);
            setShowEditModal(false);
            setNoteText("");
            setNoteType("");
            fetchNotes();
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    // Delete note
    const handleDeleteNote = async (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await axios.delete(`${BASE_URL}deleteNote/${noteId}`);
                fetchNotes();
            } catch (error) {
                console.error("Error deleting note:", error);
            }
        }
    };

    // Open edit modal
    const openEditModal = (note) => {
        setEditingNote(note);
        setNoteText(note.note);
        setNoteType(note.noteType);
        setShowEditModal(true);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            // Set user role based on login
            setUserRole(login);
            await fetchLead();
            await fetchNotes();
            setLoading(false);
        };
        init();
    }, [id, login]);

    // Format date/time in Bangladesh timezone (Asia/Dhaka)
    const formatBangladesh = (isoString) => {
        if (!isoString) return "-";
        try {
            return new Date(isoString).toLocaleString("en-GB", {
                timeZone: "Asia/Dhaka",
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        } catch (e) {
            return isoString;
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!lead) return <div>Lead not found</div>;

    // Filter notes for admin
    const counselorNotes = notes.filter(note => note.counselor_name);
    const staffNotes = notes.filter(note => note.staff_name);

    // Render table for non-admin users
    const renderSingleTable = (notes, nameColumnTitle) => {
        return (
            <Table bordered striped>
                <thead>
                    <tr className="text-center">
                        <th>{nameColumnTitle}</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Note</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notes.length > 0 ? (
                        [...notes].reverse().map((note, i) => (
                            <tr key={i}>
                                <td>{nameColumnTitle === "Counselor Name" ? note.counselor_name : note.staff_name}</td>
                                <td>{formatBangladesh(note.created_at)}</td>
                                <td>
                                    <Badge bg="info">
                                        {note.noteType}
                                    </Badge>
                                </td>
                                <td>{note.note}</td>
                                <td className="text-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openEditModal(note)}
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteNote(note.id)}
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center">
                                <em>No notes found</em>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    };

    // Render table for admin users
    const renderAdminTable = (notes, nameColumnTitle, nameField) => {
        return (
            <div className="mb-5">
                <h5>{nameColumnTitle} Notes</h5>
                <Table bordered striped>
                    <thead>
                        <tr className="text-center">
                            <th>{nameColumnTitle}</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Note</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.length > 0 ? (
                            [...notes].reverse().map((note, i) => (
                                <tr key={i}>
                                    <td>{note[nameField]}</td>
                                    <td>{formatBangladesh(note.created_at)}</td>
                                    <td>
                                        <Badge bg="info">
                                            {note.noteType}
                                        </Badge>
                                    </td>
                                    <td>{note.note}</td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => openEditModal(note)}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteNote(note.id)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    <em>No {nameColumnTitle.toLowerCase()} notes found</em>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        );
    };

    return (
        <div className="p-4">
            {/* Back Button */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                        if (login === "counselor") {
                            navigate("/NewLead")
                        } else {
                            navigate("/lead")
                        }
                    }}
                    style={{ alignItems: "center", gap: "6px" }}
                >
                    <ArrowLeft size={16} /> Back to Lead
                </Button>

                {/* Conditionally render Add Note button - only for non-admin users */}
                {userRole !== "admin" && (
                    <Button size="sm" onClick={() => setShowModal(true)}>
                        Add Note
                    </Button>
                )}
            </div>

            {/* Note History Table(s) */}
            <h4>Note History</h4>
            
            {userRole === "admin" ? (
                // For admin: Show two separate tables
                <div>
                    {renderAdminTable(counselorNotes, "Counselor", "counselor_name")}
                    {renderAdminTable(staffNotes, "Staff", "staff_name")}
                </div>
            ) : (
                // For non-admin: Show single table
                renderSingleTable(notes, userRole === "counselor" ? "Counselor Name" : "Staff Name")
            )}

            {/* Modal for adding note */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Note Type</Form.Label>
                            <Form.Select
                                value={noteType}
                                onChange={(e) => setNoteType(e.target.value)}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Call">Call</option>
                                <option value="Email">Email</option>
                                <option value="Feedback">Feedback</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddNote}>
                        Save Note
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for editing note */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Note Type</Form.Label>
                            <Form.Select
                                value={noteType}
                                onChange={(e) => setNoteType(e.target.value)}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Follow-up">Follow-up</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Call">Call</option>
                                <option value="Email">Email</option>
                                <option value="Feedback">Feedback</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateNote}>
                        Update Note
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default NoteHistory;