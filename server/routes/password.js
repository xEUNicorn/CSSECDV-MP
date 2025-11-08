const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { canChangePassword, formatDateTime, hashPassword } = require('../middleware/loginSecurity');

// Middleware to check if user is authenticated
const checkAuthenticated = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
};

/**
 * Render change password page
 */
router.get('/change', checkAuthenticated, (req, res) => {
    res.render('change_password', {
        layout: 'admin.hbs',
        title: 'Change Password | ESMC',
        css: 'change_password'
    });
});

// Middleware to check if user has been re-authenticated recently (within 5 minutes)
const checkRecentAuth = (req, res, next) => {
    if (!req.session.reAuthTime) {
        return res.status(403).json({ 
            error: 'Re-authentication required',
            requireReAuth: true 
        });
    }

    const fiveMinutes = 5 * 60 * 1000;
    const timeSinceReAuth = Date.now() - req.session.reAuthTime;

    if (timeSinceReAuth > fiveMinutes) {
        delete req.session.reAuthTime;
        return res.status(403).json({ 
            error: 'Re-authentication expired. Please verify your password again.',
            requireReAuth: true 
        });
    }

    next();
};

/**
 * Re-authenticate user before critical operations
 */
router.post('/verify-password', checkAuthenticated, async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        bcrypt.compare(password, user.password, async (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return;
            }

            if (result) {
                console.log('Passwords match! User authenticated to verify change password.');
                // Set re-authentication timestamp
                req.session.reAuthTime = Date.now();
            
                res.json({ 
                    success: true, 
                    message: 'Password verified successfully' 
                });
            } else {
                console.log('Passwords do not match! Authentication failed to verify change password.');
                return res.status(401).json({ error: 'Invalid password' });
            }
        });
        
        
    } catch (error) {
        console.error('Password verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Change password with validation
 */
router.post('/change-password', checkAuthenticated, checkRecentAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        bcrypt.compare(currentPassword, user.password, async (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return;
            }

            if (result) {
                console.log('Passwords match! User authenticated to change password.');
                // Check if passwords match
                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ error: 'New passwords do not match' });
                }

                // Check if password can be changed (at least 1 day old)
                if (!canChangePassword(user.lastChanged)) {
                    return res.status(400).json({ 
                        error: 'Password must be at least one day old before it can be changed again',
                        lastChanged: user.lastChanged
                    });
                }

                // Check if new password is in password history
                if (user.passwordHistory) {
                    for (const prevHashed of user.passwordHistory) {
                        const result = await bcrypt.compare(newPassword, prevHashed);
                        if (result) { //result means matched
                            return res.status(400).json({ 
                                error: 'Cannot reuse a previous password. Please choose a different password.' 
                            });
                        }
                    }
                }

                // Update password
                const currentTime = formatDateTime();
                const passwordHistory = user.passwordHistory || [];
                
                // Add current password to history
                passwordHistory.push(user.password); //stores the hashed password
                
                // Keep only last 5 passwords in history
                if (passwordHistory.length > 5) {
                    passwordHistory.shift();
                }
                
                //hash new password
                const hashNewPass = await hashPassword(newPassword)

                await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            password: hashNewPass,
                            passwordHistory: passwordHistory,
                            lastChanged: currentTime
                        }
                    }
                );

                // Clear re-authentication timestamp
                delete req.session.reAuthTime;

                res.json({ 
                    success: true, 
                    message: 'Password changed successfully',
                    lastChanged: currentTime
                });
            } else {
                console.log('Passwords do not match! Authentication failed to change password.');
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        });

        
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get password change eligibility
 */
router.get('/can-change', checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        //const canChange = true; for testing purposes only
        const canChange = canChangePassword(user.lastChanged);
        
        res.json({
            canChange,
            lastChanged: user.lastChanged,
            message: canChange 
                ? 'You can change your password' 
                : 'Password must be at least one day old before changing'
        });
    } catch (error) {
        console.error('Error checking password eligibility:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
