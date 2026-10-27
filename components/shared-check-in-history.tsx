import { checkInPresentation, formatCheckInTime, type CheckInHistoryPage } from "@/lib/journey-check-in-history";
import { AppIcon } from "./app-icon";
import styles from "./shared-check-in-history.module.css";

export function SharedCheckInHistory({ history, loading, onLoadEarlier }: {
  history: CheckInHistoryPage;
  loading: boolean;
  onLoadEarlier: () => void;
}) {
  return (
    <section className={styles.history} aria-labelledby="check-in-history-title">
      <div className={styles.heading}>
        <h2 id="check-in-history-title">Check-in history</h2>
        <p>Newest first · West Africa Time (WAT)</p>
      </div>
      {history.items.length ? (
        <ol id="check-in-history-list" className={styles.list} aria-label="Journey check-ins">
          {history.items.map((item) => {
            const config = checkInPresentation(item.type);
            return (
              <li key={item.id} className={item.type === "NEED_HELP" ? styles.danger : undefined}>
                <span className={styles.marker} aria-hidden="true"><AppIcon name={config.icon} size={16} /></span>
                <div className={styles.entry}>
                  <h3>{config.label}</h3>
                  <time dateTime={item.createdAt}>{formatCheckInTime(item.createdAt)}</time>
                  {item.message ? <blockquote>{item.message}</blockquote> : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : <p className={styles.empty}>No check-ins have been recorded for this journey yet.</p>}
      {history.nextCursor ? (
        <button type="button" className={styles.load} disabled={loading} onClick={onLoadEarlier} aria-controls="check-in-history-list">
          {loading ? "Loading earlier check-ins…" : "Show earlier check-ins"}
        </button>
      ) : null}
      <span className="sr-only" role="status">{loading ? "Loading earlier check-ins" : `${history.items.length} check-ins shown`}</span>
    </section>
  );
}
