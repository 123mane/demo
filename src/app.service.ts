import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { time } from 'console';

@Injectable()
export class AppService {
  constructor(private schedulerregister: SchedulerRegistry) {}
  getHello(): string {
    // console.log('Cron is running Every 30 Second ');
    return 'Hello World!';
  }
}
//   @Cron(CronExpression.EVERY_5_SECONDS, { name: 'test' })
//   EverySecond() {
//     const job = this.schedulerregister.getCronJob('test');
//     console.warn('Cron is running Every 5 Second ');
//     // job.setTime();
//     job.start();
//     const data = job.nextDates();
//     // console.log('data', data);
//   }
// }
