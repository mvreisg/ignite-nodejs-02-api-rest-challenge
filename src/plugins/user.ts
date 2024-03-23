import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function userPlugin(app: FastifyInstance) {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const bodySchema = z.object({
      name: z.string(),
    })

    const { name } = bodySchema.parse(request.body)

    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      reply.cookie('sessionId', randomUUID(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('user').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const response = await knex('user').select('*')
    return response
  })

  app.get('/:id/metrics/total', async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const result = await knex('meal')
      .where({ user_id: id })
      .count('id', { as: 'total_meals' })
      .first()

    return result
  })

  app.get('/:id/metrics/inside/diet', async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const result = await knex('meal')
      .where({ user_id: id, on_diet: true })
      .count('id', { as: 'total_meals_inside_diet' })
      .first()

    return result
  })

  app.get('/:id/metrics/outside/diet', async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const result = await knex('meal')
      .where({ user_id: id, on_diet: false })
      .count('id', { as: 'total_meals_oustide_diet' })
      .first()

    return result
  })

  app.get(
    '/:id/metrics/better/streak',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      const result = await knex('meal').where({ user_id: id }).select('*')
      const streak: number[] = []

      result.forEach((value, index) => {
        if (value.on_diet) {
          streak.push(index)
        }
      })

      const streaks = []

      for (let i = 0; i < streak.length; i++) {
        if (streak[i] !== i) {
          streaks.push(streak.splice(0, i))
        }
      }

      streaks.push(streak.splice(0, streak.length))

      let highStreak = 0

      streaks.forEach((streak) => {
        if (streak.length > highStreak) {
          highStreak = streak.length
        }
      })

      return reply.status(200).send({ streak: highStreak })
    },
  )
}
