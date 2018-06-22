import { Line } from 'messaging-api-line'
import moment from 'moment'

import * as api from '../api'

function matchSort(a, b) {
  return new Date(a.dateTime).getTime() > new Date(b.dateTime).getTime()
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
      texts.push(
        `${timeText} - ${homeTeamText} 對上 ${awayTeamText}${resultText}`
      )
    })
    const message = Line.createText(texts.join('\n'))
    return message
  } else {
    const message = Line.createText(noMatchText)
    return message
  }
}

async function produceFlexMessage(matches, texts, noMatchText) {
  if (matches && matches.length > 0) {
    const contents = []
    const flexBox = {
      type: 'box',
      layout: 'vertical',
      contents,
    }
    const flexContainer = {
      type: 'bubble',
      styles: {
        header: {
          backgroundColor: '#eaeaea',
        },
        body: {
          backgroundColor: '#eaeaea',
        },
      },
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: texts[0],
            size: 'xl',
            align: 'center',
            gravity: 'center',
            flex: 1,
          },
        ],
      },
      body: flexBox,
    }
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
      texts.push(
        `${timeText} - ${homeTeamText} 對上 ${awayTeamText}${resultText}`
      )
      const matchContents = [
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: timeText,
              size: 'lg',
              align: 'center',
              gravity: 'center',
              flex: 1,
            },
          ],
        },
      ]
      // home
      const homeTeamContents = [
        {
          type: 'image',
          url: homeTeam.flag,
          size: 'sm',
        },
        {
          type: 'text',
          text: homeTeam.name,
          size: 'sm',
          align: 'center',
        },
      ]
      if (typeof homeResult === 'number') {
        homeTeamContents.push({
          type: 'text',
          text: `${homeResult}`,
          size: 'lg',
          align: 'center',
        })
      }
      matchContents.push({
        type: 'box',
        layout: 'vertical',
        contents: homeTeamContents,
      })
      //
      matchContents.push({
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'V.S.',
            size: 'sm',
            align: 'center',
            gravity: 'center',
            flex: 1,
          },
        ],
      })
      //
      // away
      const awayTeamContents = [
        {
          type: 'image',
          url: awayTeam.flag,
          size: 'sm',
        },
        {
          type: 'text',
          text: awayTeam.name,
          size: 'sm',
          align: 'center',
        },
      ]
      if (typeof awayResult === 'number') {
        awayTeamContents.push({
          type: 'text',
          text: `${awayResult}`,
          size: 'lg',
          align: 'center',
        })
      }
      matchContents.push({
        type: 'box',
        layout: 'vertical',
        contents: awayTeamContents,
      })
      contents.push({
        type: 'box',
        layout: 'horizontal',
        contents: matchContents,
      })
    })
    const message = Line.createFlex(texts.join('\n'), flexContainer)
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
    const texts = ['今日賽事']
    const message = await produceFlexMessage(matches, texts, '今天沒有比賽喔')
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  } else if (context.intent && context.intent === '明日賽事') {
    const foundMatches = await api.findTomorrowMatches()
    const matches = [...foundMatches]
    const texts = ['明日賽事']
    const message = await produceFlexMessage(matches, texts, '明天沒有比賽喔')
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  } else if (context.intent && context.intent === '昨日賽事') {
    const foundMatches = await api.findYesterdayMatches()
    const matches = [...foundMatches]
    const texts = ['昨日賽事']
    const message = await produceFlexMessage(matches, texts, '昨天沒有比賽喔')
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  }
  next()
}
