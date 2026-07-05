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
import { ClassifiabilityAdminService } from './classifiability-admin.service.js'

type ClassifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('classifiability')
export class ClassifiabilityController {
  constructor(
    private readonly classifiabilityAdminService: ClassifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.classifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getClassifiabilityRollout() {
    return this.classifiabilityAdminService.getClassifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceClassifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.classifiabilityAdminService.getWorkspaceClassifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeClassifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ClassifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_classifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported classifiability admin action.',
      })
    }

    return this.classifiabilityAdminService.executeClassifiabilityAdminAction(
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
