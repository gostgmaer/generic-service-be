const {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode,
} = require("http-status-codes");
const pool = require('../config/dbConnection'); // Import DB Connection
const addMetadata = require('../middlewares/metadata');
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const md5 = require('md5');



 const getusers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users');

        if (!rows) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'No users found',
                status: ReasonPhrases.NOT_FOUND,
                statusCode: StatusCodes.NOT_FOUND,
                result: []
            });
        }

        return res.status(StatusCodes.OK).json({
            message: 'Users found',
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
            result: rows
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}

 const getSingleUser = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [req.params.id]);

        if (!rows || rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'User Not Found',
                status: ReasonPhrases.NOT_FOUND,
                statusCode: StatusCodes.NOT_FOUND,
                result: rows
            });
        }

        res.status(StatusCodes.OK).json({
            message: 'User Found',
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
            result: rows[0]
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}

 const userUpdate = async (req, res) => {
    try {
        const { full_name, email, phone_number, username, role_id } = req.body;

        if (!full_name || !role_id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'User details are required',
                status: ReasonPhrases.BAD_REQUEST,
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        const [result] = await pool.execute(
            `UPDATE users SET full_name = ?, phone_number = ?, role_id = ? WHERE user_id = ?`,
            [full_name, phone_number, role_id, req.params.id]
          );

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'User Not Found',
                status: ReasonPhrases.NOT_FOUND,
                statusCode: StatusCodes.NOT_FOUND,
            });
        }

        res.status(StatusCodes.OK).json({
            message: 'User updated',
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}


 const removeUser = async (req, res) => {
    try {
        const { full_name, email, phone_number, username, role_id } = req.body;


        const [result] = await pool.execute(
            `'DELETE FROM users WHERE user_id = ?', [req.params.id]`
          );

        if (result.affectedRows === 0) return res.status(StatusCodes.NOT_FOUND).json({
            message: 'User Not Found',
            status: ReasonPhrases.NOT_FOUND,
            statusCode: StatusCodes.NOT_FOUND,
            result: rows
        });


        res.status(StatusCodes.OK).json({
            message: 'User deleted',
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
         
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}


module.exports = {
    getusers,getSingleUser,removeUser,userUpdate
};

