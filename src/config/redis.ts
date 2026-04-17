import redis from 'redis'
import config from './config.js'

const redisClient = redis.createClient({
    url: config.REDIS_URL
})

redisClient.on('error',(err)=>console.log("Redis Client Error: ",err))
redisClient.on('connect',()=>console.log("Connected to Redis"))

redisClient.connect().catch(console.error)

export default redisClient