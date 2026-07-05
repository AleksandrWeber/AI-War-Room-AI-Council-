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
import { CircuitizabilityAdminService } from './circuitizability-admin.service.js'

type CircuitizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('circuitizability')
export class CircuitizabilityController {
  constructor(
    private readonly circuitizabilityAdminService: CircuitizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.circuitizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCircuitizabilityRollout() {
    return this.circuitizabilityAdminService.getCircuitizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCircuitizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.circuitizabilityAdminService.getWorkspaceCircuitizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCircuitizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CircuitizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_circuitizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported circuitizability admin action.',
      })
    }

    return this.circuitizabilityAdminService.executeCircuitizabilityAdminAction(
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
