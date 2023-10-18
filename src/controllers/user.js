const { Op } = require("sequelize");
const db = require("../db/models");

const getUsers = async (req, res) => {
  const allUsers = await db.User.findAll({
    attributes: {
      exclude: ["password"],
    },
  });
  res.send(allUsers);
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    let user = await db.User.findOne({
      where: {
        username,
      },
    });
    if (user) {
      user = user.toJSON();
      let friends = await db.Friend.findAll({
        where: {
          [Op.or]: [{ user_id: user.id }, { friend_id: user.id }],
        },
      });
      user.friends = friends;
      delete user.password;

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
      return res.status(200).json({
        user,
        posts: myPosts,
      });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
};

const createUser = async (req, res) => {
  const {
    firstName,
    lastName,
    birthDate,
    country,
    city,
    bio,
    username,
    email,
    password,
  } = req.body;

  if (
    !(
      firstName &&
      lastName &&
      birthDate &&
      country &&
      city &&
      bio &&
      username &&
      email &&
      password
    )
  ) {
    return res.status(400).json({
      message: "Error al crear el usuario",
      error: "Todos los datos son obligatorios",
    });
  }

  try {
    const [newUser, created] = await db.User.findOrCreate({
      where: {
        [Op.or]: [{ username }, { email }],
      },
      defaults: {
        firstName,
        lastName,
        birthDate,
        country,
        city,
        bio,
        username,
        email,
        password,
      },
    });
    if (created) {
      return res.status(201).json(newUser);
    } else {
      return res.status(409).json({
        message: "Error al crear el usuario",
        error: "El username o el email ya existen",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserByUsername,
};
