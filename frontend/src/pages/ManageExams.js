import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createExamWithQuestions, getExams, updateExam, deleteExam } from '../services/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/ManageExams.css';

function ManageExams() {
    const [exams, setExams] = useState([]);
    const fileInputRef = useRef(null);
    
    // Form state
    const [examData, setExamData] = useState({
        name: '',
        description: '',
        durationMinutes: 60,
        totalMarks: 100,
        startTime: '',
        endTime: ''
    });
    const [file, setFile] = useState(null);
    const [uploadType, setUploadType] = useState('excel');
    
    // UI state
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [editModeId, setEditModeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    // Fetch exams on mount
    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await getExams();
            setExams(data);
        } catch (err) {
            console.error("Failed to fetch exams:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExamData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const resetForm = () => {
        setExamData({
            name: '',
            description: '',
            durationMinutes: 60,
            totalMarks: 100,
            startTime: '',
            endTime: ''
        });
        setFile(null);
        setUploadType('excel');
        setEditModeId(null);
        // Clear the file input element
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!examData.name || !examData.startTime || !examData.endTime) {
            showToast('Please fill in Name, Start Time, and End Time.', 'error');
            return;
        }

        setLoading(true);
        try {
            if (editModeId) {
                await updateExam(editModeId, examData);
                showToast('Exam updated successfully!');
                resetForm();
                fetchExams();
            } else {
                if (!file) {
                    showToast('Please select a file to create a new exam.', 'error');
                    setLoading(false);
                    return;
                }
                await createExamWithQuestions(examData, file, uploadType);
                showToast('Exam and questions created successfully!');
                resetForm();
                fetchExams();
            }
        } catch (err) {
            showToast(err.message || 'Operation failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (exam) => {
        setEditModeId(exam.id);
        setExamData({
            name: exam.name || '',
            description: exam.description || '',
            durationMinutes: exam.durationMinutes || 60,
            totalMarks: exam.totalMarks || 100,
            startTime: exam.startTime ? exam.startTime.substring(0, 16) : '',
            endTime: exam.endTime ? exam.endTime.substring(0, 16) : ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        const id = deleteTarget;
        setDeleteTarget(null);
        try {
            await deleteExam(id);
            showToast('Exam deleted successfully.');
            if (editModeId === id) resetForm();
            fetchExams();
        } catch (err) {
            showToast(err.message || 'Failed to delete exam.', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const filteredExams = exams.filter((exam) =>
        exam.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="manage-exams-page">
            <Navbar />
            <div className="manage-exams-container">
                {/* LIST SECTION - LEFT */}
                <div className="exams-list-content">
                    <h2>📋 Your Exams</h2>
                    <p className="exams-count">{filteredExams.length} of {exams.length} exam{exams.length !== 1 ? 's' : ''}</p>
                    
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search exams by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                        )}
                    </div>

                    {filteredExams.length === 0 ? (
                        <p className="no-exams-msg">
                            {exams.length === 0 ? 'No exams found. Create one using the form.' : 'No exams match your search.'}
                        </p>
                    ) : (
                        <div className="exams-scroll-area">
                            <div className="exams-grid">
                                {filteredExams.map((exam) => (
                                    <div className="exam-card" key={exam.id}>
                                        <div className="exam-card-header">
                                            <h3>{exam.name}</h3>
                                            <div className="exam-actions">
                                                <button className="action-btn edit-btn" onClick={() => handleEditClick(exam)}>
                                                    ✏️ Edit
                                                </button>
                                                <button className="action-btn delete-btn" onClick={() => handleDeleteClick(exam.id)}>
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="exam-desc">{exam.description || 'No description provided.'}</p>
                                        <div className="exam-meta">
                                            <span>⏱️ {exam.durationMinutes} mins</span>
                                            <span>🎯 {exam.totalMarks} marks</span>
                                        </div>
                                        <div className="exam-times">
                                            <p><strong>Start:</strong> {formatDate(exam.startTime)}</p>
                                            <p><strong>End:</strong> {formatDate(exam.endTime)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* FORM SECTION - RIGHT (Fixed) */}
                <div className="manage-exams-content">
                    <h2>{editModeId ? '✏️ Edit Exam Details' : '✨ Create New Exam'}</h2>
                    <p className="form-description">
                        {editModeId
                            ? 'Update the exam details below and save your changes.'
                            : 'Fill in the exam details and upload your questions file.'}
                    </p>
                    
                    {editModeId && (
                        <button className="cancel-edit-btn" onClick={resetForm}>
                            ✕ Cancel Editing
                        </button>
                    )}

                    <div className="upload-section">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Exam Title:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={examData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Exam Title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description:</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={examData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter Exam Description"
                                />
                            </div>

                            <div className="form-group flex-row">
                                <div className="flex-1">
                                    <label>Duration (mins):</label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        value={examData.durationMinutes}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label>Total Marks:</label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={examData.totalMarks}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group flex-row">
                                <div className="flex-1">
                                    <label>Start Time:</label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={examData.startTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label>End Time:</label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={examData.endTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {!editModeId && (
                                <>
                                    <div className="form-group">
                                        <label>Questions File Format:</label>
                                        <select
                                            value={uploadType}
                                            onChange={(e) => setUploadType(e.target.value)}
                                        >
                                            <option value="excel">Excel (.xlsx)</option>
                                            <option value="photo">Photo / Image (OCR)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Select Questions File:</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept={uploadType === 'excel' ? ".xlsx,.xls" : "image/*"}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <button className="upload-btn" type="submit" disabled={loading}>
                                {loading ? 'Processing...' : (editModeId ? 'Save Changes' : 'Create Exam & Upload')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Exam"
                    message="Are you sure you want to delete this exam? All associated questions and options will be permanently removed."
                    confirmText="Delete Exam"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

export default ManageExams;
