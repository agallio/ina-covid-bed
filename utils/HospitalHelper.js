export function getRelativeLastUpdatedTime(lastUpdatedInMinutes) {
  const relativeTimeFormat = new Intl.RelativeTimeFormat('id')
  let displayedTime

  if (lastUpdatedInMinutes >= 60) {
    displayedTime = relativeTimeFormat.format(
      -Math.round(lastUpdatedInMinutes / 60),
      'hour'
    )
  } else {
    if (-Math.round(lastUpdatedInMinutes) === 0) {
      displayedTime = 'kurang dari 1 menit yang lalu'
    } else {
      displayedTime = relativeTimeFormat.format(
        -Math.round(lastUpdatedInMinutes),
        'minute'
      )
    }
  }

  return displayedTime
}
