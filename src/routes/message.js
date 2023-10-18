const { getMessages, createMessage } = require('../controllers/message');

const router = require('express').Router();

router.get('/message/:username', getMessages);
router.post('/message/create', createMessage);



module.exports = router;