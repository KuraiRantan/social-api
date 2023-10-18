const { Op } = require("sequelize");
const db = require("../db/models/index");

const createPost = async (req, res) => {
  const { content } = req.body;
  const user = req.user;

  try {
    const post = await db.Post.create({
      content,
      user_id: user.id,
      posted_at: new Date().getTime(),
    });
    let friends = await db.Friend.findAll({
      where: {
        status: "acepted",
        [Op.or]: [{ friend_id: user.id }, { user_id: user.id }],
      },
    });
    const idFriends = friends.map((f) =>
      f.friend_id === user.id ? f.user_id : f.friend_id
    );
    for (let id of idFriends) {
      const notificationPost = await db.Notification.create({
        message: `${user.firstName} ${user.lastName} ha hecho una nueva publicación`,
        read: false,
        user_id: id,
        type: "post",
        id_resource: post.toJSON().id,
      });
      const socket = req.connectedUsers.get(id);
      if (socket) {
        socket.emit("notificationCreatePost", {
          notification: notificationPost,
          post: { ...post.toJSON(), User: user },
        });
      }
    }
    res.status(201).json({ ...post.toJSON(), User: user });
  } catch (error) {
    res.status(500).json({
      message: "Error al autenticar al usuario",
      error: error.message,
    });
  }
};

const getAllFriednsPosts = async (req, res) => {
  const user = req.user;
  try {
    let friends = await db.Friend.findAll({
      where: {
        status: "acepted",
        [Op.or]: [{ friend_id: user.id }, { user_id: user.id }],
      },
    });
    // const friends = user.friends.map(f => (f.friend_id == user.id) ?
    //     {
    //         user_id: f.user_id,
    //         // [Op.or]: [
    //         //     db.Sequelize.literal('"User->receivedFriendRequests"."status" = \'acepted\''),
    //         //     db.Sequelize.literal('"User->sentFriendRequests"."status" = \'acepted\''),
    //         // ]
    //     } :
    //     {
    //         user_id: f.friend_id,
    //         // [Op.or]: [
    //         //     db.Sequelize.literal('"User->receivedFriendRequests"."status" = \'acepted\''),
    //         //     db.Sequelize.literal('"User->sentFriendRequests"."status" = \'acepted\''),
    //         // ]
    //     }
    // );
    friends = friends.map((f) =>
      f.friend_id === user.id ? f.user_id : f.friend_id
    );
    console.log(friends);
    let allPosts = await db.Post.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        user_id: {
          [Op.in]: friends,
        },
        // [Op.or]: [
        //     db.Sequelize.literal('"User->receivedFriendRequests"."status" = \'acepted\''),
        //     db.Sequelize.literal('"User->sentFriendRequests"."status" = \'acepted\''),
        // ]
      },
      include: [
        {
          model: db.User,
          include: [
            {
              model: db.Friend,
              as: "sentFriendRequests",
              attributes: [],
            },
            {
              model: db.Friend,
              as: "receivedFriendRequests",
              attributes: [],
            },
          ],
          exclude: ["sentFriendRequests", "receivedFriendRequests"],
        },
      ],
    });

    console.log(allPosts);
    res.status(200).json(allPosts);
  } catch (error) {
    res.status(500).json({
      message: "Error al autenticar al usuario",
      error: error.message,
    });
  }
};

const getMyPosts = async (req, res) => {
  const user = req.user;
  try {
    const myPosts = await db.Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.User,
          where: {
            id: user.id,
          },
        },
      ],
    });
    res.status(200).json(myPosts);
  } catch (error) {
    res.status(500).json({
      message: "Error al autenticar al usuario",
      error: error.message,
    });
  }
};

const getPostById = async (req, res) => {
  const { postId } = req.params;
  console.log("Dentro del post id");
  try {
    const post = await db.Post.findByPk(postId, {
      include: [
        {
          model: db.User,
        },
      ],
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comments = await db.Comment.findAll({
      where: {
        post_id: postId,
      },
      include: [
        {
          model: db.User,
        },
      ],
    });
    res.status(200).json({ post, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al autenticar al usuario",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllFriednsPosts,
  getMyPosts,
  getPostById,
};
