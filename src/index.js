import { createRequestHandler } from 'bottender-lambda'
import updateMatchesCommand from './commands/updateMatches'
import updateGroupResultsCommand from './commands/updateGroupResults'

import bots from './bots'

export const line = (_event, _context, callback) => {
  // console.log('apiw event:', JSON.stringify(_event))
  const handler = createRequestHandler(bots.line)
  const { context } = _event
  const event = {
    httpMethod: context['http-method'],
    body: _event['body-json'],
  }
  console.log('event:', JSON.stringify(event))
  handler(event, _context, callback)
}

export const updateMatches = async (_event, _context, callback) => {
  await updateMatchesCommand()
  await updateGroupResultsCommand()
  callback()
}

export const updateGroupResults = async (_event, _context, callback) => {
  await updateGroupResultsCommand()
  callback()
}

export default {
  line,
  updateMatches,
  updateGroupResults,
}
