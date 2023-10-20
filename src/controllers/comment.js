const db = require("../db/models");

const createComment = async (req, res) => {
  const { content, post_id, parent_comment_id } = req.body;
  const user = req.user;

  try {
    const buildComment = {
      content,
      commented_at: new Date().getTime(),
      post_id,
      user_id: user.id,
    };
    if (parent_comment_id) {
      buildComment.parent_comment_id = parent_comment_id;
    }

    const comment = await db.Comment.create(buildComment);
    await comment.reload({
      include: [
        {
          model: db.User,
        },
      ],
    });
    res.status(201).json({ comment });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al generar comentario", error: error.message });
  }
};

const getCommentByPost = async (req, res) => {
  const { post_id } = req.query;
  try {
    const comments = await db.Comment.findAll({
      where: {
        post_id,
      },
      include: [
        {
          model: db.User,
        },
      ],
    });
    res.status(200).json({ comments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al generar comentario", error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentByPost,
};
