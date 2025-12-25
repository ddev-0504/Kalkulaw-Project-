/* ============================================================
   KALKULAW v2.0 - COMPLETE JAVASCRIPT
   Feature-Rich Emergency & Evidence Management System
============================================================ */

// ============================================================
// 1. GLOBAL STATE & CONFIGURATION
// ============================================================
const AppState = {
    display: '0',
    sequence: '',
    lastOperator: null,
    isLightMode: false,
    isPremium: false,
    currentUser: null,
    evidenceList: [],
    emergencyHistory: [],
    pin: '123', // Default PIN
    cameraStream: null,
    isRecording: false,
    recordedChunks: [],
    mediaRecorder: null,
    currentEvidenceId: null,
    facingMode: 'user' // 'user' or 'environment'
};

// Mock User Database
const UserDB = {
    profile: {
        name: '',
        phone: '',
        photo: null,
        emergencyContacts: [
            { name: '', phone: '' },
            { name: '', phone: '' },
            { name: '', phone: '' }
        ]
    }
};

// Evidence Storage
const EvidenceStorage = [];

// Admin Credentials
const AdminCredentials = {
    username: 'admin_kalkulaw',
    password: 'admin123'
};

// ============================================================
// 2. DOM ELEMENTS CACHE
// ============================================================
const DOM = {};

// ============================================================
// 3. INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    initializeCalculator();
    initializeModals();
    initializeDashboard();
    initializeEvidence();
    initializeAdmin();
    initializePremium();
    updateTime();
    loadUserData();

    console.log('✅ KalkuLaw v2.0 initialized successfully!');
});

function initializeDOM() {
    // App elements
    DOM.app = document.getElementById('app');
    DOM.calcDisplay = document.getElementById('calcDisplay');
    DOM.sequenceDisplay = document.getElementById('sequenceDisplay');
    DOM.timeDisplay = document.getElementById('timeDisplay');

    // Buttons
    DOM.menuButton = document.getElementById('menuButton');
    DOM.piButton = document.getElementById('piButton');
    DOM.equalButton = document.getElementById('equalButton');

    // Modals
    DOM.menuModal = document.getElementById('menuModal');
    DOM.contactModal = document.getElementById('contactModal');
    DOM.fakeCallModal = document.getElementById('fakeCallModal');
    DOM.sosModal = document.getElementById('sosModal');
    DOM.cameraModal = document.getElementById('cameraModal');
    DOM.emergencyNotification = document.getElementById('emergencyNotification');
    DOM.premiumModal = document.getElementById('premiumModal');
    DOM.evidenceViewer = document.getElementById('evidenceViewer');
    DOM.adminLoginModal = document.getElementById('adminLoginModal');

    // Dashboard
    DOM.dashboardContainer = document.getElementById('dashboardContainer');
    DOM.dashboardExit = document.getElementById('dashboardExit');
    DOM.upgradeButton = document.getElementById('upgradeButton');
    DOM.panicButton = document.getElementById('panicButton');

    // Evidence
    DOM.evidenceGrid = document.getElementById('evidenceGrid');
    DOM.takePhoto = document.getElementById('takePhoto');
    DOM.recordVideo = document.getElementById('recordVideo');
    DOM.recordAudio = document.getElementById('recordAudio');
    DOM.uploadFile = document.getElementById('uploadFile');

    // Admin
    DOM.adminPanel = document.getElementById('adminPanel');
    DOM.adminLogout = document.getElementById('adminLogout');
}

// ============================================================
// 4. TIME DISPLAY
// ============================================================
function updateTime() {
    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        if (DOM.timeDisplay) {
            DOM.timeDisplay.textContent = `${hours}:${minutes}`;
        }
    }, 1000);
}

// ============================================================
// 5. CALCULATOR LOGIC
// ============================================================
function initializeCalculator() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.getAttribute('data-key');
            handleCalculatorInput(key);
        });
    });
}

function handleCalculatorInput(key) {
    if (key === 'AC') {
        clearCalculator();
    } else if (key === 'DEL') {
        deleteLastChar();
    } else if (key === '=') {
        AppState.sequence += key;
        DOM.sequenceDisplay.textContent = AppState.sequence;
        checkSpecialSequences();
    } else {
        // Only append to sequence if it's NOT DEL or AC
        // For special keys, we might want to be careful, but generally we append
        AppState.sequence += key;
        DOM.sequenceDisplay.textContent = AppState.sequence;

        if (key === '%') {
            handlePercent();
        } else if (['+', '−', '×', '÷'].includes(key)) {
            handleOperator(key);
        } else if (key === 'π') {
            handlePi();
        } else {
            handleNumber(key);
        }
    }
}

function clearCalculator() {
    AppState.display = '0';
    AppState.sequence = '';
    AppState.lastOperator = null;
    updateDisplay();
}

function deleteLastChar() {
    // 1. Update Display
    if (AppState.display.length > 1) {
        AppState.display = AppState.display.slice(0, -1);
    } else {
        AppState.display = '0';
    }

    // 2. Update Sequence (Remove last char)
    if (AppState.sequence.length > 0) {
        AppState.sequence = AppState.sequence.slice(0, -1);
    }

    updateDisplay();
}

function handleNumber(num) {
    if (AppState.display === '0' && num !== '.') {
        AppState.display = num;
    } else {
        AppState.display += num;
    }
    updateDisplay();
}

function handleOperator(op) {
    AppState.lastOperator = op;
    AppState.display += ' ' + op + ' ';
    updateDisplay();
}

function handlePercent() {
    try {
        const value = parseFloat(AppState.display);
        AppState.display = (value / 100).toString();
        updateDisplay();
    } catch (e) {
        showToast('Invalid operation', 2000);
    }
}

function handlePi() {
    // Prevent multiple Pis if that's a concern, or just allow it.
    // User wants "phi" symbol to appear.

    if (AppState.display === '0') {
        AppState.display = 'π';
    } else {
        AppState.display += 'π';
    }
    // Sequence is key-based, so it will get 'π' from handleCalculatorInput
    updateDisplay();
}

function updateDisplay() {
    DOM.calcDisplay.textContent = AppState.display;
    DOM.sequenceDisplay.textContent = AppState.sequence;
}

// ============================================================
// 6. SPECIAL SEQUENCES (EMERGENCY FEATURES)
// ============================================================
function checkSpecialSequences() {
    const seq = AppState.sequence.replace(/\s/g, '');

    // CHECK MODE: Fitur rahasia HANYA aktif di Mode Terang
    if (!AppState.isLightMode) {
        // Pattern Matching for Restrictions
        const isSOS = seq.includes('110=');
        const isFakeCall = seq.includes('ππ=') || seq.includes('%%=');
        const isDashboard = seq.startsWith('505') && seq.endsWith('=');

        if (isSOS || isFakeCall || isDashboard) {
            // Block access in Dark Mode
            showToast('Aktifkan Mode Terang untuk mengakses fitur ini', 3000);
            clearCalculator();
            return;
        }
    }

    // --- EXECUTE FEATURES (Only reachable if Light Mode is ON, or pattern didn't match) ---

    // 1. Fake Call: π π =
    if (seq.includes('ππ=') || seq.includes('%%=')) {
        openContactSelection();
        clearCalculator();
        return;
    }

    // 2. Emergency 110: 1 1 0 =
    if (seq.includes('110=')) {
        activateEmergency();
        clearCalculator();
        return;
    }

    // 3. Dashboard Access: 505[PIN]=
    if (seq.startsWith('505') && seq.endsWith('=')) {
        const inputPin = seq.substring(3, seq.length - 1); // remove 505 and =
        if (inputPin === AppState.pin) {
            openDashboard();
            clearCalculator();
        } else {
            // Only show error if we are sure it was intended as a dashboard attempt
            // If it's just 505 + 5 =, it wouldn't match startWith 505 AND endsWith = usually? 
            // Wait, "505+5=" matches startWith 505 and endsWith =. 
            // So we need to be careful. Dashboard code assumes 505...= is purely digits.
            // Let's rely on the PIN check.
            if (/^\d+$/.test(inputPin)) {
                showToast('PIN salah!', 2000);
                clearCalculator();
            } else {
                // If it contains operators, treat as calculation
                calculateResult();
            }
        }
        return;
    }

    // 4. Normal calculation
    calculateResult();
}

function calculateResult() {
    try {
        let expression = AppState.display
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/π/g, Math.PI);

        const result = eval(expression);
        AppState.display = result.toString();
        AppState.sequence = '';
        updateDisplay();
    } catch (e) {
        showToast('Invalid expression', 2000);
        clearCalculator();
    }
}

// ============================================================
// 7. MODE SWITCHING
// ============================================================
function initializeModals() {
    // Menu Modal
    DOM.menuButton?.addEventListener('click', () => openModal(DOM.menuModal));
    document.getElementById('menuClose')?.addEventListener('click', () => closeModal(DOM.menuModal));
    document.getElementById('menuOverlay')?.addEventListener('click', () => closeModal(DOM.menuModal));

    document.getElementById('setDarkMode')?.addEventListener('click', () => {
        setMode(false);
        closeModal(DOM.menuModal);
    });

    document.getElementById('setLightMode')?.addEventListener('click', () => {
        setMode(true);
        closeModal(DOM.menuModal);
    });

    // Contact Modal
    document.getElementById('contactClose')?.addEventListener('click', () => closeModal(DOM.contactModal));
    document.getElementById('contactOverlay')?.addEventListener('click', () => closeModal(DOM.contactModal));

    const contactOptions = document.querySelectorAll('.contact-option');
    contactOptions.forEach(option => {
        option.addEventListener('click', () => {
            const contact = option.getAttribute('data-contact');
            initiateFakeCall(contact);
        });
    });

    // Fake Call Modal
    document.getElementById('answerCall')?.addEventListener('click', answerFakeCall);
    document.getElementById('rejectCall')?.addEventListener('click', () => closeModal(DOM.fakeCallModal));

    // SOS Modal
    document.getElementById('sosCancel')?.addEventListener('click', cancelEmergency);

    // Camera Modal
    document.getElementById('cameraClose')?.addEventListener('click', stopCamera);
    document.getElementById('switchCamera')?.addEventListener('click', switchCamera);
    document.getElementById('capturePhoto')?.addEventListener('click', capturePhoto);

    // Emergency Notification
    document.getElementById('notificationClose')?.addEventListener('click', () => {
        closeModal(DOM.emergencyNotification);
    });

    // Evidence Viewer
    document.getElementById('viewerClose')?.addEventListener('click', () => {
        closeModal(DOM.evidenceViewer);
    });
    document.getElementById('viewerDownload')?.addEventListener('click', downloadCurrentEvidence);
    document.getElementById('viewerShare')?.addEventListener('click', shareCurrentEvidence);
    document.getElementById('viewerDelete')?.addEventListener('click', deleteCurrentEvidence);
}

function openModal(modal) {
    console.log('Opening modal:', modal);
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Force display
        modal.style.zIndex = '10000'; // Ensure it's on top
        console.log('Modal opened, classes:', modal.className);
    } else {
        console.error('Modal element is null!');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
    }
}

function setMode(isLight) {
    AppState.isLightMode = isLight;
    if (isLight) {
        DOM.app?.classList.add('light-mode');
        showToast('Mode Terang aktif - Fitur darurat tersedia', 3000);
    } else {
        DOM.app?.classList.remove('light-mode');
        showToast('Mode Gelap aktif', 2000);
    }
    saveUserData();
}

// ============================================================
// 8. FAKE CALL FEATURE
// ============================================================
function openContactSelection() {
    openModal(DOM.contactModal);
}

function initiateFakeCall(contactType) {
    closeModal(DOM.contactModal);

    const contactData = {
        mother: { name: 'Ibu', avatar: 'IBU', number: '+62 812-3456-7890' },
        father: { name: 'Ayah', avatar: 'Ayah', number: '+62 813-4567-8901' },
        friend: { name: 'Teman', avatar: 'Rani', number: '+62 814-5678-9012' },
        sibling: { name: 'Saudara', avatar: 'Kakak', number: '+62 815-6789-0123' }
    };

    const contact = contactData[contactType] || contactData.mother;

    document.getElementById('callerAvatar').textContent = contact.avatar;
    document.getElementById('callerName').textContent = contact.name;
    document.getElementById('callerNumber').textContent = contact.number;
    document.getElementById('callState').textContent = 'Berdering...';
    document.getElementById('callTimer').textContent = '00:00';

    openModal(DOM.fakeCallModal);

    // Simulate ringing
    let ringCount = 0;
    const ringInterval = setInterval(() => {
        ringCount++;
        if (ringCount > 5) {
            clearInterval(ringInterval);
            closeModal(DOM.fakeCallModal);
            showToast('Panggilan tidak dijawab', 2000);
        }
    }, 3000);

    // Store interval ID for cleanup
    if (DOM.fakeCallModal) {
        DOM.fakeCallModal.dataset.ringInterval = ringInterval;
    }
}

function answerFakeCall() {
    // Clear ringing interval
    if (DOM.fakeCallModal?.dataset.ringInterval) {
        clearInterval(parseInt(DOM.fakeCallModal.dataset.ringInterval));
    }

    document.getElementById('callState').textContent = 'Terhubung';

    // Start timer
    let seconds = 0;
    const timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('callTimer').textContent =
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);

    // Auto end after 2 minutes
    setTimeout(() => {
        clearInterval(timerInterval);
        closeModal(DOM.fakeCallModal);
        showToast('Panggilan berakhir', 2000);
    }, 120000);
}

// ============================================================
// 9. EMERGENCY ACTIVATION
// ============================================================
function activateEmergency() {
    openModal(DOM.sosModal);

    let countdown = 5;
    document.getElementById('sosCountdown').textContent = countdown;
    document.getElementById('sosMessage').textContent = 'Mempersiapkan pengiriman darurat...';

    const countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById('sosCountdown').textContent = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            executeEmergency();
        }
    }, 1000);

    // Store interval for cancellation
    if (DOM.sosModal) {
        DOM.sosModal.dataset.countdownInterval = countdownInterval;
    }
}

function cancelEmergency() {
    if (DOM.sosModal?.dataset.countdownInterval) {
        clearInterval(parseInt(DOM.sosModal.dataset.countdownInterval));
    }
    closeModal(DOM.sosModal);
    showToast('Emergency dibatalkan', 2000);
}

async function executeEmergency() {
    closeModal(DOM.sosModal);
    showLoading('Mengaktifkan darurat...');

    // Step 1: Start camera recording (waits for 30 seconds)
    await startEmergencyRecording();

    // Step 2: Get location
    const location = await getCurrentLocation();

    // Step 3: Save to history
    saveEmergencyToHistory(location);

    // Step 4: Send notifications (simulated)
    await sendEmergencyNotifications(location);

    hideLoading();

    // Step 5: Show success notification AFTER everything is done
    showEmergencySuccess(location);
}

async function startEmergencyRecording() {
    return new Promise((resolve) => {
        openModal(DOM.cameraModal);

        // Simplified constraints for maximum compatibility
        const constraints = {
            video: true,  // Just request video, browser will use best settings
            audio: true   // Request audio
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('Camera access granted!');
                AppState.cameraStream = stream;
                const video = document.getElementById('cameraPreview');
                if (video) {
                    video.srcObject = stream;
                    video.play().catch(e => console.log('Video play error:', e));
                }

                // Start recording - use simplest possible options
                let mediaRecorder;
                try {
                    // Try with no options first (let browser decide)
                    mediaRecorder = new MediaRecorder(stream);
                    console.log('MediaRecorder created with default settings');
                } catch (e) {
                    console.error('MediaRecorder error:', e);
                    showToast('Perangkat tidak support rekaman video', 3000);
                    stopCamera();
                    resolve();
                    return;
                }

                AppState.mediaRecorder = mediaRecorder;
                AppState.recordedChunks = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        AppState.recordedChunks.push(e.data);
                        console.log('Chunk recorded:', e.data.size, 'bytes');
                    }
                };

                mediaRecorder.onstop = () => {
                    console.log('Recording stopped, total chunks:', AppState.recordedChunks.length);
                    if (AppState.recordedChunks.length > 0) {
                        const blob = new Blob(AppState.recordedChunks, { type: 'video/webm' });
                        console.log('Video blob created:', blob.size, 'bytes');
                        saveEmergencyVideo(blob);
                    } else {
                        console.error('No video data recorded');
                        showToast('Rekaman gagal, tidak ada data', 2000);
                    }
                    stopCamera();
                    resolve();
                };

                mediaRecorder.onerror = (e) => {
                    console.error('MediaRecorder error:', e);
                    showToast('Error saat merekam', 2000);
                    stopCamera();
                    resolve();
                };

                try {
                    mediaRecorder.start(1000); // Collect data every second
                    AppState.isRecording = true;
                    document.getElementById('recordingIndicator')?.classList.remove('hidden');
                    console.log('Recording started!');

                    // Record for 30 seconds
                    let timeLeft = 30;
                    const timerElement = document.getElementById('cameraTimer');
                    if (timerElement) timerElement.textContent = timeLeft;

                    const timerInterval = setInterval(() => {
                        timeLeft--;
                        if (timerElement) timerElement.textContent = timeLeft;
                        console.log('Time left:', timeLeft);

                        if (timeLeft <= 0) {
                            clearInterval(timerInterval);
                            console.log('Time up! Stopping recording...');
                            if (mediaRecorder.state !== 'inactive') {
                                mediaRecorder.stop();
                            }
                            AppState.isRecording = false;
                            document.getElementById('recordingIndicator')?.classList.add('hidden');
                        }
                    }, 1000);
                } catch (e) {
                    console.error('Start recording error:', e);
                    showToast('Gagal memulai rekaman', 2000);
                    stopCamera();
                    resolve();
                }
            })
            .catch(err => {
                console.error('Camera access error:', err);
                console.error('Error name:', err.name);
                console.error('Error message:', err.message);

                let errorMsg = 'Kamera tidak bisa diakses. ';

                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    errorMsg += 'Izinkan akses kamera & mikrofon di browser!';
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    errorMsg += 'Kamera tidak ditemukan!';
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    errorMsg += 'Kamera sedang digunakan aplikasi lain!';
                } else {
                    errorMsg += err.message;
                }

                showToast(errorMsg, 5000);
                closeModal(DOM.cameraModal);
                resolve();
            });
    });
}

function stopCamera() {
    if (AppState.cameraStream) {
        AppState.cameraStream.getTracks().forEach(track => track.stop());
        AppState.cameraStream = null;
    }
    if (AppState.mediaRecorder && AppState.mediaRecorder.state !== 'inactive') {
        AppState.mediaRecorder.stop();
    }
    AppState.isRecording = false;
    closeModal(DOM.cameraModal);
}

function switchCamera() {
    AppState.facingMode = AppState.facingMode === 'user' ? 'environment' : 'user';

    if (AppState.cameraStream) {
        stopCamera();
        setTimeout(() => {
            startCameraPreview();
        }, 500);
    }
    showToast(`Switching to ${AppState.facingMode === 'user' ? 'front' : 'back'} camera`, 2000);
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
        saveEvidence({
            type: 'photo',
            blob: blob,
            timestamp: new Date(),
            source: 'emergency'
        });
        showToast('Foto tersimpan!', 2000);
    }, 'image/jpeg', 0.95);
}

function saveEmergencyVideo(blob) {
    console.log('Saving emergency video...');
    console.log('Original blob size:', blob.size, 'bytes');
    console.log('Original blob type:', blob.type);

    // Ensure blob has proper MIME type
    let videoBlob = blob;
    if (!blob.type || blob.type === '') {
        console.log('Blob has no type, setting to video/webm');
        videoBlob = new Blob([blob], { type: 'video/webm' });
    }

    // Create object URL for the video
    const videoUrl = URL.createObjectURL(videoBlob);
    console.log('Video URL created:', videoUrl);

    const evidence = {
        id: 'evid_' + Date.now(),
        type: 'video',
        blob: videoBlob,
        url: videoUrl,
        timestamp: new Date(),
        duration: 30,
        source: 'emergency',
        location: null,
        mimeType: videoBlob.type
    };

    EvidenceStorage.push(evidence);
    AppState.evidenceList.push(evidence);

    console.log('Emergency video saved in Memory');

    renderEvidenceGallery(); // Update UI

    // Save to Persistent DB
    KalkuDB.saveEvidence(evidence).then(() => {
        console.log('Emergency Video PERSISTED to Database!');
    }).catch(err => console.error('DB Save Failed:', err));

    saveUserData();

    // Show feedback to user
    showToast('Video darurat tersimpan!', 2000);
}

async function getCurrentLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        address: 'Surabaya, East Java, ID'
                    });
                },
                (error) => {
                    console.error('Location error:', error);
                    resolve({
                        lat: -7.2575,
                        lng: 112.7521,
                        address: 'Surabaya, East Java, ID'
                    });
                }
            );
        } else {
            resolve({
                lat: -7.2575,
                lng: 112.7521,
                address: 'Surabaya, East Java, ID'
            });
        }
    });
}

async function sendEmergencyNotifications(location) {
    // Simulate sending notifications
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Emergency notifications sent');
            console.log('Police notified');
            console.log('Emergency contacts notified');
            console.log('Location shared:', location);
            resolve();
        }, 2000);
    });
}

function saveEmergencyToHistory(location) {
    const emergency = {
        id: 'emerg_' + Date.now(),
        timestamp: new Date(),
        location: location,
        videoRecorded: true,
        notificationsSent: true
    };

    AppState.emergencyHistory.push(emergency);
    console.log('Emergency saved to history:', emergency);
    saveUserData();
}

function showEmergencySuccess(location) {
    document.getElementById('notifLocation').textContent = location.address;
    openModal(DOM.emergencyNotification);
}

// ============================================================
// 10. DASHBOARD MANAGEMENT
// ============================================================
function initializeDashboard() {
    // Exit button
    DOM.dashboardExit?.addEventListener('click', closeDashboard);

    // Panic button
    DOM.panicButton?.addEventListener('click', activateEmergency);

    // Tab navigation
    const dashTabs = document.querySelectorAll('.dash-tab');
    dashTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchDashboardTab(tabName);
        });
    });

    // Profile form
    document.getElementById('profileForm')?.addEventListener('submit', saveProfile);
    document.getElementById('photoUpload')?.addEventListener('change', handlePhotoUpload);

    // PIN form
    document.getElementById('pinForm')?.addEventListener('submit', savePIN);
}

function openDashboard() {
    DOM.dashboardContainer?.classList.remove('hidden');
    loadDashboardData();
    showToast('Selamat datang di Dashboard', 2000);
}

function closeDashboard() {
    DOM.dashboardContainer?.classList.add('hidden');
}

function switchDashboardTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.dash-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.dash-panel').forEach(panel => panel.classList.remove('active'));

    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`tab${capitalize(tabName)}`)?.classList.add('active');

    // Load specific tab data
    if (tabName === 'evidence') {
        renderEvidenceGallery();
    } else if (tabName === 'history') {
        renderEmergencyHistory();
    }
}

function loadDashboardData() {
    // Load user profile
    document.getElementById('fullName').value = UserDB.profile.name || '';
    document.getElementById('phoneNumber').value = UserDB.profile.phone || '';

    // Load emergency contacts
    UserDB.profile.emergencyContacts.forEach((contact, i) => {
        const nameInput = document.getElementById(`contact${i + 1}Name`);
        const phoneInput = document.getElementById(`contact${i + 1}Phone`);
        if (nameInput) nameInput.value = contact.name || '';
        if (phoneInput) phoneInput.value = contact.phone || '';
    });

    // Load photo
    if (UserDB.profile.photo) {
        const img = document.getElementById('profilePhotoImg');
        if (img) {
            img.src = UserDB.profile.photo;
            img.style.display = 'block';
        }
        const placeholder = document.querySelector('.profile-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    }

    // Load PIN
    const pinInput = document.getElementById('pinInput');
    if (pinInput) pinInput.value = AppState.pin;

    // Update user badge
    updateUserBadge();

    // Load evidence
    renderEvidenceGallery();

    // Load history
    renderEmergencyHistory();
}

function saveProfile(e) {
    e.preventDefault();

    UserDB.profile.name = document.getElementById('fullName').value;
    UserDB.profile.phone = document.getElementById('phoneNumber').value;

    UserDB.profile.emergencyContacts = [
        {
            name: document.getElementById('contact1Name').value,
            phone: document.getElementById('contact1Phone').value
        },
        {
            name: document.getElementById('contact2Name').value,
            phone: document.getElementById('contact2Phone').value
        },
        {
            name: document.getElementById('contact3Name').value,
            phone: document.getElementById('contact3Phone').value
        }
    ];

    saveUserData();
    updateUserBadge();
    showToast('Profil tersimpan!', 2000);
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            UserDB.profile.photo = event.target.result;
            const img = document.getElementById('profilePhotoImg');
            if (img) {
                img.src = event.target.result;
                img.style.display = 'block';
            }
            const placeholder = document.querySelector('.profile-placeholder');
            if (placeholder) placeholder.style.display = 'none';
            saveUserData();
        };
        reader.readAsDataURL(file);
    }
}

function savePIN(e) {
    e.preventDefault();
    const newPin = document.getElementById('pinInput').value;
    if (newPin.length === 3 && /^\d+$/.test(newPin)) {
        AppState.pin = newPin;
        saveUserData();
        showToast('PIN tersimpan!', 2000);
    } else {
        showToast('PIN harus 3 digit angka', 2000);
    }
}

function updateUserBadge() {
    const badge = document.getElementById('userBadge');
    const userName = document.getElementById('dashUserName');

    if (badge) {
        if (AppState.isPremium) {
            badge.innerHTML = '<span class="badge-icon"></span><span class="badge-text">PRO</span>';
        } else {
            badge.innerHTML = '<span class="badge-icon"></span><span class="badge-text">FREE</span>';
        }
    }

    if (userName) {
        userName.textContent = UserDB.profile.name || 'Pengguna';
    }
}

// ============================================================
// 11. EVIDENCE MANAGEMENT
// ============================================================
function initializeEvidence() {
    // Upload buttons
    DOM.takePhoto?.addEventListener('click', () => openCameraForPhoto());
    DOM.recordVideo?.addEventListener('click', () => openCameraForVideo());
    DOM.recordAudio?.addEventListener('click', () => recordAudio());
    DOM.uploadFile?.addEventListener('change', handleFileUpload);

    // Filter buttons
    const filterBtns = document.querySelectorAll('.evidence-filter .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            filterEvidence(filter);
        });
    });
}

function openCameraForPhoto() {
    openModal(DOM.cameraModal);
    startCameraPreview();
}

function openCameraForVideo() {
    openModal(DOM.cameraModal);
    startCameraPreview();
    // Auto-start recording after 1 second
    setTimeout(() => {
        if (AppState.cameraStream) {
            startVideoRecording();
        }
    }, 1000);
}

function startCameraPreview() {
    // Simplified constraints
    const constraints = {
        video: true,
        audio: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            console.log('✅ Camera preview started');
            AppState.cameraStream = stream;
            const video = document.getElementById('cameraPreview');
            if (video) {
                video.srcObject = stream;
                video.play().catch(e => console.log('Video play error:', e));
            }
        })
        .catch(err => {
            console.error('Camera preview error:', err);
            let errorMsg = '❌ Kamera tidak bisa diakses. ';

            if (err.name === 'NotAllowedError') {
                errorMsg += 'Izinkan akses kamera & mikrofon!';
            } else {
                errorMsg += err.message;
            }

            showToast(errorMsg, 3000);
            closeModal(DOM.cameraModal);
        });
}

function startVideoRecording() {
    if (!AppState.cameraStream) {
        showToast('❌ Kamera belum aktif', 2000);
        return;
    }

    // Use simplest MediaRecorder settings
    let mediaRecorder;
    try {
        mediaRecorder = new MediaRecorder(AppState.cameraStream);
        console.log('✅ Manual recording MediaRecorder created');
    } catch (e) {
        console.error('MediaRecorder error:', e);
        showToast('❌ Perangkat tidak support rekaman', 2000);
        return;
    }

    AppState.mediaRecorder = mediaRecorder;
    AppState.recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
            AppState.recordedChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = () => {
        if (AppState.recordedChunks.length > 0) {
            const blob = new Blob(AppState.recordedChunks, { type: 'video/webm' });
            saveEvidence({
                type: 'video',
                blob: blob,
                timestamp: new Date(),
                duration: 30,
                source: 'manual'
            });
            showToast('🎥 Video tersimpan!', 2000);
            renderEvidenceGallery();
        }
        stopCamera();
    };

    mediaRecorder.start(1000);
    AppState.isRecording = true;
    document.getElementById('recordingIndicator')?.classList.remove('hidden');

    // Record for 30 seconds
    let timeLeft = 30;
    document.getElementById('cameraTimer').textContent = timeLeft;

    const timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('cameraTimer').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            AppState.isRecording = false;
            document.getElementById('recordingIndicator')?.classList.add('hidden');
        }
    }, 1000);
}

function recordAudio() {
    showToast('🎤 Fitur rekam audio sedang dalam pengembangan', 2000);
}

function handleFileUpload(e) {
    const files = e.target.files;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileType = getFileType(file.type);
            saveEvidence({
                type: fileType,
                blob: file,
                url: event.target.result,
                timestamp: new Date(),
                source: 'upload',
                fileName: file.name
            });
            showToast(`📁 ${file.name} tersimpan!`, 2000);
            renderEvidenceGallery();
        };
        reader.readAsDataURL(file);
    });
}

function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
}

function saveEvidence(evidenceData) {
    console.log('💾 Saving evidence:', evidenceData.type);

    // Handle video blob MIME type
    let processedData = { ...evidenceData };
    if (evidenceData.type === 'video' && evidenceData.blob) {
        console.log('Video blob size:', evidenceData.blob.size);
        console.log('Video blob type:', evidenceData.blob.type);

        // Ensure blob has proper MIME type
        if (!evidenceData.blob.type || evidenceData.blob.type === '') {
            console.log('⚠️ Video blob has no type, setting to video/webm');
            processedData.blob = new Blob([evidenceData.blob], { type: 'video/webm' });
        }

        // Create URL if not provided
        if (!evidenceData.url) {
            processedData.url = URL.createObjectURL(processedData.blob);
            console.log('✅ Video URL created:', processedData.url);
        }

        processedData.mimeType = processedData.blob.type;
    }

    const evidence = {
        id: 'evid_' + Date.now(),
        ...processedData,
        url: processedData.url || (processedData.blob ? URL.createObjectURL(processedData.blob) : null)
    };

    EvidenceStorage.push(evidence);
    AppState.evidenceList.push(evidence);

    console.log('✅ Evidence saved in Memory:', evidence.id);
    console.log('Total evidence count:', EvidenceStorage.length);

    // Save properly to IndexedDB (Persistence)
    KalkuDB.saveEvidence(evidence).then(() => {
        console.log('💾 Evidence PERSISTED to Database!');
    }).catch(err => console.error('❌ DB Save Failed:', err));

    saveUserData(); // Save metadata too
}

function renderEvidenceGallery() {
    const grid = DOM.evidenceGrid;
    if (!grid) return;

    if (EvidenceStorage.length === 0) {
        grid.innerHTML = `
      <div class="empty-evidence">
        <div class="empty-icon"></div>
        <p>Belum ada bukti tersimpan</p>
        <small>Mulai dengan menambahkan foto, video, atau dokumen</small>
      </div>
    `;
        return;
    }

    grid.innerHTML = EvidenceStorage.map(evidence => `
    <div class="evidence-item" onclick="viewEvidence('${evidence.id}')">
      <div class="evidence-thumbnail">
        ${evidence.type === 'video' ? 'VIDEO' : evidence.type === 'photo' ? 'FOTO' : evidence.type === 'audio' ? 'AUDIO' : 'DOC'}
      </div>
      <div class="evidence-info">
        <div class="evidence-type">${evidence.type}</div>
        <div class="evidence-date">${formatDate(evidence.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function filterEvidence(filter) {
    const grid = DOM.evidenceGrid;
    if (!grid) return;

    const filtered = filter === 'all' ? EvidenceStorage : EvidenceStorage.filter(e => e.type === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
      <div class="empty-evidence">
        <div class="empty-icon"></div>
        <p>Tidak ada bukti dalam kategori ini</p>
      </div>
    `;
        return;
    }

    grid.innerHTML = filtered.map(evidence => `
    <div class="evidence-item" onclick="viewEvidence('${evidence.id}')">
      <div class="evidence-thumbnail">
        ${evidence.type === 'video' ? 'VIDEO' : evidence.type === 'photo' ? 'FOTO' : evidence.type === 'audio' ? 'AUDIO' : 'DOC'}
      </div>
      <div class="evidence-info">
        <div class="evidence-type">${evidence.type}</div>
        <div class="evidence-date">${formatDate(evidence.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function viewEvidence(id) {
    const evidence = EvidenceStorage.find(e => e.id === id);
    if (!evidence) {
        console.error('Evidence not found:', id);
        showToast('Bukti tidak ditemukan', 2000);
        return;
    }

    console.log('Viewing evidence:', evidence);
    AppState.currentEvidenceId = id;

    const viewerContent = document.getElementById('viewerContent');
    const viewerTitle = document.getElementById('viewerTitle');
    const viewerMeta = document.getElementById('viewerMeta');

    if (viewerTitle) viewerTitle.textContent = `Bukti ${evidence.type}`;

    if (viewerContent) {
        // Clear previous content first
        viewerContent.innerHTML = '';

        if (evidence.type === 'video') {
            const video = document.createElement('video');
            video.controls = true;
            video.style.width = '100%';
            video.style.maxHeight = '70vh';
            video.style.borderRadius = '10px';
            video.style.background = '#000';
            video.style.zIndex = '9999';
            video.style.position = 'relative';

            // Set src directly
            video.src = evidence.url;

            video.onerror = (e) => {
                console.error('Video playback error:', e);
                viewerContent.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <p style="color: #ff416c; font-size: 18px;">Video tidak bisa diputar</p>
                        <p style="color: #666; margin-top: 10px;">Error: ${video.error ? video.error.message : 'Unknown error'}</p>
                        <p style="color: #666; margin-top: 10px;">Coba download video untuk memutar di aplikasi lain</p>
                    </div>
                `;
            };

            // Append video to viewerContent
            viewerContent.appendChild(video);

        } else if (evidence.type === 'photo') {
            viewerContent.innerHTML = `
                <img src="${evidence.url}" alt="Evidence" style="max-width: 100%; max-height: 70vh; border-radius: 10px;">
            `;
        } else if (evidence.type === 'audio') {
            viewerContent.innerHTML = `
                <audio controls autoplay style="width: 100%;">
                    <source src="${evidence.url}" type="audio/webm">
                    Your browser does not support audio playback.
                </audio>
            `;
        } else {
            viewerContent.innerHTML = `
                <iframe src="${evidence.url}" width="100%" height="500px" style="border: none; border-radius: 10px;"></iframe>
            `;
        }
    }

    if (viewerMeta) {
        viewerMeta.innerHTML = `
            <p><strong>Tipe:</strong> ${evidence.type}</p>
            <p><strong>Waktu:</strong> ${formatDateTime(evidence.timestamp)}</p>
            <p><strong>Sumber:</strong> ${evidence.source === 'emergency' ? 'Emergency Recording' : evidence.source === 'manual' ? 'Manual Recording' : 'Upload'}</p>
            ${evidence.location ? `<p><strong>Lokasi:</strong> ${evidence.location.address}</p>` : ''}
            ${evidence.duration ? `<p><strong>Durasi:</strong> ${evidence.duration} detik</p>` : ''}
            ${evidence.blob ? `<p><strong>Ukuran:</strong> ${(evidence.blob.size / 1024).toFixed(2)} KB</p>` : ''}
        `;
    }

    openModal(DOM.evidenceViewer);
}

function downloadCurrentEvidence() {
    if (!AppState.currentEvidenceId) return;

    const evidence = EvidenceStorage.find(e => e.id === AppState.currentEvidenceId);
    if (!evidence) return;

    const a = document.createElement('a');
    a.href = evidence.url;
    a.download = evidence.fileName || `evidence_${evidence.id}.${evidence.type === 'video' ? 'webm' : evidence.type === 'photo' ? 'jpg' : 'file'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast('Bukti berhasil diunduh!', 2000);
}

function shareCurrentEvidence() {
    if (!AppState.currentEvidenceId) return;

    const evidence = EvidenceStorage.find(e => e.id === AppState.currentEvidenceId);
    if (!evidence) return;

    if (navigator.share) {
        navigator.share({
            title: `Bukti ${evidence.type}`,
            text: `Bukti dari KalkuLaw - ${formatDateTime(evidence.timestamp)}`,
            url: evidence.url
        }).then(() => {
            showToast('Bukti berhasil dibagikan!', 2000);
        }).catch(err => {
            console.error('Share error:', err);
            showToast('Gagal membagikan', 2000);
        });
    } else {
        showToast('Fitur share tidak tersedia di browser ini', 2000);
    }
}

function deleteCurrentEvidence() {
    if (!AppState.currentEvidenceId) return;

    if (confirm('Yakin ingin menghapus bukti ini?')) {
        const index = EvidenceStorage.findIndex(e => e.id === AppState.currentEvidenceId);
        if (index > -1) {
            EvidenceStorage.splice(index, 1);
            const listIndex = AppState.evidenceList.findIndex(e => e.id === AppState.currentEvidenceId);
            if (listIndex > -1) {
                AppState.evidenceList.splice(listIndex, 1);
            }
            saveUserData();
            closeModal(DOM.evidenceViewer);
            renderEvidenceGallery();
            showToast('Bukti berhasil dihapus', 2000);
        }
    }
}

// ============================================================
// 12. PREMIUM FEATURES
// ============================================================
function initializePremium() {
    // Premium Modal
    document.getElementById('premiumClose')?.addEventListener('click', () => closeModal(DOM.premiumModal));
    document.getElementById('premiumOverlay')?.addEventListener('click', () => closeModal(DOM.premiumModal));
    document.getElementById('buyPremium')?.addEventListener('click', purchasePremium);
    document.getElementById('premiumLater')?.addEventListener('click', () => closeModal(DOM.premiumModal));

    // Upgrade button
    DOM.upgradeButton?.addEventListener('click', () => openModal(DOM.premiumModal));

    // Check premium status and update UI
    updatePremiumUI();

    // AI Document
    const docTypeBtns = document.querySelectorAll('.doc-type-btn');
    docTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!AppState.isPremium) {
                openModal(DOM.premiumModal);
                return;
            }
            const docType = btn.getAttribute('data-doc');
            showDocumentForm(docType);
        });
    });

    document.getElementById('aiDocForm')?.addEventListener('submit', generateDocument);

    // Chatbot
    document.getElementById('chatSend')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!AppState.isPremium) {
                openModal(DOM.premiumModal);
                return;
            }
            const query = btn.getAttribute('data-query');
            document.getElementById('chatInput').value = query;
            sendChatMessage();
        });
    });
}

function updatePremiumUI() {
    const aiLock = document.getElementById('aiLock');
    const aiContent = document.getElementById('aiContent');
    const chatbotLock = document.getElementById('chatbotLock');
    const chatbotContent = document.getElementById('chatbotContent');
    const psychologistLock = document.getElementById('psychologistLock');
    const psychologistList = document.getElementById('psychologistList');
    const lawyerLock = document.getElementById('lawyerLock');
    const lawyerList = document.getElementById('lawyerList');

    if (AppState.isPremium) {
        if (aiLock) aiLock.classList.add('hidden');
        if (aiContent) aiContent.classList.remove('hidden');
        if (chatbotLock) chatbotLock.classList.add('hidden');
        if (chatbotContent) chatbotContent.classList.remove('hidden');
        if (psychologistLock) psychologistLock.classList.add('hidden');
        if (psychologistList) psychologistList.classList.remove('hidden');
        if (lawyerLock) lawyerLock.classList.add('hidden');
        if (lawyerList) lawyerList.classList.remove('hidden');
    } else {
        if (aiLock) aiLock.classList.remove('hidden');
        if (aiContent) aiContent.classList.add('hidden');
        if (chatbotLock) chatbotLock.classList.remove('hidden');
        if (chatbotContent) chatbotContent.classList.add('hidden');
        if (psychologistLock) psychologistLock.classList.remove('hidden');
        if (psychologistList) psychologistList.classList.add('hidden');
        if (lawyerLock) lawyerLock.classList.remove('hidden');
        if (lawyerList) lawyerList.classList.add('hidden');
    }
}

function purchasePremium() {
    showLoading('Memproses pembayaran...');

    // Simulate payment
    setTimeout(() => {
        AppState.isPremium = true;
        saveUserData();
        updatePremiumUI();
        updateUserBadge();
        hideLoading();
        closeModal(DOM.premiumModal);
        showToast('Selamat! Anda sekarang pengguna PRO', 3000);
    }, 2000);
}

function showDocumentForm(docType) {
    const documentForm = document.getElementById('documentForm');
    const docFormTitle = document.getElementById('docFormTitle');
    const documentTypes = document.querySelector('.document-types');

    if (documentTypes) documentTypes.classList.add('hidden');
    if (documentForm) documentForm.classList.remove('hidden');

    const titles = {
        'police-report': 'Form Laporan Polisi',
        'lawsuit': 'Form Surat Gugatan',
        'power-letter': 'Form Surat Kuasa',
        'restraining-order': 'Form Restraining Order'
    };

    if (docFormTitle) docFormTitle.textContent = titles[docType] || 'Form Dokumen';
}

function generateDocument(e) {
    e.preventDefault();

    const docTitle = document.getElementById('docTitle').value;
    const docDescription = document.getElementById('docDescription').value;
    const docTime = document.getElementById('docTime').value;
    const docLocation = document.getElementById('docLocation').value;

    showLoading('Generating dokumen...');

    // Simulate AI generation
    setTimeout(() => {
        const documentResult = document.getElementById('documentResult');
        const docPreview = document.getElementById('docPreview');
        const documentForm = document.getElementById('documentForm');

        if (documentForm) documentForm.classList.add('hidden');
        if (documentResult) documentResult.classList.remove('hidden');

        const generatedDoc = `
LAPORAN POLISI
=================

ID Laporan: ${generateCaseId()}
Tanggal: ${formatDateTime(new Date())}

IDENTITAS PELAPOR:
Nama: ${UserDB.profile.name || 'Tidak diisi'}
No. HP: ${UserDB.profile.phone || 'Tidak diisi'}

JUDUL KASUS:
${docTitle}

KRONOLOGI KEJADIAN:
${docDescription}

WAKTU KEJADIAN:
${new Date(docTime).toLocaleString('id-ID')}

LOKASI KEJADIAN:
${docLocation}

BUKTI YANG DISERTAKAN:
${EvidenceStorage.map((e, i) => `${i + 1}. ${e.type} - ${formatDateTime(e.timestamp)}`).join('\n')}

TINDAKAN YANG DIHARAPKAN:
Pemrosesan hukum sesuai UU No. 23 Tahun 2004 tentang Penghapusan Kekerasan Dalam Rumah Tangga.

Surat ini dibuat dengan sebenarnya dan dapat dipertanggungjawabkan secara hukum.

[TTD Digital]
${UserDB.profile.name || 'Pelapor'}
    `;

        if (docPreview) docPreview.textContent = generatedDoc;

        hideLoading();
        showToast('Dokumen berhasil di-generate!', 2000);
    }, 2000);
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatInput || !chatMessages) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = `
    <div class="message-avatar">User</div>
    <div class="message-bubble">
      <p>${message}</p>
    </div>
  `;
    chatMessages.appendChild(userMsg);

    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
        botMsg.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="message-bubble">
        <p>${generateBotResponse(message)}</p>
      </div>
    `;
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

function generateBotResponse(query) {
    const responses = {
        'laporan polisi': 'Untuk membuat laporan polisi, Anda bisa menggunakan fitur AI Dokumen Pintar di tab AI. Saya akan membantu Anda mengisi formulir secara otomatis.',
        'psikolog': 'Berikut adalah beberapa psikolog terverifikasi yang bisa membantu Anda:\n\n1. Dr. Sarah Melinda, M.Psi - Spesialis Trauma & KDRT\n2. Dra. Rina Wati, Psi - Konseling Keluarga\n\nKlik tab "Bantuan" untuk booking konsultasi.',
        'pengacara': 'Kami bekerja sama dengan LBH APIK yang menyediakan bantuan hukum gratis untuk korban KDRT. Anda juga bisa konsultasi dengan pengacara spesialis lainnya melalui tab "Bantuan".',
        'darurat': 'Jika Anda dalam keadaan darurat, segera tekan 110= di kalkulator untuk memanggil polisi dan merekam bukti otomatis. Video 30 detik akan dikirim ke polisi dan kontak darurat Anda.'
    };

    for (let key in responses) {
        if (query.toLowerCase().includes(key)) {
            return responses[key];
        }
    }

    return 'Terima kasih atas pertanyaan Anda. Saya adalah asisten KalkuLaw yang siap membantu Anda terkait KDRT, bukti digital, dan bantuan hukum. Ada yang bisa saya bantu?';
}

// ============================================================
// 13. ADMIN PANEL
// ============================================================
function initializeAdmin() {
    // Admin Login
    document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
    document.getElementById('adminLoginClose')?.addEventListener('click', () => closeModal(DOM.adminLoginModal));

    // Admin Logout
    DOM.adminLogout?.addEventListener('click', handleAdminLogout);

    // Admin Navigation
    const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
    adminNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-admin-tab');
            switchAdminTab(tab);
        });
    });
}

function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;

    if (username === AdminCredentials.username && password === AdminCredentials.password) {
        closeModal(DOM.adminLoginModal);
        openAdminPanel();
        showToast('Login berhasil!', 2000);
    } else {
        showToast('Username atau password salah', 2000);
    }
}

function handleAdminLogout() {
    closeAdminPanel();
    showToast('Logout berhasil', 2000);
}

function openAdminPanel() {
    if (DOM.adminPanel) {
        DOM.adminPanel.classList.remove('hidden');
        loadAdminData();
    }
}

function closeAdminPanel() {
    if (DOM.adminPanel) {
        DOM.adminPanel.classList.add('hidden');
    }
}

function switchAdminTab(tabName) {
    // Remove active class
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));

    // Add active class
    document.querySelector(`[data-admin-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`admin${capitalize(tabName)}`)?.classList.add('active');

    // Load specific data
    if (tabName === 'users') {
        loadAdminUsers();
    } else if (tabName === 'evidence') {
        loadAdminEvidence();
    } else if (tabName === 'emergencies') {
        loadAdminEmergencies();
    }
}

function loadAdminData() {
    // Update statistics
    document.getElementById('statTotalUsers').textContent = '1';
    document.getElementById('statEmergencies').textContent = AppState.emergencyHistory.length;
    document.getElementById('statEvidence').textContent = EvidenceStorage.length;
    document.getElementById('statPremium').textContent = AppState.isPremium ? '1' : '0';

    loadAdminUsers();
}

function loadAdminUsers() {
    const tbody = document.getElementById('adminUsersTable');
    if (!tbody) return;

    tbody.innerHTML = `
    <tr>
      <td>USER_001</td>
      <td>${UserDB.profile.name || 'Anonymous'}</td>
      <td>${UserDB.profile.phone || '-'}</td>
      <td>${AppState.isPremium ? '<span style="color: #ffd700;">PREMIUM</span>' : '<span style="color: #6c757d;">FREE</span>'}</td>
      <td>${formatDateTime(new Date())}</td>
      <td>
        <button onclick="viewUserDetail('USER_001')" style="padding: 5px 10px; cursor: pointer;">Detail</button>
      </td>
    </tr>
  `;
}

function loadAdminEvidence() {
    const grid = document.getElementById('adminEvidenceGrid');
    if (!grid) return;

    if (EvidenceStorage.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6c757d;">Belum ada bukti</p>';
        return;
    }

    grid.innerHTML = EvidenceStorage.map(evidence => `
    <div class="evidence-item" onclick="viewEvidence('${evidence.id}')">
      <div class="evidence-thumbnail">
        ${evidence.type === 'video' ? 'VIDEO' : evidence.type === 'photo' ? 'FOTO' : evidence.type === 'audio' ? 'AUDIO' : 'DOC'}
      </div>
      <div class="evidence-info">
        <div class="evidence-type">${evidence.type}</div>
        <div class="evidence-date">${formatDate(evidence.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function loadAdminEmergencies() {
    const list = document.getElementById('adminEmergencyList');
    if (!list) return;

    if (AppState.emergencyHistory.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #6c757d;">Belum ada emergency log</p>';
        return;
    }

    list.innerHTML = AppState.emergencyHistory.map(emergency => `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #ff416c; margin-bottom: 15px;">
      <h4>Emergency - ${emergency.id}</h4>
      <p><strong>Waktu:</strong> ${formatDateTime(emergency.timestamp)}</p>
      <p><strong>Lokasi:</strong> ${emergency.location.address}</p>
      <p><strong>Video:</strong> ${emergency.videoRecorded ? 'Terekam' : 'Tidak terekam'}</p>
      <p><strong>Notifikasi:</strong> ${emergency.notificationsSent ? 'Terkirim' : 'Gagal'}</p>
    </div>
  `).join('');
}

function viewUserDetail(userId) {
    alert(`Detail user ${userId}:\n\nNama: ${UserDB.profile.name || 'Anonymous'}\nPhone: ${UserDB.profile.phone || '-'}\nStatus: ${AppState.isPremium ? 'Premium' : 'Free'}\nEvidence: ${EvidenceStorage.length} file\nEmergencies: ${AppState.emergencyHistory.length} kali`);
}

// ============================================================
// 14. HISTORY
// ============================================================
function renderEmergencyHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (AppState.emergencyHistory.length === 0) {
        historyList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"></div>
        <p>Belum ada riwayat emergency</p>
      </div>
    `;
        return;
    }

    historyList.innerHTML = AppState.emergencyHistory.map(emergency => `
    <div class="history-item">
      <h4>Emergency - ${emergency.id}</h4>
      <p><strong>Waktu:</strong> ${formatDateTime(emergency.timestamp)}</p>
      <p><strong>Lokasi:</strong> ${emergency.location.address}</p>
      <p><strong>GPS:</strong> ${emergency.location.lat}, ${emergency.location.lng}</p>
      <p><strong>Video:</strong> ${emergency.videoRecorded ? 'Terekam' : 'Tidak terekam'}</p>
      <p><strong>Notifikasi:</strong> ${emergency.notificationsSent ? 'Terkirim ke polisi & keluarga' : 'Gagal'}</p>
    </div>
  `).join('');
}

// ============================================================
// 15. UTILITY FUNCTIONS
// ============================================================
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }
}

function showLoading(message = 'Loading...') {
    const loading = document.getElementById('loadingOverlay');
    const loadingText = document.querySelector('.loading-text');

    if (loading) {
        loading.classList.remove('hidden');
        if (loadingText) loadingText.textContent = message;
    }
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.classList.add('hidden');
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateCaseId() {
    return 'CASE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ============================================================
// 16. LOCAL STORAGE
// ============================================================
function saveUserData() {
    const data = {
        profile: UserDB.profile,
        pin: AppState.pin,
        isPremium: AppState.isPremium,
        isLightMode: AppState.isLightMode,
        emergencyHistory: AppState.emergencyHistory,
        // Note: Can't save blobs to localStorage, only metadata
        evidenceMetadata: EvidenceStorage.map(e => ({
            id: e.id,
            type: e.type,
            timestamp: e.timestamp,
            source: e.source,
            duration: e.duration
        }))
    };

    try {
        localStorage.setItem('kalkulaw_data', JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save data:', e);
    }
}

function loadUserData() {
    try {
        // Load Settings from LocalStorage
        const data = localStorage.getItem('kalkulaw_data');
        if (data) {
            const parsed = JSON.parse(data);
            UserDB.profile = parsed.profile || UserDB.profile;
            AppState.pin = parsed.pin || '123';
            AppState.isPremium = parsed.isPremium || false;
            // FORCE DARK MODE ON STARTUP
            // We ignore the saved state for isLightMode to ensure it always starts in dark mode
            AppState.isLightMode = false;
            AppState.emergencyHistory = parsed.emergencyHistory || [];

            console.log('User settings loaded');
        }

        // Load Evidence from IndexedDB (Supports Blobs!)
        KalkuDB.getAllEvidence().then(evidences => {
            console.log(`Recovering ${evidences.length} items from Database...`);
            // Clear current memory to avoid duplicates if re-running
            EvidenceStorage.length = 0;

            evidences.forEach(item => {
                // Re-create URL from stored Blob if needed
                if (item.blob && (!item.url || item.url.startsWith('blob:'))) {
                    item.url = URL.createObjectURL(item.blob);
                }
                EvidenceStorage.push(item);
            });

            console.log('Evidence loaded and URLs regenerated!');
            renderEvidenceGallery();
        }).catch(err => {
            console.error('Failed to load evidence from DB:', err);
        });

    } catch (e) {
        console.error('Failed to load data:', e);
    }
}

// ============================================================
// 17. ADDITIONAL DOCUMENT HANDLERS
// ============================================================
document.getElementById('downloadPDF')?.addEventListener('click', () => {
    const docPreview = document.getElementById('docPreview');
    if (docPreview) {
        const text = docPreview.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Polisi_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Dokumen berhasil diunduh!', 2000);
    }
});

document.getElementById('downloadDOCX')?.addEventListener('click', () => {
    showToast('Fitur export DOCX sedang dalam pengembangan', 2000);
});

document.getElementById('shareDoc')?.addEventListener('click', () => {
    const docPreview = document.getElementById('docPreview');
    if (docPreview && navigator.share) {
        navigator.share({
            title: 'Dokumen KalkuLaw',
            text: docPreview.textContent
        }).then(() => {
            showToast('Dokumen berhasil dibagikan!', 2000);
        }).catch(err => {
            console.error('Share error:', err);
            showToast('Gagal membagikan', 2000);
        });
    } else {
        showToast('Fitur share tidak tersedia', 2000);
    }
});

// ============================================================
// 20. INDEXED DB HELPER (PERSISTENT STORAGE)
// ============================================================
const KalkuDB = {
    dbName: 'KalkuLawDB',
    version: 1,
    db: null,

    async init() {
        if (this.db) return this.db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (e) => {
                console.error("DB Error:", e);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('evidence')) {
                    db.createObjectStore('evidence', { keyPath: 'id' });
                }
            };
        });
    },

    async saveEvidence(evidence) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['evidence'], 'readwrite');
            const store = transaction.objectStore('evidence');
            // Store the plain object (IndexedDB handles Blobs automatically!)
            const request = store.put(evidence);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAllEvidence() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['evidence'], 'readonly');
            const store = transaction.objectStore('evidence');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
};

// ============================================================
// 18. MAKE FUNCTIONS GLOBALLY ACCESSIBLE
// ============================================================
window.viewEvidence = viewEvidence;
window.viewUserDetail = viewUserDetail;

// ============================================================
// 19. CONSOLE WELCOME MESSAGE
// ============================================================
console.log(`
  KALKULAW v2.0 - INITIALIZED
  Emergency & Evidence Management

  Features Available:
  - Calculator (Stealth Mode)
  - Emergency 110 (1 1 0 =)
  - Fake Call (pi pi =)
  - Dashboard (5 0 5 [PIN] =)
  - Camera Recording (30s)
  - Evidence Archive
  - Premium Upgrade
  - AI Document Generator
  - Chatbot Assistant
  - Admin Panel

  Default PIN: 123
  Admin Login: admin_kalkulaw / admin123

  Light Mode REQUIRED for Emergency Features
`);