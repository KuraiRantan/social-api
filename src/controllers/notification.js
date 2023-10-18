const { Op } = require("sequelize");
const db = require("../db/models");

const createNotification = async (req, res) => {
  const { message, read } = req.body;
  const user = req.user;

  try {
    const newNotification = await db.Notification.create({
      message,
      read,
      user_id: user.id,
    });
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({
      message: "Ocurrio un error al generar notificación",
      error: error.message,
    });
  }
};

const getNotifications = async (req, res) => {
  const user = req.user;
  try {
    const notifications = await db.Notification.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        user_id: user.id,
      },
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Ocurrio un error al obtener notificaciones",
      error: error.message,
    });
  }
};

const readNotifications = async (req, res) => {
  const { notifications } = req.body;
  const user = req.user;
  try {
    await db.Notification.update(
      {
        read: true,
      },
      {
        where: {
          [Op.or]: notifications,
        },
      }
    );
    const newNotifications = await db.Notification.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        user_id: user.id,
      },
    });
    res.status(200).json(newNotifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ocurrio un error al obtener notificaciones",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  readNotifications,
};
