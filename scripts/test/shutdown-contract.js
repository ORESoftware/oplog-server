#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {spawn} = require('child_process');
const {EventEmitter} = require('events');
const Module = require('module');
const path = require('path');

if (process.env.SHUTDOWN_CHILD === '1') {
  const scenario = process.env.SCENARIO;
  const connections = new Map();
  const httpServer = {
    listening: true,
    close(cb) {
      this.listening = false;
      const poll = () => connections.size === 0 ? cb() : setTimeout(poll, 10);
      poll();
    }
  };
  const io = {
    httpServer,
    close(cb) {
      for (const socket of connections.values()) socket.disconnect(true);
      setImmediate(cb);
    }
  };
  const resource = () => ({close: () => Promise.resolve()});
  const logger = {};
  for (const level of ['info', 'warn', 'error']) {
    logger[level] = value => process.stdout.write(String(value) + '\n');
  }

  Object.defineProperty(process.stdin, 'isTTY', {
    configurable: true,
    value: process.env.STDIN_IS_TTY === '1'
  });

  const originalLoad = Module._load;
  Module._load = function (request) {
    if (request === 'bunion') return {__esModule: true, default: logger};
    if (request === './dist/index') return {};
    if (request === './dist/socket-server') return {connections, io};
    if (request === './dist/mongo-client') return {client: resource()};
    if (request === './dist/oplog') return {oplog: resource()};
    return originalLoad.apply(this, arguments);
  };

  require(path.resolve(process.argv[2]));
  if (['active-drain', 'force-sigint', 'force-eof', 'deadline'].includes(scenario)) {
    connections.set('client', {
      disconnect() { connections.delete('client'); }
    });
    if (scenario === 'active-drain') {
      setTimeout(() => connections.delete('client'), 120);
    }
  }
  process.stdout.write(JSON.stringify({event: 'child.ready'}) + '\n');
  setInterval(() => {}, 1000);
  return;
}

const modulePath = path.resolve(process.argv[2]);

function run(name, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [__filename, modulePath], {
      env: Object.assign({}, process.env, {
        SHUTDOWN_CHILD: '1',
        SCENARIO: name,
        STDIN_IS_TTY: options.tty ? '1' : '0',
        SHUTDOWN_GRACE_MS: String(options.graceMs || 400)
      }),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let ready = false;

    child.stdout.on('data', chunk => {
      stdout += chunk;
      if (!ready && stdout.includes('child.ready')) {
        ready = true;
        options.drive(child);
      }
    });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (!ready) {
        reject(new Error(`${name}: never became ready\n${stderr}`));
        return;
      }
      try {
        options.check({code, signal, stdout, stderr});
        resolve();
      }
      catch (err) {
        reject(err);
      }
    });
    setTimeout(() => {
      if (!ready) child.kill('SIGKILL');
    }, 3000).unref();
  });
}

function has(result, needle) {
  assert(result.stdout.includes(needle), `${needle} missing\n${result.stdout}\n${result.stderr}`);
}

(async () => {
  await run('non-tty-sigterm', {
    tty: false,
    drive: child => child.kill('SIGTERM'),
    check: result => {
      assert.strictEqual(result.code, 0);
      has(result, '"outcome":"graceful"');
      has(result, '"trigger":"SIGTERM"');
    }
  });

  await run('active-drain', {
    tty: false,
    drive: child => child.kill('SIGTERM'),
    check: result => {
      assert.strictEqual(result.code, 0);
      has(result, '"outcome":"graceful"');
      has(result, '"trigger":"SIGTERM"');
    }
  });

  await run('tty-sigterm', {
    tty: true,
    drive: child => child.kill('SIGTERM'),
    check: result => {
      assert.strictEqual(result.code, 0);
      has(result, '"outcome":"graceful"');
      assert(!result.stdout.includes('server.shutdown.interactive'));
    }
  });

  await run('force-sigint', {
    tty: true,
    drive: child => {
      child.kill('SIGINT');
      setTimeout(() => child.kill('SIGINT'), 60);
    },
    check: result => {
      assert.strictEqual(result.code, 0);
      has(result, '"outcome":"forced"');
      has(result, '"trigger":"sigint"');
    }
  });

  await run('force-eof', {
    tty: true,
    drive: child => {
      child.kill('SIGINT');
      setTimeout(() => child.stdin.end(), 60);
    },
    check: result => {
      assert.strictEqual(result.code, 0);
      has(result, '"trigger":"stdin_eof"');
    }
  });

  await run('non-tty-eof', {
    tty: false,
    drive: child => {
      child.stdin.end();
      setTimeout(() => child.kill('SIGTERM'), 80);
    },
    check: result => {
      assert.strictEqual(result.code, 0);
      has(result, '"trigger":"SIGTERM"');
      assert(!result.stdout.includes('stdin_eof'));
    }
  });

  await run('deadline', {
    tty: false,
    graceMs: 80,
    drive: child => child.kill('SIGTERM'),
    check: result => {
      assert.strictEqual(result.code, 1);
      has(result, '"trigger":"deadline"');
    }
  });

  console.log('shutdown wrapper scenarios passed');
})().catch(err => {
  console.error(err.stack || err);
  process.exitCode = 1;
});
