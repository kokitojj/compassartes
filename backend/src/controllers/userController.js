const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Admin
const createUser = async (req, res) => {
  const { full_name, username, password, role } = req.body;

  if (!full_name || !username || !password || !role) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (full_name, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, username, role',
      [full_name, username, hashedPassword, role]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query('SELECT id, full_name, username, role FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, username, role } = req.body;

  try {
    const updatedUser = await pool.query(
      'UPDATE users SET full_name = $1, username = $2, role = $3 WHERE id = $4 RETURNING id, full_name, username, role',
      [full_name, username, role, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
};
