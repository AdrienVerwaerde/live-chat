const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message.toString() });
  }
}

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message.toString() });
  }
}

exports.createUser = async (req, res) => {
  const {username, email, password, role} = req.body;
  try {
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({message: 'User already exists'})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    })
    const savedUser = await newUser.save();
    res.status(201).json({
      message: 'User created !',
      user: savedUser,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message.toString() });
  }
}

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({message: 'User not found'});
    }
    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message.toString() });
  }
}

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const {username, email, password, role} = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    const updatedUser = await user.save();
    res.status(200).json({
      'message': 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message.toString() });
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: 'Invalid credentials'});
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({message: 'Invalid credentials'});
    }

    const token = jwt.sign(
      {userId: user._id, role: user.role},
      JWT_SECRET,
      {expiresIn: '1h'}
    );

    res.status(200).json({
      token,
      user: user,
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message.toString() });
  }
}

// Nous voulons mettre en place ici les fonctions suivantes :
// updateUser
// deleteUser
// Une fois les fonctions rajoutées, nous pouvons décommenter les routes dans le fichier userRoutes
// et tester grâce a postman de modifier/supprimer un utilisateur.

// Une fois les 2 routes créées, notre but va être a présent d'installer jsonwebtoken 
// et de mettre en place une authentification sur une route /login
// On va avoir besoin de créer les éléments suivants :
// - Une nouvelle route
// - Une novuelle fonction du controller
// - Un middleware pour tester si le token est valide ou pas