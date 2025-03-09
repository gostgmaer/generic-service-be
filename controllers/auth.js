const {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode,
} = require("http-status-codes");
const pool = require('../config/dbConnection'); // Import DB Connection
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const md5 = require('md5');


const registerUser = async (req, res) => {
    const userId = uuidv4();
    const { full_name, email, password, username } = req.body;

    if (!full_name || !email || !password || !username) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Please Provide Required Information",
            statusCode: StatusCodes.BAD_REQUEST,
            status: ReasonPhrases.BAD_REQUEST,
        });
    }

    try {
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({
                message: 'Email or Username already exists',
                statusCode: StatusCodes.CONFLICT,
                status: ReasonPhrases.CONFLICT,
            });
        }

        const hash_password = await bcrypt.hash(password, 10);

        // Execute query correctly
        const user = await pool.execute(
            'INSERT INTO users (id, full_name, email, password_hash, username) VALUES (?, ?, ?, ?, ?)',
            [userId, full_name, email, hash_password, username]
        );
        if (user[0].affectedRows > 0) {
            return res.status(StatusCodes.CREATED).json({
                message: 'User created successfully',
                status: ReasonPhrases.CREATED,
                statusCode: StatusCodes.CREATED,
                resule: user
            });
        }



    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
};

const generateIdToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            username: user.username,
            created_at: user.created_at,
        },
        process.env.ID_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const [users] = await pool.execute(
            'SELECT id, full_name, email, password_hash FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Invalid email or password',
                statusCode: StatusCodes.UNAUTHORIZED,
                status: ReasonPhrases.UNAUTHORIZED,
            });
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Invalid email or password',
                statusCode: StatusCodes.UNAUTHORIZED,
                status: ReasonPhrases.UNAUTHORIZED,
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const idToken = generateIdToken(user);

        // Store refresh token in database
        await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

        return res.status(StatusCodes.OK).json({
            message: 'Login successful',
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
            accessToken,
            refreshToken,
            idToken,
            token_type: "Bearer",
            expires_in: 900,
          
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Refresh token is required',
            statusCode: StatusCodes.UNAUTHORIZED,
            status: ReasonPhrases.UNAUTHORIZED,
        });
    }

    try {
        // Check if refresh token exists in DB
        const [users] = await pool.execute('SELECT id, email FROM users WHERE refresh_token = ?', [refreshToken]);

        if (users.length === 0) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Invalid refresh token',
                statusCode: StatusCodes.FORBIDDEN,
                status: ReasonPhrases.FORBIDDEN,
            });
        }

        const user = users[0];

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || decoded.id !== user.id) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    message: 'Invalid or expired refresh token',
                    statusCode: StatusCodes.FORBIDDEN,
                    status: ReasonPhrases.FORBIDDEN,
                });
            }

            // Generate a new access token
            const newAccessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            const idToken = generateIdToken(user);

            return res.status(StatusCodes.OK).json({
                message: 'Access token refreshed successfully',
                status: ReasonPhrases.OK,
                statusCode: StatusCodes.OK,
                accessToken: newAccessToken,
                refreshToken,idToken
            });
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const signOutUser = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Refresh token is required',
            statusCode: StatusCodes.BAD_REQUEST,
            status: ReasonPhrases.BAD_REQUEST,
        });
    }

    try {
        // Remove refresh token from database
        const [result] = await pool.execute('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?', [refreshToken]);

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'Invalid refresh token',
                statusCode: StatusCodes.NOT_FOUND,
                status: ReasonPhrases.NOT_FOUND,
            });
        }

        return res.status(StatusCodes.OK).json({
            message: 'User signed out successfully',
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};


const sendResetPasswordEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'User not found',
                statusCode: StatusCodes.NOT_FOUND,
                status: ReasonPhrases.NOT_FOUND,
            });
        }

        const user = users[0];

        // Generate a unique token (valid for 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to the database
        await pool.execute('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [resetToken, expiresAt, user.id]);

        // Send reset link (Replace with your actual email service)
        console.log(`Send this link to the user: http://yourwebsite.com/reset-password/${resetToken}`);

        return res.status(StatusCodes.OK).json({
            message: 'Password reset link sent successfully',
            statusCode: StatusCodes.OK,
            status: ReasonPhrases.OK,
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params; // Token from URL params
    const { newPassword } = req.body; // New password from request body

    try {
        // Check if token exists and is valid
        const [users] = await pool.execute('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token]);

        if (users.length === 0) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Invalid or expired token',
                statusCode: StatusCodes.FORBIDDEN,
                status: ReasonPhrases.FORBIDDEN,
            });
        }

        const user = users[0];

        // Encrypt new password with MD5
        const hashedPassword = md5(newPassword);

        // Update user's password and remove the reset token
        await pool.execute('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, user.id]);

        return res.status(StatusCodes.OK).json({
            message: 'Password reset successfully',
            statusCode: StatusCodes.OK,
            status: ReasonPhrases.OK,
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const changePassword = async (req, res) => {
    const userId = req.user.id; // Get user ID from authentication middleware
    const { oldPassword, newPassword } = req.body;

    try {
        // Fetch user's current password
        const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'User not found',
                statusCode: StatusCodes.NOT_FOUND,
                status: ReasonPhrases.NOT_FOUND,
            });
        }

        const user = users[0];

        // Check if the old password matches
        if (md5(oldPassword) !== user.password_hash) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'Incorrect old password',
                statusCode: StatusCodes.UNAUTHORIZED,
                status: ReasonPhrases.UNAUTHORIZED,
            });
        }

        // Encrypt the new password
        const hashedNewPassword = md5(newPassword);

        // Update the password
        await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);

        return res.status(StatusCodes.OK).json({
            message: 'Password changed successfully',
            statusCode: StatusCodes.OK,
            status: ReasonPhrases.OK,
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const confirmEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const [users] = await pool.execute('SELECT id FROM users WHERE confirmation_token = ?', [token]);

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'Invalid or expired token',
                statusCode: StatusCodes.NOT_FOUND,
                status: ReasonPhrases.NOT_FOUND,
            });
        }

        await pool.execute('UPDATE users SET confirmed = ?, confirmation_token = NULL WHERE confirmation_token = ?', [true, token]);

        return res.status(StatusCodes.OK).json({
            message: 'Email confirmed successfully. You can now log in!',
            statusCode: StatusCodes.OK,
            status: ReasonPhrases.OK,
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { id, full_name, email, username, created_at } = req.user;

        return res.status(StatusCodes.OK).json({
            message: 'Profile retrieved successfully',
            user: { id, full_name, email, username, created_at },
            statusCode: StatusCodes.OK,
            status: ReasonPhrases.OK,
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};












module.exports = {
    registerUser, loginUser,refreshToken,signOutUser,sendResetPasswordEmail,resetPassword,changePassword,confirmEmail,getUserProfile
};

