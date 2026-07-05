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
import { RecognizabilityAdminService } from './recognizability-admin.service.js'

type RecognizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('recognizability')
export class RecognizabilityController {
  constructor(
    private readonly recognizabilityAdminService: RecognizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.recognizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRecognizabilityRollout() {
    return this.recognizabilityAdminService.getRecognizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRecognizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.recognizabilityAdminService.getWorkspaceRecognizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRecognizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RecognizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_recognizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported recognizability admin action.',
      })
    }

    return this.recognizabilityAdminService.executeRecognizabilityAdminAction(
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
