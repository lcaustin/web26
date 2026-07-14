import * as migration_20260628_060000_add_google_id_safe from './20260628_060000_add_google_id_safe';
import * as migration_20260629_010000_add_device_tokens_safe from './20260629_010000_add_device_tokens_safe';
import * as migration_20260712_045033_add_bulletins from './20260712_045033_add_bulletins';
import * as migration_20260712_150000_add_videos from './20260712_150000_add_videos';
import * as migration_20260712_160000_rename_video_category from './20260712_160000_rename_video_category';
import * as migration_20260713_000000_use_english_video_category from './20260713_000000_use_english_video_category';
import * as migration_20260713_001000_rename_offering_song_category from './20260713_001000_rename_offering_song_category';
import * as migration_20260713_002000_limit_sermon_category from './20260713_002000_limit_sermon_category';
import * as migration_20260713_003000_classify_sermons_by_title from './20260713_003000_classify_sermons_by_title';
import * as migration_20260713_010000_add_service_time_admin_title from './20260713_010000_add_service_time_admin_title';
import * as migration_20260713_011000_add_service_time_group from './20260713_011000_add_service_time_group';

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
  {
    up: migration_20260712_160000_rename_video_category.up,
    down: migration_20260712_160000_rename_video_category.down,
    name: '20260712_160000_rename_video_category',
  },
  {
    up: migration_20260713_000000_use_english_video_category.up,
    down: migration_20260713_000000_use_english_video_category.down,
    name: '20260713_000000_use_english_video_category',
  },
  {
    up: migration_20260713_001000_rename_offering_song_category.up,
    down: migration_20260713_001000_rename_offering_song_category.down,
    name: '20260713_001000_rename_offering_song_category',
  },
  {
    up: migration_20260713_002000_limit_sermon_category.up,
    down: migration_20260713_002000_limit_sermon_category.down,
    name: '20260713_002000_limit_sermon_category',
  },
  {
    up: migration_20260713_003000_classify_sermons_by_title.up,
    down: migration_20260713_003000_classify_sermons_by_title.down,
    name: '20260713_003000_classify_sermons_by_title',
  },
  {
    up: migration_20260713_010000_add_service_time_admin_title.up,
    down: migration_20260713_010000_add_service_time_admin_title.down,
    name: '20260713_010000_add_service_time_admin_title',
  },
  {
    up: migration_20260713_011000_add_service_time_group.up,
    down: migration_20260713_011000_add_service_time_group.down,
    name: '20260713_011000_add_service_time_group',
  },
];
