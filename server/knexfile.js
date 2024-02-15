// Update the following settings with your database information
module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            database: 'message_board_db',
            user: 'root',
            password: ''
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },

    // Add configuration for staging and production environments
};
