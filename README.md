# 🏘️ Neighborhood Service Marketplace

A full-stack MERN web platform connecting customers with local service providers through a competitive bidding system. Features include provider profiles, service requests, real-time bidding, booking management, and review systems.

---

## 📋 Project Description

The Neighborhood Service Marketplace is a comprehensive web application designed to bridge the gap between customers seeking services and local service providers. Built using the MERN stack, this platform enables:

- **Customers** to browse service providers, create service requests, receive competitive bids, and book services
- **Service Providers** to create profiles, showcase their work through portfolios, bid on service requests, and manage bookings
- **Admins** to manage users, service categories, and oversee platform operations

The platform implements a competitive bidding system where customers post service requests, providers submit bids with their proposed pricing and timeline, and customers can compare and select the best offer. This marketplace approach ensures competitive pricing and quality service delivery while providing transparency and choice to all parties involved.

**Key Features:**
- Role-based authentication and authorization (Customer, Provider, Admin)
- Provider profile management with portfolio galleries (max 10 images)
- Service request creation with budget ranges and location
- Competitive bidding system with automatic bid management
- Booking lifecycle management (Pending → Confirmed → In Progress → Completed)
- Review and rating system (only after service completion)
- Admin dashboard for user and category management
- Real-time notifications for bids and bookings

---

## 📄 Documentation

**Software Requirements Specification (SRS):**  
[View SRS Document](https://docs.google.com/document/d/1iOjoqQt3mgJnKMiFh0_M2RK23cPJyDzRnYgWpswb0vw/edit?usp=sharing)

---

## 👥 Team Members

| Name | Student ID |
|------|------------|
| Ifte Kharul Islam | TBD |
| Irfan Alam Rahi | TBD |
| Md. Faisal Bin Kamal | TBD |
| Mohammad Abtahi Kafil Chy | TBD |

*CSE470 - Software Engineering Project*  
*BRAC University*

---

## 🛠️ Tech Stack

### **MERN Stack**

| Technology | Purpose | Version |
|------------|---------|---------|
| **M** - MongoDB | NoSQL database for data storage | Atlas (Cloud) |
| **E** - Express.js | Backend web framework | ^4.18.2 |
| **R** - React | Frontend JavaScript library | ^18.2.0 |
| **N** - Node.js | JavaScript runtime | ^20.x |

### **Additional Technologies**

**Backend:**
- **Mongoose** (^8.0.3) - MongoDB ODM for data modeling
- **JWT** (^9.0.2) - JSON Web Tokens for authentication
- **Bcrypt.js** (^2.4.3) - Password hashing and security
- **Nodemailer** (^6.9.7) - Email service for notifications
- **Multer** - File upload handling for images
- **CORS** (^2.8.5) - Cross-origin resource sharing
- **Dotenv** (^16.3.1) - Environment variable management
- **Cookie-parser** (^1.4.6) - Cookie handling
- **Validator** (^13.11.0) - Input validation

**Frontend:**
- **React Router DOM** (^6.20.0) - Client-side routing
- **Axios** (^1.6.0) - HTTP client for API requests
- **Context API** - Global state management
- **CSS3** - Modern styling and responsive design

**Development Tools:**
- **Nodemon** (^3.0.2) - Auto-restart backend server
- **React Scripts** (^5.0.1) - React development tools

---

## 📁 Project Structure
```
neighborhood-service-marketplace/
├── backend/                      # Express.js backend
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── config.env           # Environment variables
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js              # User model (Customer, Provider, Admin)
│   │   ├── Address.js           # Address schema
│   │   ├── ServiceProvider.js   # Provider profile
│   │   ├── ServiceCategory.js   # Service categories
│   │   ├── ServiceRequest.js    # Service requests
│   │   ├── Bid.js               # Bidding system
│   │   ├── Booking.js           # Booking management
│   │   ├── Review.js            # Reviews & ratings
│   │   ├── Payment.js           # Payment records
│   │   └── Notification.js      # Notifications
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── serviceProviderController.js
│   │   ├── bidController.js
│   │   └── bookingController.js
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── serviceProviderRoutes.js
│   │   ├── bidRoutes.js
│   │   └── bookingRoutes.js
│   ├── middleware/              # Custom middleware
│   │   ├── authMiddleware.js    # JWT authentication
│   │   ├── roleMiddleware.js    # Role-based authorization
│   │   ├── errorHandler.js      # Error handling
│   │   └── uploadMiddleware.js  # File upload
│   ├── utils/                   # Helper functions
│   │   ├── jwtToken.js
│   │   └── sendEmail.js
│   ├── server.js                # Entry point
│   └── package.json
│
├── frontend/                    # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   └── src/
│       ├── models/              # Data models
│       │   ├── User.js
│       │   ├── ServiceProvider.js
│       │   └── Bid.js
│       ├── views/               # React components
│       │   ├── components/
│       │   │   ├── auth/
│       │   │   │   ├── LoginForm.jsx
│       │   │   │   ├── RegisterForm.jsx
│       │   │   │   └── ForgotPasswordForm.jsx
│       │   │   ├── common/
│       │   │   │   └── ProtectedRoute.jsx
│       │   │   ├── provider/
│       │   │   ├── customer/
│       │   │   └── admin/
│       │   └── pages/
│       │       ├── LoginPage.jsx
│       │       ├── RegisterPage.jsx
│       │       ├── CustomerDashboard.jsx
│       │       ├── ProviderDashboard.jsx
│       │       └── AdminDashboard.jsx
│       ├── controllers/         # Frontend business logic
│       │   ├── authController.js
│       │   └── userController.js
│       ├── services/            # API service calls
│       │   ├── api.js           # Axios instance
│       │   ├── authService.js
│       │   └── userService.js
│       ├── context/             # Global state
│       │   └── AuthContext.jsx
│       ├── utils/               # Utilities
│       │   ├── constants.js
│       │   └── validators.js
│       ├── styles/              # CSS files
│       │   └── global.css
│       ├── App.jsx              # Main app component
│       ├── index.jsx            # Entry point
│       └── package.json
│
├── docs/                        # Documentation
│   └── class-diagram.pdf
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### **Prerequisites**

Ensure you have the following installed:

- **Node.js** (v20.x or later) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** (free) - [Sign up](https://www.mongodb.com/cloud/atlas/register)

**Check installations:**
```bash
node --version    # Should show v20.x or higher
npm --version     # Should show 10.x or higher
git --version     # Should show 2.x or higher
```

---

## 📥 Installation

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/Clashi07/Neighborhood-Service-Marketplace.git
cd Neighborhood-Service-Marketplace
```

---

### **Step 2: Backend Setup**

#### **2.1 Install Backend Dependencies**
```bash
cd backend
npm install
```


#### **2.2 Create Environment Variables**

Create a file `backend/config/config.env`:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/neighborhood-marketplace

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=noreply@marketplace.com
FROM_NAME=Neighborhood Service Marketplace
```


---

### **Step 3: Frontend Setup**

#### **3.1 Install Frontend Dependencies**
```bash
# From project root
cd frontend
npm install
```

#### **3.2 Proxy Configuration**

The frontend is already configured to proxy API requests to the backend.

In `frontend/package.json`, you'll find:
```json
"proxy": "http://localhost:5000"
```

This allows the frontend to make API calls to `/api/*` which get forwarded to `http://localhost:5000/api/*`.

---

## ▶️ Running the Application

You need **TWO terminal windows** running simultaneously:

### **Terminal 1: Start Backend Server**
```bash
# From project root
cd backend
npm run dev
```

**Expected output:**
```
Server running in development mode on port 5000
MongoDB Connected: marketplace-shard-00-00.glauxe6.mongodb.net
```

✅ **Backend is running on:** `http://localhost:5000`

---

### **Terminal 2: Start Frontend Server**
```bash
# From project root (open a NEW terminal)
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view neighborhood-service-marketplace-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ **Frontend is running on:** `http://localhost:3000`

The browser will automatically open at `http://localhost:3000`

---

## 🧪 Testing the Application

### **1. Access the Application**

Open your browser and go to: **http://localhost:3000**

### **2. Register a New Account**

1. Navigate to **Register** page (`http://localhost:3000/register`)
2. Fill in the registration form:
   - **Name:** Your full name
   - **Email:** your-email@example.com
   - **Phone:** (optional) 1234567890
   - **Role:** Choose "Customer" or "Provider"
   - **Password:** Minimum 6 characters
   - **Confirm Password:** Match your password
3. Click **Sign Up**

**What happens:**
- User account is created in MongoDB
- JWT token is generated
- User is automatically logged in
- Redirected to role-based dashboard

### **3. Login**

1. Go to **Login** page (`http://localhost:3000/login`)
2. Enter your credentials:
   - **Email:** your-email@example.com
   - **Password:** your-password
3. Click **Login**

**Redirects based on role:**
- **Customer** → `/customer/dashboard`
- **Provider** → `/provider/dashboard`
- **Admin** → `/admin/dashboard`

### **4. Test Authentication Features**

**Logout:**
- Click the logout button on the dashboard
- You'll be redirected to the login page
- Token is cleared from localStorage

**Forgot Password:**
1. Go to `/forgot-password`
2. Enter your email
3. Check console/backend logs (email sending requires SMTP configuration)

**Protected Routes:**
- Try accessing `/customer/dashboard` without logging in
- You'll be redirected to `/login`

---

## 🌐 API Endpoints

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current logged-in user | Private |
| GET | `/logout` | Logout user | Private |
| GET | `/verify-email/:token` | Verify email address | Public |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password/:token` | Reset password with token | Public |

---

### **User Routes** (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/password` | Change password | Private |
| POST | `/photo` | Upload profile photo | Private |
| PUT | `/deactivate` | Deactivate account | Private |

---

### **Service Provider Routes** (`/api/service-providers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all providers | Public |
| POST | `/profile` | Create provider profile | Private (Provider) |
| PUT | `/profile` | Update provider profile | Private (Provider) |
| GET | `/:id` | Get provider by ID | Public |
| GET | `/search` | Search providers | Public |

---

### **Service Category Routes** (`/api/categories`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all categories | Public |
| POST | `/` | Create category | Private (Admin) |
| PUT | `/:id` | Update category | Private (Admin) |
| DELETE | `/:id` | Delete category | Private (Admin) |

---

### **Service Request Routes** (`/api/requests`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all requests | Private |
| POST | `/` | Create service request | Private (Customer) |
| GET | `/my-requests` | Get user's requests | Private (Customer) |
| GET | `/:id` | Get request by ID | Private |
| PUT | `/:id` | Update request | Private (Customer) |
| DELETE | `/:id` | Delete request | Private (Customer) |

---

### **Bid Routes** (`/api/bids`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all bids | Private |
| POST | `/` | Place a bid | Private (Provider) |
| GET | `/request/:requestId` | Get bids for request | Private |
| PUT | `/:id/accept` | Accept bid | Private (Customer) |
| PUT | `/:id/reject` | Reject bid | Private (Customer) |
| PUT | `/:id/withdraw` | Withdraw bid | Private (Provider) |

---

### **Booking Routes** (`/api/bookings`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all bookings | Private |
| GET | `/:id` | Get booking by ID | Private |
| PUT | `/:id/status` | Update booking status | Private |
| PUT | `/:id/cancel` | Cancel booking | Private |
| PUT | `/:id/reschedule` | Reschedule booking | Private |
| PUT | `/:id/complete` | Mark as completed | Private (Provider) |

---

### **Review Routes** (`/api/reviews`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all reviews | Public |
| POST | `/` | Create review | Private (Customer) |
| GET | `/provider/:providerId` | Get provider reviews | Public |
| PUT | `/:id` | Update review | Private (Customer) |
| DELETE | `/:id` | Delete review | Private (Customer) |

---

## 📝 Available Scripts

### **Backend Scripts**
```bash
# Start production server
npm start

# Start development server with auto-restart
npm run dev
```

### **Frontend Scripts**
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from create-react-app (irreversible)
npm run eject
```

---

## 🔧 Troubleshooting

### **Issue 1: MongoDB Connection Error**

**Error:**
```
MongoServerError: bad auth Authentication failed
```

**Solutions:**
1. Check username and password in `config.env`
2. Ensure IP address is whitelisted in MongoDB Atlas
3. Verify connection string format
4. Check if MongoDB cluster is active

**Fix:**
```bash
# Update config.env with correct credentials
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@...
```

---

### **Issue 2: Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution (Windows):**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Solution (Mac/Linux):**
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

### **Issue 3: Frontend Cannot Connect to Backend**

**Error:**
```
Proxy error: Could not proxy request /api/auth/login from localhost:3000 to http://localhost:5000
```

**Solutions:**
1. Ensure backend is running on port 5000
2. Check `package.json` has `"proxy": "http://localhost:5000"`
3. Restart both frontend and backend servers
4. Clear browser cache

---

### **Issue 4: CORS Error**

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

In `backend/server.js`, ensure CORS is configured:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

### **Issue 5: Dependencies Installation Failed**

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

---

### **Issue 6: React App Not Loading**

**Solution:**
```bash
# Navigate to frontend
cd frontend

# Delete build and cache
rm -rf build node_modules .cache

# Reinstall and restart
npm install
npm start
```

---

## 🔐 Security Features

- ✅ **Password Hashing:** Bcrypt with salt rounds
- ✅ **JWT Authentication:** Secure token-based auth
- ✅ **HTTP-Only Cookies:** Prevents XSS attacks
- ✅ **CORS Protection:** Configured allowed origins
- ✅ **Input Validation:** Validator.js for sanitization
- ✅ **Role-Based Access Control:** Middleware authorization
- ✅ **Protected Routes:** Authentication required
- ✅ **SQL Injection Prevention:** Mongoose ODM
- ✅ **Rate Limiting:** (To be implemented)
- ✅ **Environment Variables:** Sensitive data in .env

---

## 📚 Project Features

### **✅ Completed Features (Sprint 1)**

**Feature 1: User Authentication System**
- User registration with role selection (Customer/Provider/Admin)
- Login with email and password
- Logout functionality
- JWT token-based authentication
- Password encryption with bcrypt
- Email verification (structure ready)
- Forgot password (structure ready)
- Reset password (structure ready)

**Feature 2: Role-Based Dashboard**
- Separate dashboards for Customer, Provider, and Admin
- Role-based routing and access control
- Protected routes with authentication middleware
- Automatic redirection based on user role

**Feature 3: User Profile Management**
- View user profile
- Update profile information
- Change password
- Upload profile photo (structure ready)
- Account settings

---

**Sprint 2: Provider & Services**
- Feature 4: Provider Profile Creation
- Feature 5: Service Category Management
- Feature 6: Portfolio Management (10 images max, 5MB limit)
- Feature 7: Browse & Search Service Providers
- Feature 8: Advanced Filter Providers
- Feature 9: View Provider Profile Details

---

## 🗄️ Database Schema

### **Collections in MongoDB**

1. **users** - Customer, Provider, Admin accounts
2. **serviceproviders** - Provider profile information
3. **servicecategories** - Service categories (Plumbing, Tutoring, etc.)
4. **providerservices** - Services offered by providers
5. **portfolioimages** - Provider portfolio images
6. **servicerequests** - Customer service requests
7. **bids** - Provider bids on requests
8. **bookings** - Confirmed service bookings
9. **reviews** - Customer reviews and ratings
10. **payments** - Payment transaction records
11. **notifications** - System notifications

---

## 🤝 Contributing

This is a university project for CSE470 Software Engineering. Contributions are limited to team members:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Git Workflow

### **Initial Setup**
```bash
git clone https://github.com/Clashi07/Neighborhood-Service-Marketplace.git
cd Neighborhood-Service-Marketplace
```

### **Before Starting Work**
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### **After Making Changes**
```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

### **Create Pull Request**
1. Go to GitHub repository
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Add description and request review
5. Wait for approval from team members

---

## 📄 License

This project is created for academic purposes as part of the CSE470 Software Engineering course at BRAC University.

**Academic Use Only** - Not for commercial distribution.

---

## 📧 Contact & Support

### **Team Members**

**Ifte Kharul Islam**
- Role: Team Lead / Full stack
- GitHub: [@Clashi07](https://github.com/Clashi07)

**Irfan Alam Rahi**
- Role: 

**Md. Faisal Bin Kamal**
- Role: 

**Mohammad Abtahi Kafil Chy**
- Role: 

---

### **Project Links**

- **Repository:** [GitHub](https://github.com/Clashi07/Neighborhood-Service-Marketplace)
- **SRS Document:** [Google Docs](https://docs.google.com/document/d/1iOjoqQt3mgJnKMiFh0_M2RK23cPJyDzRnYgWpswb0vw/edit?usp=sharing)
- **Live Demo:** Coming Soon
- **Documentation:** Coming Soon

---

## 🙏 Acknowledgments

- **BRAC University** - CSE470 Software Engineering Course
- **Course Instructor** - For guidance and support
- **MongoDB Atlas** - Free cloud database hosting
- **React Documentation** - Comprehensive React guides
- **Express.js Community** - Backend framework support
- **Stack Overflow** - Problem-solving assistance
- **GitHub** - Version control and collaboration

---

## 📊 Project Statistics



---

## 🚀 Deployment (Coming Soon)
)

**Production URL:** TBD

---

## 📅 Project Timeline

| Sprint | Duration | Features | Status |
|--------|----------|----------|--------|
| Sprint 1 | Week 1-2 | Features 1-3 (Auth & Profile) | ✅ on going |
| Sprint 2 | Week 3-4 | Features 4-9 (Provider & Services) | 🚧 In Progress |
| Sprint 3 | Week 5-6 | Features 10-15 (Requests & Bidding) | ⏳ Planned |
| Sprint 4 | Week 7-8 | Features 16-22 (Bookings & Admin) | ⏳ Planned |

---

## 🎯 Learning Outcomes

Through this project, team members gained experience in:

- ✅ Full-stack web development with MERN stack
- ✅ RESTful API design and implementation
- ✅ Database design and modeling with MongoDB
- ✅ Authentication and authorization systems
- ✅ React component-based architecture
- ✅ State management with Context API
- ✅ Git version control and team collaboration
- ✅ Agile development methodology
- ✅ Software engineering best practices
- ✅ MVC architectural pattern


**Made with ❤️ by the Neighborhood Service Marketplace Team**

*BRAC University | CSE470 Software Engineering | Spring 2026*