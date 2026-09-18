#!/usr/bin/env node
'use strict';

const bunion = require('bunion');
const log = bunion.default || bunion;
require('./dist/index');
const {client} = require('./dist/mongo-client');
const {oplog} = require('./dist/oplog');
const {connections, io} = require('./dist/socket-server');

const stdinIsTTY = Boolean(process.stdin.isTTY);
const startedAt = Date.now();
const configuredGraceMs = parseInt(process.env.SHUTDOWN_GRACE_MS || '', 10);
const graceMs = Number.isInteger(configuredGraceMs) && configuredGraceMs > 0
  ? configuredGraceMs
  : 30000;

let phase = 'running';
let firstTrigger = '';
let signalCount = 0;
let graceTimer;
let forceTimer;
let finished = false;

function writeLog(level, event, message, fields) {
  const record = JSON.stringify(Object.assign({
    event,
    message,
    phase,
    tty: stdinIsTTY,
    signal_count: signalCount,
    grace_ms: graceMs,
    active_connections: connections.size,
    elapsed_ms: Date.now() - startedAt
  }, fields || {}));
  (log[level] || log.info).call(log, record);
}

function closeDataSources() {
  return Promise.resolve(oplog.close())
    .catch(err => writeLog('warn', 'server.shutdown.oplog_error', 'Failed while closing the oplog cursor', {
      error: err && err.message || String(err)
    }))
    .then(() => Promise.resolve(client.close()))
    .catch(err => writeLog('warn', 'server.shutdown.mongo_error', 'Failed while closing the MongoDB client', {
      error: err && err.message || String(err)
    }));
}

function waitForConnections() {
  return new Promise(resolve => {
    const poll = () => connections.size === 0 ? resolve() : setTimeout(poll, 25);
    poll();
  });
}

function closeListener() {
  return new Promise((resolve, reject) => {
    const server = io.httpServer;
    if (!server || typeof server.close !== 'function') {
      writeLog('warn', 'server.shutdown.listener_unavailable', 'Socket.IO did not expose its HTTP listener; waiting on tracked clients');
      waitForConnections().then(resolve);
      return;
    }
    if (server.listening === false) {
      resolve();
      return;
    }
    server.close(err => err ? reject(err) : resolve());
  });
}

function forceSockets() {
  connections.forEach(socket => {
    try {
      socket.disconnect(true);
    }
    catch (err) {
      writeLog('warn', 'server.shutdown.socket_error', 'Failed to disconnect a Socket.IO client', {
        error: err && err.message || String(err)
      });
    }
  });

  return new Promise(resolve => {
    if (typeof io.close !== 'function') {
      resolve();
      return;
    }
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    try {
      io.close(done);
      setTimeout(done, 250);
    }
    catch (err) {
      writeLog('warn', 'server.shutdown.socket_server_error', 'Failed while closing the Socket.IO server', {
        error: err && err.message || String(err)
      });
      done();
    }
  });
}

function complete(outcome, trigger, exitCode) {
  if (finished) return;
  finished = true;
  phase = 'stopped';
  clearTimeout(graceTimer);
  clearTimeout(forceTimer);
  writeLog(exitCode === 0 ? 'info' : 'error', 'server.shutdown.complete', 'Oplog server shutdown complete', {
    outcome,
    trigger,
    first_trigger: firstTrigger,
    exit_code: exitCode
  });
  process.exitCode = exitCode;
  process.stdin.pause();
}

function force(reason) {
  if (phase !== 'draining') return;
  phase = 'forcing';
  clearTimeout(graceTimer);
  writeLog('warn', 'server.shutdown.force', 'Forcing shutdown; clients and database cursors will be closed', {
    forced_by: reason,
    first_trigger: firstTrigger
  });
  forceTimer = setTimeout(() => {
    writeLog('error', 'server.shutdown.force_timeout', 'Forced shutdown did not settle before the final process deadline', {
      forced_by: reason
    });
    process.exit(1);
  }, 2000);

  Promise.all([forceSockets(), closeDataSources()]).then(
    () => complete('forced', reason, reason === 'deadline' ? 1 : 0),
    err => {
      writeLog('error', 'server.shutdown.force_error', 'Forced shutdown encountered an error', {
        forced_by: reason,
        error: err && err.message || String(err)
      });
      complete('forced', reason, 1);
    }
  );
}

function armInteractiveEOF() {
  process.stdin.resume();
  process.stdin.once('end', () => {
    if (stdinIsTTY && phase === 'draining' && firstTrigger === 'SIGINT') {
      force('stdin_eof');
    }
  });
}

function begin(trigger) {
  if (phase !== 'running') return;
  phase = 'draining';
  firstTrigger = trigger;
  signalCount = 1;
  writeLog('info', 'server.shutdown.requested', 'Socket.IO listener is closing and active clients are draining', {trigger});

  if (stdinIsTTY && trigger === 'SIGINT') {
    writeLog('info', 'server.shutdown.interactive', 'Press Ctrl-C again or Ctrl-D to force close', {trigger});
    armInteractiveEOF();
  }

  graceTimer = setTimeout(() => force('deadline'), graceMs);
  Promise.all([closeListener(), closeDataSources()]).then(
    () => {
      if (phase === 'draining') complete('graceful', trigger, 0);
    },
    err => {
      if (phase !== 'draining') return;
      writeLog('error', 'server.shutdown.drain_error', 'Graceful shutdown failed; escalating to force close', {
        trigger,
        error: err && err.message || String(err)
      });
      force('drain_error');
    }
  );
}

function onSignal(signal) {
  if (phase === 'running') {
    begin(signal);
    return;
  }
  if (phase === 'draining') {
    signalCount += 1;
    force(signal.toLowerCase());
  }
}

process.on('SIGINT', () => onSignal('SIGINT'));
process.on('SIGTERM', () => onSignal('SIGTERM'));
