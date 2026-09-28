# 🏪 Campus Marketplace

**Buy, Sell & Exchange Platform for Students**

A full-stack web application where verified college students can buy, sell, exchange, and communicate about second-hand items. Built with Spring Boot + React.

---

## ✨ Features

### Student Features
- 🔐 **Authentication** — Register, Login, Logout, Forgot/Reset Password with college email verification
- 🏷️ **Listings** — Create, edit, delete, and manage item listings with image upload
- 🔍 **Search & Filter** — Search by title, filter by category, condition, price range, and sort
- ❤️ **Favorites** — Save and manage favorite listings
- 💬 **Chat** — Real-time messaging between buyers and sellers linked to listings
- ⭐ **Ratings** — Rate buyers/sellers after completed transactions
- 🔔 **Notifications** — System notifications for messages, approvals, ratings, and more
- 👤 **Profile** — View/edit profile, manage listings, see ratings

### Admin Features
- 📊 **Dashboard** — Overview stats, category breakdown, user/listing/report counts
- 👥 **User Management** — Search, view, block, and unblock users
- 📦 **Listing Moderation** — Approve/reject pending listings
- ⚠️ **Report Management** — Review and resolve user reports

### Security
- BCrypt password hashing
- JWT authentication
- Role-based access control (STUDENT/ADMIN)
- College email domain validation (configurable)
- Input validation and global exception handling
- Ownership checks on all mutations

---

## 🛠 Tech Stack

| Layer | Technology |
|---------|------------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL 8 + Hibernate |
| Frontend | React 18, Vite, React Router, Axios |
| Auth | JWT (stateless), BCrypt |
| Styling | Custom CSS (navy/coral/lime design system) |

---

## 📁 Project Structure

```
campus-marketplace/
├── backend/                # Spring Boot Maven project
│   ├── src/main/java/com/campus/marketplace/
│   │   ├── config/         # Security, CORS, WebMVC configs
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── entity/         # JPA entities & enums
│   │   ├── exception/      # Global exception handling
│   │   ├── repository/     # Spring Data repositories
│   │   ├── security/       # JWT utility & filter
│   │   ├── seed/           # Development data seeder
│   │   ├── service/        # Business logic
│   │   └── util/           # File upload utility
│   └── src/main/resources/
│       └── application.properties
├── frontend/               # React + Vite
│   └── src/
│       ├── api/            # Axios API service
│       ├── context/        # Auth & Toast contexts
│       ├── layouts/        # Main & Admin layouts
│       └── pages/          # All page components
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

### 1. Database Setup

```sql
CREATE DATABASE campus_marketplace;
```

### 2. Backend Setup

```bash
cd backend

# Configure your MySQL credentials in application.properties
# Or set environment variables: DB_USERNAME, DB_PASSWORD

# Build and run
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`

---

## 👤 Sample Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Student | rahul@college.edu | student123 |
| Student | priya@college.edu | student123 |
| Student | arjun@college.edu | student123 |
| Student | sneha@college.edu | student123 |
| Student | vikram@college.edu | student123 |

> These accounts are created automatically by the data seeder when `SEED_ENABLED=true` and the database is empty.

---

## ⚙️ Environment Variables

See `.env.example` for all configurable variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | MySQL connection URL | localhost:3306/campus_marketplace |
| `DB_USERNAME` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | root |
| `JWT_SECRET` | JWT signing secret | (default dev secret) |
| `COLLEGE_EMAIL_DOMAIN` | Allowed email domain | @college.edu |
| `UPLOAD_DIRECTORY` | Image upload path | uploads |
| `MAIL_ENABLED` | Enable email service | false |
| `LISTING_REQUIRE_APPROVAL` | Admin approval for new listings | false |
| `SEED_ENABLED` | Create sample data on startup | true |

---

## 📡 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new student |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/verify-email | Verify email token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/listings | Search/filter listings |
| GET | /api/listings/{id} | Get listing detail |
| POST | /api/listings | Create listing (multipart) |
| PUT | /api/listings/{id} | Update listing |
| DELETE | /api/listings/{id} | Delete listing |
| PATCH | /api/listings/{id}/status | Update listing status |

### Favorites, Messages, Ratings, Notifications, Reports, Admin
See the controllers for complete endpoint documentation.

---

## 🔮 Future Scope

- 💳 Razorpay/Stripe payment integration
- 🔄 WebSocket real-time messaging
- 📧 Email service for verification/reset
- 🤖 AI-based fraud detection
- 📱 Push notifications
- 🏫 Multi-college support
- 📊 Advanced analytics
- 🚚 Meetup coordination

---

## 📄 License

This is a college project built for educational purposes.
