const {
    ReasonPhrases,
    StatusCodes,
  } = require("http-status-codes");
  // const { FilterOptions } = require("../utils/service");
  // const User = require("../models/user");
  
  const pool = require('../config/dbConnection'); // Import DB Connection
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const md5 = require('md5');
  const getUsers = async (req, res) => {
    try {
        let { sort = 'created_at', order = 'DESC', page = 1, limit = 10, filter } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = '';
        let queryParams = [];

        // Apply filters dynamically
        if (filter) {
            whereClause = `WHERE full_name LIKE ? OR email LIKE ? OR username LIKE ?`;
            queryParams.push(`%${filter}%`, `%${filter}%`, `%${filter}%`);
        }

        // Query to get filtered and paginated users
        const usersQuery = `
            SELECT id, full_name, email, username, created_at FROM users
            ${whereClause}
            ORDER BY ${sort} ${order} 
            LIMIT ? OFFSET ?;
        `;
        queryParams.push(parseInt(limit), parseInt(offset));

        // Query to count total users
        const countQuery = `SELECT COUNT(*) AS total FROM users ${whereClause}`;

        const [users] = await pool.execute(usersQuery, queryParams);
        const [[{ total }]] = await pool.execute(countQuery, queryParams.slice(0, -2)); // Remove LIMIT & OFFSET from count query params

        if (users.length > 0) {
            return res.status(StatusCodes.OK).json({
                message: 'Users data has been loaded successfully!',
                statusCode: StatusCodes.OK,
                status: ReasonPhrases.OK,
                result: users,
                total,
            });
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'No information found',
                statusCode: StatusCodes.NOT_FOUND,
                status: ReasonPhrases.NOT_FOUND,
            });
        }
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};
  
const getSingleUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
          message: "User ID is not provided",
          statusCode: StatusCodes.BAD_REQUEST,
          status: ReasonPhrases.BAD_REQUEST,
      });
  }

  try {
      // Fetch all fields for the given user ID
      const [row] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [id]);

      if (row.length > 0) {
          return res.status(StatusCodes.OK).json({
              message: "User data loaded successfully!",
              statusCode: StatusCodes.OK,
              status: ReasonPhrases.OK,
              result: row[0], // Return full user data
          });
      } else {
          return res.status(StatusCodes.NOT_FOUND).json({
              message: "No information found for the given ID",
              statusCode: StatusCodes.NOT_FOUND,
              status: ReasonPhrases.NOT_FOUND,
          });
      }
  } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
  }
};
  
  // const updateUser = async (req, res) => {
  //   const { id } = req.params;
  //   try {
  //     if (!id) {
  //       res.status(StatusCodes.BAD_REQUEST).json({
  //         message: "user id is not provide",
  //         statusCode: StatusCodes.BAD_REQUEST,
  //         status: ReasonPhrases.BAD_REQUEST,
  //       });
  //     }
  
  //     const user = await User.findOne({ _id: id });
  
  //     var myquery = { _id: id };
  
  //     if (user) {
  //       try {
  //         const body = { ...req.body };
  //         User.updateOne(myquery, { $set: req.body }, { upsert: true }).then(
  //           (data, err) => {
  //             if (err)
  //               res.status(StatusCodes.NOT_MODIFIED).json({
  //                 message: "Update Failed",
  //                 status: ReasonPhrases.NOT_MODIFIED,
  //                 statusCode: StatusCodes.NOT_MODIFIED,
  //                 cause: err,
  //               });
  //             else {
  //               res.status(StatusCodes.OK).json({
  //                 message: "User Update Successfully",
  //                 status: ReasonPhrases.OK,
  //                 statusCode: StatusCodes.OK,
  //                 data: data,
  //               });
  //             }
  //           }
  //         );
  //       } catch (error) {
  //         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //           message: error.message,
  //           statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  //           status: ReasonPhrases.INTERNAL_SERVER_ERROR,
  //           cause: error,
  //         });
  //       }
  //     } else {
  //       res.status(StatusCodes.BAD_REQUEST).json({
  //         message: "User does not exist..!",
  //         statusCode: StatusCodes.BAD_REQUEST,
  //         status: ReasonPhrases.BAD_REQUEST,
  //       });
  //     }
  //   } catch (error) {
  //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //       message: error.message,
  //       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  //       status: ReasonPhrases.INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // };
  
  // const deleteUser = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     if (!id) {
  //       res.status(StatusCodes.BAD_REQUEST).json({
  //         message: "id is not provide",
  //         statusCode: StatusCodes.BAD_REQUEST,
  //         status: ReasonPhrases.BAD_REQUEST,
  //       });
  //     }
  
  //     const user = await User.findOne({ _id: id });
  //     if (!user) {
  //       res.status(StatusCodes.NOT_FOUND).json({
  //         message: "User does not exist..!",
  //         statusCode: StatusCodes.NOT_FOUND,
  //         status: ReasonPhrases.NOT_FOUND,
  //       });
  //     } else {
  //       User.deleteOne({ _id: id }).then((data, err) => {
  //         if (err)
  //           res.status(StatusCodes.NOT_IMPLEMENTED).json({
  //             message: "Delete Failed",
  //             status: ReasonPhrases.NOT_IMPLEMENTED,
  //             statusCode: StatusCodes.NOT_IMPLEMENTED,
  //             cause: err,
  //           });
  //         else {
  //           res.status(StatusCodes.OK).json({
  //             message: "Delete Success",
  //             status: ReasonPhrases.OK,
  //             statusCode: StatusCodes.OK,
  //             data: data,
  //           });
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //       message: error.message,
  //       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  //       status: ReasonPhrases.INTERNAL_SERVER_ERROR,
  //       cause: error,
  //     });
  //   }
  // };
  
  module.exports = { updateUser, getUsers, getSingleUser, deleteUser };
  