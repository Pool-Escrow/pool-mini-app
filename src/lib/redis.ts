import { env } from '@/env'
import { Redis } from '@upstash/redis'

if (!env.REDIS_URL || !env.REDIS_TOKEN) {
    console.log('Missing Redis URL or Token, REDIS_URL or REDIS_TOKEN not set. Redis will not be configured.')
}

export const redis =
    env.REDIS_URL && env.REDIS_TOKEN
        ? new Redis({
              url: env.REDIS_URL,
              token: env.REDIS_TOKEN,
          })
        : ({} as Redis)

export async function set(key: string, value: string) {
    if (!redis.set) return
    return redis.set(key, value)
}

export async function get(key: string) {
    if (!redis.get) return null
    return redis.get(key)
}

export async function incr(key: string) {
    if (!redis.incr) return null
    return redis.incr(key)
}
