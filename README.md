# BR30 Trader Backend

🚀 **BR30 Trader Backend** is the server-side API for the BR30 Trader platform.  
It manages authentication, OTP verification, users, courses, purchases, payments, notifications and admin features.

---

## 🌐 Live API

```text
https://YOUR-RENDER-BACKEND-URL.onrender.com
```

---

## 🌟 Features

- User Registration & Login
- OTP Verification
- JWT Authentication
- Password Reset System
- Course Management APIs
- Purchased Course Access
- User Profile APIs
- Admin APIs
- Payment Verification
- Email Notification System
- MongoDB Database Integration
- Secure Environment Variable Setup

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt.js
- Nodemailer / Brevo SMTP
- Razorpay
- CORS
- Dotenv
- Render

---

## 📁 Folder Structure

```text
BR30-Trader-Backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── server.js
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the root folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password_or_smtp_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=https://my-frontend-eight-roan.vercel.app
```

⚠️ Never push `.env` to GitHub.

---

## 🚀 Installation & Setup

```bash
npm install
```

---

## ▶️ Run Locally

```bash
npm start
```

or

```bash
node server.js
```

---

## 📌 Main API Modules

### Auth APIs

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Course APIs

```text
GET  /api/courses
GET  /api/courses/:id
GET  /api/courses/my-courses
POST /api/courses/purchase
```

### Payment APIs

```text
POST /api/payment/order
POST /api/payment/verify
```

### Admin APIs

```text
GET    /api/admin/users
POST   /api/admin/course
PUT    /api/admin/course/:id
DELETE /api/admin/course/:id
```

---

## 🚀 Deployment

Backend deployed on:

```text
Render
```

Frontend deployed on:

```text
Vercel
```

Frontend URL:

```text
https://my-frontend-eight-roan.vercel.app/
```

---

## 👨‍💻 Developed By

**Mukesh Raj**  
Founder — **BR30 Group**

---

## 📬 Contact

- [LinkedIn](https://www.linkedin.com/in/mukeshraj-br30/)
- [GitHub](https://github.com/mukeshkumarsingh7488-afk)

---

## 📌 Project Status

This backend is actively maintained and improved for authentication, payment, dashboard, course access and platform security.

---

### Build • Learn • Trade • Grow 🚀
