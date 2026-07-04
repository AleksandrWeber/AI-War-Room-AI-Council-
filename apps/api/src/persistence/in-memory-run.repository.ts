import type {
  ArtifactHistoryItem,
  DraftRun,
  MockPipelineResult,
} from '@ai-war-room/schemas'
import type {
  RunRepository,
  SaveDraftRunInput,
} from './run.repository.js'

export class InMemoryRunRepository implements RunRepository {
  private readonly draftsByIdempotencyKey = new Map<string, DraftRun>()
  private readonly pipelineResultsByRunId = new Map<string, MockPipelineResult>()

  async findDraftRunByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<DraftRun | null> {
    return (
      this.draftsByIdempotencyKey.get(
        this.createIdempotencyKey(workspaceId, idempotencyKey),
      ) ?? null
    )
  }

  async saveDraftRun(input: SaveDraftRunInput): Promise<void> {
    this.draftsByIdempotencyKey.set(
      this.createIdempotencyKey(
        input.draftRun.workspaceId,
        input.idempotencyKey,
      ),
      input.draftRun,
    )
  }

  async saveMockPipelineResult(result: MockPipelineResult): Promise<void> {
    this.pipelineResultsByRunId.set(result.runId, result)
  }

  async listArtifacts(workspaceId: string): Promise<ArtifactHistoryItem[]> {
    return [...this.pipelineResultsByRunId.values()]
      .filter((result) => result.workspaceId === workspaceId)
      .flatMap((result) =>
        result.artifacts.map((artifact) => ({
          artifactId: artifact.metadata.artifactId,
          runId: artifact.metadata.runId,
          workspaceId: artifact.metadata.workspaceId,
          artifactType: artifact.metadata.artifactType,
          artifactVersion: artifact.metadata.artifactVersion,
          createdAt: artifact.metadata.createdAt,
          metadata: artifact.metadata,
          artifact: artifact.artifact,
        })),
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }

  async findArtifactById(
    workspaceId: string,
    artifactId: string,
  ): Promise<ArtifactHistoryItem | null> {
    return (
      (await this.listArtifacts(workspaceId)).find(
        (artifact) => artifact.artifactId === artifactId,
      ) ?? null
    )
  }

  private createIdempotencyKey(workspaceId: string, idempotencyKey: string) {
    return `${workspaceId}:${idempotencyKey}`
  }
}
