const mongoose = require("mongoose");

const heartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one heart status document per user
    },
    status: {
      type: String,
      enum: ["BROKEN", "HEALING", "FINE"],
      default: "BROKEN",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    recoveryPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("Heart", heartSchema);
