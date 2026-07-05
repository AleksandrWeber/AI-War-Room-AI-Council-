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
import { AnnotationizabilityAdminService } from './annotationizability-admin.service.js'

type AnnotationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('annotationizability')
export class AnnotationizabilityController {
  constructor(
    private readonly annotationizabilityAdminService: AnnotationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.annotationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAnnotationizabilityRollout() {
    return this.annotationizabilityAdminService.getAnnotationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAnnotationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.annotationizabilityAdminService.getWorkspaceAnnotationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAnnotationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AnnotationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_annotationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported annotationizability admin action.',
      })
    }

    return this.annotationizabilityAdminService.executeAnnotationizabilityAdminAction(
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
