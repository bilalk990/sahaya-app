/**
 * API Routes Configuration
 *
 * This file contains all API endpoint routes for the Sahayya app.
 * Routes are organized by feature/module.
 */

// ===========================================
// AUTHENTICATION & USER
// ===========================================
export const GET_CMS_DATA = 'cms-page';
export const INTRO_API = 'customer/intro_api';
export const LOGIN = 'customer/login';
export const SIGINUP = 'customer/signup';
export const VERIFY_OTP = 'verify-otp';
export const RESEND_OTP = 'resend-otp';
export const PROFILE_UPDATE = 'profile/update';
export const POLICY = 'cms-page';
export const PROFILE = 'profile';
export const DELETE_ACCOUNT = 'user/delete-self';
export const LOGOUT = 'logout';

// ===========================================
// HOUSEHOLD / ADMIN
// ===========================================
export const AddJob = 'admin/jobs';
export const AddUser = 'admin/members/store';
export const ListUser = 'admin/members/list';
export const DeleteUser = 'admin/delete-user';
export const JobApplicationList = 'admin/jobs';
export const DeleteJob = 'admin/jobs/delete';
export const ApplicantsList = 'admin/jobs';
export const ApplicantsStatus = 'admin/applications';
export const Joblist_Admin = 'admin/auth-jobs';
export const UpdateMember = 'admin/members';
export const DELETE_Member = 'delete/member';

// ===========================================
// STAFF MANAGEMENT
// ===========================================
export const AddStaff = 'staff/add';
export const UpdateStaff = 'staff/update';
export const ListStaff = 'staff/list';
export const applicationsList = 'applications';
export const QuitJob = 'customer/quit-job-request';
export const myWork = 'customer/approved-job';

// ===========================================
// KYC & VERIFICATION
// ===========================================
export const AADHAR_SAVE = 'aadhar/send-otp';
export const AADHAR_VERFIY = 'aadhar/verify';
export const KYC_UPLOAD = 'kyc/upload';
export const ADDRESSES_UPDATE = 'addresses/update';

// ===========================================
// CATEGORIES & WORK
// ===========================================
export const CATEGORY = 'category';
export const SUB_CATEGORY = 'category/subcategories';
export const WORK_INFO = 'work-info-update';
export const LAST_WORK_INFO = 'last-work-experience/save';

// ===========================================
// JOBS
// ===========================================
export const ListJob = 'jobs';
export const Apply_Job = 'applications';

// ===========================================
// LEAVE MANAGEMENT
// ===========================================
export const LeaveList = 'customer/leave-type-list';
export const ApplyLeave = 'customer/leave-apply';
export const LeaveListUser = 'customer/leave-list';
export const LeaveRejectr = 'customer/leave-reject';
export const LeaveApprove = 'customer/leave-approve';

// ===========================================
// SALARY MANAGEMENT
// ===========================================
export const SalaryManagementStaff = 'housesold/salary/staff';
export const SalaryList = 'housesold/salary/list';
export const EarningSummary = 'customer/earnings/summary';

// ===========================================
// ATTENDANCE & DASHBOARD
// ===========================================
export const AutoPresentBtn = 'settings/AutoPresent';
export const ActiveTodayUser = 'housersold/staff/active-today';
export const HousersoldAttendance = 'housersold/attendance';
export const customerDashbord = 'customer/dashbord-data';

// ===========================================
// SETTINGS & NOTIFICATIONS
// ===========================================
export const GET_NOTIFICATION_SETTINGS = 'settings/notification';
export const SAVE_NOTIFICATION_SETTINGS = 'settings/notification';
export const SUBSCRIPTIONS = 'subscriptions';

// ===========================================
// PAYMENT ROUTES (Main Backend - Laravel)
// ===========================================
export const CREATE_ORDER = 'payment/create-order';
export const VERIFY_PAYMENT = 'payment/verify';
export const PAYMENT_HISTORY = 'payment/history';
export const SUBSCRIBE_PLAN = 'subscription/subscribe';
export const SALARY_PAYMENT = 'payment/salary';

// ===========================================
// RAZORPAY API ROUTES (PHP Backend)
// Based on API_DOCUMENTATION.md
// Base URL: http://localhost:8000/api/
// ===========================================
export const RAZORPAY_ROUTES = {
  // Create Order - Generates a unique Razorpay Order ID
  CREATE_ORDER: 'create-order.php',

  // Verify Payment - Verifies server-side signature
  VERIFY_PAYMENT: 'verify-payment.php',

  // Create Subscription - For recurring payments
  CREATE_SUBSCRIPTION: 'create-subscription.php',

  // Webhook Handler - Handles async events from Razorpay
  WEBHOOK: 'webhook.php',

  // AI Staff Search - Smart matching based on natural language
  FIND_STAFF_AI: 'find-staff-ai.php',
};

// ===========================================
// HELPER EXPORTS
// ===========================================
// Export individual Razorpay routes for easier access
export const RAZORPAY_CREATE_ORDER = RAZORPAY_ROUTES.CREATE_ORDER;
export const RAZORPAY_VERIFY_PAYMENT = RAZORPAY_ROUTES.VERIFY_PAYMENT;
export const RAZORPAY_CREATE_SUBSCRIPTION = RAZORPAY_ROUTES.CREATE_SUBSCRIPTION;
export const RAZORPAY_WEBHOOK = RAZORPAY_ROUTES.WEBHOOK;
export const RAZORPAY_FIND_STAFF_AI = RAZORPAY_ROUTES.FIND_STAFF_AI;

// ===========================================
// DEFAULT EXPORT
// ===========================================
export default {
  // Auth
  LOGIN,
  SIGINUP,
  VERIFY_OTP,
  RESEND_OTP,
  LOGOUT,
  PROFILE,
  PROFILE_UPDATE,

  // Payment
  CREATE_ORDER,
  VERIFY_PAYMENT,
  PAYMENT_HISTORY,
  SUBSCRIBE_PLAN,
  SALARY_PAYMENT,

  // Razorpay
  RAZORPAY_ROUTES,

  // Subscriptions
  SUBSCRIPTIONS,
};
