# Academic Management System (AMS) v4.9.8

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://dotkpr-ctrl.github.io/AMS-/)
[![Version](https://img.shields.io/badge/version-4.9.8-blue)](https://github.com/dotkpr-ctrl/AMS-)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A comprehensive web-based Academic Management System designed for the **Automobile Engineering Department** at the **Institute of Heavy Equipment & ITC**. Built with vanilla JavaScript, this system handles student profiles, attendance tracking, assessment management, document uploads, and document generation—all with offline-first capabilities using browser local storage.

![AMS Dashboard](https://raw.githubusercontent.com/dotkpr-ctrl/-assets/87413e49245de21f59888203d550557d31c03cf6/Picture1.png)

## ✨ Features

### 🔐 Role-Based Access Control
- **Admin Access** (Site Administrator): Full system control
- **Staff Access** (Staff Members): Limited permissions for daily operations
- Automatic role persistence across sessions
- Custom dashboards for each role

### 📊 Dashboard
- **Admin Dashboard**: Student Profiles, Document Management, Staff Management, Activity Logs
- **Staff Dashboard**: Mark Attendance, Assessments, Daily Attendance
- Real-time statistics on students, batches, and assessments
- Quick access to role-specific functions
- Clean, modern interface with dynamic cards

### 👥 Student Management
- Individual student profile creation
- Bulk import via CSV/TSV format
- Batch and sub-batch organization (A/B)
- Batch in-charge assignment
- **🆕 Student Document Upload** - Upload, download, and manage documents per student
  - Supported formats: PDF, JPG, PNG, DOC, DOCX
  - 500KB file size limit per document
  - Document count display in student list
  - Activity logging for all document operations

### 📎 Document Upload System **(NEW)**
- Upload important documents for individual students
- Support for multiple file types (PDFs, images, Word docs)
- File validation and size limits
- Download documents anytime
- Delete documents with confirmation
- Document count displayed next to each student
- Accessible to both admin and staff members
- All uploads logged in Activity Logs

### ✅ Attendance System
- Daily attendance marking with date selection
- Session types: Theory, Lab, Workshop
- Sub-batch filtering for workshops
- WhatsApp share integration for absence reports
- Monthly attendance registers with percentage calculations
- Print-ready attendance documents
- Attendance history tracking

### 📝 Assessment & Grading
- Workshop assessment mark entry with automatic ranking
- Support for multiple assessment types (Q1-Q6, Practical, Record)
- Per-question mark limits with validation
- Automatic total calculation and ranking
- Semester-wise tracking
- Student transcript generation
- Assessment history with filtering

### 📋 Activity Logging
- Comprehensive activity tracking for all user actions
- Log levels: Info, Warning, Error
- Timestamps and user attribution
- Export activity logs to CSV
- View recent activities from dashboard

### 🖨️ Document Generation
- **Attendance Index**: Signature sheets
- **Blank Mark Sheets**: Pre-formatted templates
- **Final Mark Sheets**: Complete with rankings
- **Monthly Registers**: Date-wise attendance grids
- **Student Transcripts**: Complete academic history
- Professional A4 print layouts
- No-print classes for clean output

### 💾 Data Management
- Complete backup/restore functionality
- JSON export/import
- Browser local storage (offline-first)
- **Cloud Sync via GitHub** - Automatic data synchronization
- No server required for basic operation
- Data persistence across sessions

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
Simply visit: [https://dotkpr-ctrl.github.io/AMS-/](https://dotkpr-ctrl.github.io/AMS-/)

**Default Login Credentials:**
- **Admin**: Ziyad Basheer (Site Administrator)
- **Staff**: KIRAN (Staff Member)

### Option 2: Local Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/dotkpr-ctrl/AMS-.git
   cd AMS-
   ```

2. **Serve the files**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

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

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN), Custom CSS
- **Storage**: Browser LocalStorage API
- **Cloud Sync**: GitHub API
- **Fonts**: Google Fonts (Inter)
- **Icons**: Emoji + Unicode

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
- **Version**: 4.9.8

## 🆕 Recent Updates (v4.9.8)

### New Features
- ✅ Student document upload system
- ✅ Role-based dashboard cards
- ✅ Staff access to Student Profiles
- ✅ Activity logging system
- ✅ Cloud sync with GitHub

### Bug Fixes
- ✅ Fixed dashboard initialization on page load
- ✅ Fixed role persistence across sessions
- ✅ Improved permission controls

### Improvements
- ✅ Cleaner staff dashboard (3 cards)
- ✅ Better error messages
- ✅ Enhanced file validation
- ✅ Updated UI/UX

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**dot kpr**
- GitHub: [@dotkpr-ctrl](https://github.com/dotkpr-ctrl)
- Email: dotkpr@gmail.com

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
- Email: dotkpr@gmail.com

## 🔗 Links

- **Live Demo**: [https://dotkpr-ctrl.github.io/AMS-/](https://dotkpr-ctrl.github.io/AMS-/)
- **Repository**: [https://github.com/dotkpr-ctrl/AMS-](https://github.com/dotkpr-ctrl/AMS-)
- **Documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Version**: 4.9.8 | **Status**: Stable | **Last Updated**: January 31, 2026

**Built with vanilla JavaScript - No frameworks, no build tools, no dependencies!** ⚡
