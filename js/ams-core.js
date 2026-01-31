// Academic Management System v4.2
// Main Application Module

let students = [];
let assessmentMetadata = {};
let attendanceData = {};
let batchMetadata = {};
let staffMembers = [];
let currentBatch = 'AME 37';
let currentSubBatch = 'All';

const LS_KEY = 'academic_management_students_v3';
const LS_KEY_METADATA = 'academic_management_metadata_v3';
const LS_KEY_ATTENDANCE = 'academic_management_attendance_v3';
const LS_KEY_BATCH_META = 'academic_management_batch_metadata_v3';
const LS_KEY_STAFF = 'academic_management_staff_v1';
const INITIAL_BATCH_ID = 'AME 37';

// Auth State
let currentUserRole = localStorage.getItem('user_role') || null;


// Auth Functions
window.handleLogin = async (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value.trim().toLowerCase();
    const p = document.getElementById('loginPassword').value.trim();
    const err = document.getElementById('loginError');
    const btn = e.target.querySelector('button[type="submit"]');

    // Disable button and show loading
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span> Authenticating...';
    btn.disabled = true;
    err.classList.add('hidden');

    try {
        // Check if cloud sync is configured
        if (!githubSync || !githubSync.isConfigured()) {
            throw new Error('Cloud authentication not available. Please check your connection.');
        }

        // Download latest staff data from cloud
        console.log('Fetching user credentials from cloud...');
        const cloudResult = await githubSync.downloadData();

        // Update local staff data
        if (cloudResult && cloudResult.data && cloudResult.data.staffMembers) {
            staffMembers = cloudResult.data.staffMembers;
            // Save to localStorage for offline access
            localStorage.setItem(LS_KEY_STAFF, JSON.stringify(staffMembers));
            window.activityLogger.log('Sync', 'Staff data updated from cloud', 'info');
        }

        // Find user in staff members
        const staffMember = staffMembers.find(s => s.username === u && s.password === p);

        if (staffMember) {
            // Grant role based on staff member settings
            const role = staffMember.isAdmin ? 'admin' : 'staff';
            localStorage.setItem('user_role', role);
            localStorage.setItem('logged_in_user', staffMember.name);
            localStorage.setItem('logged_in_staff_id', staffMember.id);
            window.activityLogger.log('Login', `User ${staffMember.name} logged in successfully`, 'success');
            startSession(role);
        } else {
            // Invalid credentials
            window.activityLogger.log('Login Failed', `Failed login attempt for username: ${u}`, 'warning');
            err.textContent = 'Invalid username or password';
            err.classList.remove('hidden');
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);

        // Fallback to local credentials if cloud fails
        console.log('Cloud authentication failed, checking local credentials...');
        const staffMember = staffMembers.find(s => s.username === u && s.password === p);

        if (staffMember) {
            const role = staffMember.isAdmin ? 'admin' : 'staff';
            localStorage.setItem('user_role', role);
            localStorage.setItem('logged_in_user', staffMember.name);
            localStorage.setItem('logged_in_staff_id', staffMember.id);
            window.activityLogger.log('Login', `User ${staffMember.name} logged in (Offline Mode)`, 'success');
            startSession(role);
        } else {
            window.activityLogger.log('Login Failed', `Failed login attempt (Offline) for username: ${u}`, 'warning');
            err.textContent = 'Authentication failed. Please check your internet connection.';
            err.classList.remove('hidden');
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    }
};

window.handleLogout = () => {
    localStorage.removeItem('user_role');
    window.location.reload();
};

function startSession(role) {
    currentUserRole = role;
    document.getElementById('loginModal').classList.add('hidden');

    // Update User Profile Display
    const profileDisplay = document.getElementById('userProfileDisplay');
    const nameDisplay = document.getElementById('userNameDisplay');
    const roleDisplay = document.getElementById('userRoleDisplay');
    const avatar = document.getElementById('userAvatar');

    if (profileDisplay) {
        profileDisplay.classList.remove('hidden');
        const userName = localStorage.getItem('logged_in_user') || 'User';

        if (nameDisplay) nameDisplay.textContent = userName;
        if (roleDisplay) roleDisplay.textContent = role === 'admin' ? 'Site Administrator' : 'Staff Member';

        // Initials avatar
        if (avatar) {
            const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            avatar.textContent = initials;
        }
    }

    // Update Header Welcome Message
    const headerMsg = document.getElementById('headerWelcomeMsg');
    const headerName = document.getElementById('headerUserName');
    const headerRole = document.getElementById('headerUserRole');

    if (headerMsg) {
        const userName = localStorage.getItem('logged_in_user') || 'User';
        const roleText = role === 'admin' ? '(Site Administrator)' : '(Staff Member)';

        if (headerName) headerName.textContent = userName;
        if (headerRole) headerRole.textContent = roleText;
        headerMsg.classList.remove('hidden');
    }

    applyPermissions(role);
    refreshDataAndUI();
}

function refreshDataAndUI() {
    loadData();
    calculateDashboardStats();
    renderView('dashboard');
}

function checkSession() {
    const role = localStorage.getItem('user_role');
    if (role === 'admin' || role === 'staff') {
        startSession(role);
    } else {
        document.getElementById('loginModal').classList.remove('hidden');
    }
}

function applyPermissions(role) {
    const navStudents = document.getElementById('nav-students');
    const navDocs = document.getElementById('nav-docs');
    const navStaff = document.getElementById('nav-staff');

    // Default: Show all
    if (navStudents) navStudents.classList.remove('hidden');
    if (navDocs) navDocs.classList.remove('hidden');
    if (navStaff) navStaff.classList.remove('hidden');

    if (role === 'staff') {
        // Hide permissions for staff
        if (navStudents) navStudents.classList.add('hidden');
        if (navDocs) navDocs.classList.add('hidden');
        if (navStaff) navStaff.classList.add('hidden');

        // Also hide Student Management View if active
        // Logic handled in renderView if needed, but menu hiding is main restriction
    }

    // Update Dashboard or other elements if needed based on role
}

// Data Management Functions
function loadData() {
    try {
        const storedData = localStorage.getItem(LS_KEY);
        students = storedData ? JSON.parse(storedData) : [];

        const storedMetadata = localStorage.getItem(LS_KEY_METADATA);
        assessmentMetadata = storedMetadata ? JSON.parse(storedMetadata) : {};

        const storedAttendance = localStorage.getItem(LS_KEY_ATTENDANCE);
        attendanceData = storedAttendance ? JSON.parse(storedAttendance) : {};

        const storedBatchMeta = localStorage.getItem(LS_KEY_BATCH_META);
        batchMetadata = storedBatchMeta ? JSON.parse(storedBatchMeta) : {};

        const storedStaff = localStorage.getItem(LS_KEY_STAFF);
        staffMembers = storedStaff ? JSON.parse(storedStaff) : [];

        students = students.map(s => ({
            ...s,
            id: s.id || crypto.randomUUID(),
            marks: s.marks || {},
            subBatch: s.subBatch || 'None',
            batchId: s.batchId || INITIAL_BATCH_ID
        })).sort((a, b) => {
            if (a.batchId !== b.batchId) return a.batchId.localeCompare(b.batchId);
            return a.admissionNo.localeCompare(b.admissionNo);
        });
    } catch (error) {
        console.error("Error loading data:", error);
        showMessage('Storage Error', 'Could not load data.', 'error');
    }
}

function saveData() {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(students));
        localStorage.setItem(LS_KEY_METADATA, JSON.stringify(assessmentMetadata));
        localStorage.setItem(LS_KEY_ATTENDANCE, JSON.stringify(attendanceData));
        localStorage.setItem(LS_KEY_BATCH_META, JSON.stringify(batchMetadata));
        localStorage.setItem(LS_KEY_STAFF, JSON.stringify(staffMembers));

        // Trigger auto-sync to cloud if available
        if (window.autoSyncToCloud) {
            window.autoSyncToCloud();
        }
    } catch (error) {
        console.error("Error saving:", error);
        showMessage('Storage Error', 'Browser storage full.', 'error');
    }
}

// Function to update local data from cloud download
window.updateLocalDataFromCloud = (data) => {
    if (!data) return;

    students = data.students || [];
    assessmentMetadata = data.assessmentMetadata || {};
    attendanceData = data.attendanceData || {};
    batchMetadata = data.batchMetadata || {};
    staffMembers = data.staffMembers || [];

    saveData(); // Save to local storage cache
    refreshDataAndUI();
};

// Expose data for cloud sync integration
window.getAppData = () => ({
    students,
    assessmentMetadata,
    attendanceData,
    batchMetadata,
    staffMembers
});

function refreshDataAndUI() {
    loadData();
    updateBatchDropdowns();
    const currentView = document.getElementById('mainView').dataset.currentView || 'dashboard';
    renderView(currentView);
}

// UI Helper Functions
function showMessage(title, message, type = 'error') {
    const container = document.getElementById('app');
    let existingMessage = document.getElementById('appMessage');
    if (existingMessage) existingMessage.remove();

    const bgColor = type === 'error'
        ? 'bg-red-100 border-red-500 text-red-700'
        : 'bg-green-100 border-green-500 text-green-700';

    const messageHtml = `
        <div id="appMessage" class="no-print fixed top-4 right-4 p-4 rounded-lg shadow-xl border-l-4 ${bgColor} transition-all duration-300 transform translate-x-0 z-50">
            <h4 class="font-bold">${title}</h4>
            <p class="text-sm">${message}</p>
        </div>
    `;

    container.insertAdjacentHTML('afterbegin', messageHtml);
    setTimeout(() => {
        const msg = document.getElementById('appMessage');
        if (msg) msg.remove();
    }, 5000);
}

function calculateDashboardStats() {
    const totalStudents = students.length;
    const uniqueBatches = [...new Set(students.map(s => s.batchId))].length;
    const documentCount = Object.keys(assessmentMetadata).length;

    const statsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
                <p class="text-sm text-blue-600 font-bold uppercase">Total Students</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${totalStudents}</p>
            </div>
            <div class="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                <p class="text-sm text-indigo-600 font-bold uppercase">Active Batches</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${uniqueBatches}</p>
            </div>
            <div class="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
                <p class="text-sm text-green-600 font-bold uppercase">Assessments Recorded</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${documentCount}</p>
            </div>
        </div>
    `;

    const statsContainer = document.getElementById('dashboardStats');
    if (statsContainer) statsContainer.innerHTML = statsHtml;

    // Render dashboard cards based on role
    renderDashboardCards();
}

function renderDashboardCards() {
    const cardsContainer = document.getElementById('dashboardCards');
    if (!cardsContainer) return;

    const isAdmin = currentUserRole === 'admin';

    let cardsHtml = '';

    if (isAdmin) {
        // Admin Dashboard: Attendance Register, Student Profiles, Staff Management, Recorded Assessments
        cardsHtml = `
            <div onclick="renderView('attendanceRegister')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">📅</div>
                <h3 class="font-bold group-hover:text-primary">Attendance Register</h3>
                <p class="text-xs text-gray-400">Monthly reports & printables</p>
            </div>
            <div onclick="renderView('studentManagement')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">👥</div>
                <h3 class="font-bold group-hover:text-primary">Student Profiles</h3>
                <p class="text-xs text-gray-400">Manage batches & bulk imports</p>
            </div>
            <div onclick="renderView('staffManagement')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">👔</div>
                <h3 class="font-bold group-hover:text-primary">Staff Management</h3>
                <p class="text-xs text-gray-400">Manage staff & credentials</p>
            </div>
            <div onclick="renderView('assessmentHistory')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">📂</div>
                <h3 class="font-bold group-hover:text-primary">Recorded Assessments</h3>
                <p class="text-xs text-gray-400">View & manage saved records</p>
            </div>
        `;
    } else {
        // Staff Dashboard: Mark Attendance, Assessments, Daily Attendance, Workshop Viva Entry
        cardsHtml = `
            <div onclick="renderView('attendanceMarking')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">📋</div>
                <h3 class="font-bold group-hover:text-primary">Mark Attendance</h3>
                <p class="text-xs text-gray-400">Record daily status & share summary</p>
            </div>
            <div onclick="renderView('assessmentSetup')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">✒️</div>
                <h3 class="font-bold group-hover:text-primary">Assessments</h3>
                <p class="text-xs text-gray-400">Log Viva & Practical entries</p>
            </div>
            <div onclick="renderView('attendanceRegister')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">📊</div>
                <h3 class="font-bold group-hover:text-primary">Daily Attendance</h3>
                <p class="text-xs text-gray-400">View attendance records</p>
            </div>
            <div onclick="renderView('assessmentSetup')"
                class="p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md cursor-pointer group transition-all">
                <div class="text-3xl mb-2">🎓</div>
                <h3 class="font-bold group-hover:text-primary">Assessment</h3>
                <p class="text-xs text-gray-400">Enter workshop assessment scores</p>
            </div>
        `;
    }

    cardsContainer.innerHTML = cardsHtml;
}

function updateBatchDropdowns() {
    const batchIds = [...new Set(students.map(s => s.batchId))].sort();
    const selectors = [
        'batchSelector', 'assessBatchSelector', 'printBatchSelector',
        'attendanceBatchSelector', 'registerBatchSelector', 'printSubBatchSelector',
        'printStudentSelector', 'attendanceSubBatchSelector', 'assessSubBatchSelector'
    ];

    selectors.forEach(id => {
        const selector = document.getElementById(id);
        if (!selector) return;
        const currentValue = selector.value;

        if (selector.tagName === 'SELECT') {
            if (id === 'printStudentSelector') {
                const batchId = document.getElementById('printBatchSelector').value;
                const filtered = students.filter(s => s.batchId === batchId);
                selector.innerHTML = `<option value="" disabled selected>-- Select Student --</option>`;
                filtered.forEach(s => {
                    selector.innerHTML += `<option value="${s.id}">${s.name} (${s.admissionNo})</option>`;
                });
            } else if (id.includes('SubBatch')) {
                selector.innerHTML = `
                    <option value="All">Full Batch</option>
                    <option value="A">Batch A</option>
                    <option value="B">Batch B</option>
                `;
            } else {
                selector.innerHTML = `<option value="" disabled selected>-- Select Batch --</option>`;
                if (batchIds.length === 0) {
                    selector.innerHTML += `<option value="${INITIAL_BATCH_ID}">${INITIAL_BATCH_ID}</option>`;
                }
                batchIds.forEach(batch => {
                    selector.innerHTML += `<option value="${batch}">${batch}</option>`;
                });
            }

            if (currentValue && [...selector.options].some(o => o.value === currentValue)) {
                selector.value = currentValue;
            }
        }
    });
}

// Navigation Functions
window.toggleMenu = (forceClose = false) => {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;

    if (forceClose) {
        menu.classList.add('hidden');
    } else {
        menu.classList.toggle('hidden');
    }
};

window.renderView = (viewName) => {
    const mainView = document.getElementById('mainView');
    if (!mainView) return;

    mainView.dataset.currentView = viewName;
    window.toggleMenu(true);

    document.querySelectorAll('.app-view').forEach(view => view.classList.add('hidden'));

    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.remove('hidden');

        if (viewName === 'studentManagement') renderStudentList();
        else if (viewName === 'staffManagement') renderStaffList();
        else if (viewName === 'dashboard') calculateDashboardStats();
        else if (viewName === 'attendanceMarking') setupAttendanceView();
        else if (viewName === 'attendanceRegister') renderAttendanceRegister();
        else if (viewName === 'assessmentHistory') renderAssessmentHistory();

        updateBatchDropdowns();
    }
};

// Attendance Functions
function setupAttendanceView() {
    const dateInput = document.getElementById('attendanceDate');
    if (!dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    renderAttendanceList();
}

function renderAttendanceList() {
    const batchId = document.getElementById('attendanceBatchSelector').value;
    let subBatch = document.getElementById('attendanceSubBatchSelector').value;
    const date = document.getElementById('attendanceDate').value;
    const listBody = document.getElementById('attendanceListBody');

    // -- ENFORCE SUB-BATCH UI LOGIC (Always Run) --
    // We do this before checking if batchId/date exists so the UI is consistent
    const sessionTypeSelect = document.getElementById('attendanceSessionType');
    const subBatchSelect = document.getElementById('attendanceSubBatchSelector');
    let currentSessionType = 'Theory';

    if (sessionTypeSelect && subBatchSelect) {
        // If we have data context, try to use it. Otherwise rely on DOM value.
        // If batch/date invalid, we can't look up saved session type, so fallback to current UI value.
        if (batchId && date && attendanceData[batchId]?.[date]?.sessionType) {
            currentSessionType = attendanceData[batchId][date].sessionType;
            sessionTypeSelect.value = currentSessionType;
        } else {
            currentSessionType = sessionTypeSelect.value;
        }

        if (currentSessionType === 'Theory') {
            subBatchSelect.value = 'All';
            subBatchSelect.disabled = true;
            subBatch = 'All'; // Ensure logic uses 'All'
        } else {
            subBatchSelect.disabled = false;
        }
    }
    // ---------------------------------------------

    if (!batchId || !date) {
        listBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">Select batch and date</td></tr>';
        document.getElementById('btnDeleteRecord').classList.add('hidden');
        return;
    }

    // Role Check for Delete Button
    const isAdmin = localStorage.getItem('user_role') === 'admin';
    const deleteBtn = document.getElementById('btnDeleteRecord');
    if (deleteBtn) {
        if (isAdmin) deleteBtn.classList.remove('hidden');
        else deleteBtn.classList.add('hidden');
    }

    let filtered = students.filter(s => s.batchId === batchId);
    if (subBatch !== 'All') filtered = filtered.filter(s => s.subBatch === subBatch);

    const dailyData = attendanceData[batchId]?.[date] || {};

    listBody.innerHTML = filtered.map(s => {
        const isPresent = dailyData[s.id] !== 'absent';
        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-sm font-medium">${s.name}</td>
                <td class="p-3 text-xs font-mono">${s.admissionNo}</td>
                <td class="p-3 text-center">
                    <input type="checkbox" class="w-5 h-5 accent-green-600 cursor-pointer" 
                        ${isPresent ? 'checked' : ''} 
                        onchange="updateAttendanceStatus('${batchId}', '${date}', '${s.id}', this.checked)">
                </td>
            </tr>
        `;
    }).join('');
}

window.updateAttendanceStatus = (batchId, date, studentId, isPresent) => {
    if (!attendanceData[batchId]) attendanceData[batchId] = {};
    if (!attendanceData[batchId][date]) attendanceData[batchId][date] = {};
    attendanceData[batchId][date][studentId] = isPresent ? 'present' : 'absent';
    saveData();
};

window.updateSessionType = () => {
    const batchId = document.getElementById('attendanceBatchSelector').value;
    const date = document.getElementById('attendanceDate').value;
    const type = document.getElementById('attendanceSessionType').value;
    const subBatchSelect = document.getElementById('attendanceSubBatchSelector');

    // -- STRICT UI ENFORCEMENT --
    // This runs immediately, even if no batch is selected yet
    if (type === 'Theory') {
        subBatchSelect.value = 'All';
        subBatchSelect.disabled = true;
    } else {
        subBatchSelect.disabled = false;
    }

    // Only proceed to save if we have a valid batch and date
    if (!batchId || !date) return;

    if (!attendanceData[batchId]) attendanceData[batchId] = {};
    if (!attendanceData[batchId][date]) attendanceData[batchId][date] = {};

    attendanceData[batchId][date].sessionType = type;
    saveData();

    // Refresh list to apply filtering if needed
    renderAttendanceList();
};

window.saveAttendanceManual = () => {
    // Explicitly Save Session Type
    const batchId = document.getElementById('attendanceBatchSelector').value;
    const date = document.getElementById('attendanceDate').value;
    const sessionType = document.getElementById('attendanceSessionType').value;

    if (batchId && date) {
        if (!attendanceData[batchId]) attendanceData[batchId] = {};
        if (!attendanceData[batchId][date]) attendanceData[batchId][date] = {};

        // Force update session type
        attendanceData[batchId][date].sessionType = sessionType;
    }

    saveData();
    showMessage('Success', 'Attendance saved successfully!', 'success');
};

window.deleteAttendanceManual = () => {
    // 1. Permission Check
    if (localStorage.getItem('user_role') !== 'admin') {
        showMessage('Error', 'Permission Denied: Only Incharge can delete records.', 'error');
        return;
    }

    const batchId = document.getElementById('attendanceBatchSelector').value;
    const date = document.getElementById('attendanceDate').value;

    if (!batchId || !date) {
        showMessage('Error', 'Please select a batch and date first.', 'error');
        return;
    }

    if (!attendanceData[batchId] || !attendanceData[batchId][date]) {
        showMessage('Info', 'No record exists to delete.', 'error');
        return;
    }

    // 2. Confirmation
    if (confirm(`Are you sure you want to PERMANENTLY DELETE the attendance record for ${date}? This cannot be undone.`)) {
        // 3. Delete Logic
        delete attendanceData[batchId][date];
        saveData();

        // 4. UI Feedback
        renderAttendanceList();
        showMessage('Success', 'Attendance record deleted successfully.', 'success');
        window.activityLogger.log('Delete Attendance', `Deleted attendance for ${batchId} on ${date}`, 'warning');
    }
};

window.shareAttendanceWhatsApp = () => {
    const batchId = document.getElementById('attendanceBatchSelector').value;
    const subBatch = document.getElementById('attendanceSubBatchSelector').value;
    const date = document.getElementById('attendanceDate').value;

    if (!batchId || !date) return;

    let filtered = students.filter(s => s.batchId === batchId);
    if (subBatch !== 'All') filtered = filtered.filter(s => s.subBatch === subBatch);

    const dailyData = attendanceData[batchId]?.[date] || {};
    const absentees = filtered.filter(s => dailyData[s.id] === 'absent');
    const presentCount = filtered.length - absentees.length;

    let message = `*Attendance Summary*\n*Batch:* ${batchId}${subBatch !== 'All' ? ' (Sub ' + subBatch + ')' : ''}\n*Date:* ${new Date(date).toLocaleDateString('en-GB')}\n----------------------------\n*Total:* ${filtered.length}\n*Present:* ${presentCount}\n*Absent:* ${absentees.length}\n`;

    if (absentees.length > 0) {
        message += `\n*Absentees:*\n`;
        absentees.forEach((s, i) => message += `${i + 1}. ${s.name} (${s.admissionNo})\n`);
    } else {
        message += `\n*All students present.*`;
    }

    // Show Preview Modal instead of opening directly
    document.getElementById('sharePreviewText').value = message;
    document.getElementById('sharePreviewModal').classList.remove('hidden');
    window.activityLogger.log('Share Attendance', `Prepared WhatsApp message for ${batchId} on ${date}`, 'info');
};

// -- Share Preview Logic --
window.closeSharePreview = () => {
    document.getElementById('sharePreviewModal').classList.add('hidden');
};

window.copyShareText = () => {
    const text = document.getElementById('sharePreviewText');
    text.select();
    document.execCommand('copy');

    // Visual feedback
    const btn = event.currentTarget;
    const original = btn.innerHTML;
    btn.innerHTML = '<span>✅ Copied!</span>';
    setTimeout(() => btn.innerHTML = original, 2000);
    window.activityLogger.log('Share Attendance', 'Copied attendance summary to clipboard', 'info');
};

window.proceedToWhatsApp = () => {
    const message = document.getElementById('sharePreviewText').value;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    closeSharePreview();
    window.activityLogger.log('Share Attendance', 'Opened WhatsApp with attendance summary', 'info');
};

function renderAttendanceRegister() {
    const batchId = document.getElementById('registerBatchSelector').value;
    const container = document.getElementById('registerTableContainer');

    if (!batchId) {
        container.innerHTML = '<p class="text-center py-10 text-gray-500 italic">Select a batch above to load records.</p>';
        return;
    }

    const batchAttendance = attendanceData[batchId] || {};
    let dates = Object.keys(batchAttendance).sort();

    // -- FILTER BY SESSION TAB --
    const currentTab = window.currentRegisterTab || 'Theory';
    if (currentTab !== 'All') {
        dates = dates.filter(d => {
            const sType = batchAttendance[d]?.sessionType || 'Unspecified';
            // Treat 'Unspecified' as 'Theory' for backward compatibility if needed, 
            // OR strictly filter. Given user feedback, let's be strict but helpful.
            if (sType === 'Unspecified') return currentTab === 'Theory';
            return sType === currentTab;
        });
    }

    const batchStudents = students.filter(s => s.batchId === batchId)
        .sort((a, b) => a.admissionNo.localeCompare(b.admissionNo));

    if (dates.length === 0) {
        container.innerHTML = `<p class="text-center py-10 text-gray-500 italic">No <b>${currentTab}</b> records found for this batch.</p>`;
        return;
    }

    const isAdmin = localStorage.getItem('user_role') === 'admin';

    const dateHeaders = dates.map(d => {
        const [y, m, day] = d.split('-');
        let headerContent = `${day}/${m}`;

        if (isAdmin) {
            headerContent += `
            <button onclick="deleteBatchAttendanceDate('${batchId}', '${d}')"
                title="Delete this column"
                class="block mx-auto mt-1 w-5 h-5 rounded bg-red-500 text-white font-bold text-[10px] leading-none hover:bg-red-700 shadow-sm transition-all flex items-center justify-center">
                ✕
            </button>
            `;
        }

        return `<th class="px-2 py-1 text-[10px] border border-gray-300 bg-gray-50 min-w-[30px] align-top">${headerContent}</th>`;
    }).join('');

    const tableRows = batchStudents.map((s, i) => {
        let present = 0, absent = 0;

        const cells = dates.map(d => {
            const val = batchAttendance[d][s.id];
            const isAbs = val === 'absent';
            if (isAbs) absent++; else present++;
            const colorClass = isAbs ? 'text-red-600 bg-red-50 font-bold' : 'text-green-600';
            return `<td class="border border-gray-200 text-center text-xs p-1 ${colorClass}">${isAbs ? 'A' : 'P'}</td>`;
        }).join('');

        const totalDays = dates.length;
        const percent = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="border border-gray-200 text-center py-1">${i + 1}</td>
                <td class="border border-gray-200 px-2 py-1 font-medium">${s.name}</td>
                <td class="border border-gray-200 text-center py-1 font-mono text-xs text-gray-500">${s.admissionNo}</td>
                ${cells}
                <td class="border border-gray-200 text-center font-bold text-green-700 bg-green-50">${present}</td>
                <td class="border border-gray-200 text-center font-bold text-red-700 bg-red-50">${absent}</td>
                <td class="border border-gray-200 text-center font-bold">${percent}%</td>
            </tr>
        `;
    }).join('');

    // -- DELETE FUNCTION --
    window.deleteBatchAttendanceDate = (batchId, date) => {
        if (!confirm(`Are you sure you want to delete the attendance column for ${date} ? `)) return;

        if (attendanceData[batchId] && attendanceData[batchId][date]) {
            delete attendanceData[batchId][date];
            saveData();
            renderAttendanceRegister(); // Refresh
            showMessage('Success', 'Column deleted successfully.', 'success');
            window.activityLogger.log('Delete Attendance Column', `Deleted attendance column for ${batchId} on ${date}`, 'warning');
        }
    };

    const tableHtml = `
        <div class="overflow-x-auto border rounded-t-lg shadow-sm bg-white">
        <table class="w-full border-collapse text-sm">
            <thead class="bg-blue-50 text-blue-800 sticky top-0 z-10">
                <tr>
                    <th class="p-2 border border-blue-200 text-center w-10">SL</th>
                    <th class="p-2 border border-blue-200 text-left min-w-[150px]">Student Name</th>
                    <th class="p-2 border border-blue-200 text-center w-24">Adm No</th>
                    ${dateHeaders}
                    <th class="p-2 border border-blue-200 text-center w-10 text-green-700">P</th>
                    <th class="p-2 border border-blue-200 text-center w-10 text-red-700">A</th>
                    <th class="p-2 border border-blue-200 text-center w-12">%</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        </div>
        <div class="mt-4 flex justify-end">
            <button onclick="handleGenerateRequest('print', 'attendance-register')"
                class="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-primary-dark transition-all flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                    </path>
                </svg>
                Print Register
            </button>
        </div>
    `;

    container.innerHTML = tableHtml;
}

// -- Activity Log Functions --

window.renderActivityLogs = () => {
    const tbody = document.getElementById('activityLogBody');
    if (!tbody) return;

    const logs = window.activityLogger.getLogs();

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">No activity recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => {
        let typeClass = 'text-gray-600';
        if (log.type === 'error') typeClass = 'text-red-600 font-bold';
        if (log.type === 'warning') typeClass = 'text-orange-600';
        if (log.type === 'success') typeClass = 'text-green-600';

        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-gray-500 whitespace-nowrap">${new Date(log.timestamp).toLocaleString()}</td>
                <td class="p-3 font-bold text-gray-700">${log.user}</td>
                <td class="p-3"><span class="${typeClass}">${log.action}</span></td>
                <td class="p-3 text-gray-600 break-words">${log.details}</td>
            </tr>
        `;
    }).join('');
};

window.exportLogsToCSV = () => {
    const csv = window.activityLogger.exportLogsCSV();
    if (!csv) {
        alert("No logs to export!");
        return;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `ams_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.activityLogger.log('Export Logs', 'Activity logs exported to CSV', 'info');
};

// Student Management Functions
function renderStudentList() {
    const batchId = document.getElementById('batchSelector').value;
    const list = document.getElementById('studentListBody');
    const inChargeInput = document.getElementById('batchInChargeInput');

    if (inChargeInput) {
        inChargeInput.value = batchMetadata[batchId]?.inCharge || '';
    }

    const filtered = students.filter(s => s.batchId === batchId);

    if (filtered.length === 0) {
        list.innerHTML = `<tr><td colspan="5" class="p-4 text-center italic opacity-50">No student profiles in this batch.</td></tr>`;
        return;
    }

    list.innerHTML = filtered.map(s => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-2 text-sm font-medium">${s.name}</td>
            <td class="p-2 text-xs font-mono">${s.admissionNo}</td>
            <td class="p-2 text-xs">${s.batchId}</td>
            <td class="p-2">
                <select onchange="updateSubBatch('${s.id}', this.value)" class="text-xs border rounded p-1">
                    <option value="None" ${s.subBatch === 'None' ? 'selected' : ''}>None</option>
                    <option value="A" ${s.subBatch === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${s.subBatch === 'B' ? 'selected' : ''}>B</option>
                </select>
            </td>
            <td class="p-2">
                <button onclick="deleteStudent('${s.id}')" 
                    class="text-red-600 font-bold text-xs hover:underline">Delete</button>
            </td>
        </tr>
        `).join('');
}

window.updateBatchInCharge = (val) => {
    const bId = document.getElementById('batchSelector').value;
    if (!bId) return;
    if (!batchMetadata[bId]) batchMetadata[bId] = {};
    batchMetadata[bId].inCharge = val;
    saveData();
    window.activityLogger.log('Update Batch Incharge', `Batch ${bId} incharge updated to ${val}`, 'info');
};

window.updateSubBatch = (id, val) => {
    const s = students.find(x => x.id === id);
    if (s) {
        s.subBatch = val;
        saveData();
        window.activityLogger.log('Update Sub-Batch', `Student ${s.name} (${s.admissionNo}) sub-batch updated to ${val}`, 'info');
    }
};

window.deleteStudent = (id) => {
    try {
        console.log('Attempting to delete student:', id);
        if (confirm('Permanently delete student profile? This cannot be undone.')) {
            const initialCount = students.length;
            const studentName = students.find(s => s.id === id)?.name || 'Unknown';
            students = students.filter(s => s.id !== id);

            if (students.length === initialCount) {
                console.warn('Student ID not found in list:', id);
                showMessage('Error', 'Student could not be found.', 'error');
                window.activityLogger.log('Delete Student Failed', `Attempted to delete non-existent student ID: ${id}`, 'error');
                return;
            }

            saveData();
            renderStudentList();
            updateBatchDropdowns();
            console.log('Student deleted successfully. New count:', students.length);
            showMessage('Success', 'Student profile deleted.', 'success');
            window.activityLogger.log('Delete Student', `Deleted student: ${studentName} (ID: ${id})`, 'warning');
        } else {
            console.log('Deletion cancelled by user.');
            window.activityLogger.log('Delete Student', `Deletion of student ID: ${id} cancelled`, 'info');
        }
    } catch (err) {
        console.error('Delete failed:', err);
        showMessage('Error', 'Could not delete student. Check console.', 'error');
        window.activityLogger.log('Delete Student Failed', `Error deleting student ID: ${id} - ${err.message}`, 'error');
    }
};

window.handleStudentFormSubmit = (e) => {
    e.preventDefault();
    const newStudent = {
        name: e.target.studentName.value.trim(),
        admissionNo: e.target.admissionNo.value.trim(),
        batchId: e.target.batchId.value.trim().toUpperCase(),
        id: crypto.randomUUID(),
        marks: {},
        subBatch: 'None'
    };
    students.push(newStudent);
    saveData();
    e.target.reset();
    renderStudentList();
    updateBatchDropdowns();
    showMessage('Success', 'Student added.', 'success');
    window.activityLogger.log('Add Student', `Added student: ${newStudent.name} (${newStudent.admissionNo}) to batch ${newStudent.batchId}`, 'success');
};

window.toggleBulkInputModal = (show) => {
    const modal = document.getElementById('bulkInputModal');
    if (show) {
        modal.classList.remove('hidden');
        document.getElementById('bulkBatchId').value = document.getElementById('batchSelector').value || '';
        window.activityLogger.log('Bulk Input', 'Opened bulk student input modal', 'info');
    } else {
        modal.classList.add('hidden');
    }
};

window.handleBulkInput = (e) => {
    e.preventDefault();
    const bId = document.getElementById('bulkBatchId').value.trim().toUpperCase();
    const text = document.getElementById('bulkStudentData').value.trim();

    if (!bId || !text) return;

    let addedCount = 0;
    text.split('\n').forEach(line => {
        const p = line.split(/[,\t;]/).map(x => x.trim());
        if (p.length >= 2 && p[0] && p[1]) {
            students.push({
                id: crypto.randomUUID(),
                name: p[0],
                admissionNo: p[1],
                batchId: bId,
                marks: {},
                subBatch: 'None'
            });
            addedCount++;
        }
    });

    saveData();
    refreshDataAndUI();
    window.toggleBulkInputModal(false);
    showMessage('Success', 'Batch imported.', 'success');
    window.activityLogger.log('Bulk Import', `Imported ${addedCount} students into batch ${bId}`, 'success');
};

// Staff Management Functions
window.addStaff = (name, phone, position, colorCode, isAdmin = false) => {
    // Generate username from name (first name + last name initial, lowercase)
    const nameParts = name.trim().toLowerCase().split(' ');
    const firstName = nameParts[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : '';
    const username = firstName + lastInitial;

    // Password is last 4 digits of phone number
    const password = phone.trim().slice(-4);

    const newStaff = {
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        position: position.trim(),
        colorCode: colorCode,
        username: username,
        password: password,
        isAdmin: isAdmin
    };

    staffMembers.push(newStaff);
    saveData();
    renderStaffList();

    // Show credentials in success message
    const adminNote = isAdmin ? '\n(Site Administrator - Full Access)' : '';
    showMessage('Staff Added!',
        `${name} added successfully!${adminNote} \nUsername: ${username} \nPassword: ${password} `,
        'success');
    window.activityLogger.log('Add Staff', `Added staff: ${name} (${position}, Admin: ${isAdmin})`, 'success');
};

window.deleteStaff = (staffId) => {
    if (confirm('Permanently delete this staff member? This cannot be undone.')) {
        const staffName = staffMembers.find(s => s.id === staffId)?.name || 'Unknown';
        staffMembers = staffMembers.filter(s => s.id !== staffId);
        saveData();
        renderStaffList();
        showMessage('Success', 'Staff member deleted.', 'success');
        window.activityLogger.log('Delete Staff', `Deleted staff: ${staffName} (ID: ${staffId})`, 'warning');
    }
};

window.updateStaff = (staffId, updates) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (staff) {
        Object.assign(staff, updates);
        saveData();
        renderStaffList();
        showMessage('Success', 'Staff member updated.', 'success');
        window.activityLogger.log('Update Staff', `Updated staff: ${staff.name} (ID: ${staffId})`, 'info');
    }
};

function renderStaffList() {
    const container = document.getElementById('staffListContainer');
    const staffCount = document.getElementById('staffCount');

    if (staffCount) {
        staffCount.textContent = staffMembers.length;
    }

    if (!container) return;

    if (staffMembers.length === 0) {
        container.innerHTML = `
        <div class="text-center py-10 text-gray-500 italic border-2 border-dashed rounded-xl">
            <div class="text-4xl mb-2">👥</div>
                No staff members added yet. Use the form above to add staff.
            </div>
        `;
        return;
    }

    const colorBadges = {
        blue: 'bg-blue-500 text-white',
        green: 'bg-green-500 text-white',
        red: 'bg-red-500 text-white',
        white: 'bg-white text-gray-800 border border-gray-300'
    };

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${staffMembers.map(staff => `
                <div class="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h4 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                                ${staff.name}
                                ${staff.isAdmin ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-300">⭐ Admin</span>' : ''}
                            </h4>
                            <p class="text-sm text-gray-600 font-mono mt-1">📞 ${staff.phone}</p>
                        </div>
                        <span class="${colorBadges[staff.colorCode]} px-3 py-1 rounded-full text-xs font-bold">
                            ${staff.position}
                        </span>
                    </div>
                    <div class="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-3">
                        <p class="text-[10px] font-bold text-gray-500 uppercase mb-1">Login Credentials</p>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-500">Username:</span>
                                <span class="font-mono font-bold text-blue-700 ml-1">${staff.username || 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">Password:</span>
                                <span class="font-mono font-bold text-blue-700 ml-1">${staff.password || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3 pt-3 border-t">
                        <button onclick="deleteStaff('${staff.id}')" 
                            class="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-all">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('')
        }
        </div>
        `;
}

window.handleStaffFormSubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('staffName').value;
    const phone = document.getElementById('staffPhone').value;
    const position = document.getElementById('staffPosition').value;
    const colorCode = document.getElementById('staffColor').value;
    const isAdmin = document.getElementById('staffIsAdmin').checked;

    addStaff(name, phone, position, colorCode, isAdmin);
    e.target.reset();
};


// Sheet Generation Functions
window.handleGenerateRequest = (mode, forceType = null) => {
    try {
        let config = {};

        if (mode === 'assessment') {
            config = {
                batchId: document.getElementById('assessBatchSelector').value,
                sem: document.getElementById('assessSemesterSelector').value,
                subBatch: document.getElementById('assessSubBatchSelector').value,
                maxMark: document.getElementById('assessMaxMark').value,
                examDate: document.getElementById('assessExamDate').value,
                type: 'mark' // Reverted to standard entry
            };
        } else {
            config = {
                batchId: document.getElementById(forceType ? 'registerBatchSelector' : 'printBatchSelector').value,
                sem: document.getElementById('printSemesterSelector')?.value || '1st',
                subBatch: document.getElementById('printSubBatchSelector')?.value || 'All',
                maxMark: document.getElementById('printMaxMark')?.value || '200',
                studentId: document.getElementById('printStudentSelector')?.value,
                type: forceType || document.getElementById('printTypeSelector').value,
                filterType: document.getElementById('registerFilterType')?.value || 'month',
                sessionFilter: document.getElementById('registerSessionType')?.value || 'Theory',
                startDate: document.getElementById('registerStartDate')?.value,
                endDate: document.getElementById('registerEndDate')?.value
            };
        }

        if (!config.batchId) {
            showMessage('Error', 'Select a batch.', 'error');
            return;
        }

        generateSheet(false, config);
        window.activityLogger.log('Generate Sheet', `Generated sheet of type: ${config.type} for batch: ${config.batchId}`, 'info');
    } catch (err) {
        showMessage('Error', 'Generation failed. Check selections.', 'error');
        window.activityLogger.log('Generate Sheet Failed', `Error generating sheet: ${err.message}`, 'error');
    }
};

function generateSheet(isReload = false, config) {
    window.activeSheetConfig = config;
    currentBatch = config.batchId;
    currentSubBatch = config.subBatch;

    // Unified storage key: Always use 'mark' so data is shared between Entry and Print views
    const keyType = 'mark';
    const sheetKey = `${config.batchId} -${config.sem} -${keyType} -${config.maxMark} `;
    const meta = assessmentMetadata[sheetKey] || {};

    renderView('sheetGeneration');

    document.getElementById('sheetBatchDisplay').textContent = config.batchId;
    document.getElementById('sheetBatchDisplay').textContent = config.batchId;

    // Repurpose Semester Display for Session Type in Registers
    if (config.type === 'attendance-register') {
        document.getElementById('sheetSemesterDisplay').textContent = (config.sessionFilter || 'THEORY').toUpperCase();
    } else {
        document.getElementById('sheetSemesterDisplay').textContent = config.sem;
    }

    const dateVal = config.examDate || meta.date || new Date();
    const dateObj = new Date(dateVal);

    // Dynamic Date Header Logic
    const dateEl = document.getElementById('sheetDate');
    const noteEl = dateEl.parentElement.querySelector('.text-right'); // "DATE:" label container

    if (config.type === 'attendance-register') {
        // Change label to PERIOD
        if (noteEl && noteEl.firstChild) noteEl.firstChild.nodeValue = 'PERIOD: ';

        // Determine Period String
        let periodStr = '';
        const now = new Date();

        if (config.filterType === 'month' || !config.filterType) {
            const m = now.toLocaleString('default', { month: 'long' });
            periodStr = `${m} ${now.getFullYear()} `;
        } else if (config.filterType === 'week') {
            periodStr = 'Current Week';
        } else if (config.filterType === 'custom') {
            const d1 = config.startDate ? new Date(config.startDate).toLocaleDateString('en-GB') : '?';
            const d2 = config.endDate ? new Date(config.endDate).toLocaleDateString('en-GB') : '?';
            periodStr = `${d1} - ${d2} `;
        }
        dateEl.textContent = periodStr;
    } else {
        // Reset label to DATE
        if (noteEl && noteEl.firstChild) noteEl.firstChild.nodeValue = 'DATE: ';
        dateEl.textContent = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-GB') : dateVal;
    }

    document.getElementById('displayMaxMark').textContent = config.maxMark;

    const isMarkSheet = config.type === 'mark' || config.type === 'workshop-viva';
    document.getElementById('maxMarkHeaderContainer').classList.toggle('hidden', !isMarkSheet);

    const titles = {
        'workshop-viva': 'FINAL MARK SHEET (v5)',
        'mark': 'ASSESSMENT MARK ENTRY',
        'mark-sheet': 'BLANK MARK SHEET',
        'attendance-index': 'ATTENDANCE INDEX',
        'attendance-register': 'MONTHLY ATTENDANCE REGISTER',
        'transcript': 'ACADEMIC TRANSCRIPT'
    };
    document.getElementById('sheetTitle').textContent = titles[config.type] || 'SHEET';

    // Dynamic Main Title Logic
    const mainTitleEl = document.getElementById('sheetMainTitle');
    if (config.type === 'attendance-register' || config.type === 'transcript') {
        mainTitleEl.classList.add('hidden');

        // Append Session Type to the Sheet Title for clarity
        // Append Session Type to the Sheet Title for clarity
        if (config.type === 'attendance-register') {
            const sType = config.sessionFilter || 'Theory';
            const titleEl = document.getElementById('sheetTitle');
            titleEl.textContent = `MONTHLY ATTENDANCE REGISTER - ${sType.toUpperCase()} `;

            // Visual Distinction
            titleEl.className = "text-sm md:text-md font-semibold border-b-2 inline-block px-8 pb-0.5 mt-1"; // reset
            if (sType === 'Theory') {
                titleEl.classList.add('border-blue-700', 'text-blue-800');
            } else if (sType === 'Workshop') {
                titleEl.classList.add('border-orange-600', 'text-orange-700');
            } else {
                titleEl.classList.add('border-black', 'text-black');
            }
        }
    } else {
        mainTitleEl.classList.remove('hidden');
        mainTitleEl.textContent = 'WORKSHOP VIVA';
    }


    let filtered = students.filter(s => s.batchId === config.batchId);
    if (currentSubBatch !== 'All') {
        filtered = filtered.filter(s => s.subBatch === currentSubBatch);
    }

    if (config.type === 'attendance-index') renderAttendanceIndex(filtered);
    else if (config.type === 'attendance-register') renderMonthlyRegister(config.batchId, filtered, config);
    else if (config.type === 'mark-sheet') renderBlankMarkSheet(filtered);
    else if (config.type === 'transcript') renderTranscript(config.studentId);
    else renderMarksEntry(filtered, config.type, config.maxMark, sheetKey);
}

function renderAttendanceIndex(filtered) {
    document.getElementById('markSheetControls').classList.add('hidden');
    document.getElementById('generatedSheetHeader').innerHTML = `
        <tr>
            <th class="w-10 text-center border-r border-gray-300">SL.</th>
            <th class="text-left px-2 border-r border-gray-300">NAME</th>
            <th class="w-32 text-center border-r border-gray-300">ADMISSION NO.</th>
            <th class="w-32 text-center">SIGNATURE</th>
        </tr>
        `;
    document.getElementById('generatedSheetBody').innerHTML = filtered.map((s, i) => `
        <tr class="h-9">
            <td>${i + 1}</td>
            <td class="text-left font-medium p-name">${s.name}</td>
            <td class="font-mono text-[9px]">${s.admissionNo}</td>
            <td></td>
        </tr>
        `).join('');
}

// Filter Register Logic
window.toggleDateInputs = () => {
    const type = document.getElementById('registerFilterType').value;
    const customContainer = document.getElementById('customDateInputs');
    if (customContainer) {
        customContainer.classList.toggle('hidden', type !== 'custom');
    }
};

// Tab Logic
window.currentRegisterTab = 'Theory'; // Default

window.switchRegisterTab = (tab) => {
    window.currentRegisterTab = tab;

    // Update UI
    ['Theory', 'Workshop', 'All'].forEach(t => {
        const btn = document.getElementById(`tab${t} `);
        if (t === tab) {
            // Active Styles
            btn.classList.add('bg-white', 'shadow-sm', 'scale-105');
            btn.classList.remove('text-gray-500', 'hover:bg-gray-200');

            // Color Coding based on Tab
            if (tab === 'Theory') btn.classList.add('text-blue-700', 'border', 'border-blue-200');
            else if (tab === 'Workshop') btn.classList.add('text-orange-600', 'border', 'border-orange-200');
            else btn.classList.add('text-gray-800', 'border', 'border-gray-300');

        } else {
            // Inactive Styles
            btn.className = "flex-1 py-2 px-4 rounded-md text-xs font-bold transition-all text-gray-500 hover:bg-gray-200";
        }
    });

    renderAttendanceRegister(); // Update In-Place View
};


window.filterRegister = () => {
    const batchId = document.getElementById('registerBatchSelector').value;
    if (!batchId) return;

    // Trigger generation with register config
    const config = {
        batchId: batchId,
        subBatch: 'All', // Default to All for overview
        type: 'attendance-register',
        filterType: document.getElementById('registerFilterType').value,
        sessionFilter: window.currentRegisterTab, // Use Tab State
        startDate: document.getElementById('registerStartDate').value,
        endDate: document.getElementById('registerEndDate').value
    };
    generateSheet(false, config);
    window.activityLogger.log('Filter Register', `Filtered attendance register for batch ${batchId} by ${config.filterType} and session ${config.sessionFilter}`, 'info');
};

function renderMonthlyRegister(batchId, filtered, config) {
    document.getElementById('markSheetControls').classList.add('hidden');
    const batchAttendance = attendanceData[batchId] || {};
    let dates = Object.keys(batchAttendance).sort();

    // -- FILTERING LOGIC --
    const now = new Date();
    const filterType = config?.filterType || 'month';

    if (filterType === 'week') {
        // Get start of week (Sunday)
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        dates = dates.filter(d => {
            const date = new Date(d);
            return date >= startOfWeek && date <= endOfWeek;
        });
    } else if (filterType === 'month') {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        dates = dates.filter(d => {
            const date = new Date(d);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
    } else if (filterType === 'custom') {
        const start = config.startDate ? new Date(config.startDate) : null;
        const end = config.endDate ? new Date(config.endDate) : null;

        if (start && end) {
            // Set end to end of day
            end.setHours(23, 59, 59, 999);
            dates = dates.filter(d => {
                const date = new Date(d);
                return date >= start && date <= end;
            });
        }
    }

    // 2. Filter by Session Type
    const sessionFilter = config?.sessionFilter || 'All';

    if (sessionFilter !== 'All') {
        dates = dates.filter(d => {
            const sessionType = batchAttendance[d]?.sessionType || 'Unspecified';
            return sessionType === sessionFilter;
        });
    }

    const dateHeaders = dates.map(d => `
        <th class="w-6 text-[10px] p-1 border-r border-black bg-gray-50 align-bottom font-medium" style="height: 100px; vertical-align: bottom;">
            <div style="writing-mode: vertical-rl; transform: rotate(180deg); margin: 0 auto; white-space: nowrap;">
                ${new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
            </div>
        </th>
        `).join('');

    document.getElementById('generatedSheetHeader').innerHTML = `
        <tr class="border-b-2 border-black">
                <th class="w-10 text-center border-r border-black p-2 font-bold text-xs uppercase bg-gray-100">SL.</th>
                <th class="text-left px-2 border-r border-black font-bold text-xs uppercase bg-gray-100" style="min-width: 250px;">NAME</th>
                ${dateHeaders}
                <th class="w-8 text-center border-r border-black bg-green-50 text-green-800 font-bold text-xs border-l-2 border-l-black">P</th>
                <th class="w-8 text-center border-r border-black bg-red-50 text-red-800 font-bold text-xs">A</th>
                <th class="w-10 text-center bg-blue-50 text-blue-800 font-bold text-xs">%</th>
            </tr>
        `;

    if (dates.length === 0) {
        // Smart Empty State: Check if data exists under OTHER categories
        if (sessionFilter !== 'All') {
            const allDates = Object.keys(batchAttendance);
            const otherCounts = {};
            allDates.forEach(d => {
                const type = batchAttendance[d]?.sessionType || 'Unspecified';
                if (type !== sessionFilter) {
                    otherCounts[type] = (otherCounts[type] || 0) + 1;
                }
            });

            const otherMsg = Object.entries(otherCounts).map(([k, v]) => `${v} ${k}`).join(', ');

            if (otherMsg) {
                document.getElementById('generatedSheetBody').innerHTML = `
        <tr><td colspan="100" class="text-center p-8 text-gray-400 italic border-b border-black">
            No <b>${sessionFilter.toUpperCase()}</b> records found.<br>
                <span class="text-red-500 text-xs not-italic">
                    However, found: <b>${otherMsg}</b> records.<br>
                        (Please update "Session Type" in Daily Attendance if this is a mistake)
                </span>
        </td></tr>
            `;
                return;
            }
        }

        document.getElementById('generatedSheetBody').innerHTML = `
            <tr><td colspan="100" class="text-center p-8 text-gray-400 italic border-b border-black">No attendance records found for this period.</td></tr>
                `;
        return;
    }

    document.getElementById('generatedSheetBody').innerHTML = filtered.map((s, i) => {
        let absCount = 0;
        let presentCount = 0;

        const cells = dates.map(d => {
            const isAbs = batchAttendance[d] && batchAttendance[d][s.id] === 'absent';
            const hasRecord = !!batchAttendance[d];

            if (isAbs) absCount++;
            else if (hasRecord) presentCount++;

            const status = hasRecord ? (isAbs ? 'A' : 'P') : '-';

            let cellStyle = 'font-weight: bold; color: green;';
            if (isAbs) cellStyle = 'font-weight: bold; color: red; background-color: #fee2e2;'; // light red bg
            if (status === '-') cellStyle = 'color: #d1d5db;'; // gray-300

            return `<td class="p-0 text-[10px] text-center border-r border-black h-8" style="${cellStyle}">${status}</td>`;
        }).join('');

        const total = dates.length;
        const percent = total > 0
            ? (((total - absCount) / total) * 100).toFixed(0)
            : '0';

        const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-gray-50'; // Zebra Striping

        return `
        <tr class="h-8 border-b border-black ${rowBg} print:bg-transparent">
                    <td class="text-center text-black font-medium text-xs border-r border-black">${i + 1}</td>
                    <td class="text-left font-bold p-name text-xs px-2 border-r border-black text-black uppercase">${s.name}</td>
                    ${cells}
                    <td class="text-center font-bold text-xs text-green-700 bg-green-50 border-r border-black border-l-2 border-l-black">${presentCount}</td>
                    <td class="text-center font-bold text-xs text-red-700 bg-red-50 border-r border-black">${absCount}</td>
                    <td class="text-center font-bold text-xs text-blue-700 bg-blue-50">${percent}%</td>
                </tr>
        `;
    }).join('');
}

function renderBlankMarkSheet(filtered) {
    document.getElementById('markSheetControls').classList.add('hidden');
    const headers = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'PRAC', 'REC'];
    const markHeaders = headers.map(h => `<th class="w-7 text-[9px]">${h}</th>`).join('');

    document.getElementById('generatedSheetHeader').innerHTML = `
        <tr>
            <th class="w-9">SL.</th>
            <th class="text-left">NAME</th>
            <th class="w-28">ADM NO.</th>
            ${markHeaders}
    <th class="w-10">TOTAL</th>
        </tr>
        `;

    document.getElementById('generatedSheetBody').innerHTML = filtered.map((s, i) => `
        <tr class="h-10">
            <td>${i + 1}</td>
            <td class="text-left font-medium p-name">${s.name}</td>
            <td class="text-[9px] font-mono">${s.admissionNo}</td>
            ${Array(9).fill('<td></td>').join('')}
        </tr>
        `).join('');
}

window.handleEnterKey = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const inputs = Array.from(document.querySelectorAll('.mark-input'));
        const index = inputs.indexOf(e.target);
        if (index > -1 && index + 1 < inputs.length) {
            inputs[index + 1].focus();
            inputs[index + 1].select();
        }
    }
};

function renderMarksEntry(filtered, type, maxMark, sheetKey) {
    const isEntry = type === 'mark';
    const isViva = type && type.toString().includes('workshop-viva'); // This is now the "Print Summary" mode

    const isSubmitted = !!assessmentMetadata[sheetKey];
    const isAdmin = currentUserRole === 'admin';
    const isReadOnly = isSubmitted && !isAdmin;

    if (isReadOnly) {
        // Hide controls for staff on submitted sheets
        document.getElementById('markSheetControls').classList.add('hidden');
    } else {
        // Show controls if it's entry mode (and not read-only)
        document.getElementById('markSheetControls').classList.toggle('hidden', !isEntry);
    }

    let headers = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'PRAC', 'REC'];
    if (isViva) headers = ['TOTAL'];

    const markHeaders = headers.map(h =>
        `<th class="w-12 text-xs text-center border-r border-black bg-gray-50">${h}</th>`
    ).join('');

    const totalHeaderStyle = isViva ? 'display:none' : '';
    const actionHeader = isAdmin ? '<th class="w-10 text-center text-red-600 border-l border-black">DEL</th>' : '';

    document.getElementById('generatedSheetHeader').innerHTML = `
        <tr class="border-b-2 border-black text-center">
            <th class="w-12 text-center border-r border-black">SL.</th>
            <th class="text-left pl-2 border-r border-black">NAME</th>
            <th class="w-24 text-center border-r border-black">ADM NO.</th>
            ${markHeaders}
            <th class="w-12 border-r border-black" style="${totalHeaderStyle}">TOTAL</th>
            <th class="w-12 text-center">RANK</th>
            ${actionHeader}
        </tr>
        `;

    // Calculate ranks first
    let processed = filtered.map(s => {
        const mData = s.marks[sheetKey]?.marks || Array(8).fill(0);
        const total = mData.reduce((a, b) => a + b, 0);
        return { ...s, mData, total };
    }).sort((a, b) => b.total - a.total);

    let currentRank = 1;
    processed.forEach((s, i) => {
        if (i > 0 && s.total < processed[i - 1].total) currentRank = i + 1;
        s.rank = s.total > 0 ? currentRank : 'AB';
    });

    document.getElementById('generatedSheetBody').innerHTML = processed.map((s, i) => {
        let cells = '';
        if (isViva) {
            // Read-Only Summary View
            cells = `
        <td class="p-0 border-r border-black h-10 text-center align-middle">
            <input type="number" value="${s.total}" disabled
                class="w-full h-full text-center bg-transparent outline-none border-none text-lg font-bold text-black no-print">
                <span class="print-only">${s.total}</span>
            </td>
    `;
        } else {
            // Standard Entry View
            cells = s.mData.map((m, idx) => `
        <td class="border-r border-black p-0 h-8 text-center align-middle">
            <input type="number" value="${m}" ${isReadOnly ? 'disabled' : ''}
                class="mark-input w-full h-full text-center bg-transparent outline-none border-none text-base font-bold no-print ${isReadOnly ? 'text-gray-500' : ''}"
                onkeydown="handleEnterKey(event)"
                oninput="liveUpdateMark('${s.id}', ${idx}, this.value, '${sheetKey}', ${maxMark}, this)">
                <span class="print-only text-sm">${m}</span>
            </td>
    `).join('');
        }

        const deleteBtn = isAdmin ? `
        <td class="text-center border-l border-black no-print p-0">
            <button onclick="deleteStudentMark('${s.id}', '${sheetKey}')" class="text-red-500 hover:text-red-700 font-bold px-1 text-xs">
                🗑️
            </button>
            </td>
        ` : '';

        return `
        <tr class="h-8 border-b border-black hover:bg-gray-50 transition-colors" data-sid="${s.id}">
                <td class="text-center border-r border-black font-medium text-xs">${i + 1}</td>
                <td class="text-left pl-1 font-bold p-name border-r border-black text-[11px] uppercase leading-tight">${s.name}</td>
                <td class="text-center font-mono border-r border-black text-[9px] font-bold text-blue-800 tracking-tighter whitespace-nowrap overflow-hidden">${s.admissionNo}</td>
                ${cells}
                <td class="text-center font-bold border-r border-black total-cell text-sm" style="${totalHeaderStyle}">${s.total}</td>
                <td class="text-center font-bold rank-cell text-sm">${s.rank}</td>
                ${deleteBtn}
            </tr>
        `;
    }).join('');
}

window.deleteStudentMark = (sid, sheetKey) => {
    if (!confirm('Are you sure you want to delete marks for this student?')) return;

    const student = students.find(s => s.id === sid);
    if (!student || !student.marks[sheetKey]) return;

    // Remove marks
    delete student.marks[sheetKey];

    saveData();
    showMessage('Deleted', 'Student marks deleted.', 'success');

    // Re-render
    const config = window.activeSheetConfig;
    generateSheet(false, config);
    window.activityLogger.log('Delete Student Marks', `Deleted marks for student ${student.name} (ID: ${sid}) from assessment ${sheetKey}`, 'warning');
};

function renderTranscript(studentId) {
    document.getElementById('markSheetControls').classList.add('hidden');
    const s = students.find(x => x.id === studentId);

    if (!s) {
        document.getElementById('generatedSheetBody').innerHTML =
            '<tr><td colspan="5" class="p-4 text-center">Please select a student from the Print Center.</td></tr>';
        return;
    }

    document.getElementById('generatedSheetHeader').innerHTML = `
        <tr>
            <th class="w-12">#</th>
            <th class="text-left">ASSESSMENT SEMESTER</th>
            <th class="w-20">MAX SCORE</th>
            <th class="w-20">SCORE</th>
            <th class="w-20">RANK</th>
        </tr>
        `;

    const keys = Object.keys(assessmentMetadata).filter(k => k.startsWith(s.batchId)).sort((a, b) => {
        const dateA = new Date(assessmentMetadata[a]?.date || 0);
        const dateB = new Date(assessmentMetadata[b]?.date || 0);
        return dateB - dateA;
    });

    const rows = keys.map((k, i) => {
        const m = assessmentMetadata[k];
        const studentData = calculateRankForStudent(k, s.id, m.maxMark);
        return `
        <tr>
                <td>${i + 1}</td>
                <td class="text-left font-medium">${m.semester} Semester Workshop Assessment</td>
                <td>${m.maxMark * 8}</td>
                <td class="font-bold">${studentData.total}</td>
                <td class="font-bold">${studentData.rank}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('generatedSheetBody').innerHTML = rows ||
        '<tr><td colspan="5" class="p-4 text-center italic text-gray-400">No assessment data found for this student.</td></tr>';
}

function calculateRankForStudent(key, sid, maxMark) {
    const batchId = key.split('-')[0];
    const batchStudents = students.filter(s => s.batchId === batchId);

    const processed = batchStudents.map(s => {
        const m = s.marks[key]?.marks || Array(8).fill(0);
        return { id: s.id, total: m.reduce((a, b) => a + b, 0) };
    }).sort((a, b) => b.total - a.total);

    let rank = 1;
    for (let i = 0; i < processed.length; i++) {
        if (i > 0 && processed[i].total < processed[i - 1].total) rank = i + 1;
        if (processed[i].id === sid) {
            return {
                total: processed[i].total,
                rank: processed[i].total > 0 ? rank : 'AB'
            };
        }
    }
    return { total: 0, rank: 'AB' };
}

window.liveUpdateMark = (sid, idx, val, key, max, inputEl) => {
    const limits = [10, 10, 10, 10, 10, 10, 40, 100];
    const limit = limits[idx] || 100;

    let numVal = parseInt(val) || 0;

    if (numVal > limit) {
        numVal = limit;
        if (inputEl) inputEl.value = limit;
    }
    if (numVal < 0) {
        numVal = 0;
        if (inputEl) inputEl.value = 0;
    }

    const student = students.find(s => s.id === sid);
    if (!student) return;

    if (!student.marks[key]) {
        student.marks[key] = { marks: Array(8).fill(0) };
    }

    student.marks[key].marks[idx] = numVal;

    const row = document.querySelector(`tr[data - sid= "${sid}"]`);
    if (row) {
        const total = student.marks[key].marks.reduce((a, b) => a + b, 0);
        row.querySelector('.total-cell').textContent = total;
    }
};

window.saveMarks = () => {
    const config = window.activeSheetConfig;
    const keyType = 'mark'; // Unified storage
    const sheetKey = `${config.batchId} -${config.sem} -${keyType} -${config.maxMark} `;

    assessmentMetadata[sheetKey] = {
        date: config.examDate,
        semester: config.sem,
        maxMark: config.maxMark
    };

    saveData();
    generateSheet(true, config);
    showMessage('Success', 'Marks saved successfully.', 'success');
    window.activityLogger.log('Save Marks', `Marks saved for assessment ${sheetKey}`, 'success');
};

// Import/Export Functions
window.exportData = () => {
    const data = {
        students,
        assessmentMetadata,
        attendanceData,
        batchMetadata,
        staffMembers
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ams_v4_2_backup.json';
    a.click();
    window.activityLogger.log('Export Data', 'All system data exported to JSON backup', 'info');
};

window.importData = (e) => {
    if (!e.target.files[0]) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const d = JSON.parse(ev.target.result);
            students = d.students || [];
            assessmentMetadata = d.assessmentMetadata || {};
            attendanceData = d.attendanceData || {};
            batchMetadata = d.batchMetadata || {};
            staffMembers = d.staffMembers || [];
            saveData();
            refreshDataAndUI();
            showMessage('Success', 'System restored.', 'success');
            window.activityLogger.log('Import Data', 'System data imported from backup file', 'warning');
        } catch (err) {
            showMessage('Error', 'Invalid backup file.', 'error');
            window.activityLogger.log('Import Data Failed', `Error importing data: ${err.message}`, 'error');
        }
    };
    reader.readAsText(e.target.files[0]);
};

// Initialize on DOM Load
// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Version Probe
    showMessage('System Updated', 'AMS v4.4 is now active.', 'success');

    checkSession(); // Check login first
    loadData();

    // Setup event listeners
    document.getElementById('batchSelector').onchange = renderStudentList;
    document.getElementById('attendanceBatchSelector').onchange = renderAttendanceList;
    document.getElementById('attendanceSubBatchSelector').onchange = renderAttendanceList;
    document.getElementById('attendanceDate').onchange = renderAttendanceList;
    document.getElementById('registerBatchSelector').onchange = renderAttendanceRegister;
    document.getElementById('printBatchSelector').onchange = updateBatchDropdowns;
    document.getElementById('printTypeSelector').onchange = (e) => {
        document.getElementById('transcriptSelectionContainer')
            .classList.toggle('hidden', e.target.value !== 'transcript');
    };

    refreshDataAndUI();
});

// Assessment History Functions
window.renderAssessmentHistory = () => {
    const listBody = document.getElementById('assessmentHistoryBody');
    if (!listBody) return;

    const keys = Object.keys(assessmentMetadata).sort((a, b) => {
        const dateA = new Date(assessmentMetadata[a]?.date || 0);
        const dateB = new Date(assessmentMetadata[b]?.date || 0);
        return dateB - dateA;
    });

    if (keys.length === 0) {
        listBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500">No recorded assessments found.</td></tr>';
        return;
    }

    listBody.innerHTML = keys.map(key => {
        const meta = assessmentMetadata[key] || {};
        // Key format: batch-sem-type-maxMark
        const parts = key.split('-');

        let batchId = parts[0];
        let sem = parts[1];
        let keyType = parts[2]; // 'viva' or 'mark'
        let maxMark = parts[3];

        const date = meta.date ? new Date(meta.date).toLocaleDateString('en-GB') : '-';
        const typeLabel = (keyType === 'viva') ? 'Workshop Viva' : 'Assessment';
        const typeCode = (keyType === 'viva') ? 'workshop-viva' : 'mark';

        return `
        <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-4 font-medium">${date}</td>
                <td class="p-4">${batchId}</td>
                <td class="p-4">${sem}</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${keyType === 'viva' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${typeLabel}</span></td>
                <td class="p-4">${maxMark}</td>
                <td class="p-4 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="loadAssessment('${key}', '${typeCode}')" 
                            class="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm">
                            View
                        </button>
                        ${window.currentUserRole === 'incharge' ? `
                        <button onclick="deleteAssessment('${key}')" 
                            class="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
                            Delete
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

window.loadAssessment = (key, type) => {
    const parts = key.split('-');
    const batchId = parts[0];
    const sem = parts[1];
    const maxMark = parts[3];
    const meta = assessmentMetadata[key] || {};

    const config = {
        batchId: batchId,
        sem: sem,
        subBatch: 'All',
        maxMark: maxMark,
        type: type,
        examDate: meta.date
    };

    generateSheet(false, config);
};

// Update user badge
const updateRoleBadge = () => {
    const badge = document.getElementById('currentUserBadge');
    if (badge) {
        badge.textContent = (window.currentUserRole || 'Guest').toUpperCase();
        badge.parentElement.classList.toggle('bg-red-50', window.currentUserRole !== 'incharge');
        badge.parentElement.classList.toggle('text-red-800', window.currentUserRole !== 'incharge');
        badge.parentElement.classList.toggle('border-red-100', window.currentUserRole !== 'incharge');
    }
};
document.addEventListener('DOMContentLoaded', updateRoleBadge);

window.deleteAssessment = (key) => {
    // RBAC Check: Only Incharge can delete
    if (window.currentUserRole !== 'incharge') {
        showMessage('Access Denied', 'Only Incharge users can delete assessments.', 'error');
        return;
    }

    if (!confirm('Are you sure you want to permanently delete this assessment record? This cannot be undone.')) {
        return;
    }

    // 1. Remove metadata
    delete assessmentMetadata[key];

    // 2. Remove marks from all students
    students.forEach(student => {
        if (student.marks && student.marks[key]) {
            delete student.marks[key];
        }
    });

    // 3. Save and refresh
    saveData();
    renderAssessmentHistory();
    calculateDashboardStats(); // Update stats
    showMessage('Success', 'Assessment record deleted successfully.', 'success');
};

// Initialize session on page load
checkSession();

