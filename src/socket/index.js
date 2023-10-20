const socketIO = require("socket.io");
const { validateToken } = require("../helpers/validateToken");
const db = require("../db/models");
const { Op } = require("sequelize");

const connectedUsers = new Map();

const configureSocket = (server) => {
  const io = socketIO(server, {
    transports: ["websocket", "polling"], // Habilitar WebSockets y polling
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("Conectado", socket.id);
    const token = socket.handshake?.auth?.token;
    const user = validateToken(token);
    if (user) {
      connectedUsers.set(user.id, socket);
      await db.User.update(
        { status: "online" },
        {
          where: {
            id: user.id,
          },
        }
      );
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
      for (let { user: friend } of friends) {
        const socketFriend = connectedUsers.get(friend.id);
        if (socketFriend) {
          let userFriend = await db.Friend.findOne({
            where: {
              [Op.or]: [
                { [Op.and]: [{ user_id: user.id }, { friend_id: friend.id }] },
                { [Op.and]: [{ user_id: friend.id }, { friend_id: user.id }] },
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
          });
          userFriend = userFriend.toJSON();
          if (userFriend.sentFriendRequests?.id !== user.id) {
            userFriend.user = userFriend.receivedFriendRequests;
          }
          if (userFriend.receivedFriendRequests?.id !== user.id) {
            userFriend.user = userFriend.sentFriendRequests;
          }
          delete userFriend.sentFriendRequests;
          delete userFriend.receivedFriendRequests;
          socketFriend.emit("statusUser", userFriend);
        }
      }
    } else {
      console.log("Disconnect error", socket.id);
      socket.disconnect(true);
    }

    socket.on("disconnect", async () => {
      console.log("Disconnect", connectedUsers.get(user.id));
      connectedUsers.delete(user.id);
      await db.User.update(
        { status: "offline" },
        {
          where: {
            id: user.id,
          },
        }
      );
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
      for (let { user: friend } of friends) {
        const socketFriend = connectedUsers.get(friend.id);
        if (socketFriend) {
          let userFriend = await db.Friend.findOne({
            where: {
              [Op.or]: [
                { [Op.and]: [{ user_id: user.id }, { friend_id: friend.id }] },
                { [Op.and]: [{ user_id: friend.id }, { friend_id: user.id }] },
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
          });
          userFriend = userFriend.toJSON();
          if (userFriend.sentFriendRequests?.id !== user.id) {
            userFriend.user = userFriend.receivedFriendRequests;
          }
          if (userFriend.receivedFriendRequests?.id !== user.id) {
            userFriend.user = userFriend.sentFriendRequests;
          }
          delete userFriend.sentFriendRequests;
          delete userFriend.receivedFriendRequests;
          socketFriend.emit("statusUser", userFriend);
        }
      }
    });
  });

  return {
    connectedUsers,
    io,
  };
};

module.exports = {
  configureSocket,
  connectedUsers,
};
