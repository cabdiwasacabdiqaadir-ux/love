const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Journal content cannot be empty"],
      trim: true,
      maxlength: 10000,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // updatedAt tracks edits automatically
);

journalSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Journal", journalSchema);
