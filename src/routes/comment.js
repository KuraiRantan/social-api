const { createComment, getCommentByPost } = require('../controllers/comment');

const router = require('express').Router();

router.post('/comment/create', createComment);
router.get('/comment', getCommentByPost);


module.exports = router;