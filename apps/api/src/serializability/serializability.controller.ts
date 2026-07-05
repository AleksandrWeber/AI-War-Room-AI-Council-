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
import { SerializabilityAdminService } from './serializability-admin.service.js'

type SerializabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('serializability')
export class SerializabilityController {
  constructor(
    private readonly serializabilityAdminService: SerializabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.serializabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSerializabilityRollout() {
    return this.serializabilityAdminService.getSerializabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSerializabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.serializabilityAdminService.getWorkspaceSerializabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSerializabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SerializabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_serializability_summary') {
      throw new BadRequestException({
        message: 'Unsupported serializability admin action.',
      })
    }

    return this.serializabilityAdminService.executeSerializabilityAdminAction(
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
