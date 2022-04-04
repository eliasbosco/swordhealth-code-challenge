const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, {
        foreignKey: 'userId',
        onUpdate: 'Cascade',
        onDelete: 'Cascade',
        as: 'taskUser',
      });
    }
  }

  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      summary: {
        type: DataTypes.STRING(2500),
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'user',
          key: 'id',
        },
        allowNull: false,
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
      modelName: 'Task',
      tableName: 'task',
      indexes: [
        {
          name: 'task_date',
          fields: ['date'],
        },
        {
          name: 'task_userId',
          fields: ['userId'],
        },
      ],
    }
  );

  return Task;
};
