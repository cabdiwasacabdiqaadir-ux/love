const Challenge = require("../models/Challenge");

// The default 10-day recovery program, used to seed a new user's challenges.
const DEFAULT_CHALLENGES = [
  { day: 1, title: "Accept what happened." },
  { day: 2, title: "Don't text them." },
  { day: 3, title: "Don't check their profile." },
  { day: 4, title: "Remove painful reminders." },
  { day: 5, title: "Exercise for 20 minutes." },
  { day: 6, title: "Spend time with friends." },
  { day: 7, title: "Learn something new." },
  { day: 8, title: "Focus on your goals." },
  { day: 9, title: "Write 3 things you are grateful for." },
  { day: 10, title: "Write your future goals." },
];

// GET /api/challenges — seeds the default program the first time a user visits
async function getChallenges(req, res, next) {
  try {
    const count = await Challenge.countDocuments({ userId: req.user._id });

    if (count === 0) {
      await Challenge.insertMany(
        DEFAULT_CHALLENGES.map((c) => ({ ...c, userId: req.user._id }))
      );
    }

    const challenges = await Challenge.find({ userId: req.user._id }).sort({ day: 1 });
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
}

// POST /api/challenges — add a custom challenge
async function createChallenge(req, res, next) {
  try {
    const { day, title, description } = req.body;
    if (!day || !title) {
      return res.status(400).json({ message: "Day and title are required." });
    }

    const challenge = await Challenge.create({
      userId: req.user._id,
      day,
      title,
      description: description || "",
    });

    res.status(201).json({ challenge });
  } catch (err) {
    next(err);
  }
}

// PUT /api/challenges/:id — update, and toggle completion timestamps
async function updateChallenge(req, res, next) {
  try {
    const { title, description, completed } = req.body;

    const update = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    };

    if (completed !== undefined) {
      update.completed = completed;
      update.completedAt = completed ? new Date() : null;
    }

    const challenge = await Challenge.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }
    res.json({ challenge });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/challenges/:id
async function deleteChallenge(req, res, next) {
  try {
    const challenge = await Challenge.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }
    res.json({ message: "Challenge deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getChallenges, createChallenge, updateChallenge, deleteChallenge };
