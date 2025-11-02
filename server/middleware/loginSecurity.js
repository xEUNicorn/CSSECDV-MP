const User = require('../models/User');

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
async function recordFailedLogin(username) {
    const user = await User.findOne({ username });
    
    if (!user) {
        return;
    }

    const attempts = user.failedLoginAttempts + 1;
    const updates = {
        failedLoginAttempts: attempts,
        lastLoginAttempt: new Date()
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
                lastLoginAttempt: new Date()
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

module.exports = {
    checkAccountLock,
    recordFailedLogin,
    recordSuccessfulLogin,
    canChangePassword,
    formatDateTime,
    MAX_LOGIN_ATTEMPTS,
    LOCK_TIME
};
