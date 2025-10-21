# ShopVibe 🛍️

### *Your Style, Your Vibe, Delivered Daily*

A modern full-stack e-commerce platform for fashion clothing and accessories, built with Next.js, TypeScript, Express.js, and PostgreSQL.

## 🚀 Features

- 🛒 Shopping cart with multi-variant products (sizes, colors)
- 💳 Secure PayPal payment integration
- 👤 User authentication with JWT and role-based access
- 🎟️ Coupon and discount system
- 📦 Order tracking and management
- 👔 Clothing and accessories catalog
- 📧 Email notifications for orders
- 🖼️ Cloudinary image management
- 🔒 Arcjet security and rate limiting

**Table Of Contents**

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Screenshots](#-screenshots)
- [Live Demo](#-live-demo)
- [Author](#-author)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 with TypeScript
- Tailwind CSS + Radix UI
- Zustand for state management

**Backend:**
- Express.js with TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication with bcrypt
- Cloudinary, Nodemailer, PayPal

**DevOps:**
- Docker & Docker Compose
- Containerized microservices

## 📦 Installation

**Prerequisites**

-Node.js 18.x or higher

-npm or yarn

-PostgreSQL 14+

-Docker Compose (optional, for local development)

**Local Setup**

1. **Clone the repository**
```bash
git clone https://github.com/pravallika2108/Ecommerce-Fashion.git
cd Ecommerce-Fashion
```
2. **Install backend dependencies**

```bash
cd server
npm install
cd ..
```
3. **Install frontend dependencies**

```bash
cd  client
npm install
cd ..
```
4. **Create environment files**
Create server/.env: for local:

```bash
   DATABASE_URL=postgresql://user:password@localhost:5437/ecommerce_fashion
   JWT_SECRET=your_jwt_secret_key_here
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_SECRET=your_paypal_secret
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_CLOUD_NAME= your_cloudinary_cloud_name
   PORT=3001
   FRONTEND_URL=localhost:3000
   NODE_ENV= development
```
Create client/env for local:

```bash
   JWT_SECRET = your_jwt_secret_key_here
   ARCJET_KEY =your_arcjet_key
```

5. **Set up database**

```bash
   createdb ecommerce_fashion
   cd server
   npx prisma migrate dev --name init
   cd ..
```

6. **Start development servers**
   
Terminal 1 (Server):
```bash
cd server
npm run dev
```
Terminal 2 (Client):
```bash
cd client
npm run dev
```
7. **Access the app**
   
- Frontend:http://localhost:3000
- Backend:http://localhost:3001
- Database UI: http://localhost:5555


**Using Docker (Local Development)**

If you have Docker and Docker Compose installed, run everything in containers:

bashdocker-compose up -d


**Backend Deployment**

- Create Web Service on Render
- Connect GitHub repository, set root directory to backend
- Build Command:  cd server && npm install && npm run build && npm run prisma:generate && npx prisma migrate deploy
- Start Command: cd server && npm start
- Add environment variables 
- Connect Render PostgreSQL database


**Frontend Deployment**

- Create Web Service on Render
- Connect GitHub repository
- Build Command: npm install && npm run build 
- Start Command:  npm start
- Add environment variables


## 🌐 Live Demo

[https://ecommerce-fashion-1.onrender.com]

## 📸 Screenshots



## 👨‍💻 Author

Pravallika
- GitHub: [@pravallika2108](https://github.com/pravallika2108)
- LinkedIn: www.linkedin.com/in/pravallika-gudipati-b4a91920a

