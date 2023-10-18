'use strict';
const bcrypt = require('bcrypt');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, { foreignKey: 'user_id' });
      User.hasMany(models.Comment, { foreignKey: 'user_id' });
      User.hasMany(models.Message, { foreignKey: 'sender_id', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
      User.hasMany(models.Notification, { foreignKey: 'user_id' });
      User.hasMany(models.Friend, { foreignKey: 'user_id', as: 'sentFriendRequests' });
      User.hasMany(models.Friend, { foreignKey: 'friend_id', as: 'receivedFriendRequests' });
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    birthDate: {
      type: DataTypes.DATE,
      get(){
        return this.getDataValue('birthDate')?.toISOString()?.slice(0, 10);
      }
    },
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    bio: DataTypes.TEXT,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'offline'
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(11);
    const hastPassword = await bcrypt.hash(user.password, salt);
    user.password = hastPassword;
  })
  return User;
};