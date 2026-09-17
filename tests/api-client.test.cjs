const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadClient(fetch, baseUrl = 'https://api.example.com/api') {
  const saved = new Map();
  const keychain = {
    ACCESSIBLE: {WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device'},
    async setGenericPassword(user, password) {saved.set('session', {password}); return true;},
    async getGenericPassword() {return saved.get('session') || false;},
    async resetGenericPassword() {saved.delete('session'); return true;},
  };
  const code = ts.transpileModule(fs.readFileSync('src/api/client.ts', 'utf8'), {
    compilerOptions: {esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, __DEV__: false, fetch, AbortController, FormData, setTimeout, clearTimeout,
    require(name) {
      if (name === 'react-native-keychain') return keychain;
      if (name === './config.json') return {baseUrl};
      throw new Error('Unexpected import ' + name);
    },
  });
  return {client: exports, saved};
}
const session = () => ({access_token: 'test-token', user: {id: 'user-1', name: 'Ana', email: 'ana@example.com'}});
const response = (status, data) => ({ok: status >= 200 && status < 300, status, text: async () => data === undefined ? '' : JSON.stringify(data)});

test('restores secure session and sends bearer token with JSON', async () => {
  let sent;
  const {client} = loadClient(async (url, options) => {sent = {url, options}; return response(200, {id: 'g1'});});
  await client.saveSession(client.makeSession(session()));
  const restored = await client.restoreSession();
  assert.equal(restored.user.user_metadata.name, 'Ana');
  await client.api('/goals', 'POST', {title: 'Viaje'});
  assert.equal(sent.url, 'https://api.example.com/api/goals');
  assert.equal(sent.options.headers.Authorization, 'Bearer test-token');
  assert.equal(sent.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(sent.options.body), {title: 'Viaje'});
});
test('401 clears session and notifies auth state', async () => {
  const {client, saved} = loadClient(async () => response(401, {message: 'Unauthenticated'}));
  await client.saveSession(client.makeSession(session()));
  let cleared = false;
  client.onSessionChange(value => {cleared = value === null;});
  await assert.rejects(client.api('/auth/me'), error => error.status === 401);
  assert.equal(saved.size, 0);
  assert.equal(cleared, true);
});
test('network failure keeps credentials for reconnecting', async () => {
  const {client, saved} = loadClient(async () => {throw new Error('offline');});
  await client.saveSession(client.makeSession(session()));
  await assert.rejects(client.api('/goals'), error => error.status === 0);
  assert.equal(saved.size, 1);
});
test('validation errors surface the first field message', async () => {
  const {client} = loadClient(async () => response(422, {errors: {amount: ['Monto inválido']}}));
  await assert.rejects(client.api('/goals'), error => error.status === 422 && error.message === 'Monto inválido');
});
test('multipart lets fetch choose its boundary and 204 returns no body', async () => {
  let sent;
  const {client} = loadClient(async (url, options) => {sent = options; return response(204);});
  const data = new FormData();
  data.append('file', 'photo');
  assert.equal(await client.api('/auth/avatar', 'POST', data), undefined);
  assert.equal(sent.headers['Content-Type'], undefined);
  assert.equal(sent.body, data);
});
test('production rejects missing URL or cleartext HTTP before sending a request', async () => {
  for (const url of ['', 'http://example.com/api']) {
    const {client} = loadClient(async () => {throw new Error('must not fetch');}, url);
    await assert.rejects(client.api('/goals'), error => error.status === 0);
  }
});
test('late 401 from previous login does not clear a new session', async () => {
  let complete;
  const {client, saved} = loadClient(() => new Promise(resolve => {complete = resolve;}));
  await client.saveSession(client.makeSession(session()));
  const pending = client.api('/goals');
  await client.saveSession(client.makeSession({...session(), access_token: 'new-token'}));
  complete(response(401, {}));
  await assert.rejects(pending, error => error.status === 401);
  assert.equal(JSON.parse(saved.get('session').password).access_token, 'new-token');
});
