const { getUsers, createUser, getUserByUsername } = require('../controllers/user');

const router = require('express').Router();


router.get('/users', getUsers);
router.get('/users/:username', getUserByUsername)
router.post('/users', createUser);

module.exports = router;