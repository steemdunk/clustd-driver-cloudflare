import { DriverMachine, DriverClient } from 'clustd-lib';
import * as Cloudflare from 'cloudflare';
import { Config } from './config';

const cf = Cloudflare({
  email: Config.cloudflare.email,
  key: Config.cloudflare.api_key
});

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  value: string;
}

class CFDriver extends DriverMachine {

  private readonly recordIds: string[] = [];

  constructor() {
    super({
      id: 'driver-cloudflare',
      secret: Config.secret
    }, Config.host);


  }

  async init() {
    try {
      const recs = await this.findRecords();
      if (!recs.length) {
        this.logger.warn('No updatable records found, please check your configuration');
      } else {
        this.logger.info(`Found ${recs.length} updatable record${recs.length === 1 ? '' : 's'}`);
      }
    } catch (e) {
      this.logger.error('Failed to perform initial configuration check', e);
    }
  }

  async trigger(isMaster: boolean): Promise<void> {
    if (!isMaster) {
      return;
    }
    this.logger.info('Updating Cloudflare DNS Records');
    const recs = await this.findRecords();
    if (!recs.length) {
      this.logger.warn('No records found to update');
      return;
    }

    const newRec = Config.cloudflare.dns_record;
    for (const rec of recs) {
      const {id, type, name, value} = rec;
      this.logger.info(`Found record '${name}' with current value ${value} \
(type: ${type}, id: ${id})`);
      try {
        await cf.dnsRecords.edit(newRec.zone_id, id, {
          type,
          name,
          content: newRec.value,
          ttl: newRec.ttl,
          proxied: newRec.proxied
        });
        this.logger.info('Record successfully updated');
      } catch (e) {
        this.logger.error('Failed to update record', e);
      }
    }

  }

  async findRecords(): Promise<DnsRecord[]> {
    try {
      const confRec = Config.cloudflare.dns_record;
      const res = await cf.dnsRecords.browse(confRec.zone_id);
      const records: DnsRecord[] = [];
      for (const rec of res.result) {
        if (rec.name === confRec.name) {
          records.push({
            id: rec.id,
            type: rec.type,
            name: rec.name,
            value: rec.content
          });
        }
      }
      return records;
    } catch (e) {
      this.logger.error('Failed to find dns records', e.name, require('util').inspect(e));
      if (e.name === 'RequestError') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return await this.findRecords();
      } else {
        throw e;
      }
    }
  }
}

(async () => {
  const cfd = new CFDriver();
  await cfd.init();
  cfd.connect();
})();
