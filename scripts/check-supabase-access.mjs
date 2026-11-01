import fs from 'node:fs';

const envFiles = ['.env', '.env.local', '.env.example'];
const acceptedKeys = [
  'VITE_SUPABASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];
const loaded = {};
const sources = {};

function parseEnvFile(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

for (const file of envFiles) {
  if (!fs.existsSync(file)) {
    console.log(`${file}: not present`);
    continue;
  }
  const values = parseEnvFile(fs.readFileSync(file, 'utf8'));
  const matchingNames = acceptedKeys.filter((name) => Object.hasOwn(values, name));
  console.log(`${file}: present; recognized variable names: ${matchingNames.join(', ') || 'none'}`);
  if (file !== '.env.example') {
    for (const name of matchingNames) {
      loaded[name] = values[name];
      sources[name] = file;
    }
  }
}

for (const name of acceptedKeys) {
  if (process.env[name]) {
    loaded[name] = process.env[name];
    sources[name] = 'process environment';
  }
}

const urlName = ['VITE_SUPABASE_URL', 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'].find((name) => loaded[name]);
const keyName = [
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
].find((name) => loaded[name]);
const projectUrl = urlName ? loaded[urlName].trim() : '';
const publicKey = keyName ? loaded[keyName].trim() : '';
const keyFormat = publicKey.startsWith('sb_publishable_')
  ? 'publishable key'
  : publicKey.startsWith('sb_secret_')
    ? 'secret key'
    : publicKey.startsWith('eyJ')
      ? 'JWT-format key'
      : publicKey ? 'unrecognized key format' : 'missing';
let jwtRole = '';
let jwtClaims = {};
if (keyFormat === 'JWT-format key') {
  try {
    jwtClaims = JSON.parse(Buffer.from(publicKey.split('.')[1], 'base64url').toString('utf8'));
    jwtRole = jwtClaims.role ?? '';
  } catch {
    // Key format is not a valid JWT; never print its contents.
  }
}
const privilegedKey = keyFormat === 'secret key' || ['service_role', 'supabase_admin'].includes(jwtRole);
let parsedUrl;
try {
  parsedUrl = new URL(projectUrl);
} catch {
  parsedUrl = null;
}
const validProtocol = parsedUrl?.protocol === 'https:'
  || (parsedUrl?.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsedUrl.hostname));
const validUrl = Boolean(validProtocol && parsedUrl.hostname && !/your-project|placeholder/i.test(parsedUrl.hostname));
const validKey = Boolean(publicKey.length > 20 && !/placeholder|your-supabase/i.test(publicKey) && !privilegedKey);
const urlProjectRef = parsedUrl?.hostname.endsWith('.supabase.co') ? parsedUrl.hostname.split('.')[0] : '';
const jwtProjectMatchesUrl = jwtClaims.ref && urlProjectRef ? jwtClaims.ref === urlProjectRef : null;
const jwtExpired = Number.isFinite(jwtClaims.exp) ? jwtClaims.exp * 1000 <= Date.now() : null;

console.log(`Usable project URL and public anon/publishable key: ${validUrl && validKey ? 'yes' : 'no'}`);
console.log(`Selected configuration source: ${urlName ? sources[urlName] : 'URL missing'}; ${keyName ? sources[keyName] : 'public key missing'}`);
console.log(`Key format check: ${privilegedKey ? 'privileged key detected; request blocked' : keyFormat}`);
if (keyFormat === 'JWT-format key') {
  console.log(`JWT role check: ${jwtRole || 'not present'}; URL project match: ${jwtProjectMatchesUrl === null ? 'not verifiable' : jwtProjectMatchesUrl ? 'yes' : 'no'}; expired: ${jwtExpired === null ? 'not verifiable' : jwtExpired ? 'yes' : 'no'}`);
}

if (!(validUrl && validKey)) {
  console.log(privilegedKey
    ? 'No request sent. Use the project anon/publishable key; service-role/secret keys must not be used by this check or browser code.'
    : 'No request sent. Set a real project URL and public anon/publishable key in .env or .env.local.');
  process.exitCode = 2;
} else {
  try {
    const response = await fetch(`${projectUrl.replace(/\/$/, '')}/rest/v1/`, {
      headers: { apikey: publicKey, accept: 'application/openapi+json' },
      signal: AbortSignal.timeout(12000),
    });
    console.log(`Read-only PostgREST root response: HTTP ${response.status}`);
    if (response.ok) {
      let paths = [];
      try {
        const specification = await response.json();
        paths = Object.keys(specification.paths ?? {}).filter((path) => path !== '/' && !path.startsWith('/rpc/')).sort();
      } catch {
        // A successful HTTP response still confirms endpoint reachability; the API spec may be disabled.
      }
      console.log(`Public REST endpoints advertised: ${paths.length ? paths.join(', ') : 'none (schema exposure may be disabled)'}`);
      console.log('Result: the project endpoint is reachable and accepted the supplied public API key for this read-only request.');
      console.log('This does not bypass RLS or prove access to private tables/data.');
    } else {
      if (response.status === 401) {
        console.log('Gateway diagnosis: unauthorized. The URL is reachable, but this request was not accepted. The key may be invalid, from a different project, or not the anon/publishable key.');
      }
      console.log('Result: endpoint/key validation did not succeed. No project data was read.');
      process.exitCode = 1;
    }
  } catch (error) {
    console.log(`Read-only request failed: ${error instanceof Error ? error.name : 'network error'}`);
    console.log('No project data was read. Check the URL, DNS/network access, and Supabase API availability.');
    process.exitCode = 1;
  }
}
