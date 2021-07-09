import Redis from 'ioredis'

const redis = new Redis(process.env.NEXT_REDIS_URL)

const get = async (key) => {
  const data = await redis.get(key)
  if (data === null) return null
  return JSON.parse(data)
}

const set = async (key, fetcher, expires) => {
  const data = await fetcher()
  await redis.set(key, JSON.stringify(data), 'EX', expires)
  return data
}

const remove = async (key) => {
  await redis.del(key)
}

const fetch = async (key, fetcher, expires, options = {}) => {
  // Revalidate the cache
  if (options.revalidate) return set(key, fetcher, expires)

  const existing = await get(key)
  if (existing !== null) return existing
  return set(key, fetcher, expires)
}

const exported = { fetch, remove }
export default exported
