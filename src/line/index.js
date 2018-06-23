// import Debug from 'debug'
import { LineBot, middleware } from 'bottender'

import {
  parseIntent,
  replyMatchLINE,
  replyGroupResultLINE,
} from '../middleware'
import sessionStore from '../session'

// const debug = new Debug('bot:line')

const bot = new LineBot({
  sessionStore,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  accessToken: process.env.LINE_ACCESS_TOKEN,
})

bot.onEvent(middleware([parseIntent, replyMatchLINE, replyGroupResultLINE]))

export default bot
