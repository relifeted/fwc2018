import _parseIntent from './parseIntent'
import _replyTodayMatchLINE from './replyTodayMatchLINE'
import _hello from './hello'

export const parseIntent = _parseIntent
export const replyTodayMatchLINE = _replyTodayMatchLINE
export const hello = _hello

export default {
  parseIntent,
  replyTodayMatchLINE,
  hello,
}
