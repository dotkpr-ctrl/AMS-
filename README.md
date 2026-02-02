# Academic Management System (AMS) v5.2.0

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://dotkpr-ctrl.github.io/AMS-/)
[![Version](https://img.shields.io/badge/version-5.2.0-blue)](https://github.com/dotkpr-ctrl/AMS-)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚀 Overview
A comprehensive web-based Academic Management System designed for the **Automobile Engineering Department** at the **Institute of Heavy Equipment & ITC**. Built with vanilla JavaScript, this system handles student profiles, attendance tracking, assessment management, document uploads, and document generation—all with offline-first capabilities using browser local storage.

---

## 🌟 Key Features

### 📅 Attendance System
- **Daily Marking**: Record attendance for Theory and Practical sessions.
- **Sub-Batch Support**: Filter students by batch divisions for practicals.
- **Live Search**: Quickly find students by name or admission number.
- **WhatsApp Integration**: Share attendance summaries directly to faculty groups.

### ✒️ Assessment Management
- **Grade Entry**: Streamlined interface for Viva and Practical marks.
- **Auto-Ranking**: Instant calculation of ranks based on total scores.
- **Data Validation**: Real-time validation against maximum mark limits.

### 📁 Document Management
- **Smart Uploads**: Attach certificates and documents to student profiles.
- **Cloud Sync**: Optional GitHub-powered cloud storage for cross-device access.

### 🖨️ Document Center
- **Automated Generation**: Create Assessment Sheets and Hall Tickets instantly.
- **Print-Ready Designs**: All generated documents are optimized for A4 printing.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Tailwind CSS
- **Logic**: Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage + GitHub Sync
- **Version**: 5.2.0

## 🆕 Recent Updates (v5.2.0)

### New Features
- ✅ Student document upload system
- ✅ Detailed activity logging for administrators
- ✅ Cloud sync status indicators

### Bug Fixes
- ✅ Fixed dashboard initialization on page load
- ✅ Fixed role persistence across sessions
- ✅ Improved permission controls

### Improvements
- ✅ Cleaner staff dashboard (3 cards)
- ✅ Better error messages
- ✅ Enhanced file validation
- ✅ Updated UI/UX

---

## 💻 Quick Start

### 🌐 Direct Link
Simply visit: [https://dotkpr-ctrl.github.io/AMS-/](https://dotkpr-ctrl.github.io/AMS-/)

### 🏠 Local Installation
1. Register/Login to your GitHub account.
2. Clone the repository:
   ```bash
   git clone https://github.com/dotkpr-ctrl/AMS-.git
   ```
3. Open `index.html` in any modern web browser.

### Option 3: Direct File Access
Simply open `index.html` in your web browser. No server needed!

## 📁 Project Structure

```
AMS-/
├── index.html              # Main HTML structure with all views
├── index.css              # Custom styles and design system
├── js/
│   ├── ams-core.js        # Core application logic
│   ├── github-sync.js     # Cloud synchronization
│   ├── cloud-sync-integration.js  # Sync integration
│   └── logger.js          # Activity logging system
├── assets/                # Images and static resources
├── README.md              # This file
├── LICENSE                # MIT License
├── DEPLOYMENT.md          # Deployment guide
└── .gitignore             # Git exclusions
```

## 📖 Usage Guide

### Initial Setup

1. **First Visit**: Login modal appears
2. **Select Role**: Choose Admin or Staff
3. **Dashboard**: Role-specific dashboard loads
4. **Data**: System uses localStorage, data persists

### Adding Students

**Individual Entry:**
1. Navigate to "Student Profiles"
2. Select a batch ID
3. Fill in student name and admission number
4. Click "Save Student"

**Bulk Import:**
1. Click "+ Bulk Import"
2. Enter batch ID
3. Paste data in format: `Name, Admission Number`
4. Click "Import Batch"

### Managing Student Documents **(NEW)**

1. Go to "Student Profiles"
2. Find the student in the list
3. Click "📎 Docs (n)" button
4. **Upload**: Click "Choose File" and select a document
   - Supported: PDF, JPG, PNG, DOC, DOCX
   - Max size: 500KB
5. **Download**: Click blue "Download" button
6. **Delete**: Click red "Delete" button (with confirmation)
7. Documents persist across sessions

### Marking Attendance

1. Go to "Mark Attendance"
2. Select batch, session type, and date
3. Select sub-batch for workshop sessions
4. Check/uncheck students present
5. Click "Save Attendance"
6. Optional: Share summary via WhatsApp

### Recording Assessment Marks

1. Navigate to "Assessments"
2. Select batch, semester, and exam date
3. Click "Begin Mark Entry"
4. Enter marks (auto-validates)
5. Press Enter to move between fields
6. Click "💾 Save Scores"
7. View automatic rankings

### Viewing Activity Logs

1. Go to "Activity Logs" (Admin only)
2. View timestamped activities
3. Filter by action type
4. Export to CSV for analysis

## 🔒 Security & Privacy

- All data stored locally in browser
- No external data transmission (except GitHub sync if enabled)
- Role-based access control
- Admin-only sensitive operations
- Regular backups recommended via Export feature
- Documents stored as base64 in localStorage

## 🔑 Permission Matrix

| Feature | Admin | Staff |
|---------|-------|-------|
| Dashboard | ✅ | ✅ |
| Mark Attendance | ✅ | ✅ |
| Assessments | ✅ | ✅ |
| Daily Attendance | ✅ | ✅ |
| Student Profiles | ✅ | ✅ |
| **Upload Documents** | ✅ | ✅ |
| **Download Documents** | ✅ | ✅ |
| **Delete Documents** | ✅ | ✅ |
| Delete Students | ✅ | ❌ |
| Bulk Import | ✅ | ❌ |
| Document Management | ✅ | ❌ |
| Staff Management | ✅ | ❌ |
| Activity Logs | ✅ | ❌ |

## 📊 System Statistics

- **Total Students**: 307
- **Active Batches**: 16
- **Assessments Recorded**: 7
- **Storage**: LocalStorage + GitHub Sync
- **Version**: 5.2.0

---

## ☁️ Cloud Sync Setup

To enable cross-device synchronization:
1. Generate a **GitHub Personal Access Token** (classic) with `repo` scope.
2. Open the **Cloud Sync** menu in the application.
3. Paste your token and click **Connect**.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Next Steps: Push to GitHub

### Step 1: Push to GitHub

You need to push the code to GitHub. Since this is your first push, you'll need to authenticate.

Run this command:

```bash
git push -u origin main
```

**Important**: GitHub will prompt you for authentication. You have two options:

#### Option A: Using Personal Access Token (Recommended)

1. **Create a token** at: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "AMS Push Token"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

When prompted for password during `git push`, paste the token instead.

#### Option B: Using GitHub Desktop

1. Install GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Add this repository: File → Add Local Repository
4. Select folder: `c:\Users\a2zin\.gemini\antigravity\playground\vacant-pathfinder`
5. Click "Publish repository"

### Step 2: Enable GitHub Pages

After pushing to GitHub:

1. Go to: https://github.com/dotkpr-ctrl/AMS-/settings/pages
2. Under "Source", select: **main** branch
3. Folder: **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your site will be live at: **https://dotkpr-ctrl.github.io/AMS-/**

### Step 3: Verify Deployment

Visit https://dotkpr-ctrl.github.io/AMS-/ to see your live application!

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**dotkpr-ctrl**
- GitHub: [@dotkpr-ctrl](https://github.com/dotkpr-ctrl)
- Email: a2zwb@github.com1

## 🏫 Institution

**Institute of Heavy Equipment & ITC**
- Department: Automobile Engineering
- Approved Institute of STED Council of India

## 🙏 Acknowledgments

- Designed for the Automobile Engineering Department
- Built with ❤️ using modern web technologies
- Special thanks to all contributors and users
- Powered by vanilla JavaScript and Tailwind CSS

## 📞 Support

For issues, questions, or suggestions:
- Open an [issue](https://github.com/dotkpr-ctrl/AMS-/issues)
- Contact: via GitHub Issues

## 🔗 Links

- **Live Demo**: [https://dotkpr-ctrl.github.io/AMS-/](https://dotkpr-ctrl.github.io/AMS-/)
- **Repository**: [https://github.com/dotkpr-ctrl/AMS-](https://github.com/dotkpr-ctrl/AMS-)

---

**Version**: 5.2.0 | **Status**: Stable | **Last Updated**: February 2, 2026

**Built with vanilla JavaScript - No frameworks, no build tools, no dependencies!** ⚡

