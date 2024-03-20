import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meal', (table) => {
    table.uuid('id').primary().notNullable()
    table.uuid('user_id').notNullable()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.datetime('datetime').defaultTo(knex.fn.now()).notNullable()
    table.boolean('on_diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meal')
}
