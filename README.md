# Clustd Cloudflare Driver

A driver to automatically update DNS records when a server goes down. This is useful for front ends that need to switch servers automatically in order to remain online.

## Configuration

```yml
host: ws://127.0.0.1:3001
secret: 'cluster secret'
cloudflare:
  email: -email-
  api_key: -api key-
  dns_record:
    zone_id: -zone id-
    name: mydomain.com
    value: 1.2.3.4
    ttl: 1 # 1 means auto
    proxied: true # Whether to proxy traffic through cloudflare

```

## clustd

Find the other projects below to get started setting up your cluster.

- clustd daemon: https://github.com/steemdunk/clustd
- clustd library: https://github.com/steemdunk/clustd-lib
