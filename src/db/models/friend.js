'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Friend.belongsTo(models.User, { foreignKey: 'user_id', as: 'sentFriendRequests' });
      Friend.belongsTo(models.User, { foreignKey: 'friend_id', as: 'receivedFriendRequests' });
    }
  }
  Friend.init({
    user_id: DataTypes.INTEGER,
    friend_id: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Friend',
  });
  return Friend;
};