import * as assert from 'assert';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

export interface DnsRecordConfig {
  zone_id: string;
  name: string;
  value: string;
  ttl: number;
  proxied: boolean;
}

export interface CloudflareConfig {
  email: string;
  api_key: string;
  dns_record: DnsRecordConfig;
}

export interface Config {
  host: string;
  secret: string;
  cloudflare: CloudflareConfig;
}

export const Config: Config = {} as any;
if (process.env.NODE_ENV !== 'TEST') {
  const file = process.env.CLUSTD_CONFIG || 'config.yml';
  const data = fs.readFileSync(file).toString('utf8');
  const raw = yaml.safeLoad(data);
  setConfig(raw);
}

export function setConfig(conf: Config) {
  Object.assign(Config, conf);
  validate();
}

function validate() {
  assert(Config.host, 'missing host config');
  assert(Config.secret, 'missing cluster secret config');

  const cf = Config.cloudflare;
  assert(cf, 'missing cloudflare config');
  assert(cf.email, 'missing cloudflare.email config');
  assert(cf.api_key, 'missing cloudflare.api_key config');

  assert(cf.dns_record, 'missing cloudflare.dns_record config');
  assert(cf.dns_record.zone_id, 'missing cloudflare.dns_record.zone_id config');
  assert(cf.dns_record.name, 'missing cloudflare.dns_record.name config');
  assert(cf.dns_record.value, 'missing cloudflare.dns_record.value config');
  assert(cf.dns_record.ttl, 'missing cloudflare.dns_record.ttl config');
  assert(cf.dns_record.proxied, 'missing cloudflare.dns_record.proxied config');
}
