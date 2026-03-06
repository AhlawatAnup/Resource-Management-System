// confirmation-popup.js

export function showConfirmationPopup(onSubmitHandler, originalEvent, student = {}, purpose = '') {
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-popup-overlay';

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup';

    popup.innerHTML = `
        <h3 class="confirmation-popup__title">Undertaking for Use of AI Data Centre Facilities at Panjab University, Chandigarh</h3>
        <div class="confirmation-popup__content">

            <div class="confirmation-popup__user-details">
                <h4>User Details</h4>
                <div class="confirmation-popup__details-grid">
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Name:</span>
                        <span class="confirmation-popup__detail-value">${student.name || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Roll Number:</span>
                        <span class="confirmation-popup__detail-value">${student.rollNo || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Branch:</span>
                        <span class="confirmation-popup__detail-value">${student.branch || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Institute:</span>
                        <span class="confirmation-popup__detail-value">${student.instituteName || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Address:</span>
                        <span class="confirmation-popup__detail-value">${student.instituteAddress || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Purpose of Use:</span>
                        <span class="confirmation-popup__detail-value">${purpose || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <p>I, the undersigned, understand and agree to the following terms and conditions for using the equipment and facilities of AI Data Centre established by DIC, PU, Chandigarh.</p>

            <h4>1. Acknowledgment of Funding</h4>
            <p>I acknowledge that the equipment and infrastructure available in this data centre have been made possible through generous support from the following grants:</p>
            <ul>
                <li>Ministry of Education (MoE), Government of India, at the Design Innovation Centre (DIC) (File No.: 17-11/2015-PN-1), November 2015.</li>
                <li>Department of Science and Technology (DST) through the Fund for Improvement of S&T Infrastructure (FIST) grant (SR/FST/ET-I/2021/878), 2021.</li>
                <li>AI Data Centre established through CSR grant by Vardhman Textile Pvt Ltd and Intel Corp by Design Innovation Centre, Panjab University, Chandigarh. (File No: 05/02/2025)</li>
            </ul>
            <p>I understand and agree that any research or work performed using this equipment must properly acknowledge these funding bodies in all resulting publications, presentations, IPR, and reports.</p>

            <h4>2. Proper Use and Care of Equipment</h4>
            <p>I will use all equipment, including the high-end GPU server, responsibly and exclusively for academic and research purposes as approved by the lab in-charge. I will not use the equipment for any unauthorized commercial or personal activities.</p>
            <p>I will handle all equipment with care and diligence to prevent damage. I will report any malfunction, damage, or issues with the equipment to the data centre in-charge immediately. I understand that I may be held financially responsible for any damage caused due to negligence or misuse.</p>

            <h4>3. Data Security and Privacy</h4>
            <p>I am responsible for the security of my own data. I will not store sensitive, classified, or unauthorized data on the lab's servers or storage devices. I understand that the lab is not responsible for any loss or corruption of my personal data.</p>

            <h4>4. Compliance with Policies</h4>
            <p>I will adhere to all safety protocols, access policies, and operational guidelines set forth by the Design Innovation Centre and Panjab University. I understand that failure to comply with these rules may result in the suspension of my access to the facilities.</p>

            <h4>5. Declaration</h4>
            <p>By signing below, I confirm that I have read, understood, and agree to abide by all the terms and conditions outlined in this undertaking. I commit to using the provided facilities and equipment responsibly and ethically.</p>

            <div class="confirmation-popup__user-details">
                <h4>User Details</h4>
                <div class="confirmation-popup__details-grid">
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Name:</span>
                        <span class="confirmation-popup__detail-value">${student.name || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Roll Number:</span>
                        <span class="confirmation-popup__detail-value">${student.rollNo || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Branch:</span>
                        <span class="confirmation-popup__detail-value">${student.branch || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Institute:</span>
                        <span class="confirmation-popup__detail-value">${student.instituteName || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Address:</span>
                        <span class="confirmation-popup__detail-value">${student.instituteAddress || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Purpose of Use:</span>
                        <span class="confirmation-popup__detail-value">${purpose || 'N/A'}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Date:</span>
                        <span class="confirmation-popup__detail-value">${currentDate}</span>
                    </div>
                    <div class="confirmation-popup__detail-row">
                        <span class="confirmation-popup__detail-label">Signature:</span>
                        <span class="confirmation-popup__detail-value confirmation-popup__signature">Signed by ${student.name || 'User'}</span>
                    </div>
                </div>
            </div>

            <div class="confirmation-popup__buttons">
                <button id="popup-cancel-btn" class="confirmation-popup__btn confirmation-popup__btn--cancel">Cancel</button>
                <button id="popup-submit-btn" class="confirmation-popup__btn confirmation-popup__btn--submit">I Agree & Submit</button>
            </div>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Cancel button handler
    document.getElementById('popup-cancel-btn').addEventListener('click', () => {
        overlay.remove();
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Submit button handler - calls the actual submit handler
    document.getElementById('popup-submit-btn').addEventListener('click', () => {
        overlay.remove();
        onSubmitHandler(originalEvent);
    });
}
