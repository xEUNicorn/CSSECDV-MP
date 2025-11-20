const User = require('../models/User');
const bcrypt = require('bcrypt');

// Maximum failed login attempts before locking
const MAX_LOGIN_ATTEMPTS = 5;
// Lock duration in milliseconds (30 minutes)
const LOCK_TIME = 30 * 60 * 1000;

/**
 * Check if account is locked
 */
async function checkAccountLock(username) {
    const user = await User.findOne({ username });
    
    if (!user) {
        return { locked: false };
    }

    // Check if account is locked and lock time has expired
    if (user.accountLocked && user.lockUntil) {
        if (new Date() > user.lockUntil) {
            // Unlock the account
            await User.updateOne(
                { username },
                {
                    $set: {
                        accountLocked: false,
                        failedLoginAttempts: 0,
                        lockUntil: null
                    }
                }
            );
            return { locked: false };
        }
        return { locked: true, lockUntil: user.lockUntil };
    }

    return { locked: false };
}

/**
 * Record failed login attempt
 */
async function recordFailedLogin(username, ipAddress) {
    const user = await User.findOne({ username });
    
    if (!user) {
        return;
    }

    const attempts = user.failedLoginAttempts + 1;
    const updates = {
        failedLoginAttempts: attempts,
        lastLoginAttempt: new Date(),
        lastLoginAttemptIP: ipAddress || 'unknown',
        lastLoginAttemptSuccess: false
    };

    // Lock account if max attempts reached
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updates.accountLocked = true;
        updates.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await User.updateOne({ username }, { $set: updates });
    
    return {
        attempts,
        locked: attempts >= MAX_LOGIN_ATTEMPTS,
        remaining: MAX_LOGIN_ATTEMPTS - attempts
    };
}

/**
 * Record successful login
 */
async function recordSuccessfulLogin(username, ipAddress) {
    await User.updateOne(
        { username },
        {
            $set: {
                failedLoginAttempts: 0,
                accountLocked: false,
                lockUntil: null,
                lastLoginAttempt: new Date(),
                lastLoginAttemptIP: ipAddress || 'unknown',
                lastLoginAttemptSuccess: true
            },
            $push: {
                loginHistory: {
                    timestamp: new Date(),
                    ipAddress: ipAddress || 'unknown'
                }
            }
        }
    );
}

/**
 * Get last login attempt information for notification
 * This should be called BEFORE recording a successful login to get the previous attempt
 */
async function getLastLoginAttemptInfo(username) {
    const user = await User.findOne({ username }).select('lastLoginAttempt lastLoginAttemptIP lastLoginAttemptSuccess loginHistory');
    
    if (!user) {
        return null;
    }

    // Check if there's a previous successful login in history (before the current one)
    // We want the second-to-last entry since the last one will be the current login
    if (user.loginHistory && user.loginHistory.length > 1) {
        // Get the second-to-last successful login from history (previous login)
        const previousLogin = user.loginHistory[user.loginHistory.length - 2];
        return {
            timestamp: previousLogin.timestamp,
            ipAddress: previousLogin.ipAddress,
            success: true
        };
    } else if (user.loginHistory && user.loginHistory.length === 1) {
        // First successful login - check if there was a failed attempt before
        if (user.lastLoginAttempt && !user.lastLoginAttemptSuccess) {
            return {
                timestamp: user.lastLoginAttempt,
                ipAddress: user.lastLoginAttemptIP || 'unknown',
                success: false
            };
        }
        // First login ever, no previous attempt to show
        return null;
    } else if (user.lastLoginAttempt) {
        // If there was a previous attempt (could be failed) and no successful logins yet
        return {
            timestamp: user.lastLoginAttempt,
            ipAddress: user.lastLoginAttemptIP || 'unknown',
            success: user.lastLoginAttemptSuccess || false
        };
    }
    
    return null;
}

/**
 * Check if password can be changed (must be at least 1 day old)
 */
function canChangePassword(lastChanged) {
    if (!lastChanged) {
        return true; // First time password change
    }

    // Parse the date format: mm-dd-yyyy hh:mm:ss am/pm
    const parts = lastChanged.split(' ');
    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');
    const ampm = parts[2];

    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);

    // Convert to 24-hour format
    if (ampm.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
    } else if (ampm.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }

    const lastChangedDate = new Date(
        parseInt(dateParts[2]), // year
        parseInt(dateParts[0]) - 1, // month (0-indexed)
        parseInt(dateParts[1]), // day
        hours,
        minutes,
        seconds
    );

    const oneDayInMs = 24 * 60 * 60 * 1000;
    const timeSinceChange = Date.now() - lastChangedDate.getTime();

    return timeSinceChange >= oneDayInMs;
}

/**
 * Format current date/time to mm-dd-yyyy hh:mm:ss am/pm
 */
function formatDateTime(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${month}-${day}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Hash the password using bcrypt module
 */
async function hashPassword(toBeHashed) {
    const saltRounds = 12; //higher means better security
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(toBeHashed, salt);
        return hash;
    } catch (error) {
        console.error("Error in generating the hash:", error);
        return null;
    }
    
}

/**
 * Compare hashes, returns true if matched
 */
async function compareHashes(normalStr, hashedStr) {
    try {
        const result = await bcrypt.compare(normalStr, hashedStr);
        if (result) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error in generating the hash:", error);
        return null;
    }
    
}

module.exports = {
    checkAccountLock,
    recordFailedLogin,
    recordSuccessfulLogin,
    getLastLoginAttemptInfo,
    canChangePassword,
    formatDateTime,
    hashPassword,
    compareHashes,
    MAX_LOGIN_ATTEMPTS,
    LOCK_TIME
};
