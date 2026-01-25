import { Controller, Get, ServiceUnavailableException, Logger, Session } from '@nestjs/common';
import { AllowAnonymous, AuthService } from '@thallesp/nestjs-better-auth';
import { DataSource } from 'typeorm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('api/health')
@ApiTags('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly dataSource: DataSource, private authService: AuthService) { }


  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @AllowAnonymous() // All routes inside this controller are public
  health() {
    this.logger.debug('Health check requested');
    return { status: 'ok' };
  }

  @Get('db')
  @AllowAnonymous() // All routes inside this controller are public
  @ApiOperation({ summary: 'Database Health check' })
  @ApiResponse({ status: 200, description: 'Database health check successful' })
  async dbHealth() {
    try {
      // Perform a real database operation
      await this.dataSource.query('SELECT 1');

      return { status: 'ok' };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database unavailable',
      });
    }
  }

  @Get('auth')
  @ApiOperation({ summary: 'Authentication Health check' })
  @ApiResponse({ status: 200, description: 'Authentication health check successful' })
  async authHealth(@Session() session: any) {
    try {
      if (!session.user) {
        throw new ServiceUnavailableException({
          status: 'error',
          message: 'User not authenticated',
        });
      }
      return { status: 'ok', message: 'user authenticated' };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'User not authenticated',
      });
    }
  }
}
