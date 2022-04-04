'use strict';
const cryptoHelper = require("../helpers/cryptoHelper");
const { User } = require('../models/index');

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     */
    try {
      await User.sync({ alter: true });
      const transaction = await queryInterface.sequelize.transaction();
      try {
        await queryInterface.bulkInsert('user', [
          {
            emailAddress: 'manager@swordhealth.com',
            firstName: 'Usuario Manager',
            lastName: 'Gente Boa',
            password: cryptoHelper.getSHA256(`${process.env.SESSION_SECRET}abc123`),
            role: 0, // Manager
          },
          {
            emailAddress: 'technician@swordhealth.com',
            firstName: 'Usuario Technician',
            lastName: 'Nem Tanto',
            password: cryptoHelper.getSHA256(`${process.env.SESSION_SECRET}abc123`),
            role: 1, // Manager
          },
        ], );
      } catch (error) {
        await transaction.rollback();
        console.log(error);
      }
    } catch (error) {
      console.log('INSERTION MIGRATION FAILURE', error);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.bulkDelete('user', {
      emailAddress: {
        [Sequelize.Op.in]: ['manager@swordhealth.com', 'technician@swordhealth.com'],
      },
    });
  }
};
