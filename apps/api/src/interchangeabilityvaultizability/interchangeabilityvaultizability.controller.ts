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
import { InterchangeabilityvaultizabilityAdminService } from './interchangeabilityvaultizability-admin.service.js'

type InterchangeabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('interchangeabilityvaultizability')
export class InterchangeabilityvaultizabilityController {
  constructor(
    private readonly interchangeabilityvaultizabilityAdminService: InterchangeabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.interchangeabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInterchangeabilityvaultizabilityRollout() {
    return this.interchangeabilityvaultizabilityAdminService.getInterchangeabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInterchangeabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.interchangeabilityvaultizabilityAdminService.getWorkspaceInterchangeabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInterchangeabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InterchangeabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_interchangeabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported interchangeabilityvaultizability admin action.',
      })
    }

    return this.interchangeabilityvaultizabilityAdminService.executeInterchangeabilityvaultizabilityAdminAction(
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
