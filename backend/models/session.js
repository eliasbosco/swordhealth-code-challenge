const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {}

  Session.init(
    {
      sid: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      expire: {
        type: DataTypes.DATE,
      },
      sess: {
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: 'Session',
      tableName: 'session',
      timestamps: false,
    }
  );
  return Session;
};
