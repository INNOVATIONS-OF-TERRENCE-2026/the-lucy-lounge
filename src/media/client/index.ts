// =============================================================================
// THE LUCY LOUNGE - MEDIA CLIENT INDEX
// =============================================================================
// Unified exports for the Media Graph Client and Ingestion Pipeline
// =============================================================================

// Media Graph Client
export {
  MediaGraphClient,
  mediaGraphClient,
  createMediaGraphClient,
  type IngestResult,
  type BatchIngestResult,
  type SearchFilters,
  type PaginationParams,
} from './MediaGraphClient';

// Ingestion Pipeline
export {
  ContentIngestionPipeline,
  createIngestionPipeline,
  createSyncJob,
  DEFAULT_INGESTION_CONFIG,
  DEFAULT_SYNC_SCHEDULES,
  type IngestionConfig,
  type IngestionProgress,
  type IngestionResult,
  type SyncSchedule,
} from './IngestionPipeline';
