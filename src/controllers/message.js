const { Op } = require("sequelize");
const db = require("../db/models");



const getMessages = async (req, res) => {
    const { username } = req.params;
    const user = req.user;
    try {
        const messages = await db.Message.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            where: {
                [Op.and]: [
                    {
                      [Op.or]: [
                        { sender_id: user.id },
                        { receiver_id: user.id },
                      ]
                    },
                    {
                      [Op.or]: [
                        db.Sequelize.literal(`"sender"."username" = '${username}'`),
                        db.Sequelize.literal(`"receiver"."username" = '${username}'`)
                      ]
                    }
                  ]
            },
            include: [
                {
                    model: db.User,
                    as: 'sender',
                    
                },
                {
                    model: db.User,
                    as: 'receiver',
                   
                }
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Ocurrio un error al generar invitacion', error: error.message });
    }
}

const createMessage = async (req, res) => {
    const { content, receiver_id } = req.body;
    const user = req.user;
    try {
        const newMessage = await db.Message.create({
            content,
            receiver_id,
            sender_id: user.id,
            sent_at: new Date()
        }, {
            order: [
                ['createdAt', 'ASC']
            ],
            where: {
                [Op.and]: [
                    {
                      [Op.or]: [
                        { sender_id: user.id },
                        { receiver_id: user.id },
                      ]
                    },
                    {
                      [Op.or]: [
                        { '$sender.id$': receiver_id },
                        { '$receiver.id$': receiver_id },
                      ]
                    }
                  ]
            },
            include: [
                {
                    model: db.User,
                    as: 'sender',
                    
                },
                {
                    model: db.User,
                    as: 'receiver',
                   
                }
            ]
        });
        const socket = req.connectedUsers.get(receiver_id);
        if(socket){
            socket.emit('createMessage', newMessage);
        } else {
            await db.Notification.create({
                message: `${user.firstName} ${user.lastName} ha enviado un mensaje`,
                read: false,
                user_id: receiver_id,
                type: 'post',
                id_resource: newMessage.toJSON().id,
            });
        }
        res.status(200).json(newMessage)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Ocurrio un error al generar invitacion', error: error.message });
    }
}

module.exports = {
    getMessages,
    createMessage,
}