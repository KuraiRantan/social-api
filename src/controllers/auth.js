const { Op } = require("sequelize");
const db = require("../db/models/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  const { identifier, password } = req.body;
  if (!(identifier && password)) {
    return res.status(400).json({
      message: "Error al iniciar sesion",
      error: "Los datos identifier(username/email) y password son obligatorios",
    });
  }

  try {
    let user = await db.User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
      attributes: {
        // exclude: ['password']
      },
    });

    if (user) {
      user = user.toJSON();
      let friends = await db.Friend.findAll({
        where: {
          [Op.or]: [{ user_id: user.id }, { friend_id: user.id }],
        },
        include: [
          {
            model: db.User,
            as: "sentFriendRequests",
            // exclude: ['sentFriendRequests', 'receivedFriendRequests'],
          },
          {
            model: db.User,
            as: "receivedFriendRequests",
          },
        ],
      });
      friends = friends.map((f) => {
        f = f.toJSON();
        if (f.sentFriendRequests?.id === user.id) {
          f.user = f.receivedFriendRequests;
        }
        if (f.receivedFriendRequests?.id === user.id) {
          f.user = f.sentFriendRequests;
        }
        delete f.sentFriendRequests;
        delete f.receivedFriendRequests;
        return { ...f };
      });
      const notifications = await db.Notification.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          user_id: user.id,
        },
      });
      user.friends = friends;
      const isPassword = await bcrypt.compare(password, user.password);
      delete user.password;
      if (isPassword) {
        const token = jwt.sign(
          user,
          process.env.SECRET_ENCRYPT /*{expiresIn: '1h'}*/
        );
        return res.status(200).json({
          user,
          token,
          notifications,
          friends,
        });
      }
    }
    return res.status(400).json({
      message: "Error al autenticar al usuario",
      error: "Usuario o contraseña incorrectos",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al autenticar al usuario",
      error: error.message,
    });
  }
};

const authenticated = async (req, res) => {
  const user = req.user;
  try {
    if (user) {
      let friends = await db.Friend.findAll({
        where: {
          [Op.or]: [{ user_id: user.id }, { friend_id: user.id }],
        },
        include: [
          {
            model: db.User,
            as: "sentFriendRequests",
            // exclude: ['sentFriendRequests', 'receivedFriendRequests'],
          },
          {
            model: db.User,
            as: "receivedFriendRequests",
          },
        ],
      });
      friends = friends.map((f) => {
        f = f.toJSON();
        if (f.sentFriendRequests?.id === user.id) {
          f.user = f.receivedFriendRequests;
        }
        if (f.receivedFriendRequests?.id === user.id) {
          f.user = f.sentFriendRequests;
        }
        delete f.sentFriendRequests;
        delete f.receivedFriendRequests;
        return { ...f };
      });
      const notifications = await db.Notification.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          user_id: user.id,
        },
      });
      user.friends = friends;
      delete user.password;
      const token = jwt.sign(
        user,
        process.env.SECRET_ENCRYPT /*{expiresIn: '1h'}*/
      );
      return res.status(200).json({
        user,
        token,
        notifications,
        friends,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al autenticar al usuario",
      error: error.message,
    });
  }
};

module.exports = {
  loginUser,
  authenticated,
};
