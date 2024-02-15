/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.createTable('messages', function (table) {
		table.increments('id').primary();
		table.uuid('uuid').unique().notNullable();
		table.integer('date').notNullable();
		table.string('sender_address').notNullable();
		table.string('tip', 66).notNullable();
		table.string('message', 100).notNullable();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable('messages');
};
