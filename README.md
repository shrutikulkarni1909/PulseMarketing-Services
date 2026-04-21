# Battery Maintenance Management System

A full-stack web-based battery maintenance tracking system for service businesses. It helps manage customer records, AMC contracts, maintenance schedules, battery health history, and technician workflows through a centralized platform.

---

## Overview

This system replaces manual tracking of battery maintenance visits. Customer profiles, AMC details, payment records, and maintenance history are stored securely and can be accessed through any browser.

### Key Features

- Track customers due today, overdue, or upcoming this week
- Manage AMC contract dates and renewal reminders
- Record battery voltage readings during service visits
- Search and filter customers by name, area, phone, or status
- Shared centralized data management
- Responsive interface for desktop and mobile use

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js |
| Database | MongoDB |
| UI | Responsive Design, Vanilla JS |

---

## Features

### Dashboard

- Total Customers
- Due Today
- Overdue Customers
- Due This Week
- Quick action tables for daily tasks

### Customer Management

- Add new customers  
- Edit customer details  
- Remove records  
- Search & filter database  

### Maintenance Scheduling

- Auto next due date calculation  
- Mark maintenance completed  
- Reschedule visits  
- Overdue alerts  

### AMC Tracking

- AMC start/end dates  
- Expiry warnings  
- Renewal reminders  
- Payment tracking  

### Maintenance History

Store records such as:

- Date of visit  
- Voltage on mains  
- Voltage on load  
- Technician remarks  

---

## Project Structure

```bash
Battery-Maintenance-System/
│── index.html
│── server.js
│── package.json
│── .gitignore
│
└── src/
    ├── data/
    ├── components/
    ├── styles/
    └── utils/
```

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Battery-Maintenance-System.git
cd Battery-Maintenance-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env`

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

### 4. Run Project

```bash
node server.js
```

Open in browser:

```text
http://localhost:3000
```

---

## Sample Use Cases

- Battery service centers  
- AMC management businesses  
- Maintenance scheduling teams  
- Field technician tracking systems  

---

## Future Improvements

- Login / Role-based Access  
- SMS / WhatsApp reminders  
- Analytics Dashboard  
- Invoice Generation  
- Export Reports (PDF / Excel)  

---

## Author

Shruti Kulkarni  
GitHub: https://github.com/shrutikulkarni1909
