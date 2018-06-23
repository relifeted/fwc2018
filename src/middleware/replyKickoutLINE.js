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
      homePenalty,
      awayPenalty,
      homeTeamId,
      awayTeamId,
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
      if (typeof homePenalty === 'number' && typeof awayPenalty === 'number') {
        resultText = `${resultText}, 點球 ${homePenalty}:${awayPenalty}`
      }
    }
    const timeText = moment(dateTime).utcOffset('+08:00').format(MATCH_TIME_FORMAT)
    texts.push(`${timeText} - ${homeTeamText} 對上 ${awayTeamText}${resultText}`)
  })
  return texts.join('\n')
}

function produceMatchResult(match, contents) {
  const {
    homeTeam,
    awayTeam,
    homeResult,
    awayResult,
    homePenalty,
    awayPenalty,
    homeTeamId,
    awayTeamId,
    dateTime,
    finished,
  } = match
  contents.push({
    type: 'separator',
  })
  // home
  const homeTeamContents = []
  if (homeTeam) {
    homeTeamContents.push({
      type: 'box',
      layout: 'vertical',
      flex: 2,
      contents: [
        {
          type: 'image',
          url: homeTeam.flag,
        },
        {
          type: 'text',
          text: homeTeam.name,
          align: 'center',
          gravity: 'center',
          flex: 1,
          wrap: true,
        },
      ],
    })
  } else {
    homeTeamContents.push({
      type: 'text',
      text: processUndefinedName(homeTeamId),
      size: 'lg',
      align: 'center',
      gravity: 'center',
      flex: 2,
    })
  }
  if (typeof homeResult === 'number' && finished) {
    const resultContents = [
      {
        type: 'text',
        text: `${homeResult}`,
        size: 'md',
        align: 'center',
        gravity: 'center',
        flex: 1,
      },
    ]
    if (typeof homePenalty === 'number') {
      resultContents.push({
        type: 'text',
        text: `(${homePenalty})`,
        size: 'md',
        align: 'center',
        gravity: 'center',
        flex: 1,
      })
    }
    homeTeamContents.push({
      type: 'box',
      layout: 'vertical',
      flex: 1,
      contents: resultContents,
    })
  }
  // away
  const awayTeamContents = []
  if (typeof awayResult === 'number' && finished) {
    const resultContents = [
      {
        type: 'text',
        text: `${awayResult}`,
        size: 'md',
        align: 'center',
        gravity: 'center',
        flex: 1,
      },
    ]
    if (typeof awayPenalty === 'number') {
      resultContents.push({
        type: 'text',
        text: `(${awayPenalty})`,
        size: 'md',
        align: 'center',
        gravity: 'center',
        flex: 1,
      })
    }
    awayTeamContents.push({
      type: 'box',
      layout: 'vertical',
      flex: 1,
      contents: resultContents,
    })
  }
  if (awayTeam) {
    awayTeamContents.push({
      type: 'box',
      layout: 'vertical',
      flex: 2,
      contents: [
        {
          type: 'image',
          url: awayTeam.flag,
        },
        {
          type: 'text',
          text: awayTeam.name,
          align: 'center',
          gravity: 'center',
          flex: 1,
          wrap: true,
        },
      ],
    })
  } else {
    awayTeamContents.push({
      type: 'text',
      text: processUndefinedName(awayTeamId),
      size: 'lg',
      align: 'center',
      gravity: 'center',
      flex: 2,
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
        align: 'center',
        gravity: 'center',
        flex: 1,
      },
      ...awayTeamContents,
    ],
  }
  contents.push({
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: moment(dateTime).utcOffset('+08:00').format(MATCH_TIME_FORMAT),
        size: 'lg',
        margin: 'xs',
        align: 'start',
        gravity: 'center',
        flex: 1,
      },
      versusContents,
    ],
  })
}

async function produceFlexMessage(matches, title, altText) {
  if (matches && matches.length > 0) {
    const contents = []
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
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: title,
            size: 'xl',
            align: 'center',
            gravity: 'center',
            flex: 1,
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents,
      },
    }
    matches.forEach(match => produceMatchResult(match, contents))
    const message = Line.createFlex(altText, flexContainer)
    return message
  }
  const message = Line.createText('沒有戰績 Orz')
  return message
}

export default (async function handler(context, next) {
  const { text = '' } = context.event
  if (text.match(/16強/)) {
    const round16 = await api.findMatchByType('round16')
    // console.log('round16:', JSON.stringify(round16))
    const title = `16強淘汰賽`
    const message = await produceFlexMessage(
      [...round16],
      title,
      produceTextMessage([...round16], title)
    )
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  } else if (text.match(/8強/)) {
    const round8 = await api.findMatchByType('round8')
    // console.log('round8:', JSON.stringify(round8))
    const title = `8強淘汰賽`
    const message = await produceFlexMessage(
      [...round8],
      title,
      produceTextMessage([...round8], title)
    )
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  } else if (text.match(/4強/)) {
    const round4 = await api.findMatchByType('round4')
    // console.log('round4:', JSON.stringify(round4))
    const title = `4強淘汰賽`
    const message = await produceFlexMessage(
      [...round4],
      title,
      produceTextMessage([...round4], title)
    )
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  } else if (text.match(/冠軍[賽|戰]/)) {
    const round2 = await api.findMatchByType('round2')
    // console.log('round4:', JSON.stringify(round4))
    const title = `冠軍賽`
    const message = await produceFlexMessage(
      [...round2],
      title,
      produceTextMessage([...round2], title)
    )
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  } else if (text.match(/季軍[賽|戰]/)) {
    const round2loser = await api.findMatchByType('round2loser')
    // console.log('round4:', JSON.stringify(round4))
    const title = `季軍賽`
    const message = await produceFlexMessage(
      [...round2loser],
      title,
      produceTextMessage([...round2loser], title)
    )
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  }
  next()
})
