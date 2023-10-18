const { sendFriend, responseFriend } = require('../controllers/friend');

const router = require('express').Router();


router.post('/friends/request', sendFriend);
router.post('/friends/response', responseFriend);


module.exports = router;