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
import { AllocationizabilityAdminService } from './allocationizability-admin.service.js'

type AllocationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('allocationizability')
export class AllocationizabilityController {
  constructor(
    private readonly allocationizabilityAdminService: AllocationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.allocationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAllocationizabilityRollout() {
    return this.allocationizabilityAdminService.getAllocationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAllocationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.allocationizabilityAdminService.getWorkspaceAllocationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAllocationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AllocationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_allocationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported allocationizability admin action.',
      })
    }

    return this.allocationizabilityAdminService.executeAllocationizabilityAdminAction(
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
