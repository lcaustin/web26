import * as migration_20260628_060000_add_google_id_safe from './20260628_060000_add_google_id_safe';

export const migrations = [
  {
    up: migration_20260628_060000_add_google_id_safe.up,
    down: migration_20260628_060000_add_google_id_safe.down,
    name: '20260628_060000_add_google_id_safe'
  },
];
