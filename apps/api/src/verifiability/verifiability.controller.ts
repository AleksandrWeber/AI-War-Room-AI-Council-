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
import { VerifiabilityAdminService } from './verifiability-admin.service.js'

type VerifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('verifiability')
export class VerifiabilityController {
  constructor(
    private readonly verifiabilityAdminService: VerifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.verifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVerifiabilityRollout() {
    return this.verifiabilityAdminService.getVerifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVerifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.verifiabilityAdminService.getWorkspaceVerifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVerifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VerifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_verifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported verifiability admin action.',
      })
    }

    return this.verifiabilityAdminService.executeVerifiabilityAdminAction(
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
