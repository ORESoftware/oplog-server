import * as CDTOplogServer from '../dist';

console.log('CDTOplogServer exports:', CDTOplogServer);


import {Subject, Subscription} from 'rxjs';

const s = new Subject();

const sub = s.subscribe(v => {});

const v : Array<Subscription> = [];

v.push(sub, sub, sub);