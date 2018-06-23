// import Debug from 'debug'
import { LineBot, middleware } from 'bottender'

import parseIntent from '../middleware/parseIntent'
import replyMatchLINE from '../middleware/replyMatchLINE'
import replyGroupResultLINE from '../middleware/replyGroupResultLINE'
import replyKickoutLINE from '../middleware/replyKickoutLINE'

import sessionStore from '../session'

// const debug = new Debug('bot:line')

const bot = new LineBot({
  sessionStore,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  accessToken: process.env.LINE_ACCESS_TOKEN,
})

bot.onEvent(
  middleware([
    parseIntent,
    replyMatchLINE,
    replyGroupResultLINE,
    replyKickoutLINE,
  ])
)

export default bot
