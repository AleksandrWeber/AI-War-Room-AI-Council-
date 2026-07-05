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
import { ReproducibilityAdminService } from './reproducibility-admin.service.js'

type ReproducibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('reproducibility')
export class ReproducibilityController {
  constructor(
    private readonly reproducibilityAdminService: ReproducibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.reproducibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReproducibilityRollout() {
    return this.reproducibilityAdminService.getReproducibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReproducibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.reproducibilityAdminService.getWorkspaceReproducibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReproducibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReproducibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_reproducibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported reproducibility admin action.',
      })
    }

    return this.reproducibilityAdminService.executeReproducibilityAdminAction(
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
