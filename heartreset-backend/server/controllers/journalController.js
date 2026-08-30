const Journal = require("../models/Journal");

// POST /api/journal
async function createEntry(req, res, next) {
  try {
    const { title, content, date } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Journal content cannot be empty." });
    }

    const entry = await Journal.create({
      userId: req.user._id,
      title: title || "",
      content,
      date: date || Date.now(),
    });

    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
}

// GET /api/journal — most recent first
async function getEntries(req, res, next) {
  try {
    const entries = await Journal.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

// GET /api/journal/:id
async function getEntry(req, res, next) {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }
    res.json({ entry });
  } catch (err) {
    next(err);
  }
}

// PUT /api/journal/:id
async function updateEntry(req, res, next) {
  try {
    const { title, content, date } = req.body;

    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...(title !== undefined && { title }), ...(content !== undefined && { content }), ...(date && { date }) },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }
    res.json({ entry });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/journal/:id
async function deleteEntry(req, res, next) {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }
    res.json({ message: "Journal entry deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };
