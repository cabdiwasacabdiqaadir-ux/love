const express = require("express");
const { createHeart, getHeart, updateHeart, deleteHeart } = require("../controllers/heartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every route below requires a logged-in user

router.post("/", createHeart);
router.get("/", getHeart);
router.put("/", updateHeart);
router.delete("/", deleteHeart);

module.exports = router;
