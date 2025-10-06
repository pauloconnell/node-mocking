'use strict'

module.exports = async function (fastify, opts) {
  function monitorMessages (socket) {
    socket.on('message', (data) => {
      try {
        const {cmd, payload } = JSON.parse(data)
        if (cmd === 'update-category') {
          sendCurrentOrders(payload.category, socket)
        }
      } catch (err) {
        fastify.log.warn('WebSocket Message (data: %o) Error: %s',
          data, err.message)
      }
    })
  }

  function sendCurrentOrders(category, socket) {
    console.log("see these orders?")
    for (const order of fastify.currentOrders(category)) {
      socket.send(order)
    }
  }

  fastify.get(
    '/:category',
    { websocket: true },
    async ( socket , request) => {
      monitorMessages(socket)
      console.log("about to sendCurrentOrders")
      sendCurrentOrders(request.params.category, socket)
      console.log("now getting realtime orders")
      for await (const order of fastify.realtimeOrders()) {
        if (socket.readyState >= socket.CLOSING) break
        socket.send(order)
      }
    }
  )

  fastify.post('/:id', async (request) => {
    const { id } = request.params
    fastify.addOrder(id, request.body.amount)
    return { ok: true }
  })
} 