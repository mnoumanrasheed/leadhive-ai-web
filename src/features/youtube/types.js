/**
 * YouTube feature — runtime values + JSDoc type documentation.
 * TypeScript types are preserved as JSDoc for developer reference.
 *
 * @typedef {'platform'|'channel'|'persona'|'content'|'dashboard'|'command-center'|'analytics'} DemoScreen
 *
 * @typedef {Object} Channel
 * @property {string} id
 * @property {string} title
 * @property {string} thumbnail
 * @property {string|null} subscribers
 * @property {string|null} views
 * @property {string|null} videos
 *
 * @typedef {Object} Profile
 * @property {string} business_name
 * @property {string} website
 * @property {string} services
 * @property {string} brand_tone
 * @property {string} ai_rules
 *
 * @typedef {Object} Video
 * @property {string} video_id
 * @property {string} title
 * @property {string} thumbnail
 *
 * @typedef {Video & { views: number, comments: number, likes: number }} VideoMetrics
 *
 * @typedef {Object} Schedule
 * @property {string} mode
 * @property {string} target_date
 * @property {string} start_time
 * @property {string} end_time
 *
 * @typedef {Object} Workspace
 * @property {Profile} profile
 * @property {string[]} selection
 * @property {Schedule} schedule
 * @property {boolean} running
 * @property {boolean} automation_ready
 *
 * @typedef {Object} Session
 * @property {Channel[]} channels
 * @property {string|null} selected
 * @property {string} csrf
 *
 * @typedef {Object} Activity
 * @property {string} author
 * @property {string} comment
 * @property {string} reply
 * @property {string} timestamp
 *
 * @typedef {Object} ScreenNavigation
 * @property {(screen: DemoScreen) => void} navigate
 */

/** @type {Record<DemoScreen, string>} */
export const screenLabels = {
  platform: 'YouTube Intelligence',
  channel: 'Channel',
  persona: 'AI Persona',
  content: 'Video Library',
  dashboard: 'Overview',
  'command-center': 'Command Center',
  analytics: 'Analytics',
}

/** @returns {DemoScreen} */
export function screenFromHash() {
  const candidate = window.location.hash.slice(1)
  return Object.hasOwn(screenLabels, candidate) ? candidate : 'platform'
}