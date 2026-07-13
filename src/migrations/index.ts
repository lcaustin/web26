import * as migration_20260628_060000_add_google_id_safe from './20260628_060000_add_google_id_safe';
import * as migration_20260629_010000_add_device_tokens_safe from './20260629_010000_add_device_tokens_safe';
import * as migration_20260712_045033_add_bulletins from './20260712_045033_add_bulletins';
import * as migration_20260712_150000_add_videos from './20260712_150000_add_videos';

export const migrations = [
  {
    up: migration_20260628_060000_add_google_id_safe.up,
    down: migration_20260628_060000_add_google_id_safe.down,
    name: '20260628_060000_add_google_id_safe',
  },
  {
    up: migration_20260629_010000_add_device_tokens_safe.up,
    down: migration_20260629_010000_add_device_tokens_safe.down,
    name: '20260629_010000_add_device_tokens_safe',
  },
  {
    up: migration_20260712_045033_add_bulletins.up,
    down: migration_20260712_045033_add_bulletins.down,
    name: '20260712_045033_add_bulletins',
  },
  {
    up: migration_20260712_150000_add_videos.up,
    down: migration_20260712_150000_add_videos.down,
    name: '20260712_150000_add_videos',
  },
];
