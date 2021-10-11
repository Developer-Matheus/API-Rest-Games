'use strict';

var bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: 'matheus@email.com.br',
      password: bcrypt.hashSync('pass123m', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'charles@email.com.br',
      password: bcrypt.hashSync('senhadocharlao', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
