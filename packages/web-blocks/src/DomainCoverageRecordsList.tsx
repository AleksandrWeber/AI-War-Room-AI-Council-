export type DomainCoverageRecord = {
  domain: string
  tableName: string
  tableExists: boolean
  recordCount: number
}

export type DomainCoverageRecordsListProps = {
  records: DomainCoverageRecord[]
  listClassName: string
  cardClassName: string
  formatDomain: (domain: string) => string
}

export function DomainCoverageRecordsList({
  records,
  listClassName,
  cardClassName,
  formatDomain,
}: DomainCoverageRecordsListProps) {
  return (
    <div className={listClassName}>
      {records.map((record) => (
        <article
          className={`${cardClassName} ${cardClassName}--${record.tableExists ? 'ready' : 'missing'}`}
          key={record.domain}
        >
          <div>
            <strong>{formatDomain(record.domain)}</strong>
            <p>{record.tableName}</p>
            <small>
              {record.tableExists
                ? `${record.recordCount} record(s)`
                : 'Table missing'}
            </small>
          </div>
        </article>
      ))}
    </div>
  )
}
