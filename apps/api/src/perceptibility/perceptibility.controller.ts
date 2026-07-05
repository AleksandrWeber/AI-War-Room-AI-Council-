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
import { PerceptibilityAdminService } from './perceptibility-admin.service.js'

type PerceptibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('perceptibility')
export class PerceptibilityController {
  constructor(
    private readonly perceptibilityAdminService: PerceptibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.perceptibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPerceptibilityRollout() {
    return this.perceptibilityAdminService.getPerceptibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePerceptibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.perceptibilityAdminService.getWorkspacePerceptibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePerceptibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PerceptibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_perceptibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported perceptibility admin action.',
      })
    }

    return this.perceptibilityAdminService.executePerceptibilityAdminAction(
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
