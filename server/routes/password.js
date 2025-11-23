const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const { canChangePassword, formatDateTime, hashPassword, compareHashes } = require('../middleware/loginSecurity');
const { requireAuth } = require('../middleware/auth');
const setViewData = require('../middleware/viewData');

// Apply view data middleware so templates receive `user` and notifications
router.use(setViewData);

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
router.get('/change', requireAuth, (req, res) => {
    const pathFrom = req.query.from; //when going here, it is /change?from=...

    if (pathFrom) {
        req.session.from = pathFrom; //extract the from part and save it
        return res.redirect('/password/change'); //go back and render the clean version
    }

    res.render('change_password', {
        layout: 'admin.hbs',
        title: 'Change Password | ESMC',
        css: 'change_password',
        path: req.session.from || null
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
router.post('/verify-password', requireAuth, async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const passwordMatches = await compareHashes(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Mark the session as recently re-authenticated (used by /change-password)
        if (req.session) {
            req.session.reAuthTime = Date.now();
        }

        // Respond with a clear success object the client expects
        return res.json({ success: true, name: user.name, username: user.username });
    } catch (error) {
        console.error('Password verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Change password with validation
 */
router.post('/change-password', requireAuth, checkRecentAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const currentMatches = await compareHashes(currentPassword, user.password);
        if (!currentMatches) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

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
        const passwordHistory = user.passwordHistory || [];
        const reuseDetected = await Promise.all(
            passwordHistory.map(async (oldHash) => bcrypt.compare(newPassword, oldHash))
        );

        if (reuseDetected.some((match) => match)) {
            return res.status(400).json({ 
                error: 'Cannot reuse a previous password. Please choose a different password.' 
            });
        }

        // Update password
        const currentTime = formatDateTime();
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Add current password to history
        passwordHistory.push(user.password);
        
        // Keep only last 5 passwords in history
        if (passwordHistory.length > 5) {
            passwordHistory.shift();
        }

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedNewPassword,
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
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Get password change eligibility
 */
router.get('/can-change', requireAuth, async (req, res) => {
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


/* FORGOT PASSWORD ROUTES */

/**
 * Show Forgot Password Webpage
 */
router.get('/forgot_password', async (req, res) =>{
    const pathFrom = req.query.from;

    if (pathFrom) {
        req.session.from = pathFrom;
        return res.redirect('/password/forgot_password');
    }

    res.render('forgot_password', {layout: "account.hbs", title: "Forgot Password | ESMC", css:"forgot_password", 
                                  path: req.session.from || null});
})

/**
 * Verify Username by checking if existing
 * If existing, return two random security questions previously picked
 * Otherwise, return 0s as its values
 */
router.post('/verify-username', async (req, res) =>{
    try {
        const { username } = req.body;
        const user = await User.findOne({ username: username });
        var isExisting = false;
        var randomQuestions = [0, 0]
        var name = " "

        if (user) {
            isExisting = true;
            const questions = user.securityQuestions;
            randomQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 2); //shuffle and get two questions
            name = user.name;
        }
        
        res.json({success: true, exists: isExisting, questions: randomQuestions, name: name});
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send({success: false, message: "Server Error"});
    }
})

/**
 * Check if user is able to change password based on their last change
 */
router.post('/check-change', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username: username }); //user exists
        const canChange = canChangePassword(user.lastChanged);
        
        res.json({success: true, change: canChange});
    } catch (error) {
        console.error('Error checking password eligibility:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * Verify Security Answers based on the Security Questions presented from user
 */
router.post('/verify-security-answers', async (req, res) =>{
    try {
        const { username, secQ1, secQ2, secA1, secA2 } = req.body;
        const user = await User.findOne({ username: username }); //user exists
        const listSecurityQuestions = user.securityQuestions;
        var answers = true;                                     // assume all answers are true

        if (listSecurityQuestions) {
            const listHashedAnswers = [user.secAns1, user.secAns2, user.secAns3];
            const listVerifyQuestions = [secQ1, secQ2];
            const listVerifyAnswers = [secA1, secA2];

            console.log(listVerifyQuestions)
            console.log(listVerifyAnswers)
            console.log("=====")

            for (var i = 0; i < listSecurityQuestions.length; i++) {
                const userQuestion = listSecurityQuestions[i];
                const hashedAnswer = listHashedAnswers[i];

                console.log(userQuestion)
                console.log(hashedAnswer)
                
                for (var j = 0; j < listVerifyQuestions.length; j++) {
                    if (listVerifyQuestions[j] === userQuestion) {
                        console.log(j)
                        const result = await compareHashes(listVerifyAnswers[j], hashedAnswer);

                        if (!result) { //not matched
                            answers = false;
                            break;
                        }
                    }
                }
                if (!answers) { // do not specify which answer is wrong
                    break;
                }
            }
        }
        console.log(answers)
        
        res.json({success: true, verified: answers});
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send({success: false, message: "Server Error"});
    }
})

/**
 * Check the previous passwords of the user to see if new password matches with one of them
 */
router.post('/check-previous-passwords', async (req, res) =>{
    try {
        const { username, newPassword } = req.body;
        const user = await User.findOne({ username: username }); //user exists
        var prevPassword = false;

        if (user.passwordHistory) {
            for (const prevHashed of user.passwordHistory) {
                const result = await bcrypt.compare(newPassword, prevHashed);
                if (result) { //result means matched
                    prevPassword = true;
                    break;
                }
            }
        }
        
        const currentPass = await compareHashes(newPassword, user.password);
        if (currentPass) { //currentPass means matched
            prevPassword = true;
        }
        
        res.json({success: true, previous: prevPassword});
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send({success: false, message: "Server Error"});
    }
})

/**
 * Update password from forgot password page
 */
router.post('/update-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const user = await User.findOne({ username: username });

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

        res.json({success: true});
        
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
