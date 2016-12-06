require('dotenv').config({silent:true})

export default {
  APP_NAME: process.env.APP_NAME || 'cognicity-server',
  API_REPORTS_TIME_WINDOW: process.env.API_REPORTS_TIME_WINDOW || 3600,
  API_REPORTS_LIMIT: process.env.API_REPORTS_LIMIT,
  API_FLOODGAUGE_REPORTS_TIME_WINDOW: process.env.API_FLOODGAUGE_REPORTS_TIME_WINDOW || 3600,
  API_FLOODGAUGE_REPORTS_LIMIT: process.env.API_FLOODGAUGE_REPORTS_LIMIT,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  BODY_LIMIT: process.env.BODY_LIMIT || '100kb',
  CACHE: process.env.CACHE === 'true' || false,
  COMPRESS: process.env.COMPRESS === 'true' || false,
  CORS: process.env.CORS === 'true' || false,
  CORS_HEADERS: process.env.CORS_HEADERS || ['Link'],
  DB_HOSTNAME: process.env.DB_HOSTNAME || '127.0.0.1',
  DB_NAME: process.env.DB_NAME || 'cognicity',
  DB_PASSWORD: process.env.DB_PASSWORD || 'p@ssw0rd',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_SSL: process.env.DB_SSL === 'true' || false,
  DB_TIMEOUT: process.env.DB_TIMEOUT || 10000,
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  FORMAT_DEFAULT: process.env.GEO_FORMAT_DEFAULT || 'json',
  FORMATS: (process.env.GEO_FORMATS || 'json,xml').split(','),
  GEO_FORMAT_DEFAULT: process.env.GEO_FORMAT_DEFAULT || 'topojson',
  GEO_FORMATS: (process.env.GEO_FORMATS || 'geojson,topojson,cap').split(','),
  GEO_PRECISION: process.env.GEO_PRECISION || 10,
  INFRASTRUCTURE_TYPES: (process.env.INFRASTRUCTURE_TYPES || 'floodgates,pumps,waterways').split(','),
  LOG_CONSOLE: process.env.LOG_CONSOLE === 'true' || false,
  LOG_DIR: process.env.LOG_DIR || '',
  LOG_JSON: process.env.LOG_JSON === 'true' || false,
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  LOG_MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || 1024 * 1024 * 100,
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 8001,
  REGION_CODES: (process.env.REGION_CODES || 'jbd,bdg,sby').split(','),
  RESPONSE_TIME: process.env.RESPONSE_TIME === 'true' || false,
  TABLE_FLOODGAUGE_REPORTS: process.env.TABLE_FLOODGAUGE_REPORTS || 'floodgauge.reports',
  TABLE_FEEDS_QLUE: process.env.TABLE_FEEDS_QLUE || 'qlue.reports',
  TABLE_GRASP_CARDS: process.env.TABLE_GRASP_CARDS || 'grasp.cards',
  TABLE_GRASP_LOG: process.env.TABLE_GRASP_LOG || 'grasp.log',
  TABLE_GRASP_REPORTS: process.env.TABLE_GRASP_REPORTS || 'grasp.reports',
  TABLE_GRASP_REPORT_IMAGES: process.env.TABLE_GRASP_REPORT_IMAGES || 'grasp.images',
  TABLE_INSTANCE_REGIONS: process.env.TABLE_INSTANCE_REGIONS || 'cognicity.instance_regions',
  TABLE_LOCAL_AREAS: process.env.TABLE_LOCAL_AREAS || 'cognicity.local_areas',
  TABLE_REM_STATUS: process.env.TABLE_REM_STATUS || 'cognicity.rem_status',
  TABLE_REM_STATUS_LOG: process.env.TABLE_REM_STATUS_LOG || 'cognicity.rem_status_log',
  TABLE_REPORTS: process.env.TABLE_REPORTS || 'cognicity.all_reports',
}
