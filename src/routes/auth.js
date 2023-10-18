const { loginUser, authenticated } = require('../controllers/auth');
const authentication = require('../middlewares/authentication');

const router = require('express').Router();


router.post('/auth/login', loginUser);
router.post('/auth/authenticated', [authentication], authenticated);


module.exports = router;