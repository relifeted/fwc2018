import Debug from 'debug'
import { LineBot, middleware } from 'bottender'

import {
  parseIntent,
  replyMatchLINE,
} from '../middleware'
import sessionStore from '../session'

const debug = new Debug('bot:line')

const bot = new LineBot({
  sessionStore,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  accessToken: process.env.LINE_ACCESS_TOKEN,
})

bot.onEvent(
  middleware([
    parseIntent,
    replyMatchLINE,
  ])
)

export default bot
