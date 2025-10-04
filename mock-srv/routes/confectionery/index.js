'use strict'

const data = [
  {id: 'B1', name: 'Chocolate Bar', rrp: '22.40', info: 'Delicious overpriced chocolate.'}
]

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return data
  })
  fastify.post('/', async function (request, reply) {
    request.mockDataInsert(opts.prefix.slice(1), data)  // opts.prefix is /confectionery or whatever route(folder) name is
    return data                                         // .slice(1) just drops the '/'
  })
}