export function getRelativeLastUpdatedTime(lastUpdatedInMinutes) {
  const relativeTimeFormat = new Intl.RelativeTimeFormat('id')
  let displayedTime

  if (lastUpdatedInMinutes >= 60) {
    displayedTime = relativeTimeFormat.format(
      -Math.round(lastUpdatedInMinutes / 60),
      'hour'
    )
  } else {
    displayedTime = relativeTimeFormat.format(
      -Math.round(lastUpdatedInMinutes),
      'minute'
    )
  }

  return displayedTime
}
