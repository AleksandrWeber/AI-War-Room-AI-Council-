import { Fragment, type ReactNode } from 'react'

export type ShieldScanHighlightFinding = {
  findingId: string
  severity: string
  category: string
  span?: {
    start: number
    end: number
    quote: string
  }
}

/**
 * Renders idea text with clickable Shield finding spans for Human Review.
 * Overlapping spans are resolved by earliest start; later overlaps may truncate.
 */
export function getHighlightedIdea(
  rawIdea: string,
  findings: ShieldScanHighlightFinding[],
  onSelectFinding?: (findingId: string) => void,
): ReactNode {
  const spans = findings
    .filter((finding) => finding.span)
    .map((finding) => ({
      findingId: finding.findingId,
      category: finding.category,
      severity: finding.severity,
      start: finding.span!.start,
      end: finding.span!.end,
    }))
    .sort((left, right) => left.start - right.start)

  if (spans.length === 0) {
    return rawIdea
  }

  let cursor = 0

  return (
    <>
      {spans.map((span) => {
        const before = rawIdea.slice(cursor, span.start)
        const highlighted = rawIdea.slice(span.start, span.end)
        cursor = span.end

        return (
          <Fragment key={span.findingId}>
            {before}
            <button
              type="button"
              className="finding-mark"
              aria-label={`Shield ${span.severity} finding: ${span.category}. Activate to review.`}
              onClick={() => onSelectFinding?.(span.findingId)}
            >
              {highlighted}
            </button>
          </Fragment>
        )
      })}
      {rawIdea.slice(cursor)}
    </>
  )
}
