import Redis from 'ioredis'

const redis = new Redis(process.env.NEXT_REDIS_URL)

const get = async (key) => {
  try {
    const data = await redis.get(key)
    if (data === null) return null
    return JSON.parse(data)
  } catch (e) {
    console.log(e)
  }
}

const set = async (key, fetcher, expires) => {
  try {
    const data = await fetcher()
    await redis.set(key, JSON.stringify(data), 'EX', expires)
    return data
  } catch (e) {
    console.log(e)
  }
}

const remove = async (key) => {
  await redis.del(key)
}

const fetch = async (key, fetcher, expires, options = {}) => {
  // Revalidate the cache
  if (options.revalidate) return set(key, fetcher, expires)

  try {
    const existing = await get(key)
    if (existing !== null) return existing
  } catch (e) {
    console.error(e)
  }

  return set(key, fetcher, expires)
}

const exported = { fetch, remove }
export default exported
