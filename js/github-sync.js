// GitHub Data Sync Module for Academic Management System
// Enables cloud storage and cross-device data access

class GitHubDataSync {
    constructor() {
        this.token = localStorage.getItem('github_token') || '';
        this.owner = 'a2zwb';
        this.repo = 'ams';
        this.branch = 'data';
        this.apiBase = 'https://api.github.com';
        this.lastSync = localStorage.getItem('last_sync') || null;
        this.syncInProgress = false;

        // Queue state
        this.pendingUpload = localStorage.getItem('pending_upload') === 'true';
        this.initNetworkListeners();
    }

    // Initialize network state listeners
    initNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('Network online. Checking for pending uploads...');
            this.processQueue();
        });

        // Check periodically just in case
        setInterval(() => {
            if (navigator.onLine && this.pendingUpload) {
                this.processQueue();
            }
        }, 60000); // Check every minute
    }

    // Process pending uploads
    async processQueue() {
        if (!this.pendingUpload || this.syncInProgress) return;

        console.log('Processing offline queue...');

        try {
            // Use the data currently in localStorage as the source of truth
            if (typeof window.saveData === 'function') {
                // Trigger a sync using the global sync function if available
                // This ensures we get the latest state from app memory
                await window.autoSyncToCloud();
            } else {
                // Fallback: try to just mark as done if we can't trigger sync
                // But usually autoSyncToCloud will call uploadData
                this.pendingUpload = false;
                localStorage.setItem('pending_upload', 'false');
            }
        } catch (e) {
            console.log('Retry failed:', e.message);
        }
    }

    // Set GitHub Personal Access Token
    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    // Get headers for GitHub API requests
    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    // Check if token is configured
    isConfigured() {
        return this.token && this.token.length > 0;
    }

    // Test connection to GitHub
    async testConnection() {
        if (!this.isConfigured()) {
            throw new Error('GitHub token not configured');
        }

        try {
            const response = await fetch(`${this.apiBase}/user`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Invalid GitHub token');
            }

            const user = await response.json();
            return { success: true, username: user.login };
        } catch (error) {
            throw new Error(`Connection failed: ${error.message}`);
        }
    }

    // Get file from repository
    async getFile(path) {
        // ... (existing getFile logic)
        // Add timestamp to prevent caching of SHA
        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}&t=${Date.now()}`;

        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (response.status === 404) {
                return null; // File doesn't exist yet
            }

            if (!response.ok) {
                throw new Error(`Failed to get file: ${response.statusText}`);
            }

            const data = await response.json();
            // Unicode-safe decoding
            const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
            return {
                content: JSON.parse(content),
                sha: data.sha
            };
        } catch (error) {
            console.error(`Error getting file ${path}:`, error);
            // Don't throw here, just return null so app can work offline
            return null;
        }
    }

    // Upload or update file in repository
    async putFile(path, content, sha = null) {
        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}`;

        const body = {
            message: `Update ${path} - ${new Date().toISOString()}`,
            // Unicode-safe encoding (btoa fails on non-Latin1 chars)
            content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
            branch: this.branch
        };

        if (sha) {
            body.sha = sha; // Required for updates
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload file');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    // Ensure data branch exists
    async ensureBranchExists() {
        try {
            // Check if branch exists
            const branchUrl = `${this.apiBase}/repos/${this.owner}/${this.repo}/branches/${this.branch}`;
            const response = await fetch(branchUrl, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                return true; // Branch already exists
            }

            // If branch doesn't exist, create it from main
            const mainRef = await fetch(`${this.apiBase}/repos/${this.owner}/${this.repo}/git/ref/heads/main`, {
                headers: this.getHeaders()
            });

            if (!mainRef.ok) {
                throw new Error(`Failed to get main branch: ${mainRef.statusText}`);
            }

            const mainData = await mainRef.json();

            if (!mainData || !mainData.object || !mainData.object.sha) {
                throw new Error('Invalid response from GitHub API');
            }

            const sha = mainData.object.sha;

            // Create new branch
            const createResponse = await fetch(`${this.apiBase}/repos/${this.owner}/${this.repo}/git/refs`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    ref: `refs/heads/${this.branch}`,
                    sha: sha
                })
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.json();
                throw new Error(`Failed to create branch: ${errorData.message || createResponse.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error ensuring branch exists:', error);
            throw error; // Propagate error instead of returning false
        }
    }

    // Upload all data to GitHub
    async uploadData(students, assessmentMetadata, attendanceData, batchMetadata, staffMembers = [], activityLogs = []) {
        if (!this.isConfigured()) {
            throw new Error('GitHub token not configured. Please set up sync in Settings.');
        }

        if (this.syncInProgress) {
            throw new Error('Sync already in progress');
        }

        this.syncInProgress = true;

        try {
            // Ensure data branch exists
            await this.ensureBranchExists();

            // Prepare data structure
            const data = {
                lastUpdated: new Date().toISOString(),
                version: '4.8', // Bump version in JSON
                students: students,
                assessmentMetadata: assessmentMetadata,
                attendanceData: attendanceData,
                batchMetadata: batchMetadata,
                staffMembers: staffMembers,
                activityLogs: activityLogs
            };

            // Get existing file SHA if it exists
            const filePath = 'ams-data.json';
            const existing = await this.getFile(filePath);
            const sha = existing ? existing.sha : null;

            // Upload to GitHub
            await this.putFile(filePath, data, sha);

            // Update last sync timestamp
            this.lastSync = new Date().toISOString();
            localStorage.setItem('last_sync', this.lastSync);

            // Clear pending flag on success
            this.pendingUpload = false;
            localStorage.setItem('pending_upload', 'false');

            return { success: true, timestamp: this.lastSync };
        } catch (error) {
            console.warn('Sync failed, queuing for retry:', error.message);

            // Mark as pending upload so we retry later
            this.pendingUpload = true;
            localStorage.setItem('pending_upload', 'true');

            // Return special status code for offline/queued
            return {
                success: false,
                queued: true,
                message: error.message
            };
        } finally {
            this.syncInProgress = false;
        }
    }

    // Download data from GitHub
    async downloadData() {
        if (!this.isConfigured()) {
            throw new Error('GitHub token not configured. Please set up sync in Settings.');
        }

        if (this.syncInProgress) {
            throw new Error('Sync already in progress');
        }

        this.syncInProgress = true;

        try {
            const file = await this.getFile('ams-data.json');

            if (!file) {
                throw new Error('No data found in cloud. Please upload data first.');
            }

            const data = file.content;

            // Validate data structure
            if (!data.students || !data.assessmentMetadata || !data.attendanceData || !data.batchMetadata) {
                throw new Error('Invalid data format in cloud storage');
            }

            // Update last sync timestamp
            this.lastSync = data.lastUpdated;
            localStorage.setItem('last_sync', this.lastSync);

            return {
                success: true,
                data: {
                    students: data.students,
                    assessmentMetadata: data.assessmentMetadata,
                    attendanceData: data.attendanceData,
                    batchMetadata: data.batchMetadata,
                    staffMembers: data.staffMembers || []
                },
                timestamp: data.lastUpdated
            };
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Get sync status
    getSyncStatus() {
        return {
            configured: this.isConfigured(),
            lastSync: this.lastSync,
            inProgress: this.syncInProgress
        };
    }

    // Clear token (disconnect)
    disconnect() {
        this.token = '';
        localStorage.removeItem('github_token');
        localStorage.removeItem('last_sync');
        this.lastSync = null;
    }
}

// Export for use in main app
window.GitHubDataSync = GitHubDataSync;

