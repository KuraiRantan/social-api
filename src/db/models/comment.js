'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.User, { foreignKey: 'user_id' });
      Comment.belongsTo(models.Post, { foreignKey: 'post_id' });
      Comment.belongsTo(models.Comment, { foreignKey: 'parent_comment_id', as: 'parentComment' });
      Comment.hasMany(models.Comment, { foreignKey: 'parent_comment_id', as: 'replies' });
    }
  }
  Comment.init({
    content: DataTypes.TEXT,
    commented_at: DataTypes.DATE,
    post_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    parent_comment_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};