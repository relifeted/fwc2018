import { Line } from 'messaging-api-line'
import moment from 'moment'

import * as api from '../api'

const MATCH_TIME_FORMAT = 'M/D HH:mm'

function processUndefinedName(team) {
  if (team.startsWith('winner')) {
    const [, group] = team.split('_')
    return `${group.toUpperCase()}組第一名`
  }
  if (team.startsWith('runner')) {
    const [, group] = team.split('_')
    return `${group.toUpperCase()}組第二名`
  }
  return '未定'
}

function produceTextMessage(matches, title) {
  const texts = [`${title}：`]
  matches.forEach(match => {
    const {
      homeTeam,
      awayTeam,
      dateTime,
      homeResult,
      awayResult,
      homeTeamId,
      awayTeamId
    } = match
    const homeTeamText = homeTeam
      ? `${homeTeam.name} ${homeTeam.emojiString}`
      : processUndefinedName(homeTeamId)
    const awayTeamText = awayTeam
      ? `${awayTeam.name} ${awayTeam.emojiString}`
      : processUndefinedName(awayTeamId)
    let resultText = ''
    if (typeof homeResult === 'number' && typeof awayResult === 'number') {
      resultText = `, 比數 ${homeResult}:${awayResult}`
    }
    const timeText = moment(dateTime).format(MATCH_TIME_FORMAT)
    texts.push(
      `${timeText} - ${homeTeamText} 對上 ${awayTeamText}${resultText}`
    )
  })
  return texts.join('\n')
}

function produceMatchResult(match, contents) {
  const {
    homeTeam,
    awayTeam,
    homeResult,
    awayResult,
    homeTeamId,
    awayTeamId,
    dateTime,
    finished
  } = match
  contents.push({
    type: 'separator'
  })
  // home
  const homeTeamContents = []
  if (homeTeam) {
    homeTeamContents.push(
      {
        type: 'image',
        url: homeTeam.flag,
        size: 'sm'
      },
      {
        type: 'text',
        text: homeTeam.name,
        size: 'sm',
        align: 'center'
      }
    )
  } else {
    homeTeamContents.push({
      type: 'text',
      text: processUndefinedName(homeTeamId),
      size: 'sm',
      align: 'center'
    })
  }
  if (typeof homeResult === 'number' && finished) {
    homeTeamContents.push({
      type: 'text',
      text: `${homeResult}`,
      size: 'lg',
      align: 'center'
    })
  }
  // away
  const awayTeamContents = []
  if (awayTeam) {
    awayTeamContents.push(
      {
        type: 'image',
        url: awayTeam.flag,
        size: 'sm'
      },
      {
        type: 'text',
        text: awayTeam.name,
        size: 'sm',
        align: 'center'
      }
    )
  } else {
    awayTeamContents.push({
      type: 'text',
      text: processUndefinedName(awayTeamId),
      size: 'sm',
      align: 'center'
    })
  }
  if (typeof awayResult === 'number' && finished) {
    awayTeamContents.push({
      type: 'text',
      text: `${awayResult}`,
      size: 'lg',
      align: 'center'
    })
  }
  const versusContents = {
    type: 'box',
    layout: 'horizontal',
    contents: [
      ...homeTeamContents,
      {
        type: 'text',
        text: 'V.S.',
        size: 'sm',
        align: 'center',
        gravity: 'center',
        flex: 1
      },
      ...awayTeamContents
    ]
  }
  contents.push({
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: moment(dateTime).format(MATCH_TIME_FORMAT),
        size: 'lg',
        margin: 'xs',
        align: 'start',
        gravity: 'center',
        flex: 1
      },
      versusContents
    ]
  })
}

async function produceFlexMessage(matches, title, altText) {
  if (matches && matches.length > 0) {
    const contents = []
    const flexContainer = {
      type: 'bubble',
      styles: {
        header: {
          backgroundColor: '#eaeaea'
        },
        body: {
          backgroundColor: '#eaeaea'
        }
      },
      header: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: title,
            size: 'xl',
            align: 'center',
            gravity: 'center',
            flex: 1
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents
      }
    }
    matches.forEach(match => produceMatchResult(match, contents))
    const message = Line.createFlex(altText, flexContainer)
    return message
  }
  const message = Line.createText('沒有戰績 Orz')
  return message
}

export default async function handler(context, next) {
  const { text = '' } = context.event
  if (text.match(/16強/)) {
    const round16 = await api.findMatchByType('round16')
    console.log('round16 length:', round16.length)
    // console.log('groupResults:', JSON.stringify(groupResults))
    const title = `16強淘汰賽`
    const message = await produceFlexMessage(
      [...round16],
      title,
      produceTextMessage([...round16], title)
    )
    console.log('message:', JSON.stringify(message))
    // const message = Line.createText(JSON.stringify(round16))
    await context.reply([message])
  }
  next()
}
