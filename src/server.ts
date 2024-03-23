import fastify from 'fastify'
import { userPlugin } from './plugins/user'
import cookies from '@fastify/cookie'
import { mealPlugin } from './plugins/meal'

export const app = fastify()

app.register(cookies)
app.register(userPlugin, { prefix: '/user' })
app.register(mealPlugin, { prefix: '/meal' })

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('HTTP Server Running!'))
