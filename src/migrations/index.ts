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
import * as migration_20260713_012000_add_staff from './20260713_012000_add_staff';
import * as migration_20260713_013000_update_staff_import_fields from './20260713_013000_update_staff_import_fields';
import * as migration_20260714_010000_add_training_pages from './20260714_010000_add_training_pages';
import * as migration_20260714_011000_add_mission_page from './20260714_011000_add_mission_page';
import * as migration_20260714_012000_add_mission_table_data from './20260714_012000_add_mission_table_data';
import * as migration_20260714_013000_add_department_hero_media from './20260714_013000_add_department_hero_media';
import * as migration_20260714_014000_add_photo_gallery from './20260714_014000_add_photo_gallery';
import * as migration_20260716_000000_add_bulletin_news_source from './20260716_000000_add_bulletin_news_source';
import * as migration_20260719_043825_add_hero_background_videos from './20260719_043825_add_hero_background_videos';
import * as migration_20260719_060000_add_video_english_title from './20260719_060000_add_video_english_title';
import * as migration_20260719_061000_backfill_sermon_english_titles from './20260719_061000_backfill_sermon_english_titles';
import * as migration_20260719_062000_add_video_sync_unique_index from './20260719_062000_add_video_sync_unique_index';
import * as migration_20260719_070000_add_registration_page from './20260719_070000_add_registration_page';
import * as migration_20260719_071000_refine_registration_page from './20260719_071000_refine_registration_page';
import * as migration_20260719_072000_use_r2_registration_images from './20260719_072000_use_r2_registration_images';
import * as migration_20260720_000000_add_news_categories from './20260720_000000_add_news_categories';
import * as migration_20260720_001000_restore_video_sync_unique_index from './20260720_001000_restore_video_sync_unique_index';

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
  {
    up: migration_20260713_012000_add_staff.up,
    down: migration_20260713_012000_add_staff.down,
    name: '20260713_012000_add_staff',
  },
  {
    up: migration_20260713_013000_update_staff_import_fields.up,
    down: migration_20260713_013000_update_staff_import_fields.down,
    name: '20260713_013000_update_staff_import_fields',
  },
  {
    up: migration_20260714_010000_add_training_pages.up,
    down: migration_20260714_010000_add_training_pages.down,
    name: '20260714_010000_add_training_pages',
  },
  {
    up: migration_20260714_011000_add_mission_page.up,
    down: migration_20260714_011000_add_mission_page.down,
    name: '20260714_011000_add_mission_page',
  },
  {
    up: migration_20260714_012000_add_mission_table_data.up,
    down: migration_20260714_012000_add_mission_table_data.down,
    name: '20260714_012000_add_mission_table_data',
  },
  {
    up: migration_20260714_013000_add_department_hero_media.up,
    down: migration_20260714_013000_add_department_hero_media.down,
    name: '20260714_013000_add_department_hero_media',
  },
  {
    up: migration_20260714_014000_add_photo_gallery.up,
    down: migration_20260714_014000_add_photo_gallery.down,
    name: '20260714_014000_add_photo_gallery',
  },
  {
    up: migration_20260716_000000_add_bulletin_news_source.up,
    down: migration_20260716_000000_add_bulletin_news_source.down,
    name: '20260716_000000_add_bulletin_news_source',
  },
  {
    up: migration_20260719_043825_add_hero_background_videos.up,
    down: migration_20260719_043825_add_hero_background_videos.down,
    name: '20260719_043825_add_hero_background_videos'
  },
  {
    up: migration_20260719_060000_add_video_english_title.up,
    down: migration_20260719_060000_add_video_english_title.down,
    name: '20260719_060000_add_video_english_title',
  },
  {
    up: migration_20260719_061000_backfill_sermon_english_titles.up,
    down: migration_20260719_061000_backfill_sermon_english_titles.down,
    name: '20260719_061000_backfill_sermon_english_titles',
  },
  {
    up: migration_20260719_062000_add_video_sync_unique_index.up,
    down: migration_20260719_062000_add_video_sync_unique_index.down,
    name: '20260719_062000_add_video_sync_unique_index',
  },
  {
    up: migration_20260719_070000_add_registration_page.up,
    down: migration_20260719_070000_add_registration_page.down,
    name: '20260719_070000_add_registration_page',
  },
  {
    up: migration_20260719_071000_refine_registration_page.up,
    down: migration_20260719_071000_refine_registration_page.down,
    name: '20260719_071000_refine_registration_page',
  },
  {
    up: migration_20260719_072000_use_r2_registration_images.up,
    down: migration_20260719_072000_use_r2_registration_images.down,
    name: '20260719_072000_use_r2_registration_images',
  },
  {
    up: migration_20260720_000000_add_news_categories.up,
    down: migration_20260720_000000_add_news_categories.down,
    name: '20260720_000000_add_news_categories',
  },
  {
    up: migration_20260720_001000_restore_video_sync_unique_index.up,
    down: migration_20260720_001000_restore_video_sync_unique_index.down,
    name: '20260720_001000_restore_video_sync_unique_index',
  },
];
