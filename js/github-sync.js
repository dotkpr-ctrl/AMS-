// GitHub Data Sync Module for Academic Management System
// Enables cloud storage and cross-device data access

class GitHubDataSync {
    constructor() {
        this.token = localStorage.getItem('github_token') || '';
        this.owner = 'dotkpr-ctrl';
        this.repo = 'AMS-';
        this.branch = 'data';
        this.apiBase = 'https://api.github.com';
        this.lastSync = localStorage.getItem('last_sync') || null;
        this.syncInProgress = false;
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
        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;

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
            const content = atob(data.content); // Decode base64
            return {
                content: JSON.parse(content),
                sha: data.sha
            };
        } catch (error) {
            console.error(`Error getting file ${path}:`, error);
            return null;
        }
    }

    // Upload or update file in repository
    async putFile(path, content, sha = null) {
        const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}`;

        const body = {
            message: `Update ${path} - ${new Date().toISOString()}`,
            content: btoa(JSON.stringify(content, null, 2)), // Encode to base64
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

            const mainData = await mainRef.json();
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

            return createResponse.ok;
        } catch (error) {
            console.error('Error ensuring branch exists:', error);
            return false;
        }
    }

    // Upload all data to GitHub
    async uploadData(students, assessmentMetadata, attendanceData, batchMetadata) {
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
                version: '4.2',
                students: students,
                assessmentMetadata: assessmentMetadata,
                attendanceData: attendanceData,
                batchMetadata: batchMetadata
            };

            // Get existing file SHA if it exists
            const existing = await this.getFile('ams-data.json');
            const sha = existing ? existing.sha : null;

            // Upload to GitHub
            await this.putFile('ams-data.json', data, sha);

            // Update last sync timestamp
            this.lastSync = new Date().toISOString();
            localStorage.setItem('last_sync', this.lastSync);

            return { success: true, timestamp: this.lastSync };
        } catch (error) {
            throw new Error(`Upload failed: ${error.message}`);
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
                    batchMetadata: data.batchMetadata
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
