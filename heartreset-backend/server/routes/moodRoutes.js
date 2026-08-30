const express = require("express");
const { createMood, getMoods, updateMood, deleteMood } = require("../controllers/moodController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createMood);
router.get("/", getMoods);
router.put("/:id", updateMood);
router.delete("/:id", deleteMood);

module.exports = router;
