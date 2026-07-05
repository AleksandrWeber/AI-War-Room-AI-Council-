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
import { FormulatabilityAdminService } from './formulatability-admin.service.js'

type FormulatabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('formulatability')
export class FormulatabilityController {
  constructor(
    private readonly formulatabilityAdminService: FormulatabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.formulatabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFormulatabilityRollout() {
    return this.formulatabilityAdminService.getFormulatabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFormulatabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.formulatabilityAdminService.getWorkspaceFormulatabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFormulatabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FormulatabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_formulatability_summary') {
      throw new BadRequestException({
        message: 'Unsupported formulatability admin action.',
      })
    }

    return this.formulatabilityAdminService.executeFormulatabilityAdminAction(
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
