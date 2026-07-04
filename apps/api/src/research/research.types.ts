import type { DraftRun } from '@ai-war-room/schemas'

export type ResearchDocument = {
  sourceId: string
  title: string
  url: string
  provider: string
  publishedAt: string
  content: string
}

export type ResearchCitation = Omit<ResearchDocument, 'content'>

export type ResearchProviderRequest = {
  draftRun: DraftRun
}

export interface ResearchProvider {
  readonly providerId: string
  search(request: ResearchProviderRequest): Promise<ResearchDocument[]>
}
