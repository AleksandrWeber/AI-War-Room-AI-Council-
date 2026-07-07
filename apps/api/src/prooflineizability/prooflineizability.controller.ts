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
import { ProoflineizabilityAdminService } from './prooflineizability-admin.service.js'

type ProoflineizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('prooflineizability')
export class ProoflineizabilityController {
  constructor(
    private readonly prooflineizabilityAdminService: ProoflineizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.prooflineizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProoflineizabilityRollout() {
    return this.prooflineizabilityAdminService.getProoflineizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProoflineizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.prooflineizabilityAdminService.getWorkspaceProoflineizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProoflineizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProoflineizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_prooflineizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported prooflineizability admin action.',
      })
    }

    return this.prooflineizabilityAdminService.executeProoflineizabilityAdminAction(
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
