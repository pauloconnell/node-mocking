  'use strict'

module.exports = async function (fastify, opts) {
  fastify.get(
     '/:category',
    { websocket: true },
    async (socket, request) => {
      for (const order of fastify.currentOrders(request.params.category)) {
        socket.send(order)
      }
      console.log("server says socket has: ", socket.currentOrders)
      for await (const order of fastify.realtimeOrders()) {
        console.log("server says order: ", order)
        if (socket.readyState >= socket.CLOSING) break  // socket has closed
        socket.send(order)
      }
    }
  )
} 