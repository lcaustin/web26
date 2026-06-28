import * as migration_20260628_052113_add_google_id from './20260628_052113_add_google_id';

export const migrations = [
  {
    up: migration_20260628_052113_add_google_id.up,
    down: migration_20260628_052113_add_google_id.down,
    name: '20260628_052113_add_google_id'
  },
];
