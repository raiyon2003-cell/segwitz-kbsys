/**
 * Document audit log: pure diff/plan, Supabase write helpers, and read queries.
 * DB table: public.document_activity_log
 */

export {
  planDocumentUpdateLogEntries,
  toDocumentRowSnapshot,
} from "./diff";
export type {
  DocumentFormPayload,
  DocumentRowSnapshot,
  ActivityLogEntry,
} from "./diff";

export {
  tryLogDocumentActivity,
  tryLogDocumentActivities,
} from "./log-writer";

export {
  getActivityLogPaginated,
} from "./queries";
export type { ActivityLogPageResult } from "./queries";
