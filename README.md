# Wanna Web Supervisor Admin

A professional full-stack application with a React frontend and a Node.js/Express backend. This project is designed for supervisor management and admin oversight.

---

## 📁 Project Structure

This repository contains both the client-side and server-side code:

* **`backend/`** - Node.js & Express API, Database models, and JWT authentication.
* **`frontend/`** - React.js application, UI components, and state management.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- CSS3 / Bootstrap (or your chosen framework)
- Axios for API calls

**Backend:**
- Node.js & Express
- JWT (JSON Web Tokens) for security
- MongoDB (via Mongoose)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed.

### 2. Installation

First, clone the repository:

git clone [https://github.com/mayuri-gaikwad5/Wanna-web-supervisor-admin.git](https://github.com/mayuri-gaikwad5/Wanna-web-supervisor-admin.git)
cd Wanna-web-supervisor-admin

### 3. Setup Backend
 
```bash
cd backend
npm install
# Note: You may need to create a .env file for database and JWT secrets
node src/app.js

## Setup Frontend
Open a second terminal window:
cd frontend
npm install
npm run dev




### 2026-01-19 
#### Stable Release – Multi-Region Admin & Supervisor System
**Major Updates:**
- Region-based Admin system implemented
- One Admin per region (e.g., Solapur, Pune)
- Supervisor signup includes region selection
- Supervisor approval requests are visible **only to Admin of same region**
- Admin approval flow stabilized
- Supervisor dashboard fixed for reload (no auto logout)
- Map shows region-based view (e.g., Solapur supervisor sees Solapur)
- Email verification:
  - Supervisor → Required
  - Admin → Not required
- Backend auth status unified and secured
- MongoDB duplicate region protection handled
- Mappls integration stabilized (lat/lng order fixed)
- Supervisor logs for admin in particular region with access management
## Notes
- Do not create multiple admins for same region
- Region names must match across system (case-sensitive)
- Always commit stable code before major changes
