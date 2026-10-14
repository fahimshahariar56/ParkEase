import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/env.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('Error handler diagnostics', () => {
  it('logs safe route and operation diagnostics without exposing secrets or request data', () => {
    const originalError = console.error;
    const originalNodeEnv = env.NODE_ENV;
    let loggedMessage;
    console.error = (...args) => { loggedMessage = args.join(' '); };
    env.NODE_ENV = 'production';

    let response;
    const res = {
      locals: { operation: 'auth.loginCustomer' },
      status(statusCode) {
        response = { statusCode };
        return this;
      },
      json(body) {
        response.body = body;
        return this;
      },
    };

    try {
      errorHandler(
        Object.assign(new Error('Database password=private-value'), {
          code: 'ER_NO_SUCH_TABLE',
          sqlState: '42S02',
          sql: 'SELECT * FROM users',
        }),
        {
          method: 'POST',
          originalUrl: '/api/v1/auth/customer/login?password=query-value',
          body: { password: 'request-value' },
        },
        res,
        () => assert.fail('The error handler must finish the response')
      );
    } finally {
      console.error = originalError;
      env.NODE_ENV = originalNodeEnv;
    }

    assert.match(loggedMessage, /auth\.loginCustomer/);
    assert.match(loggedMessage, /ER_NO_SUCH_TABLE/);
    assert.match(loggedMessage, /42S02/);
    assert.match(loggedMessage, /Database password=\[REDACTED\]/);
    assert.match(loggedMessage, /"route":"\/api\/v1\/auth\/customer\/login"/);
    assert.doesNotMatch(loggedMessage, /private-value|query-value|request-value|SELECT \* FROM users/);
    assert.equal(response.statusCode, 500);
    assert.equal(response.body.success, false);
    assert.equal(response.body.debug, undefined);
  });

  it('does not log expected client errors', () => {
    const originalError = console.error;
    let wasLogged = false;
    console.error = () => { wasLogged = true; };

    try {
      errorHandler(
        Object.assign(new Error('Invalid email or password.'), { status: 401 }),
        { method: 'POST', originalUrl: '/api/v1/auth/customer/login' },
        {
          locals: {},
          status() { return this; },
          json() {},
        },
        () => assert.fail('The error handler must finish the response')
      );
    } finally {
      console.error = originalError;
    }

    assert.equal(wasLogged, false);
  });
});
