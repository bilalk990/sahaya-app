# Sahayya API Documentation

**Backend Base URL:** `https://sahayaa-backend-production.up.railway.app/api/`
**Authentication:** Bearer Token (Laravel Passport OAuth 2.0)
**Content-Type:** `application/json` / `multipart/form-data`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Profile](#2-user-profile)
3. [KYC & Verification](#3-kyc--verification)
4. [Jobs](#4-jobs)
5. [Job Applications](#5-job-applications)
6. [Staff Management](#6-staff-management)
7. [Household Members](#7-household-members)
8. [Leave Management](#8-leave-management)
9. [Salary & Earnings](#9-salary--earnings)
10. [Attendance & Dashboard](#10-attendance--dashboard)
11. [Categories & Work Info](#11-categories--work-info)
12. [Services](#12-services)
13. [Bookings](#13-bookings)
14. [Cart & Wishlist](#14-cart--wishlist)
15. [Promo Codes](#15-promo-codes)
16. [Wallet & Payments](#16-wallet--payments)
17. [Subscriptions](#17-subscriptions)
18. [Reviews & Ratings](#18-reviews--ratings)
19. [Support & FAQ](#19-support--faq)
20. [Notifications](#20-notifications)
21. [Banners & CMS](#21-banners--cms)
22. [Bank Accounts](#22-bank-accounts)
23. [Settings](#23-settings)
24. [Analytics](#24-analytics)
25. [Razorpay Payment Service](#25-razorpay-payment-service)
26. [Frontend Usage Summary](#26-frontend-usage-summary)
27. [Missing APIs Analysis](#27-missing-apis-analysis)

---

## Response Format

All responses follow this structure:

```json
// Success
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "status": "error",
  "message": "Error description",
  "errors": { ... }
}
```

## Role IDs

| ID | Role |
|----|------|
| 1  | Admin / Super Admin |
| 2  | Customer (Household Owner) |
| 3  | Staff |
| 4  | Service Provider |

---

## 1. Authentication

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/customer/login` | No | USED |
| POST | `/customer/signup` | No | USED |
| POST | `/verify-otp` | No | USED |
| POST | `/resend-otp` | No | USED |
| POST | `/google` | No | NOT USED |
| POST | `/logout` | Yes | USED |
| GET  | `/designations-list` | No | NOT USED |

### POST `/customer/login`
Send OTP to phone number for login.
```
Request:
{
  "phone_number": "9876543210",
  "country_code": "+91"
}

Response:
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": { "user_id": 123 }
}
```

### POST `/customer/signup`
Register a new user.
```
Request:
{
  "phone_number": "9876543210",
  "country_code": "+91"
}

Response:
{
  "status": "success",
  "message": "User registered, OTP sent",
  "data": { "user_id": 124 }
}
```

### POST `/verify-otp`
Verify OTP and get auth token.
```
Request:
{
  "otp": "123456",
  "user_id": 123,
  "device_token": "fcm_token_here",
  "device_type": "android"
}

Response:
{
  "status": "success",
  "data": {
    "token": "Bearer eyJ...",
    "user": { ... },
    "user_role_id": 2
  }
}
```

### POST `/resend-otp`
Resend OTP to phone number.
```
Request:
{
  "phone_number": "9876543210",
  "country_code": "+91"
}
```

### POST `/google`
Social login with Google. **NOT USED IN FRONTEND**
```
Request:
{
  "social_token": "google_id_token",
  "email": "user@gmail.com",
  "name": "User Name"
}
```

### POST `/logout`
Logout and revoke token. **Requires Auth**
```
Response:
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## 2. User Profile

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/profile` | Yes | USED (in routes file) |
| POST | `/profile/update` | Yes | USED |
| POST | `/customer/profile/update` | Yes | NOT USED |
| POST | `/update/password` | Yes | NOT USED |
| POST | `/user/delete-self` | Yes | USED |
| GET  | `/addresses` | Yes | NOT USED |
| POST | `/addresses/update` | Yes | USED |

### POST `/profile/update`
Update user profile (multipart form-data).
```
Request (form-data):
{
  "first_name": "John",
  "last_name": "Doe",
  "gender": "male",
  "dob": "1990-01-15",
  "image": <file>
}
```

### POST `/user/delete-self`
Delete own account permanently. **Requires Auth**

### POST `/addresses/update`
Update user addresses.
```
Request:
{
  "addresses": [
    {
      "address_line_1": "123 Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  ]
}
```

---

## 3. KYC & Verification

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/aadhar/send-otp` | Yes | USED |
| POST | `/aadhar/verify` | Yes | USED (in routes file) |
| POST | `/aadhar/resend-otp` | Yes | NOT USED |
| GET  | `/aadhar/status` | Yes | NOT USED |
| POST | `/kyc/upload` | Yes | USED |
| GET  | `/kyc/status/{user_id}` | Yes | NOT USED |

### POST `/aadhar/send-otp`
Send OTP for Aadhaar verification.
```
Request (form-data):
{
  "aadhar_number": "123456789012"
}
```

### POST `/kyc/upload`
Upload KYC documents (multipart form-data).
```
Request (form-data):
{
  "police_verification": <file>,
  "aadhaar_front": <file>,
  "aadhaar_back": <file>
}
```

---

## 4. Jobs

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/jobs` | Optional | USED |
| GET  | `/jobs/{id}` | Optional | USED |
| POST | `/admin/jobs` | Yes | USED |
| POST | `/admin/jobs/{id}` | Yes | NOT USED |
| POST | `/admin/jobs/{id}/status` | Yes | NOT USED |
| POST | `/admin/jobs/delete/{id}` | Yes | USED (in routes file) |
| GET  | `/admin/auth-jobs` | Yes | USED |

### GET `/jobs`
List all available jobs.
```
Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "House Cleaner",
      "description": "...",
      "compensation": "15000",
      "compensation_type": "monthly",
      "city": "Mumbai",
      "state": "Maharashtra",
      "is_applied": false
    }
  ]
}
```

### POST `/admin/jobs`
Create a new job posting. **Requires Auth**
```
Request (form-data):
{
  "title": "Cook Needed",
  "description": "Looking for experienced cook",
  "expectedCompensation": "20000",
  "compensationType": "monthly",
  "location": "Mumbai",
  "hours": "8",
  "days": "6",
  "skills": "cooking,indian cuisine"
}
```

### GET `/admin/auth-jobs`
Get jobs posted by the authenticated user.

---

## 5. Job Applications

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/applications` | Yes | USED |
| GET  | `/applications` | Yes | USED (in routes file) |
| POST | `/applications/{id}/delete` | Yes | NOT USED |
| POST | `/admin/applications/{id}/status` | Yes | USED (in routes file) |
| GET  | `/admin/jobs/{jobId}/applications` | Yes | USED |

### POST `/applications`
Apply for a job.
```
Request (form-data):
{
  "jobId": 1,
  "coverLetter": "I am experienced...",
  "expectedSalary": "18000",
  "availableFrom": "2025-06-01"
}
```

### POST `/admin/applications/{id}/status`
Update application status (accept/reject).
```
Request:
{
  "status": "accepted"  // or "rejected", "pending"
}
```

---

## 6. Staff Management

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/staff/add` | Yes | USED |
| GET  | `/staff/list` | Yes | USED |
| GET  | `/staff/{id}` | Yes | NOT USED |
| POST | `/staff/update/{id}` | Yes | USED (in routes file) |
| GET  | `/customer/approved-job` | Yes | USED |
| POST | `/customer/quit-job-request` | Yes | USED |

### POST `/staff/add`
Add a new staff member (multipart form-data).
```
Request (form-data):
{
  "firstName": "Raj",
  "lastName": "Kumar",
  "email": "raj@email.com",
  "phoneNumber": "9876543210",
  "aadharNumber": "123456789012",
  "gender": "male",
  "DOB": "1995-05-15",
  "address": "123 Street, Mumbai",
  "emergencyContact": "9876543211",
  "roleDesignation": "Cook",
  "joiningDate": "2025-06-01",
  "salary": "15000",
  "payFrequency": "monthly",
  "workingDays": "Mon,Tue,Wed,Thu,Fri,Sat",
  "documents": <file>
}
```

### GET `/customer/approved-job`
Get current user's approved/active job.

### POST `/customer/quit-job-request`
Submit quit job request.
```
Request (form-data):
{
  "jobId": 1,
  "endDate": "2025-07-01",
  "reason": "Personal reasons"
}
```

---

## 7. Household Members

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/admin/members/store` | Yes | USED |
| GET  | `/admin/members/list` | Yes | USED |
| GET  | `/admin/members/{id}` | Yes | NOT USED |
| POST | `/admin/members/{id}` | Yes | USED (in routes file) |
| POST | `/delete/member/{id}` | Yes | USED |
| POST | `/admin/delete-user` | Yes | NOT USED |

### POST `/admin/members/store`
Add a household member.

### GET `/admin/members/list`
List all household members.

### POST `/delete/member/{id}`
Delete a household member.

---

## 8. Leave Management

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/customer/leave-type-list` | Yes | USED |
| POST | `/customer/leave-apply` | Yes | USED |
| GET  | `/customer/leave-list` | Yes | USED |
| POST | `/customer/leave-approve/{id}` | Yes | USED |
| POST | `/customer/leave-reject/{id}` | Yes | USED |

### GET `/customer/leave-type-list`
Get all available leave types.

### POST `/customer/leave-apply`
Apply for leave.
```
Request (form-data):
{
  "leaveType": "sick_leave",
  "startDate": "2025-06-10",
  "endDate": "2025-06-12",
  "reason": "Medical appointment",
  "supportingDocument": <file>
}
```

### GET `/customer/leave-list`
Get user's leave applications.

### POST `/customer/leave-approve/{id}`
Approve a leave request (household owner).

### POST `/customer/leave-reject/{id}`
Reject a leave request (household owner).

---

## 9. Salary & Earnings

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/housesold/salary/staff/{user_id}` | Yes | USED (in routes file) |
| POST | `/housesold/salary/staff/{user_id}` | Yes | NOT USED |
| GET  | `/housesold/salary/list` | Yes | USED |
| GET  | `/customer/earnings/summary` | Yes | USED |
| GET  | `/customer/earnings/summary/{job_id}` | Yes | NOT USED |

### GET `/housesold/salary/list`
Get recent salary payments.

### GET `/customer/earnings/summary`
Get earnings summary for staff.
```
Response:
{
  "status": "success",
  "data": {
    "total_earned": 45000,
    "deductions": 2000,
    "net_salary": 43000,
    "payment_history": [...]
  }
}
```

---

## 10. Attendance & Dashboard

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/housersold/staff/active-today` | Yes | USED |
| GET  | `/housersold/attendance/` | Yes | USED |
| POST | `/housersold/attendance/` | Yes | USED |
| GET  | `/housersold/attendance/{id}` | Yes | NOT USED |
| PUT  | `/housersold/attendance/{id}` | Yes | NOT USED |
| DELETE | `/housersold/attendance/{id}` | Yes | NOT USED |
| GET  | `/customer/dashbord-data` | Yes | USED |

### GET `/housersold/staff/active-today`
Get staff members active/present today.

### POST `/housersold/attendance/`
Record attendance.
```
Request (form-data):
{
  "user_id": 5,
  "date": "2025-06-10",
  "status": "present",
  "check_in": "09:00",
  "check_out": "18:00"
}
```

### GET `/customer/dashbord-data`
Get staff dashboard data (earnings, attendance summary).

---

## 11. Categories & Work Info

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/category` | Yes | USED |
| GET  | `/category/subcategories` | Yes | USED |
| POST | `/category/save` | Yes | NOT USED |
| POST | `/category/update/{id}` | Yes | NOT USED |
| POST | `/work-info-update` | Yes | USED |
| POST | `/last-work-experience/save` | Yes | USED (in routes file) |

### GET `/category`
Get all service categories/roles.

### GET `/category/subcategories`
Get all subcategories/skills.

### POST `/work-info-update`
Update work information.
```
Request (form-data):
{
  "primaryRole": "Cook",
  "selectedSkills": ["Indian Cuisine", "Baking"],
  "languages": ["Hindi", "English"],
  "totalExperience": "5 years",
  "education": "12th Pass",
  "additionalInfo": "..."
}
```

---

## 12. Services

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/services/` | Yes | NOT USED |
| GET  | `/services/` | Yes | NOT USED |
| GET  | `/services/{service}` | Yes | NOT USED |
| POST | `/services/{service}` | Yes | NOT USED |
| POST | `/services/delete/{service}` | Yes | NOT USED |
| GET  | `/services/category/{categoryId}` | Yes | NOT USED |
| GET  | `/services/user/{userId}` | Yes | NOT USED |
| GET  | `/customer/service/category` | Yes | NOT USED |
| GET  | `/customer/service/category/{id}` | Yes | NOT USED |
| GET  | `/customer/category/shops/{id}` | Yes | NOT USED |
| GET  | `/customer/shops/{id}` | Yes | NOT USED |

> **All service endpoints are NOT USED in the frontend.** These support a service marketplace feature that hasn't been implemented yet.

---

## 13. Bookings

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/customer/bookings` | Yes | NOT USED |
| POST | `/customer/booking-create/{id}` | Yes | NOT USED |
| POST | `/customer/booking-verify` | Yes | NOT USED |
| GET  | `/customer/bookings/list` | Yes | NOT USED |
| GET  | `/customer/booking/{id}` | Yes | NOT USED |
| POST | `/customer/booking/{id}/cancel` | Yes | NOT USED |
| GET  | `/customer/services/{serviceId}/available-slots` | Yes | NOT USED |
| GET  | `/bookings/list` | Yes | NOT USED |
| POST | `/booking/accepted/{id}` | Yes | NOT USED |
| POST | `/booking/reject/{id}` | Yes | NOT USED |
| POST | `/booking/completed/{id}` | Yes | NOT USED |
| GET  | `/appointment/list` | Yes | NOT USED |

> **All booking endpoints are NOT USED in the frontend.** The booking/scheduling system is not yet implemented.

---

## 14. Cart & Wishlist

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/customer/cart/add` | Yes | NOT USED |
| GET  | `/customer/cart/` | Yes | NOT USED |
| DELETE | `/customer/cart/remove/{id}` | Yes | NOT USED |
| DELETE | `/customer/cart/clear` | Yes | NOT USED |
| POST | `/customer/wishlist-add` | Yes | NOT USED |
| POST | `/customer/wishlist-remove/{id}` | Yes | NOT USED |
| GET  | `/customer/wishlist` | Yes | NOT USED |

> **All cart/wishlist endpoints are NOT USED.** E-commerce features are not yet implemented.

---

## 15. Promo Codes

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/promo-codes` | Yes | NOT USED |
| GET  | `/promo-codes/{id}` | Yes | NOT USED |
| POST | `/promo-codes` | Yes | NOT USED |
| POST | `/promo-codes/validate` | Yes | NOT USED |
| POST | `/promo-codes/update/{id}` | Yes | NOT USED |
| POST | `/promo-codes/delete/{id}` | Yes | NOT USED |
| GET  | `/customer/promo-codes/{id}` | Yes | NOT USED |
| GET  | `/customer/promo-code/highlighted` | Yes | NOT USED |

> **All promo code endpoints are NOT USED.** Discount system not yet integrated.

---

## 16. Wallet & Payments

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/wallet/` | Yes | NOT USED |
| POST | `/wallet/` | Yes | NOT USED |
| POST | `/wallet/verify` | Yes | NOT USED |
| GET  | `/customer/transaction/list` | Yes | NOT USED |
| GET  | `/transaction/list` | Yes | NOT USED |
| GET  | `/getTransactions` | Yes | NOT USED |
| GET  | `/transactions/{id}/invoice` | Yes | NOT USED |

> **All wallet/transaction endpoints are NOT USED.** Wallet system not yet integrated (payments go through Razorpay directly).

---

## 17. Subscriptions

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/subscriptions` | Yes | USED |
| GET  | `/subscriptions/show/{id}` | Yes | NOT USED |
| POST | `/subscription/create-order` | Yes | NOT USED |
| POST | `/subscription/verify-payment` | Yes | NOT USED |
| GET  | `/subscription/current` | Yes | NOT USED |
| GET  | `/subscription/history` | Yes | NOT USED |
| POST | `/subscription/subscribe` | Yes | USED |
| GET  | `/customer/subscription-list` | Yes | NOT USED |

### GET `/subscriptions`
Get all subscription plans.

### POST `/subscription/subscribe`
Subscribe to a plan after Razorpay payment.
```
Request:
{
  "subscriptionId": 1,
  "paymentId": "pay_xyz123"
}
```

---

## 18. Reviews & Ratings

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/reviews/store` | Yes | NOT USED |
| GET  | `/reviews/list` | Yes | NOT USED |
| GET  | `/reviews/list-self` | Yes | NOT USED |
| DELETE | `/reviews/delete/{id}` | Yes | NOT USED |

> **All review endpoints are NOT USED.** Review/rating system not yet integrated.

---

## 19. Support & FAQ

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/supports` | Yes | NOT USED |
| GET  | `/supports` | Yes | NOT USED |
| POST | `/supports/{id}/reply` | Yes | NOT USED |
| GET  | `/faq-support` | No | NOT USED |
| GET  | `/faq-support/{id}` | No | NOT USED |
| POST | `/faq-support-search` | No | NOT USED |
| GET  | `/faq-support-categories` | No | NOT USED |

> **All support/FAQ endpoints are NOT USED.** Help & support features not yet integrated.

---

## 20. Notifications

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| POST | `/notifications/add` | Yes | NOT USED |
| GET  | `/notifications/list` | Yes | NOT USED |
| PUT  | `/notifications/{id}/read` | Yes | NOT USED |
| GET  | `/read-all` | Yes | NOT USED |

> **All notification list endpoints are NOT USED.** Push notifications work via Firebase but in-app notification listing is not integrated.

---

## 21. Banners & CMS

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/cms-page` | No | USED |
| GET  | `/admin/banner` | Yes | NOT USED |
| POST | `/admin/banner` | Yes | NOT USED |
| GET  | `/customer/home` | Yes | NOT USED |

### GET `/cms-page`
Get CMS pages (Privacy Policy, Terms, etc.)

---

## 22. Bank Accounts

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/bank-accounts` | Yes | NOT USED |
| GET  | `/bank-accounts/{id}` | Yes | NOT USED |
| POST | `/bank-accounts` | Yes | NOT USED |
| POST | `/bank-accounts/update/{id}` | Yes | NOT USED |
| POST | `/bank-accounts/delete/{id}` | Yes | NOT USED |
| POST | `/bank-accounts/set/{id}` | Yes | NOT USED |

> **All bank account endpoints are NOT USED.** Bank account management not yet integrated.

---

## 23. Settings

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/settings/notification` | Yes | USED |
| POST | `/settings/notification` | Yes | USED |
| GET  | `/settings/AutoPresent` | Yes | USED |
| POST | `/settings/AutoPresent` | Yes | USED |

### GET `/settings/notification`
Get notification preferences.

### POST `/settings/notification`
Update notification preferences.
```
Request (form-data):
{
  "value": true
}
```

### GET/POST `/settings/AutoPresent`
Get or toggle auto-present attendance setting.

---

## 24. Analytics

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| GET  | `/analytics` | Yes | NOT USED |
| GET  | `/random-analytics/overview` | Yes | NOT USED |
| GET  | `/analytics/customers` | Yes | NOT USED |
| GET  | `/analytics/vendors` | Yes | NOT USED |

> **All analytics endpoints are NOT USED.**

---

## 25. Razorpay Payment Service

**Razorpay PHP Backend:** `http://localhost:8000/api/` (needs production URL)
**Razorpay Test Key:** `rzp_test_Rcx3E3rF2dNmEc`

| Method | Endpoint | Used |
|--------|----------|------|
| POST | `create-order.php` | USED |
| POST | `verify-payment.php` | USED |
| POST | `create-subscription.php` | USED |
| POST | `webhook.php` | USED (server-side) |
| POST | `find-staff-ai.php` | USED |

### Payment Flow
1. **Create Order** - `POST create-order.php` with amount & currency
2. **Open Razorpay Checkout** - Native SDK with order ID
3. **Verify Payment** - `POST verify-payment.php` with payment details

---

## 26. Frontend Usage Summary

### Currently Used APIs (28 endpoints)

| # | Endpoint | Feature |
|---|----------|---------|
| 1 | `POST /customer/login` | Login |
| 2 | `POST /customer/signup` | Registration |
| 3 | `POST /verify-otp` | OTP Verification |
| 4 | `POST /resend-otp` | Resend OTP |
| 5 | `POST /logout` | Logout |
| 6 | `POST /profile/update` | Profile Update |
| 7 | `POST /user/delete-self` | Delete Account |
| 8 | `POST /addresses/update` | Update Address |
| 9 | `POST /aadhar/send-otp` | Aadhaar OTP |
| 10 | `POST /kyc/upload` | KYC Documents |
| 11 | `GET /jobs` | Job Listings |
| 12 | `GET /jobs/{id}` | Job Details |
| 13 | `POST /admin/jobs` | Create Job |
| 14 | `GET /admin/auth-jobs` | My Posted Jobs |
| 15 | `GET /admin/jobs/{id}/applications` | View Applicants |
| 16 | `POST /applications` | Apply for Job |
| 17 | `POST /admin/applications/{id}/status` | Accept/Reject Applicant |
| 18 | `POST /staff/add` | Add Staff |
| 19 | `GET /staff/list` | List Staff |
| 20 | `GET /admin/members/list` | List Members |
| 21 | `POST /delete/member/{id}` | Delete Member |
| 22 | `GET /customer/leave-type-list` | Leave Types |
| 23 | `POST /customer/leave-apply` | Apply Leave |
| 24 | `GET /customer/leave-list` | Leave List |
| 25 | `POST /customer/leave-approve/{id}` | Approve Leave |
| 26 | `POST /customer/leave-reject/{id}` | Reject Leave |
| 27 | `GET /customer/approved-job` | My Work |
| 28 | `POST /customer/quit-job-request` | Quit Job |
| 29 | `GET /housesold/salary/list` | Salary List |
| 30 | `GET /customer/earnings/summary` | Earnings |
| 31 | `GET /housersold/staff/active-today` | Active Staff |
| 32 | `POST /housersold/attendance/` | Record Attendance |
| 33 | `GET /customer/dashbord-data` | Staff Dashboard |
| 34 | `GET /category` | Categories |
| 35 | `GET /category/subcategories` | Subcategories |
| 36 | `POST /work-info-update` | Update Work Info |
| 37 | `GET /subscriptions` | Subscription Plans |
| 38 | `POST /subscription/subscribe` | Subscribe |
| 39 | `GET /settings/notification` | Notification Settings |
| 40 | `POST /settings/notification` | Update Notification Settings |
| 41 | `GET /settings/AutoPresent` | Auto-Present Setting |
| 42 | `POST /settings/AutoPresent` | Toggle Auto-Present |
| 43 | `GET /cms-page` | CMS/Policy Pages |

---

## 27. Missing APIs Analysis

### CRITICAL - Not Integrated but Available in Backend

#### A. Services & Booking System (12 endpoints)
The backend has a complete service marketplace with bookings, but the frontend has **zero integration**.

**Missing endpoints:**
- `GET /customer/service/category` - Browse service categories
- `GET /customer/category/shops/{id}` - Find service providers
- `GET /customer/shops/{id}` - View provider details
- `POST /customer/bookings` - Create booking
- `GET /customer/bookings/list` - My bookings
- `GET /customer/booking/{id}` - Booking details
- `POST /customer/booking/{id}/cancel` - Cancel booking
- `GET /customer/services/{id}/available-slots` - Check availability
- `POST /booking/accepted/{id}` - Accept booking (vendor)
- `POST /booking/reject/{id}` - Reject booking (vendor)
- `POST /booking/completed/{id}` - Complete booking (vendor)
- `GET /customer/home` - Home screen data (banners, featured)

#### B. Wallet & Transactions (7 endpoints)
Full wallet system exists but is unused.

**Missing endpoints:**
- `GET /wallet/` - Wallet balance & history
- `POST /wallet/` - Add money to wallet
- `POST /wallet/verify` - Verify wallet top-up
- `GET /customer/transaction/list` - Transaction history
- `GET /transactions/{id}/invoice` - Download invoice

#### C. Support & FAQ (7 endpoints)
Help system is built but not connected.

**Missing endpoints:**
- `POST /supports` - Create support ticket
- `GET /supports` - My support tickets
- `POST /supports/{id}/reply` - Reply to ticket
- `GET /faq-support` - FAQ list
- `POST /faq-support-search` - Search FAQs

#### D. Notifications (4 endpoints)
In-app notification listing is missing.

**Missing endpoints:**
- `GET /notifications/list` - All notifications
- `PUT /notifications/{id}/read` - Mark as read
- `GET /read-all` - Mark all as read

#### E. Reviews & Ratings (4 endpoints)
No review system in frontend.

**Missing endpoints:**
- `POST /reviews/store` - Write review
- `GET /reviews/list` - Reviews for my services
- `GET /reviews/list-self` - My reviews

#### F. Bank Accounts (6 endpoints)
Bank account management not integrated.

**Missing endpoints:**
- `GET /bank-accounts` - List bank accounts
- `POST /bank-accounts` - Add bank account
- `POST /bank-accounts/update/{id}` - Update account
- `POST /bank-accounts/delete/{id}` - Delete account
- `POST /bank-accounts/set/{id}` - Set default account

#### G. Cart & Wishlist (7 endpoints)
E-commerce cart/wishlist not integrated.

**Missing endpoints:**
- `POST /customer/cart/add` - Add to cart
- `GET /customer/cart/` - View cart
- `DELETE /customer/cart/remove/{id}` - Remove item
- `POST /customer/wishlist-add` - Add to wishlist
- `GET /customer/wishlist` - View wishlist

#### H. Promo Codes (8 endpoints)
Discount system not integrated.

**Missing endpoints:**
- `GET /promo-codes` - List promo codes
- `POST /promo-codes/validate` - Validate a code
- `GET /customer/promo-code/highlighted` - Featured promos

#### I. Other Missing Features
- `POST /google` - Google social login
- `GET /designations-list` - Designations
- `POST /update/password` - Password change
- `GET /subscription/current` - Current subscription status
- `GET /subscription/history` - Subscription history
- `GET /analytics` - Dashboard analytics
- `GET /admin/banner` - Promotional banners
- `POST /refer-submit` - Referral system
- `GET /aadhar/status` - Aadhaar verification status check
- `GET /kyc/status/{user_id}` - KYC status check

---

## Summary Statistics

| Category | Total Backend APIs | Used in Frontend | Missing |
|----------|-------------------|-----------------|---------|
| Authentication | 7 | 5 | 2 |
| Profile | 7 | 4 | 3 |
| KYC | 6 | 3 | 3 |
| Jobs | 7 | 5 | 2 |
| Applications | 5 | 4 | 1 |
| Staff | 6 | 5 | 1 |
| Members | 6 | 3 | 3 |
| Leave | 5 | 5 | 0 |
| Salary | 5 | 2 | 3 |
| Attendance | 7 | 3 | 4 |
| Categories | 6 | 4 | 2 |
| **Services** | **11** | **0** | **11** |
| **Bookings** | **12** | **0** | **12** |
| **Cart/Wishlist** | **7** | **0** | **7** |
| **Promo Codes** | **8** | **0** | **8** |
| **Wallet** | **7** | **0** | **7** |
| Subscriptions | 8 | 2 | 6 |
| **Reviews** | **4** | **0** | **4** |
| **Support/FAQ** | **7** | **0** | **7** |
| **Notifications** | **4** | **0** | **4** |
| Banners/CMS | 4 | 1 | 3 |
| **Bank Accounts** | **6** | **0** | **6** |
| Settings | 4 | 4 | 0 |
| **Analytics** | **4** | **0** | **4** |
| **TOTAL** | **~148** | **~43** | **~105** |

> **Only ~29% of backend APIs are currently integrated in the frontend.**
> **~71% of available APIs are NOT YET USED.**

---

## Known Issues

1. **Razorpay URL points to localhost** - `http://localhost:8000/api/` needs production URL
2. **Razorpay test keys in production code** - Should use environment variables
3. **Spelling inconsistencies** - `housersold` vs `housesold` vs `household` in endpoints
4. **No token refresh** - Missing automatic token refresh on 401 responses
5. **No API versioning** - Routes don't use `/v1/` prefix consistently
6. **Google Maps API key hardcoded** - Should be in environment config

---

*Generated: February 2026*
