import { SlackBot } from 'bottender'

import sessionStore from '../session'

const bot = new SlackBot({
  sessionStore,
  channelSecret: 'c824bd2beba51d9a8a16f3337e5a7d33',
  accessToken:
    'Tw6nQBLrQ8BHCMgdTawuYSk++aWVbNROElOb/or3jC1wHzVWbSDB8l6Nu9alBwYpN+KD+MYvnii6tkFHhcTjKuoBoBpoarGwp6b+Bz8ftl9pwFiJsXgy4ujxSXYzuxwrjCVVSptpRVM8HLf/yz2REwdB04t89/1O/w1cDnyilFU=',
})

bot.onEvent(async context => {
  await context.reply([
    {
      type: 'text',
      text: 'Hello!',
    },
  ])
})

export default bot
