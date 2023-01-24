import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { AppService } from './app.service';

@Injectable()
export class CronService {
  constructor(private schedulerregister: SchedulerRegistry) {}
  // // @Cron(CronExpression.EVERY_10_SECONDS, { name: 'test2' })
  // Every45Second() {
  //   const job = this.schedulerregister.getCronJob('test2');
  //   console.log('Cron is running evrey 30 Seconds');
  //   // job.stop();
  //   const data = job.nextDates();
  //   console.log('data', data);
  //   job.start();
  // }
}
