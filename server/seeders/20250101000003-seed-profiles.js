'use strict';

const dataProfil = [
  { UserId: 1, fullName: 'Arum Wulandari', phoneNumber: '081234567890', address: 'Jl. Hayam Wuruk 12, Pekalongan', budgetLimit: null },
  { UserId: 2, fullName: 'Arief Rizky', phoneNumber: '081298765432', address: 'Jl. Sudirman 45, Jakarta Pusat', budgetLimit: 500000 },
  { UserId: 3, fullName: 'Bagas Prakoso', phoneNumber: '081377788899', address: 'Jl. Malioboro 8, Yogyakarta', budgetLimit: null }
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const daftarProfil = dataProfil.map(profil => {
      return {
        UserId: profil.UserId,
        fullName: profil.fullName,
        phoneNumber: profil.phoneNumber,
        address: profil.address,
        budgetLimit: profil.budgetLimit,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('Profiles', daftarProfil, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Profiles', null, {
      truncate: true,
      restartIdentity: true,
      cascade: true
    });
  }
};
