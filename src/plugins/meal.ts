import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export async function mealPlugin(app: FastifyInstance) {
  app.get('/:id/user/:userId', async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    })

    const { id, userId } = paramsSchema.parse(request.params)

    const response = await knex('meal')
      .where({ id, user_id: userId })
      .select('*')
      .first()
    return { meal: response }
  })

  app.get('/:userId', async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      userId: z.string().uuid(),
    })

    const { userId } = paramsSchema.parse(request.params)

    const response = await knex('meal').where({ user_id: userId }).select('*')
    return { meals: response }
  })

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const bodySchema = z.object({
      userId: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      onDiet: z.boolean(),
    })

    const { userId, name, description, onDiet } = bodySchema.parse(request.body)

    await knex('meal').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      on_diet: onDiet,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id/user/:userId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const bodySchema = z.object({
        name: z.string(),
        description: z.string(),
        datetime: z.string(),
        onDiet: z.boolean(),
      })

      const { name, description, datetime, onDiet } = bodySchema.parse(
        request.body,
      )

      const paramsSchema = z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      })

      const { id, userId } = paramsSchema.parse(request.params)

      await knex('meal')
        .where({
          id,
          user_id: userId,
        })
        .update({
          name,
          description,
          datetime,
          on_diet: onDiet,
        })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id/user/:userId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      })

      const { id, userId } = paramsSchema.parse(request.params)

      await knex('meal').where({ id, user_id: userId }).delete()

      return reply.status(204).send()
    },
  )
}
