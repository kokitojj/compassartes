const asyncHandler = require('express-async-handler');
const pool = require('../../config/db');

// @desc    Create a wellness entry
// @route   POST /api/fisioload
// @access  Private
const createWellnessEntry = asyncHandler(async (req, res) => {
  const {
    session_type,
    duration_minutes,
    fatigue_pre,
    sleep_quality,
    sleep_hours,
    stress_level,
    mood,
    muscle_soreness,
    injury_pain,
    menstrual_period,
    nutrition_quality,
    fatigue_post,
    rpe,
    comments,
  } = req.body;

  const { rows } = await pool.query(
    'INSERT INTO wellness_entries (user_id, session_type, duration_minutes, fatigue_pre, sleep_quality, sleep_hours, stress_level, mood, muscle_soreness, injury_pain, menstrual_period, nutrition_quality, fatigue_post, rpe, comments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
    [
      req.user.id,
      session_type,
      duration_minutes,
      fatigue_pre,
      sleep_quality,
      sleep_hours,
      stress_level,
      mood,
      muscle_soreness,
      injury_pain,
      menstrual_period,
      nutrition_quality,
      fatigue_post,
      rpe,
      comments,
    ]
  );

  res.status(201).json(rows[0]);
});

// @desc    Get all wellness entries for a user
// @route   GET /api/fisioload
// @access  Private
const getWellnessEntriesForUser = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM wellness_entries WHERE user_id = $1', [req.user.id]);
  res.json(rows);
});


const getAllWellnessEntries = asyncHandler(async (req, res) => {
  const query = `
    SELECT 
      we.*, 
      u.full_name as user_name
    FROM wellness_entries we
    JOIN users u ON we.user_id = u.id
  `;
  const { rows } = await pool.query(query);
  res.json(rows);
});

module.exports = {
  createWellnessEntry,
  getWellnessEntriesForUser,
  getAllWellnessEntries,
};
