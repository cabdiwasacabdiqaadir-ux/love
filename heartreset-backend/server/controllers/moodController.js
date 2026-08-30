const Mood = require("../models/Mood");

// POST /api/mood
async function createMood(req, res, next) {
  try {
    const { mood, note, date } = req.body;
    if (!mood) {
      return res.status(400).json({ message: "Mood is required." });
    }

    const entry = await Mood.create({
      userId: req.user._id,
      mood,
      note: note || "",
      date: date || Date.now(),
    });

    res.status(201).json({ mood: entry });
  } catch (err) {
    next(err);
  }
}

// GET /api/mood — most recent first
async function getMoods(req, res, next) {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ moods });
  } catch (err) {
    next(err);
  }
}

// PUT /api/mood/:id
async function updateMood(req, res, next) {
  try {
    const { mood, note, date } = req.body;

    const entry = await Mood.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...(mood && { mood }), ...(note !== undefined && { note }), ...(date && { date }) },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Mood entry not found." });
    }
    res.json({ mood: entry });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/mood/:id
async function deleteMood(req, res, next) {
  try {
    const entry = await Mood.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: "Mood entry not found." });
    }
    res.json({ message: "Mood entry deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { createMood, getMoods, updateMood, deleteMood };
