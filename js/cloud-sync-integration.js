// Cloud Sync Functions
// Initialize GitHub Sync instance
let githubSync = null;

// Initialize sync on page load
function initializeCloudSync() {
    githubSync = new GitHubDataSync();
    updateSyncUI();

    // Add event listener for cloudSync view
    const existingRenderView = window.renderView;
    window.renderView = function (viewName) {
        existingRenderView(viewName);
        if (viewName === 'cloudSync') {
            updateSyncUI();
            loadTokenInput();
        }
    };
}

// Update UI based on sync status
function updateSyncUI() {
    if (!githubSync) return;

    const status = githubSync.getSyncStatus();
    const statusCard = document.getElementById('syncStatusCard');
    const statusText = document.getElementById('syncStatusText');
    const statusIcon = document.getElementById('syncStatusIcon');
    const lastSyncInfo = document.getElementById('lastSyncInfo');
    const lastSyncTime = document.getElementById('lastSyncTime');

    const uploadBtn = document.getElementById('uploadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');

    if (status.configured) {
        statusCard.className = 'mb-6 p-4 rounded-lg border bg-green-50 border-green-200';
        statusText.textContent = '✅ Connected to GitHub';
        statusIcon.textContent = '✓';

        if (status.lastSync) {
            lastSyncInfo.classList.remove('hidden');
            const syncDate = new Date(status.lastSync);
            lastSyncTime.textContent = syncDate.toLocaleString('en-GB');
        }

        uploadBtn.disabled = false;
        downloadBtn.disabled = false;
        disconnectBtn.disabled = false;
    } else {
        statusCard.className = 'mb-6 p-4 rounded-lg border bg-yellow-50 border-yellow-200';
        statusText.textContent = 'Not configured - Enter token below';
        statusIcon.textContent = '⚠️';
        lastSyncInfo.classList.add('hidden');

        uploadBtn.disabled = true;
        downloadBtn.disabled = true;
        disconnectBtn.disabled = true;
    }
}

// Load token into input field
function loadTokenInput() {
    const tokenInput = document.getElementById('githubTokenInput');
    if (tokenInput && githubSync) {
        tokenInput.value = githubSync.token || '';
    }
}

// Test GitHub connection
window.testGitHubConnection = async () => {
    const tokenInput = document.getElementById('githubTokenInput');
    const token = tokenInput.value.trim();

    if (!token) {
        showMessage('Error', 'Please enter a GitHub token', 'error');
        return;
    }

    githubSync.setToken(token);

    try {
        const result = await githubSync.testConnection();
        showMessage('Success', `Connected as ${result.username}!`, 'success');
        updateSyncUI();
    } catch (error) {
        showMessage('Connection Failed', error.message, 'error');
    }
};

// Save GitHub token
window.saveGitHubToken = () => {
    const tokenInput = document.getElementById('githubTokenInput');
    const token = tokenInput.value.trim();

    if (!token) {
        showMessage('Error', 'Please enter a GitHub token', 'error');
        return;
    }

    githubSync.setToken(token);
    showMessage('Success', 'Token saved successfully!', 'success');
    updateSyncUI();
};

// Upload data to cloud
window.uploadToCloud = async () => {
    if (!githubSync || !githubSync.isConfigured()) {
        showMessage('Error', 'Please configure GitHub token first', 'error');
        return;
    }

    const confirmed = confirm(`This will upload all your data (students, attendance, assessments) to GitHub.\n\nContinue?`);
    if (!confirmed) return;

    try {
        showMessage('Uploading...', 'Syncing data to cloud...', 'success');

        const result = await githubSync.uploadData(
            students,
            assessmentMetadata,
            attendanceData,
            bat chMetadata
        );

        showMessage('Upload Complete', `Data synced successfully at ${new Date(result.timestamp).toLocaleTimeString()}`, 'success');
        updateSyncUI();
    } catch (error) {
        showMessage('Upload Failed', error.message, 'error');
    }
};

// Download data from cloud
window.downloadFromCloud = async () => {
    if (!githubSync || !githubSync.isConfigured()) {
        showMessage('Error', 'Please configure GitHub token first', 'error');
        return;
    }

    const confirmed = confirm(`This will replace all your local data with data from GitHub.\n\n⚠️ Make sure you've backed up any local changes!\n\nContinue?`);
    if (!confirmed) return;

    try {
        showMessage('Downloading...', 'Loading data from cloud...', 'success');

        const result = await githubSync.downloadData();

        // Update local data
        students = result.data.students;
        assessmentMetadata = result.data.assessmentMetadata;
        attendanceData = result.data.attendanceData;
        batchMetadata = result.data.batchMetadata;

        // Save to localStorage
        saveData();

        // Refresh UI
        refreshDataAndUI();

        showMessage('Download Complete', `Data loaded successfully! Last updated: ${new Date(result.timestamp).toLocaleString()}`, 'success');
        updateSyncUI();
    } catch (error) {
        showMessage('Download Failed', error.message, 'error');
    }
};

// Disconnect from GitHub
window.disconnectGitHub = () => {
    const confirmed = confirm('Disconnect from GitHub?\n\nYour local data will remain safe, but cloud sync will be disabled.');
    if (!confirmed) return;

    githubSync.disconnect();
    document.getElementById('githubTokenInput').value = '';
    showMessage('Disconnected', 'GitHub sync disabled', 'success');
    updateSyncUI();
};

// Initialize cloud sync when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCloudSync();
});
