'use strict'

//const { promisify } = require('util')
const { PassThrough } = require('stream')
const fp = require('fastify-plugin')
//const timeout = promisify(setTimeout)

const orders = {                      // orders format is Category ['prefix'OrderNumber]
  A1: { total: 3 },
  A2: { total: 7 },
  B1: { total: 101 },
}

const catToPrefix = {                   // standard way we can change category name without messing everything up
  electronics: 'A',
  confectionery: 'B',
}



// async function * realtimeOrdersSimulator() {    // simulates order comming in from users
//   const ids = Object.keys(orders)
//   while (true) {
//     const delta = Math.floor(Math.random() * 7) + 1
//     const id = ids[Math.floor(Math.random() * ids.length)]
//     orders[id].total += delta
//     const { total } = orders[id]
//     yield JSON.stringify({ id, total })
//     await timeout(1500)
//   }
// }


const orderStream = new PassThrough({objectMode: true})   // Node.js Stream.PassThrough

async function * realtimeOrders () {
  for await (const {id, total} of orderStream) {
    yield JSON.stringify({ id, total })
  }
} 

function * currentOrders(category) {
  const idPrefix = catToPrefix[category]
  if (!idPrefix) return
  const ids = Object.keys(orders).filter((id) => id[0] === idPrefix)  // idPrefix is the 'category' (string bracket notation id[0] gives category A or B ect)
  for (const id of ids) {
    yield JSON.stringify({id, ...orders[id]})                         // lists all orders in that category
  }
}

function addOrder(id, amount) {
  if (orders.hasOwnProperty(id) === false) {
    const err = new Error(`Order ${id} not found`)
    err.status = 404
    throw err
  }
  if (Number.isInteger(amount) === false) {
    const err = new Error('Supplied amount must be an integer')
    err.status = 400
    throw err
  }
  orders[id].total += amount
  const { total } = orders[id]
  orderStream.write({id, total})
} 



const calculateID = (idPrefix, data) => {
  const sorted = [...(new Set(data.map(({id}) => id)))]
  const next = Number(sorted.pop().slice(1)) + 1;
  return `${idPrefix}${next}`
}

module.exports = fp(async function (fastify, opts) {
   fastify.decorate('currentOrders', currentOrders)
  fastify.decorate('realtimeOrders', realtimeOrders)
   fastify.decorate('addOrder', addOrder)
  fastify.decorateRequest('mockDataInsert', function insert (category, data) {
    const request = this
    const idPrefix = catToPrefix[category]
    const id = calculateID(idPrefix, data)
     orders[id] = { total: 0 }
    data.push({id, ...request.body})
  })
})