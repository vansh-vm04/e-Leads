# Buyer Lead Intake App

This project is a Buyer Lead Intake web application built with **Next.js**, **React Hook Form**, **Zod**, and **Prisma**.

It allows users to submit buyer leads with validation, rate limiting, and error boundaries. The app is designed for server-side rendering (SSR) where possible and enforces ownership rules for updates.

<img style="width:800px;" src="./public/buyers-page.png"/>

---

## 🚀 Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/buyer-lead-intake.git
cd buyer-lead-intake
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
Create a `.env` file at the root with:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/db_name"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

### 4. Database migration & seed
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run locally
```bash
npm run dev
```

App will be available at `http://localhost:3000`.

---

## 🛠️ Design Notes

### Validation
- All form fields are validated using **Zod** + **React Hook Form**.  
- Server-side validation is added in the API layer to ensure data consistency.

### SSR vs Client
- The app uses **SSR** for rendering initial pages.  
- Form interactions and validation happen on the **client side**.

### Ownership Enforcement
- Users can only update or delete the leads they created.  
- Auth middleware checks for user ID on sensitive actions.

### Error Boundary + Empty State
- Error boundary component wraps pages to catch rendering errors.  
- Empty state components handle cases when no leads are available.

---

## ✅ Features Done
-  Form with Zod + React Hook Form validation  
-  CSV Upload + Validator  
-  Budget check with Zod schema  
-  Rate limiting for create/update actions  
-  Error boundary + Empty state handling  
-  Unit test for CSV validator  

## ⏭️ Skipped (and why)
- Admin feature, due to time constraints.
---

## 🧪 Tests

Run unit tests:
```bash
npm run test
```

Tests include:
- CSV validator  
- Budget validation  
- Error boundary handling  

---
