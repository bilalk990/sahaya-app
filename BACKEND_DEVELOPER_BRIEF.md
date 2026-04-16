# Sahayya - Backend Developer Brief

**Date:** February 2026
**Project:** Sahayya - Role-Based Household Staff Management App
**Backend:** Laravel + MySQL
**Base URL:** `https://sahayaa-backend-production.up.railway.app/api/`

---

## SECTION A: BUGS & FIXES (Fix First)

### A1. Fix Spelling in Endpoint URLs

The following endpoints have typos. Rename them to use `household`:

| Current (Wrong) | Change To | Used In |
|---|---|---|
| `/housersold/staff/active-today` | `/household/staff/active-today` | Dashboard |
| `/housersold/attendance/` | `/household/attendance/` | Dashboard |
| `/housersold/attendance/{id}` | `/household/attendance/{id}` | Attendance |
| `/housesold/salary/staff/{user_id}` | `/household/salary/staff/{user_id}` | Salary |
| `/housesold/salary/list` | `/household/salary/list` | Salary |
| `/customer/dashbord-data` | `/customer/dashboard-data` | Staff Dashboard |

> **Note:** Keep old URLs working as aliases for 2 weeks, then remove them. Frontend will be updated simultaneously.

---

### A2. Fix Attendance GET/PUT/DELETE

These endpoints exist in backend but are not working properly or not documented:

| Method | Endpoint | What To Fix |
|---|---|---|
| GET | `/household/attendance/{id}` | Return single attendance record with staff name, date, status, check-in/out times |
| PUT | `/household/attendance/{id}` | Allow updating attendance status (present/absent/half-day), must log who changed it and why |
| DELETE | `/household/attendance/{id}` | Allow deleting wrong attendance entries |

---

### A3. Fix Salary Endpoints

| Method | Endpoint | What To Fix |
|---|---|---|
| POST | `/household/salary/staff/{user_id}` | Currently not working. Should record a salary payment with: amount, payment_mode (cash/upi/bank), deductions, bonus, date |
| GET | `/customer/earnings/summary/{job_id}` | Should return earnings for a specific job, not just overall |

---

## SECTION B: NEW APIs TO BUILD (Grouped by Module)

---

### B1. BLACKLIST STAFF MODULE (6 APIs) - PRIORITY: HIGH

This is a core safety feature. Zero APIs exist for this.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | POST | `/blacklist/add` | Yes | `{ staff_id, aadhaar_number, reason, fir_document (file), photo (file) }` | `{ status, message, blacklist_id }` |
| 2 | GET | `/blacklist/list` | Yes | Query: `?page=1&per_page=10` | `{ data: [{ id, staff_name, aadhaar_number, reason, photo_url, fir_url, blacklisted_by, created_at }], pagination }` |
| 3 | GET | `/blacklist/check/{aadhaar}` | Yes | - | `{ is_blacklisted: true/false, details: { reason, blacklisted_by, date } }` |
| 4 | DELETE | `/blacklist/remove/{id}` | Yes | - | `{ status, message }` |
| 5 | GET | `/blacklist/{id}/documents` | Yes | - | `{ aadhaar_front_url, aadhaar_back_url, photo_url, fir_document_url }` |
| 6 | POST | `/blacklist/report` | Yes | `{ aadhaar_number, reason, evidence (file) }` | `{ status, message, report_id }` |

**Business Logic:**
- When any household adds a staff (POST `/staff/add`), auto-check if their Aadhaar is blacklisted
- If blacklisted, return a warning in the response: `{ warning: "This Aadhaar is blacklisted", blacklist_reason: "..." }`
- Store FIR documents and photos in secure storage (S3/similar)
- Only the household who blacklisted can remove the blacklist entry

---

### B2. HIRE ME / STAFF AVAILABILITY MODULE (8 APIs) - PRIORITY: HIGH

Staff can mark themselves as available for hire. Households can browse and find staff.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | POST | `/staff/hire-me/opt-in` | Yes | `{ services_offered: ["cooking", "cleaning"], availability_type: "daily/monthly", expected_salary, description }` | `{ status, listing_id }` |
| 2 | PUT | `/staff/hire-me/update` | Yes | `{ services_offered, availability_type, expected_salary, description }` | `{ status, message }` |
| 3 | POST | `/staff/hire-me/pause` | Yes | - | `{ status, message }` |
| 4 | POST | `/staff/hire-me/deactivate` | Yes | - | `{ status, message }` |
| 5 | POST | `/staff/availability/update` | Yes | `{ is_available: true/false, available_from, available_days: ["Mon","Tue"] }` | `{ status, message }` |
| 6 | GET | `/staff/availability/status` | Yes | - | `{ is_available, available_from, available_days, listing_status }` |
| 7 | GET | `/staff/available-list` | Optional | Query: `?city=Mumbai&service=cooking&page=1&sort=rating` | `{ data: [{ id, name, photo, services, rating, experience, salary_expected, verified, reviews_count }], pagination }` |
| 8 | GET | `/staff/available/{id}` | Optional | - | `{ full_profile, services, work_history, reviews, aadhaar_verified, references, availability }` |

**Business Logic:**
- Only KYC-verified staff can opt into Hire Me
- Listing shows: prior jobs + duration, household reviews, Aadhaar verification badge
- Staff controls their listing (pause/update/deactivate)
- Households can search by city, service type, rating, availability

**Database Tables Needed:**
```
staff_listings:
  - id, user_id, services_offered (JSON), availability_type, expected_salary,
    description, status (active/paused/deactivated), available_from,
    available_days (JSON), created_at, updated_at
```

---

### B3. SALARY ENHANCEMENTS (11 APIs) - PRIORITY: HIGH

Current salary is basic (list + summary only). Need advance, EMI, bonus, slip download, and receipt confirmation.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/salary/slip/{salary_id}/download` | Yes | - | PDF file download |
| 2 | POST | `/salary/advance/request` | Yes | `{ amount, reason, job_id }` | `{ status, advance_id }` |
| 3 | GET | `/salary/advance/list` | Yes | Query: `?staff_id=5&status=pending` | `{ data: [{ id, amount, reason, status, requested_date, approved_date }] }` |
| 4 | POST | `/salary/advance/approve/{id}` | Yes | - | `{ status, message }` |
| 5 | POST | `/salary/advance/reject/{id}` | Yes | `{ reason }` | `{ status, message }` |
| 6 | POST | `/salary/bonus/add` | Yes | `{ staff_id, amount, reason, month }` | `{ status, message }` |
| 7 | POST | `/salary/emi/add` | Yes | `{ staff_id, total_amount, monthly_deduction, start_month, end_month, reason }` | `{ status, emi_id }` |
| 8 | GET | `/salary/emi/list/{staff_id}` | Yes | - | `{ data: [{ id, total, monthly, remaining, start, end, reason, status }] }` |
| 9 | POST | `/salary/adjustment` | Yes | `{ staff_id, amount, type: "addition/deduction", reason, month }` | `{ status, message }` |
| 10 | POST | `/customer/salary/confirm/{salary_id}` | Yes (Staff) | - | `{ status, message }` |
| 11 | GET | `/customer/salary/breakdown/{job_id}` | Yes (Staff) | Query: `?month=2026-02` | `{ base_salary, bonus, advance_deduction, emi_deduction, adjustments, net_salary, payment_mode, payment_status }` |

**Salary Calculation Logic:**
```
Net Salary = Base Salary
            + Bonus
            - Leave Deductions (auto from attendance)
            - Advance Deductions
            - EMI Deductions
            + Manual Adjustments
```

**PDF Salary Slip should contain:**
- Staff name, Aadhaar (masked), month/year
- Base salary, working days, leave days
- Bonus, deductions (advance, EMI, leave)
- Net amount, payment mode, payment date
- Household name and address

**Database Tables Needed:**
```
salary_advances:
  - id, staff_id, household_id, job_id, amount, reason, status (pending/approved/rejected),
    requested_at, approved_at, rejected_reason

salary_emis:
  - id, staff_id, household_id, total_amount, monthly_deduction, start_month,
    end_month, reason, remaining_amount, status (active/completed)

salary_adjustments:
  - id, staff_id, household_id, amount, type (addition/deduction), reason, month

salary_receipts:
  - id, salary_id, staff_id, confirmed_at
```

---

### B4. ATTENDANCE OVERRIDE TRACKING (3 APIs) - PRIORITY: MEDIUM

Track all manual changes to auto-present attendance.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/attendance/overrides` | Yes | Query: `?staff_id=5&month=2026-02` | `{ data: [{ id, staff_name, date, original_status, new_status, changed_by, reason, timestamp }] }` |
| 2 | POST | `/attendance/override/{attendance_id}` | Yes | `{ new_status: "absent/leave/half-day", reason }` | `{ status, message }` |
| 3 | GET | `/attendance/override-log/{staff_id}` | Yes | Query: `?from=2026-01-01&to=2026-02-28` | `{ data: [{ date, original, changed_to, changed_by_name, reason, timestamp }] }` |

**Business Logic:**
- Default attendance = "present" (auto-present feature)
- When household changes present to absent/leave, log it in `attendance_overrides` table
- Store: who changed, when, original value, new value, reason
- This is for audit/transparency

**Database Table Needed:**
```
attendance_overrides:
  - id, attendance_id, staff_id, household_id, original_status, new_status,
    changed_by (user_id), reason, created_at
```

---

### B5. IN-APP NOTIFICATIONS (4 APIs) - PRIORITY: HIGH

Push notifications via Firebase already work. But there's no in-app notification list/history.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/notifications/list` | Yes | Query: `?page=1&per_page=20` | `{ data: [{ id, title, message, type, is_read, created_at, data: {} }], unread_count, pagination }` |
| 2 | PUT | `/notifications/{id}/read` | Yes | - | `{ status, message }` |
| 3 | POST | `/notifications/read-all` | Yes | - | `{ status, message }` |
| 4 | GET | `/notifications/unread-count` | Yes | - | `{ unread_count }` |

**Notification Types to Store:**
- `salary_reminder` - Salary due date approaching
- `advance_reminder` - Advance repayment due
- `leave_request` - New leave request from staff
- `leave_approved` / `leave_rejected` - Leave status update
- `subscription_expiry` - Subscription about to expire
- `late_checkin` - Staff checked in late
- `blacklist_alert` - Added staff is blacklisted
- `payment_received` - Salary payment confirmed
- `job_application` - New application on your job post
- `job_accepted` / `job_rejected` - Application status update
- `hire_me_inquiry` - Someone viewed your Hire Me listing

**Business Logic:**
- When sending Firebase push notification, ALSO save it in `notifications` table
- Return unread_count in the list API response for badge display
- Auto-delete notifications older than 90 days

---

### B6. REVIEWS & RATINGS (3 APIs) - PRIORITY: MEDIUM

Needed for the Hire Me module. Households review staff after employment.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | POST | `/reviews/store` | Yes | `{ staff_id, job_id, rating (1-5), review_text, tags: ["punctual", "trustworthy"] }` | `{ status, review_id }` |
| 2 | GET | `/reviews/list/{staff_id}` | Optional | Query: `?page=1` | `{ average_rating, total_reviews, data: [{ id, reviewer_name, rating, text, tags, date }] }` |
| 3 | GET | `/reviews/list-self` | Yes (Staff) | - | `{ average_rating, total_reviews, data: [...] }` |

**Business Logic:**
- Only household who employed the staff can review
- One review per job (can edit, not duplicate)
- Review tags: punctual, trustworthy, skilled, reliable, professional, friendly
- Average rating shown on staff profile and Hire Me listing

---

### B7. SUPPORT & FAQ (5 APIs) - PRIORITY: MEDIUM

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | POST | `/supports` | Yes | `{ subject, message, category, screenshot (file) }` | `{ status, ticket_id }` |
| 2 | GET | `/supports` | Yes | Query: `?status=open&page=1` | `{ data: [{ id, subject, status, created_at, last_reply_at }] }` |
| 3 | POST | `/supports/{id}/reply` | Yes | `{ message, attachment (file) }` | `{ status, message }` |
| 4 | GET | `/faq-support` | No | Query: `?category=payment` | `{ data: [{ id, question, answer, category }] }` |
| 5 | POST | `/faq-support-search` | No | `{ query: "how to pay salary" }` | `{ data: [{ id, question, answer }] }` |

---

### B8. BANK ACCOUNTS (5 APIs) - PRIORITY: MEDIUM

Staff needs bank accounts for receiving salary digitally.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/bank-accounts` | Yes | - | `{ data: [{ id, bank_name, account_number (masked), ifsc, is_default }] }` |
| 2 | POST | `/bank-accounts` | Yes | `{ bank_name, account_number, ifsc_code, account_holder_name, is_default }` | `{ status, account_id }` |
| 3 | POST | `/bank-accounts/update/{id}` | Yes | Same as add | `{ status, message }` |
| 4 | POST | `/bank-accounts/delete/{id}` | Yes | - | `{ status, message }` |
| 5 | POST | `/bank-accounts/set/{id}` | Yes | - | `{ status, message }` |

**Business Logic:**
- Mask account number in list response (show last 4 digits only)
- Validate IFSC code format
- At least one account must remain if salary mode is "bank"

---

### B9. MULTI-LANGUAGE (2 APIs) - PRIORITY: LOW

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/languages` | No | - | `{ data: [{ code: "hi", name: "Hindi", is_default }, { code: "en", name: "English" }] }` |
| 2 | GET | `/translations/{lang_code}` | No | - | `{ data: { "login": "लॉगिन", "signup": "साइन अप", ... } }` |

**Note:** Client will provide JSON translation files. Backend just serves them. Cache these responses heavily.

---

### B10. KYC STATUS (3 APIs) - PRIORITY: MEDIUM

These may already exist in backend but are not documented properly.

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/aadhar/status` | Yes | - | `{ is_verified, aadhaar_number (masked), verified_at }` |
| 2 | POST | `/aadhar/resend-otp` | Yes | `{ aadhaar_number }` | `{ status, message }` |
| 3 | GET | `/kyc/status/{user_id}` | Yes | - | `{ aadhaar_verified, photo_uploaded, police_clearance_uploaded, overall_status: "complete/pending/partial" }` |

---

### B11. SUBSCRIPTION ENHANCEMENTS (2 APIs) - PRIORITY: MEDIUM

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/subscription/current` | Yes | - | `{ plan_name, status (active/expired), start_date, end_date, staff_limit, staff_used, days_remaining, auto_renew }` |
| 2 | GET | `/subscription/history` | Yes | - | `{ data: [{ plan_name, amount, start, end, payment_id, status }] }` |

**Business Logic:**
- Auto-lock features when subscription expires (no new staff add, no salary pay)
- Send notification 7 days and 1 day before expiry
- Downgrade to free plan on expiry (keep data, restrict features)

---

### B12. STAFF EMPLOYMENT HISTORY (2 APIs) - PRIORITY: LOW

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | GET | `/staff/employment-history` | Yes (Staff) | - | `{ data: [{ household_name, role, joined_date, left_date, duration, city, rating }] }` |
| 2 | GET | `/staff/references/{staff_id}` | Yes | - | `{ data: [{ household_name, contact (masked), duration, feedback }] }` |

---

### B13. HOUSEHOLD MEMBER ROLE ASSIGNMENT (1 API) - PRIORITY: LOW

| # | Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|---|
| 1 | POST | `/admin/members/{id}/assign-role` | Yes | `{ role: "admin" / "viewer" }` | `{ status, message }` |

**Business Logic:**
- `admin` role: Can add/remove staff, manage salary, approve leave
- `viewer` role: Can only view staff list, attendance, salary history (read-only)

---

## SECTION C: EXISTING APIS THAT NEED CHANGES

### C1. POST `/staff/add` - Add Blacklist Check

**Current:** Just adds the staff.
**Change:** Before adding, check if the Aadhaar is in `blacklist` table.

```
// Add to response when blacklisted
{
  "status": "warning",
  "message": "This staff member is blacklisted",
  "blacklist_info": {
    "reason": "Theft reported",
    "blacklisted_by": "Household Name",
    "date": "2026-01-15"
  },
  "staff_added": true  // Still add, but with warning
}
```

---

### C2. POST `/household/attendance/` - Add Override Logging

**Current:** Just records attendance.
**Change:** If changing an existing attendance record (e.g., present to absent), log it in `attendance_overrides` table automatically.

---

### C3. GET `/customer/dashboard-data` - Add More Data

**Current:** Basic dashboard.
**Change:** Also return:
```json
{
  "existing_data": "...",
  "unread_notifications": 5,
  "pending_leave_requests": 2,
  "pending_advance_requests": 1,
  "subscription_days_remaining": 15,
  "subscription_plan": "Premium"
}
```

---

### C4. GET `/staff/list` - Add Blacklist Flag

**Current:** Returns staff list.
**Change:** Add `is_blacklisted` field to each staff object.

```json
{
  "data": [
    {
      "id": 1,
      "name": "Raj Kumar",
      "is_blacklisted": false,
      "kyc_status": "verified"
    }
  ]
}
```

---

### C5. POST `/customer/leave-apply` - Auto Deduct from Salary

**Current:** Just records leave.
**Change:** When leave is approved AND it's unpaid leave, automatically add it as a salary deduction for that month.

---

### C6. Notification Triggers (Add to Existing APIs)

Add automatic notification creation (save to DB + send Firebase push) when these events happen:

| Trigger Event | API That Should Trigger It | Notification To |
|---|---|---|
| Staff applies for leave | `POST /customer/leave-apply` | Household admin |
| Leave approved/rejected | `POST /customer/leave-approve/{id}` | Staff |
| Salary paid | `POST /household/salary/staff/{id}` | Staff |
| Job application received | `POST /applications` | Household who posted |
| Application accepted/rejected | `POST /admin/applications/{id}/status` | Staff applicant |
| Advance requested | `POST /salary/advance/request` | Household admin |
| Advance approved/rejected | `POST /salary/advance/approve/{id}` | Staff |
| Subscription expiring (7 days) | Cron Job / Scheduler | Household admin |
| Subscription expired | Cron Job / Scheduler | Household admin |
| Blacklisted staff added | `POST /staff/add` (when blacklisted) | Household admin |
| New review received | `POST /reviews/store` | Staff |

---

## SECTION D: DATABASE TABLES TO CREATE

```sql
-- 1. Blacklist
CREATE TABLE blacklists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_user_id BIGINT NULL,
    aadhaar_number VARCHAR(12) NOT NULL,
    staff_name VARCHAR(255),
    reason TEXT NOT NULL,
    fir_document_url VARCHAR(500),
    photo_url VARCHAR(500),
    aadhaar_front_url VARCHAR(500),
    aadhaar_back_url VARCHAR(500),
    blacklisted_by BIGINT NOT NULL, -- household user_id
    status ENUM('active', 'removed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_aadhaar (aadhaar_number),
    FOREIGN KEY (blacklisted_by) REFERENCES users(id)
);

-- 2. Staff Listings (Hire Me)
CREATE TABLE staff_listings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    services_offered JSON,
    availability_type ENUM('daily', 'monthly', 'both') DEFAULT 'both',
    expected_salary DECIMAL(10,2),
    description TEXT,
    status ENUM('active', 'paused', 'deactivated') DEFAULT 'active',
    available_from DATE,
    available_days JSON,
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_city_status (city, status),
    INDEX idx_status (status)
);

-- 3. Salary Advances
CREATE TABLE salary_advances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    household_id BIGINT NOT NULL,
    job_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejected_reason TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (household_id) REFERENCES users(id)
);

-- 4. Salary EMIs
CREATE TABLE salary_emis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    household_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    monthly_deduction DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    start_month DATE NOT NULL,
    end_month DATE NOT NULL,
    reason TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (household_id) REFERENCES users(id)
);

-- 5. Salary Adjustments
CREATE TABLE salary_adjustments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    household_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('addition', 'deduction') NOT NULL,
    reason TEXT,
    month DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (household_id) REFERENCES users(id)
);

-- 6. Salary Receipts (Staff Confirmation)
CREATE TABLE salary_receipts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    salary_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- 7. Attendance Overrides
CREATE TABLE attendance_overrides (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attendance_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    household_id BIGINT NOT NULL,
    original_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by BIGINT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- 8. Notifications (In-App)
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_user_created (user_id, created_at)
);

-- 9. Reviews
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    job_id BIGINT,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    UNIQUE KEY unique_review (staff_id, reviewer_id, job_id)
);

-- 10. Support Tickets
CREATE TABLE support_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50),
    screenshot_url VARCHAR(500),
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE support_replies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id)
);

-- 11. Languages & Translations
CREATE TABLE languages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE translations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    language_code VARCHAR(5) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    UNIQUE KEY unique_translation (language_code, key_name)
);

-- 12. Member Roles (add column to existing members table)
-- ALTER TABLE household_members ADD COLUMN role ENUM('admin', 'viewer') DEFAULT 'viewer';
```

---

## SECTION E: CRON JOBS / SCHEDULED TASKS

| # | Schedule | Task | Details |
|---|---|---|---|
| 1 | Daily 12:00 AM | Auto-mark present | Mark all active staff as "present" for today if AutoPresent is ON |
| 2 | Daily 9:00 AM | Late check-in alert | Send notification if staff hasn't checked in by 9 AM |
| 3 | Daily 6:00 PM | Salary reminder | On 28th of each month, remind households about pending salary |
| 4 | Daily 10:00 AM | Subscription expiry check | Send notification 7 days and 1 day before expiry |
| 5 | Daily 12:00 AM | Subscription auto-expire | Lock features for expired subscriptions |
| 6 | Weekly Sunday | Clean old notifications | Delete notifications older than 90 days |
| 7 | Monthly 1st | EMI auto-deduct | Add EMI deduction to salary calculation for the month |

---

## SECTION F: PRIORITY ORDER FOR DEVELOPMENT

| Priority | Module | APIs Count | Reason |
|---|---|---|---|
| 1 | Fix Bugs (Section A) | 6 fixes | Existing features broken/inconsistent |
| 2 | Blacklist Staff | 6 new | Core safety feature, zero coverage |
| 3 | Salary Enhancements | 11 new | Most requested feature (advance, EMI, slip) |
| 4 | In-App Notifications | 4 new | Users need notification history |
| 5 | Hire Me / Availability | 8 new | Major new feature for staff |
| 6 | Reviews & Ratings | 3 new | Required for Hire Me to work properly |
| 7 | Existing API Changes (Section C) | 6 changes | Improve current features |
| 8 | Support & FAQ | 5 new | User support system |
| 9 | Bank Accounts | 5 new | Digital salary payments |
| 10 | KYC Status | 3 new | May already exist, just document |
| 11 | Subscription Enhancements | 2 new | Show current plan status |
| 12 | Attendance Override | 3 new | Audit trail feature |
| 13 | Member Roles | 1 new | Admin/viewer access control |
| 14 | Employment History | 2 new | Staff work history |
| 15 | Multi-Language | 2 new | Can be last, client provides JSON |

**TOTAL: ~55 new APIs + 6 bug fixes + 6 existing API changes + 7 cron jobs**

---

## SECTION G: NOTES FOR BACKEND DEV

1. **All new APIs must follow the existing response format:**
```json
{ "status": "success/error", "message": "...", "data": { } }
```

2. **All authenticated APIs use Bearer Token** (Laravel Passport). Same middleware as existing APIs.

3. **File uploads** (FIR docs, screenshots, etc.) should go to the same storage as current KYC uploads.

4. **Pagination** - Use Laravel's built-in pagination. Return: `current_page, last_page, per_page, total`.

5. **The frontend team will update endpoint URLs simultaneously** when spelling fixes are deployed. Coordinate the release.

6. **Don't remove old endpoints immediately** - keep `/housersold/` and `/housesold/` as aliases for 2 weeks after adding `/household/`.
