'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, { foreignKey: 'user_id' });
      Post.hasMany(models.Like, { foreignKey: 'post_id' });
      Post.hasMany(models.Comment, { foreignKey: 'post_id' });
    }
  }
  Post.init({
    content: DataTypes.TEXT,
    posted_at: DataTypes.DATE,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};