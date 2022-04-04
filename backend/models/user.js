const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      emailAddress: {
        type: DataTypes.STRING,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.INTEGER, // 0 - Manager | 1 - Technician
        allowNull: false,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
      password: {
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("NOW"),
      },
    },
    {
      sequelize,
      timestamps: true,
      timestampsWithDefaults: true,
      modelName: 'User',
      tableName: 'user',
      indexes: [
        {
          name: 'user_emailAddress',
          unique: true,
          fields: ['emailAddress'],
        },
      ],
    }
  );

  return User;
};
