# Security Features Documentation

## Overview
This document describes the security features implemented in the ESMC application.

## Features Implemented

### 1. Login Security

#### Failed Login Attempts Tracking
- **Maximum Attempts**: 5 failed login attempts
- **Account Lock Duration**: 30 minutes
- **Automatic Unlock**: Accounts automatically unlock after the lock period expires
- **Manual Unlock**: Owner accounts can manually unlock locked accounts via the Login Logs dashboard

#### Implementation Details
- Failed attempts are tracked in the User model (`failedLoginAttempts` field)
- Account lock status stored in `accountLocked` and `lockUntil` fields
- Login attempts tracked with timestamps in `lastLoginAttempt`
- Successful logins reset the failed attempt counter

### 2. Password Management

#### Password Change Restrictions
- **Minimum Age**: Passwords must be at least 1 day old before they can be changed
- **Password History**: System maintains history of last 5 passwords
- **Reuse Prevention**: Users cannot reuse any of their previous 5 passwords
- **Format**: Password change timestamps stored as "mm-dd-yyyy hh:mm:ss am/pm"

#### Re-authentication for Critical Operations
- Users must re-verify their password before changing it
- Re-authentication session valid for 5 minutes
- Ensures security even if user leaves their session unattended

### 3. Security Questions

Users select 3 security questions from the following options:
1. First Pet's Name
2. Mother's maiden name
3. Childhood Nickname
4. Name of the first school you attended
5. Favorite fictional character

**Storage Format**:
- Questions stored as array of numbers: `securityQuestions: [1, 5, 3]`
- Answers stored in separate fields: `secAns1`, `secAns2`, `secAns3`

### 4. Login Activity Logging

#### Tracked Information
- Timestamp of each successful login
- IP address of login attempts
- Failed login attempts count
- Account lock status and duration

#### Owner Dashboard
- **Access**: Owner accounts only (`/admin/login-logs`)
- **Features**:
  - View all user login activity
  - Filter by user or status
  - View detailed login history per user
  - Unlock locked accounts
  - Export logs to CSV

### 5. User Registration

#### Registration Page
- **Route**: `/admin/register`
- **Fields**:
  - Full Name
  - Username (must be unique)
  - Password
  - Confirm Password
  - 3 Security Questions with Answers

#### Validation
- Username uniqueness check
- Password confirmation match
- Security questions must be different
- Auto-generates unique userId

### 6. Error Handling

#### 404 Error Page
- **Route**: Any non-existent route
- **Features**:
  - User-friendly error message
  - Navigation options to homepage and login
  - Contact support link
  - Modern, branded design

## API Endpoints

### Authentication Routes (`/admin`)
- `GET /admin/login` - Login page
- `POST /admin/login` - Login authentication
- `GET /admin/register` - Registration page
- `POST /admin/register` - Create new account
- `GET /admin/logout` - Logout user

### Password Management Routes (`/password`)
- `GET /password/change` - Change password page
- `POST /password/verify-password` - Re-authenticate user
- `POST /password/change-password` - Change password
- `GET /password/can-change` - Check password change eligibility

### Login Logs Routes (`/admin`) - Owner Only
- `GET /admin/login-logs` - Login logs dashboard
- `GET /admin/login-history/:username` - Get user login history
- `POST /admin/unlock-account` - Unlock a locked account
- `GET /admin/export-logs` - Export logs to CSV

## User Model Schema

```javascript
{
    userId: Number,
    username: String,
    name: String,
    password: String,
    status: String, // "Customer", "Employee", "Owner"
    securityQuestions: Array, // [1, 2, 4]
    secAns1: String,
    secAns2: String,
    secAns3: String,
    passwordHistory: Array,
    lastChanged: String, // "mm-dd-yyyy hh:mm:ss am/pm"
    failedLoginAttempts: Number,
    accountLocked: Boolean,
    lockUntil: Date,
    lastLoginAttempt: Date,
    loginHistory: [{
        timestamp: Date,
        ipAddress: String
    }]
}
```

## Security Middleware

### `loginSecurity.js`
Located at: `/server/middleware/loginSecurity.js`

**Functions**:
- `checkAccountLock(username)` - Check if account is locked
- `recordFailedLogin(username)` - Record failed login attempt
- `recordSuccessfulLogin(username, ipAddress)` - Record successful login
- `canChangePassword(lastChanged)` - Check if password can be changed
- `formatDateTime(date)` - Format date to required format

### Authentication Middleware
- `checkAuthenticated` - Verify user is logged in
- `checkOwner` - Verify user has Owner status
- `checkRecentAuth` - Verify recent re-authentication for critical operations

## Design Updates

### Color Scheme
All instances of Ferrari red (`#fc0404`) have been updated to `#720110` throughout:
- Login page
- Registration page
- All CSS files
- Buttons and links
- Error pages

## File Structure

```
/server
  /middleware
    loginSecurity.js
  /models
    User.js
  /routes
    admin.js
    password.js
  /config
    passport.js

/views
  login.hbs
  register.hbs
  change_password.hbs
  login_logs.hbs
  error404.hbs

/public
  /css
    login.css
    register.css
    change_password.css
    login_logs.css
    error404.css
```

## Usage Instructions

### For Users
1. **Registration**: Navigate to `/admin/register` to create an account
2. **Login**: Use `/admin/login` with username and password
3. **Change Password**: Access via `/password/change` when logged in
4. **Account Locked**: Wait 30 minutes or contact an Owner to unlock

### For Owners
1. **View Login Logs**: Navigate to `/admin/login-logs`
2. **Unlock Accounts**: Click "Unlock" button next to locked accounts
3. **View Details**: Click "Details" to see full login history
4. **Export Data**: Click "Export Logs" to download CSV

## Security Best Practices

1. **Password Storage**: Currently passwords are stored in plain text. For production, implement bcrypt hashing.
2. **HTTPS**: Use TLS/SSL certificates for secure transmission
3. **Session Security**: Configure secure session cookies
4. **Rate Limiting**: Consider adding rate limiting for login attempts
5. **Input Validation**: All user inputs are validated on both client and server side

## Testing

### Test Scenarios
1. **Failed Login**: Try 5 incorrect passwords to trigger account lock
2. **Password Change**: Attempt to change password before 24 hours
3. **Password Reuse**: Try to reuse a previous password
4. **Re-authentication**: Test 5-minute timeout for critical operations
5. **Owner Access**: Verify only Owners can access login logs

## Notes

- Date format for `lastChanged`: "mm-dd-yyyy hh:mm:ss am/pm"
- Security questions stored as numbers 1-5
- Login history maintains IP addresses for audit trail
- Account locks automatically expire after 30 minutes
- Password history maintains last 5 passwords
