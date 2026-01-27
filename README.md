# Academic Management System (AMS) v4.2

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://dotkpr-ctrl.github.io/AMS-/)
[![Version](https://img.shields.io/badge/version-4.2-blue)](https://github.com/dotkpr-ctrl/AMS-)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A comprehensive web-based Academic Management System designed for the **Automobile Engineering Department**. Built with vanilla JavaScript, this system handles student profiles, attendance tracking, assessment management, and document generation—all with offline-first capabilities using browser local storage.

![AMS Dashboard](https://raw.githubusercontent.com/dotkpr-ctrl/-assets/87413e49245de21f59888203d550557d31c03cf6/Picture1.png)

## ✨ Features

### 📊 Dashboard
- Real-time statistics on students, batches, and assessments
- Quick access to all major functions
- Clean, modern interface

### 👥 Student Management
- Individual student profile creation
- Bulk import via CSV/TSV format
- Batch and sub-batch organization
- Batch in-charge assignment

### ✅ Attendance System
- Daily attendance marking with date selection
- Sub-batch filtering
- WhatsApp share integration for absence reports
- Monthly attendance registers with percentage calculations
- Print-ready attendance documents

### 📝 Assessment & Grading
- Workshop viva mark entry with automatic ranking
- Support for multiple assessment types (Q1-Q6, Practical, Record)
- Per-question mark limits with validation
- Automatic total calculation
- Semester-wise tracking
- Student transcript generation

### 🖨️ Document Generation
- **Attendance Index**: Signature sheets
- **Blank Mark Sheets**: Pre-formatted templates
- **Final Mark Sheets**: Complete with rankings
- **Monthly Registers**: Date-wise attendance grids
- **Student Transcripts**: Complete academic history
- Professional A4 print layouts

### 💾 Data Management
- Complete backup/restore functionality
- JSON export/import
- Browser local storage (offline-first)
- No server required

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
Simply visit: [https://dotkpr-ctrl.github.io/AMS-/](https://dotkpr-ctrl.github.io/AMS-/)

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
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Custom styles and print layouts
├── js/
│   └── app.js          # Application logic and data management
├── README.md           # This file
├── LICENSE             # MIT License
└── .gitignore          # Git exclusions
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN), Custom CSS
- **Storage**: Browser LocalStorage API
- **Fonts**: Google Fonts (Inter)
- **Icons**: Emoji + SVG

## 📖 Usage Guide

### Adding Students

**Individual Entry:**
1. Navigate to "Student Profiles"
2. Select a batch
3. Fill in the form at the bottom
4. Click "Save Student"

**Bulk Import:**
1. Click "+ Bulk Import"
2. Enter batch ID
3. Paste data in format: `Name, Admission Number`
4. Click "Import Batch"

### Marking Attendance

1. Go to "Daily Attendance"
2. Select batch, sub-batch (if any), and date
3. Check/uncheck present status
4. Click "Save to Register"
5. Optional: Share summary via WhatsApp

### Recording Assessment Marks

1. Navigate to "Assessment Entry"
2. Select batch, semester, and exam date
3. Click "Begin Mark Entry"
4. Enter marks (auto-validates against limits)
5. Press Enter to move to next field
6. Click "💾 Save Scores"

### Generating Documents

1. Go to "Document Center"
2. Select document type
3. Choose batch and other parameters
4. Click "Generate Printable Document"
5. Use "🖨️ Print to A4" when ready

## 🔒 Data Security

- All data is stored locally in your browser
- No data is transmitted to external servers
- Regular backups recommended (use Export feature)
- Data persists across sessions

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

## 🙏 Acknowledgments

- Designed for the Automobile Engineering Department
- Built with ❤️ using modern web technologies
- Special thanks to all contributors and users

## 📞 Support

For issues, questions, or suggestions:
- Open an [issue](https://github.com/dotkpr-ctrl/AMS-/issues)
- Email: dotkpr@gmail.com

---

**Version**: 4.2 | **Status**: Stable | **Last Updated**: January 2026
