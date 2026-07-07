import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { ProofregistryizabilityAdminService } from './proofregistryizability-admin.service.js'

type ProofregistryizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('proofregistryizability')
export class ProofregistryizabilityController {
  constructor(
    private readonly proofregistryizabilityAdminService: ProofregistryizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.proofregistryizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProofregistryizabilityRollout() {
    return this.proofregistryizabilityAdminService.getProofregistryizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProofregistryizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.proofregistryizabilityAdminService.getWorkspaceProofregistryizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProofregistryizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProofregistryizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_proofregistryizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported proofregistryizability admin action.',
      })
    }

    return this.proofregistryizabilityAdminService.executeProofregistryizabilityAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }
}
