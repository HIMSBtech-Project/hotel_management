const express = require('express');
const {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
} = require('../controllers/roomController');
const { admin, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', protect, admin, createRoom);
router.put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);

module.exports = router;
