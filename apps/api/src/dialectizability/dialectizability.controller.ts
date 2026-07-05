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
import { DialectizabilityAdminService } from './dialectizability-admin.service.js'

type DialectizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dialectizability')
export class DialectizabilityController {
  constructor(
    private readonly dialectizabilityAdminService: DialectizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dialectizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDialectizabilityRollout() {
    return this.dialectizabilityAdminService.getDialectizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDialectizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dialectizabilityAdminService.getWorkspaceDialectizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDialectizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DialectizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dialectizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dialectizability admin action.',
      })
    }

    return this.dialectizabilityAdminService.executeDialectizabilityAdminAction(
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
