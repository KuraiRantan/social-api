const { Op } = require("sequelize");
const db = require("../db/models");

const sendFriend = async (req, res) => {
  const { friend_id, operation } = req.body;
  const user = req.user;
  try {
    let [request, created] = await db.Friend.findOrCreate({
      where: {
        [Op.or]: [
          { user_id: user.id, friend_id },
          { user_id: friend_id, friend_id: user.id },
        ],
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
      defaults: {
        user_id: user.id,
        friend_id,
        status: "pending",
      },
    });

    if (!created && !operation)
      return res.status(400).json({
        message: "Solicitud enviada",
        error: "Ya se ha enviado la solicitud",
      });
    if (!created) {
      const requestStatus = request.toJSON().status;

      if (
        (requestStatus === "pending" && operation === "acepted") ||
        requestStatus === "acepted" ||
        (requestStatus === "pending" && operation === "refused")
      ) {
        request.status = operation;
        await request.save();
      }
      if (requestStatus === "refused" && operation === "pending") {
        request.status = operation;
        request.user_id = user.id;
        request.friend_id = friend_id;
        await request.save();
      }
    }
    request = request.toJSON();
    if (request.sentFriendRequests?.id === user.id) {
      request.user = request.receivedFriendRequests;
    }
    if (request.receivedFriendRequests?.id === user.id) {
      request.user = request.sentFriendRequests;
    }
    delete request.sentFriendRequests;
    delete request.receivedFriendRequests;

    const messageNotification = `${user.firstName} ${user.lastName} ha ${
      operation === "pending" ? "send" : operation
    } solicitud de amistad`;

    const notificationFriend = await db.Notification.create({
      message: messageNotification,
      read: false,
      user_id: friend_id,
      type: "friend",
      id_resource: request.id,
    });
    const socket = req.connectedUsers.get(friend_id);
    if (socket) {
      socket.emit("notificationRequestFriend", {
        notification: notificationFriend,
        friend: { ...request },
      });
    }
    res.status(201).json(request);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ocurrio un error al generar invitacion",
      error: error.message,
    });
  }
};

const responseFriend = async (req, res) => {
  const { friend_id, acepted } = req.body;
  const user = req.user;

  try {
    const request = await db.Friend.findOne({
      where: {
        [Op.or]: [
          { user_id: user.id, friend_id },
          { user_id: friend_id, friend_id: user.id },
        ],
      },
    });

    if (request) {
      request.status = acepted ? "acepted" : "refused";
      await request.save();
      res.status(200).json(request);
    } else {
      res.status(404).json({
        message: "Fallo al responder la solicitud de amistad",
        error: "No se encontro solicitud de amistad",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Ocurrio un error al generar invitacion",
      error: error.message,
    });
  }
};

module.exports = {
  sendFriend,
  responseFriend,
};
