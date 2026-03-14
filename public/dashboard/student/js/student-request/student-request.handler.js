// handlers.js

// Utils
import {
    getLoggedInStudentId,
    showErrorMessage,
    getStudentVerificationStatus,
    validateExpiryDate
} from '../student.utils.js';

// Services
import {
    fetchStudentData,
    submitResourceRequest
} from './student-request.service.js';

// UI
import {
    renderResourcesPage,
    initializeExpiryDatePicker
} from './student-request.ui.js';

// External
import { isValidUsername, logoutDirectly } from '../../../common/js/commons.js';

export async function handleLoadRequestResources() {
    try {
        const studentId = await getLoggedInStudentId();

        if (!studentId) {
            throw new Error('Student ID not found. Please login again.');
        }

        const response = await fetchStudentData(studentId);

        if (!response.ok) {
            if (response.status === 404) {
                logoutDirectly();
                return;
            }
            throw new Error('Failed to fetch student details');
        }

        const studentData = await response.json();

        const verificationStatus = getStudentVerificationStatus(studentData);

        renderResourcesPage(
            studentData,
            verificationStatus,
            handleResourceRequest,
            initializeExpiryDatePicker
        );

    } catch (error) {
        console.error('Error loading student details for resources:', error);
        logoutDirectly();
    }
}

export async function handleResourceRequest(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn.disabled) return;

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        const formData = {
            username: document.getElementById('username').value.trim(),
            title: document.getElementById('title').value.trim(),
            purpose: document.getElementById('purpose').value.trim(),
            expiryDate: document.getElementById('expiry-date').value,
        };

        if (!formData.username || !formData.title || !formData.purpose || !formData.expiryDate) {
            throw new Error('Please fill in all required fields');
        }

        if (!isValidUsername(formData.username)) {
            throw new Error('Username can only contain letters, numbers, hyphens (-), and underscores (_), with no spaces or special characters');
        }

        if (formData.username.length <= 5 || formData.username.length >= 50) {
            throw new Error('Username must be greater than 5 and less than 50 characters');
        }

        if (formData.title.length > 50) {
            throw new Error('Title must not exceed 50 characters');
        }
        
        if (formData.purpose.length < 100) {
            throw new Error('Purpose must be at least 100 characters long');
        }

        if (formData.purpose.length > 2000) {
            throw new Error('Purpose must not exceed 2000 characters');
        }

        validateExpiryDate(formData.expiryDate);

        const studentId = await getLoggedInStudentId();
        if (!studentId) {
            throw new Error('Student ID not found. Please login again.');
        }

        const response = await submitResourceRequest({
            ...formData,
            studentId
        });

        if (!response.ok) {
            const errorData = await response.json();

            if (errorData.error && errorData.error.includes('Only one pending request is allowed')) {
                showErrorMessage(
                    'You already have a pending request. Please wait for it to be processed or delete it if no action has been taken by teacher/admin.',
                    'request-content'
                );
                return;
            }

            if (errorData.error && /username already exists/i.test(errorData.error)) {
                Swal.fire({
                    title: "Error!",
                    text: "Username already taken. Please choose a different username.",
                    icon: "error",
                    draggable: true,
                    scrollbarPadding: false,
                    heightAuto: false
                });
                return;
            }

            throw new Error(errorData.message || (errorData.error || 'Failed to submit request'));
        }

        await Swal.fire({
            title: "Success!",
            text: "Resource request submitted successfully! You will be notified once it is processed.",
            icon: "success",
            draggable: true,
            scrollbarPadding: false,
            heightAuto: false
        });

        window.location.href = '/dashboard/student/view-requests';

    } catch (error) {
        console.error('Error submitting resource request:', error);
        Swal.fire({
            title: "Error!",
            text: "Failed to submit request: " + error.message,
            icon: "error",
            draggable: true
        });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}