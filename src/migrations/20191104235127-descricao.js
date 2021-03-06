'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('descricao',
            {
                id: {
                    type: Sequelize.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false
                },
                codigo: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                nome: {
                    type: Sequelize.STRING(45),
                    allowNull: true
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
            },
            {
                charset: 'utf8',
                collate: 'utf8_general_ci'
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('descricao');
    }
};
