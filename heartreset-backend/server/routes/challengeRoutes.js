const express = require("express");
const {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getChallenges);
router.post("/", createChallenge);
router.put("/:id", updateChallenge);
router.delete("/:id", deleteChallenge);

module.exports = router;
