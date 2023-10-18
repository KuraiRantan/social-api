const { createPost, getAllFriednsPosts, getMyPosts, getPostById } = require('../controllers/post');

const router = require('express').Router();

router.post('/post', createPost);
router.get('/post', getMyPosts);
router.get('/post/friends', getAllFriednsPosts);
router.get('/post/:postId', getPostById);

module.exports = router;