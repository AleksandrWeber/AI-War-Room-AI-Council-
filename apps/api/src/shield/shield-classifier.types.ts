import type { ShieldFindingSource, ShieldScanResult } from '@ai-war-room/schemas'

export type ShieldClassifierInput = {
  text: string
  source: ShieldFindingSource
}

export interface ShieldClassifier {
  readonly classifierId: string
  classify(input: ShieldClassifierInput): Promise<ShieldScanResult>
}
