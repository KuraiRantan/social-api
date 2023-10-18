const { getNotifications, readNotifications } = require('../controllers/notification');

const router = require('express').Router();


router.get('/notification', getNotifications);
router.post('/notification/read', readNotifications);


module.exports = router;