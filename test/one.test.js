"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CDTOplogServer = require("../dist");
console.log('CDTOplogServer exports:', CDTOplogServer);
var rxjs_1 = require("rxjs");
var s = new rxjs_1.Subject();
var sub = s.subscribe(function (v) { });
var v = [];
v.push(sub, sub, sub);
