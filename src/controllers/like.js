const db = require("../db/models");


const createLike = async (req, res) => {
    const {
        is_comment_like,
        post_id
    } = req.body;
    const user = req.user;

    try {
      const newLike = await db.Like.create({
        is_comment_like,
        post_id,
        user_id: user.id
      });
      res.status(201).json(newLike);  
    } catch (error) {
        res.status(500).json({message: 'Ocurrio un erro al crear like', error: error.message});
    }
}

module.exports = {
    createLike,
}