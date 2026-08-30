const Heart = require("../models/Heart");

// POST /api/heart — create (only if one doesn't already exist)
async function createHeart(req, res, next) {
  try {
    const existing = await Heart.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Heart status already exists. Use PUT to update it." });
    }

    const { status, reason, recoveryPercentage } = req.body;
    const heart = await Heart.create({
      userId: req.user._id,
      status: status || "BROKEN",
      reason: reason || "",
      recoveryPercentage: recoveryPercentage || 0,
    });

    res.status(201).json({ heart });
  } catch (err) {
    next(err);
  }
}

// GET /api/heart
async function getHeart(req, res, next) {
  try {
    const heart = await Heart.findOne({ userId: req.user._id });
    if (!heart) {
      return res.status(404).json({ message: "No heart status found yet." });
    }
    res.json({ heart });
  } catch (err) {
    next(err);
  }
}

// PUT /api/heart
async function updateHeart(req, res, next) {
  try {
    const { status, reason, recoveryPercentage } = req.body;

    const heart = await Heart.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...(status !== undefined && { status }),
        ...(reason !== undefined && { reason }),
        ...(recoveryPercentage !== undefined && { recoveryPercentage }),
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({ heart });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/heart
async function deleteHeart(req, res, next) {
  try {
    const heart = await Heart.findOneAndDelete({ userId: req.user._id });
    if (!heart) {
      return res.status(404).json({ message: "No heart status found to delete." });
    }
    res.json({ message: "Heart status deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { createHeart, getHeart, updateHeart, deleteHeart };
