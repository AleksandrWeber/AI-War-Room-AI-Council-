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
import { OrderingizabilityAdminService } from './orderingizability-admin.service.js'

type OrderingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('orderingizability')
export class OrderingizabilityController {
  constructor(
    private readonly orderingizabilityAdminService: OrderingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.orderingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOrderingizabilityRollout() {
    return this.orderingizabilityAdminService.getOrderingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOrderingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.orderingizabilityAdminService.getWorkspaceOrderingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOrderingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OrderingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_orderingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported orderingizability admin action.',
      })
    }

    return this.orderingizabilityAdminService.executeOrderingizabilityAdminAction(
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
