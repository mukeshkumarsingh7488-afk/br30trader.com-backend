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

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

---

### Authentication & Security

![JWT](https://img.shields.io/badge/JWT_Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Bcrypt.js](https://img.shields.io/badge/Bcrypt.js-FF6B35?style=for-the-badge&logo=securityscorecard&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-0052CC?style=for-the-badge)
![Dotenv](https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)

---

### Email Services

![Brevo](https://img.shields.io/badge/Brevo_SMTP-0099FF?style=for-the-badge)
![Nodemailer](https://img.shields.io/badge/Nodemailer-34A853?style=for-the-badge)

---

### Payments

![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)

---

### Deployment

![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-00ED64?style=for-the-badge&logo=mongodb&logoColor=white)

---

### Development Tools

![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

---

## 📁 Project Structure

```bash
BR30TRADER.COM-B
│
├── my-backend/
│   │
│   ├── .vscode/
│   │
│   ├── certificates/
│   │
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── razorpay.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── tempCodeRunnerFile.js
│   │   └── userController.js
│   │
│   ├── docs/
│   │
│   ├── images/
│   │
│   ├── middleware/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── multerCloudinary.js
│   │   └── upload.js
│   │
│   ├── models/
│   │   ├── Certificate.js
│   │   ├── Coupon.js
│   │   ├── Course.js
│   │   ├── Notification.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Trade.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── adminEmailRoutes.js
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── notifications.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── trades.js
│   │   └── whatsapp.js
│   │
│   ├── uploads/
│   │
│   ├── utils/
│   │   ├── emailHelper.js
│   │   ├── generateProfessionalCert.js
│   │   └── reviewReply.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── autoReview.js
│   ├── fakeUsers.js
│   ├── firebase-debug.log
│   ├── firebase.json
│   ├── index.js
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── serviceAccountKey.json
│   └── tempCodeRunnerFile.js
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

## 📬 Connect With Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mukesh_Raj-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mukeshraj-br30/)

[![GitHub](https://img.shields.io/badge/GitHub-mukeshkumarsingh7488--afk-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mukeshkumarsingh7488-afk)

[![Instagram](https://img.shields.io/badge/Instagram-BR30TraderOfficial-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/br30Traderofficial)

[![YouTube](https://img.shields.io/badge/YouTube-BR30TraderOfficial-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@br30traderofficial)

[![Telegram](https://img.shields.io/badge/Telegram-BR30_Community-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/+hBAT4kWo63A4ZWY1)

[![WhatsApp](https://img.shields.io/badge/WhatsApp-BR30_Community-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/B4t82SWBcgOIZTeQXp1wDI)

[![Facebook](https://img.shields.io/badge/Facebook-BR30-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/share/1DDJYGYYDf/)

[![X](https://img.shields.io/badge/X-@MukeshKuma48159-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/MukeshKuma48159)

[![Threads](https://img.shields.io/badge/Threads-BR30TraderOfficial-000000?style=for-the-badge&logo=threads&logoColor=white)](https://www.threads.com/@br30traderofficial)

[![BR30 Trader](https://img.shields.io/badge/BR30_Trader-Visit_Website-00ff88?style=for-the-badge&logo=googlechrome&logoColor=black)](https://my-frontend-eight-roan.vercel.app/)

---

---

## 📌 Project Status

This backend is actively maintained and improved for authentication, payment, dashboard, course access and platform security.

---

### Build • Learn • Trade • Grow 🚀
