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
import { NotarizationizabilityAdminService } from './notarizationizability-admin.service.js'

type NotarizationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('notarizationizability')
export class NotarizationizabilityController {
  constructor(
    private readonly notarizationizabilityAdminService: NotarizationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.notarizationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNotarizationizabilityRollout() {
    return this.notarizationizabilityAdminService.getNotarizationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNotarizationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.notarizationizabilityAdminService.getWorkspaceNotarizationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNotarizationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NotarizationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_notarizationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported notarizationizability admin action.',
      })
    }

    return this.notarizationizabilityAdminService.executeNotarizationizabilityAdminAction(
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
