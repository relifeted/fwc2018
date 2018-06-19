import { Line } from 'messaging-api-line'
import moment from 'moment'

import * as api from '../api'

function matchSort(a, b) {
  return (new Date(a.dateTime)).getTime() > (new Date(b.dateTime)).getTime()
}

async function produceMessage(matches, texts, noMatchText) {
  if (matches && matches.length > 0) {
    matches.sort(matchSort).forEach(match => {
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
      texts.push(`${timeText} - ${homeTeamText} 對上 ${awayTeamText}${resultText}`)
    })
    const message = Line.createText(texts.join('\n'))
    return message
  } else {
    const message = Line.createText(noMatchText)
    return message
  }
}

export default async function handler(context, next) {
  if (context.intent && context.intent === '今日賽事') {
    const foundMatches = await api.findTodayMatches()
    const matches = [...foundMatches]
    const texts = ['今日賽事：']
    const message = await produceMessage(matches, texts, '今天沒有比賽喔')
    console.log('message:', message)
    await context.reply([message])
  } else if (context.intent && context.intent === '明日賽事') {
    const foundMatches = await api.findTomorrowMatches()
    const matches = [...foundMatches]
    const texts = ['明日賽事：']
    const message = await produceMessage(matches, texts, '明天沒有比賽喔')
    console.log('message:', message)
    await context.reply([message])
  } else if (context.intent && context.intent === '昨日賽事') {
    const foundMatches = await api.findYesterdayMatches()
    const matches = [...foundMatches]
    const texts = ['昨日賽事：']
    const message = await produceMessage(matches, texts, '昨天沒有比賽喔')
    console.log('message:', message)
    await context.reply([message])
  }
  next()
}
