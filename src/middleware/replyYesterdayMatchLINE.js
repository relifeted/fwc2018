import { Line } from 'messaging-api-line'
import moment from 'moment'

import * as api from '../api'
import { isNumber } from 'util'

export default async function handler(context, next) {
  if (context.intent && context.intent === '昨日賽事') {
    const matches = await api.findYesterdayMatches()
    if (matches && matches.length > 0) {
      let text = `昨日賽事：`
      matches.forEach(match => {
        const { homeTeam, awayTeam, dateTime, homeResult, awayResult } = match
        const homeTeamText = `${homeTeam.name} ${homeTeam.emojiString}`
        const awayTeamText = `${awayTeam.name} ${awayTeam.emojiString}`
        let resultText = ''
        if (typeof homeResult === 'number' && typeof awayResult === 'number') {
          resultText = `, 比數 ${homeResult}:${awayResult}`
        }
        const timeText = moment(dateTime)
          .utcOffset('+08:00')
          .format('HH:mm')
        text = `\n${timeText} - ${homeTeamText} 對上 ${awayTeamText}${resultText}`
      })
      const message = Line.createText(text)
      console.log('message:', message)
      await context.reply([message])
    } else {
      const message = Line.createText('昨天沒有比賽喔')
      console.log('message:', message)
      await context.reply([message])
    }
  }
  next()
}
