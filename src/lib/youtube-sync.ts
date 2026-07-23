import { Client } from 'pg'

type Channel = {
  channelId: string
  tags: string
}

type YouTubeVideo = {
  channelId: string
  description: string
  publishedAt: string
  tags: string
  title: string
  videoId: string
}

// Matches the channels previously collected by lcaustin-api's batch job.
const CHANNELS: Channel[] = [
  { channelId: 'UC79yGTWIkhPZoxNf5dBRw0Q', tags: '' },
  // { channelId: 'UCSKyUDuhQqTo10f2_LGv2Fw', tags: '교육부,영아부' },
  // { channelId: 'UCOKua9Ejf0AfEV7hZIAKCjw', tags: '교육부,유아부' },
  // { channelId: 'UC-9P27-tBR4o5lQP23w0CLg', tags: '교육부,초등부' },
  { channelId: 'UCE_Drbj5M6-fcFfZ-Hmhm5Q', tags: '교육부,중고등부' },
  { channelId: 'UCVo7eNU0fieOO_55pi387KA', tags: '교육부,대학부' },
  // { channelId: 'UCeGoe3oCma2Sn_EPdRX-BBg', tags: '교육부,청년부' }, 
  { channelId: 'UCw3bqxCOOay_VKM9T5Q6CCA', tags: '교육부,EM,EnglishMinistry' },
]

const RECENT_VIDEOS_PER_CHANNEL = 10

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string }
    snippet?: {
      description?: string
      publishedAt?: string
      title?: string
    }
  }>
}

function parseSearchResults(data: YouTubeSearchResponse, channel: Channel): YouTubeVideo[] {
  return (data.items ?? []).flatMap((item) => {
    const videoId = item.id?.videoId
    const title = item.snippet?.title
    const publishedAt = item.snippet?.publishedAt
    if (!videoId || !title || !publishedAt) return []

    return [{
      channelId: channel.channelId,
      description: item.snippet?.description ?? '',
      publishedAt,
      tags: channel.tags,
      title,
      videoId,
    }]
  })
}

function category(video: YouTubeVideo) {
  const text = `${video.tags} ${video.title} ${video.description}`
  if (video.title.includes('매일말씀묵상') || /^daily\s*$/i.test(video.description.trim())) return 'daily-devotion'
  if (video.title.includes('임마누엘찬양대') || text.includes('찬양대')) return 'choir'
  if (video.title.includes('특송') || video.title.includes('헌금송')) return 'offering-song'
  if (video.title.includes('예배실황') || video.title.includes('금요예배') || text.includes('경배와찬양')) return 'worship'
  if (video.title.includes('설교')) return 'sermon'
  if (text.includes('교육부') || text.includes('영아부') || text.includes('유아부') || text.includes('초등부') || text.includes('중고등부') || text.includes('대학부') || text.includes('청년부')) return 'ministry'
  return 'other'
}

function englishTitle(video: YouTubeVideo) {
  if (!video.title.includes('주일설교') || !video.description.includes('/')) return null
  const translatedTitle = video.description.slice(video.description.lastIndexOf('/') + 1).trim()
  return /[A-Za-z]/.test(translatedTitle) ? translatedTitle : null
}

// Videos are often published after the service. A leading ISO date in the
// title is the air date visitors expect to see; retain YouTube's timestamp
// only when the title does not provide a service date.
function publishedAt(video: YouTubeVideo) {
  const airDate = video.title.match(/^\s*(\d{4}-\d{2}-\d{2})\b/)?.[1]
  return airDate ? `${airDate}T12:00:00.000Z` : video.publishedAt
}

async function fetchChannel(channel: Channel, apiKey: string) {
  const params = new URLSearchParams({
    channelId: channel.channelId,
    key: apiKey,
    maxResults: String(RECENT_VIDEOS_PER_CHANNEL),
    order: 'date',
    part: 'snippet',
    type: 'video',
  })
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
  if (!response.ok) throw new Error(`YouTube API channel ${channel.channelId} returned ${response.status}`)
  return parseSearchResults(await response.json() as YouTubeSearchResponse, channel)
}

export async function syncYouTubeChannels() {
  const databaseUri = process.env.DATABASE_URI
  if (!databaseUri) throw new Error('DATABASE_URI is required')
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is required')

  const results = await Promise.allSettled(CHANNELS.map(async (channel) => ({ channel, videos: await fetchChannel(channel, apiKey) })))
  const failures = results.flatMap((result) => result.status === 'rejected' ? [result.reason instanceof Error ? result.reason.message : String(result.reason)] : [])
  const videos = results.flatMap((result) => result.status === 'fulfilled' ? result.value.videos : [])
  const uniqueVideos = [...new Map(videos.map((video) => [video.videoId, video])).values()]

  const client = new Client({ connectionString: databaseUri })
  await client.connect()
  try {
    for (const video of uniqueVideos) {
      const videoCategory = category(video)
      const values = [
        video.title,
        englishTitle(video),
        videoCategory,
        video.videoId,
        `https://www.youtube.com/watch?v=${video.videoId}`,
        `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
        video.description || null,
        video.tags || null,
        publishedAt(video),
      ]
      const updated = await client.query(
        `UPDATE videos SET
           admin_title = $1,
           title_en = COALESCE($2, title_en),
           category = $3,
           video_url = $5,
           thumbnail_url = $6,
           description = $7,
           tags = $8,
           published_at = $9::timestamptz,
           updated_at = now()
         WHERE source = 'youtube' AND video_id = $4`,
        values,
      ) as { rowCount: number | null }

      if (updated.rowCount === 0) {
        await client.query(
          `INSERT INTO videos (admin_title, title_en, category, source, video_id, video_url, thumbnail_url, description, tags, published_at, created_at, updated_at)
           VALUES ($1, $2, $3, 'youtube', $4, $5, $6, $7, $8, $9::timestamptz, now(), now())`,
          values,
        )
      }
    }
  } finally {
    await client.end()
  }

  return {
    channels: CHANNELS.length,
    failures,
    synced: uniqueVideos.length,
  }
}
