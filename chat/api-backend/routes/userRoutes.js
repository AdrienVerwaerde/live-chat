const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authToken = require('../middlewares/authToken');
const validateData = require('../middlewares/validateData');

// Swagger documentation for creating a user
/**
 * @swagger
 * /api/users:
 *  post:
 *    summary: Create a new user
 *    description: Registers a new user with the provided details.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: "user123"
 *              password:
 *                type: string
 *                example: "password123"
 *    responses:
 *      201:
 *        description: User created successfully.
 *      400:
 *        description: Bad Request.
 */
router.post('/', validateData, userController.createUser);

// Swagger documentation for user login
/**
 * @swagger
 * /api/users/login:
 *  post:
 *    summary: User login
 *    description: Logs in a user with valid credentials.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: "user123"
 *              password:
 *                type: string
 *                example: "password123"
 *    responses:
 *      200:
 *        description: Login successful.
 *      401:
 *        description: Unauthorized.
 */
router.post('/login', userController.loginUser);

// Swagger documentation for getting all users
/**
 * @swagger
 * /api/users:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Get all users
 *    description: Retrieves a list of all users. Requires authentication.
 *    responses:
 *      200:
 *        description: A list of users.
 *      401:
 *        description: Unauthorized.
 */
router.get('/', authToken, userController.getAllUsers);

// Swagger documentation for getting a user by ID
/**
 * @swagger
 * /api/users/{id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Get user by ID
 *    description: Retrieves user details by user ID. Requires authentication.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The user ID
 *    responses:
 *      200:
 *        description: User details retrieved.
 *      401:
 *        description: Unauthorized.
 *      404:
 *        description: User not found.
 */
router.get('/:id', authToken, userController.getUserById);

// Swagger documentation for updating a user
/**
 * @swagger
 * /api/users/{id}:
 *  put:
 *    security:
 *      - bearerAuth: []
 *    summary: Update user
 *    description: Updates a user's information. Requires authentication.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The user ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: "newUsername"
 *              password:
 *                type: string
 *                example: "newPassword"
 *    responses:
 *      200:
 *        description: User updated successfully.
 *      400:
 *        description: Bad Request.
 *      401:
 *        description: Unauthorized.
 *      404:
 *        description: User not found.
 */
router.put('/:id', authToken, validateData, userController.updateUser);

// Swagger documentation for deleting a user
/**
 * @swagger
 * /api/users/{id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete user
 *    description: Deletes a user by user ID. Requires authentication.
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The user ID
 *    responses:
 *      200:
 *        description: User deleted successfully.
 *      401:
 *        description: Unauthorized.
 *      404:
 *        description: User not found.
 */
router.delete('/:id', authToken, userController.deleteUser);

module.exports = router;
