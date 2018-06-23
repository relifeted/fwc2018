import { Line } from 'messaging-api-line'

import * as api from '../api'

function teamSort(a, b) {
  return a.teamId > b.teamId
}

function produceTextMessage(results, title) {
  const texts = [`${title}：`]

  results.sort(teamSort).forEach(result => {
    const {
      team,
      points,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifferential,
    } = result
    const { name, emojiString } = team
    const teamText = `${emojiString} ${name} 積分：${points}`
    texts.push(teamText)
    const detailText = `勝 ${wins} 平 ${draws} 負 ${losses} 進球 ${goalsFor} 失球 ${goalsAgainst} 淨勝球 ${goalDifferential}`
    texts.push(detailText)
  })
  return texts.join('\n')
}

function produceTeamResult(result, contents) {
  const {
    team,
    points,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifferential,
  } = result
  const { name, flag } = team
  contents.push({
    type: 'separator',
  })
  contents.push({
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'image',
            url: flag,
          },
          {
            type: 'text',
            text: name,
            size: 'lg',
            margin: 'xs',
            align: 'center',
            gravity: 'center',
            flex: 1,
            wrap: true,
          },
          {
            type: 'text',
            text: `${points}`,
            size: 'lg',
            align: 'center',
            gravity: 'center',
            flex: 1,
          },
        ],
      },
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '勝',
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
              {
                type: 'text',
                text: `${wins}`,
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '平',
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
              {
                type: 'text',
                text: `${draws}`,
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '負',
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
              {
                type: 'text',
                text: `${losses}`,
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '進球',
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
              {
                type: 'text',
                text: `${goalsFor}`,
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '失球',
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
              {
                type: 'text',
                text: `${goalsAgainst}`,
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '淨勝球',
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
              {
                type: 'text',
                text: `${goalDifferential}`,
                size: 'sm',
                align: 'center',
                gravity: 'center',
                flex: 1,
                wrap: true,
              },
            ],
          },
        ],
      },
    ],
  })
}

async function produceFlexMessage(results, title, altText) {
  if (results && results.length > 0) {
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
    results
      .sort(teamSort)
      .forEach(result => produceTeamResult(result, contents))
    const message = Line.createFlex(altText, flexContainer)
    return message
  }
  const message = Line.createText('沒有戰績 Orz')
  return message
}

export default async function handler(context, next) {
  const { text = '' } = context.event
  if (text.match(/[A-H]{1}組戰績/)) {
    const groupId = `${text.charCodeAt(0) - 64}`
    console.log('groupId:', groupId)
    const { groupResults } = await api.getGroup(groupId)
    // console.log('groupResults:', JSON.stringify(groupResults))
    const title = `${text}`
    const message = await produceFlexMessage(
      [...groupResults],
      title,
      produceTextMessage([...groupResults], title)
    )
    console.log('message:', JSON.stringify(message))
    await context.reply([message])
  }
  next()
}
