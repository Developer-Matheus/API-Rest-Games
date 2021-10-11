'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Games', [{
      title: "Call of GTA",
      year: 2021,
      price: 50.15,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Chiken wars",
      year: 2015,
      price: 100.35,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "GTA - wars",
      year: 2018,
      price: 81.50,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Games', null, {});
  }
};
