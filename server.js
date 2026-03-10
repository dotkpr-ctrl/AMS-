const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const ip = require('ip');
const os = require('os');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Store data in the user's AppData/Roaming folder so it persists and isn't deleted accidentally
const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
const serverDataDir = path.join(appDataPath, 'AMS-Server');
const serverDataPath = path.join(serverDataDir, 'ams-server-data.json');

// Ensure directory exists
if (!fs.existsSync(serverDataDir)) {
    fs.mkdirSync(serverDataDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.static(path.join(__dirname, '/')));

app.get('/api/data', (req, res) => {
    try {
        if (fs.existsSync(serverDataPath)) {
            const data = fs.readFileSync(serverDataPath, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.json({ students: [], assessmentMetadata: {}, attendanceData: {}, batchMetadata: {}, staffMembers: [] });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(serverDataPath, JSON.stringify(req.body));
        res.json({ success: true });
    } catch (e) {
        console.error('Error saving data:', e);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log('✅ AMS LOCAL SERVER IS RUNNING');
    console.log('======================================================');
    console.log(`\nLocal Access (This PC): http://localhost:${PORT}`);
    console.log(`Network Access (Phones/Other PCs): http://${ip.address()}:${PORT}`);
    console.log(`\nData is safely being saved to: ${serverDataPath}`);
    console.log('\n======================================================');
    console.log('Press Ctrl+C to stop the server\n');

    // Automatically open the default browser on Windows
    exec(`start http://localhost:${PORT}`);
});
