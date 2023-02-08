import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Controller()
export class AppController {
  constructor(
    private scheduleregister: SchedulerRegistry,
    private readonly appService: AppService,
  ) {}
  @Cron(CronExpression.EVERY_5_SECONDS, { name: 'test' })
  @Get()
  getHello(): string {
    const job = this.scheduleregister.getCronJob('test');
    return this.appService.getHello();
  }
}
