import { useState, useEffect } from "react";

// ─── tiny helpers ──────────────────────────────────────────────────────────
const API = "/api";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

// ─── StarRating ────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false, size = 32 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  const labels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            style={{
              background: "none",
              border: "none",
              cursor: readonly ? "default" : "pointer",
              padding: 2,
              transition: "transform 0.15s",
              transform: !readonly && hovered >= star ? "scale(1.2)" : "scale(1)",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24">
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={active >= star ? "#F59E0B" : "none"}
                stroke={active >= star ? "#F59E0B" : "#CBD5E1"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      {!readonly && active > 0 && (
        <span style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, letterSpacing: 0.5 }}>
          {labels[active - 1]}
        </span>
      )}
    </div>
  );
}

// ─── ReviewModal ────────────────────────────────────────────────────────────
// Props:
//   booking   – { _id, provider: { _id, name, profilePhoto }, completedAt, serviceTitle }
//   onClose   – fn()
//   onSuccess – fn(review)
export function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating]           = useState(0);
  const [comment, setComment]         = useState("");
  const [recommended, setRecommended] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const provider = booking?.provider ?? {};

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ bookingId: booking._id, rating, comment, recommended }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSuccess?.(data.data);
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerText}>
            <h2 style={styles.title}>Rate Your Experience</h2>
            <p style={styles.subtitle}>{booking?.serviceTitle ?? "Service"}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Provider info */}
        <div style={styles.providerRow}>
          <ProviderAvatar provider={provider} />
          <div>
            <div style={styles.providerName}>{provider.name}</div>
            <div style={styles.providerLabel}>Service Provider</div>
          </div>
        </div>

        {/* Stars */}
        <div style={styles.section}>
          <StarRating value={rating} onChange={setRating} size={36} />
        </div>

        {/* Comment */}
        <div style={styles.section}>
          <label style={styles.label}>Your Review <span style={styles.optional}>(optional)</span></label>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Share details about your experience…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.charCount}>{comment.length}/1000</div>
        </div>

        {/* Recommend toggle */}
        <div style={styles.section}>
          <label style={styles.label}>Would you recommend this provider?</label>
          <div style={styles.toggleRow}>
            {[true, false].map(val => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setRecommended(val)}
                style={{
                  ...styles.toggleBtn,
                  ...(recommended === val ? styles.toggleActive : {}),
                }}
              >
                {val ? "👍 Yes" : "👎 No"}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Skip for Now
          </button>
          <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? "Submitting…" : "Submit Review"}
          </button>
        </div>

        <p style={styles.editNote}>You can edit this review within 48 hours of submission.</p>
      </div>
    </Overlay>
  );
}

// ─── EditReviewModal ─────────────────────────────────────────────────────────
// Props:
//   review    – existing review object (with isEditable, editableUntil)
//   onClose   – fn()
//   onSuccess – fn(updatedReview)
export function EditReviewModal({ review, onClose, onSuccess }) {
  const [rating, setRating]           = useState(review?.rating ?? 0);
  const [comment, setComment]         = useState(review?.comment ?? "");
  const [recommended, setRecommended] = useState(review?.recommended ?? true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const timeLeft = review?.editableUntil
    ? Math.max(0, new Date(review.editableUntil) - Date.now())
    : 0;

  const hoursLeft = Math.floor(timeLeft / 3_600_000);
  const minutesLeft = Math.floor((timeLeft % 3_600_000) / 60_000);

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/reviews/${review._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ rating, comment, recommended }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSuccess?.(data.data);
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!review?.isEditable) {
    return (
      <Overlay onClose={onClose}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Review</h2>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <StarRating value={review?.rating} readonly size={28} />
            {review?.comment && <p style={{ marginTop: 16, color: "#475569" }}>{review.comment}</p>}
            <div style={{ ...styles.editNote, marginTop: 16, color: "#EF4444" }}>
              The 48-hour edit window has expired.
            </div>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerText}>
            <h2 style={styles.title}>Edit Your Review</h2>
            <p style={{ ...styles.subtitle, color: "#F59E0B" }}>
              ⏱ {hoursLeft}h {minutesLeft}m left to edit
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.section}>
          <StarRating value={rating} onChange={setRating} size={36} />
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Your Review <span style={styles.optional}>(optional)</span></label>
          <textarea
            rows={4}
            maxLength={1000}
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.charCount}>{comment.length}/1000</div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Would you recommend this provider?</label>
          <div style={styles.toggleRow}>
            {[true, false].map(val => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setRecommended(val)}
                style={{
                  ...styles.toggleBtn,
                  ...(recommended === val ? styles.toggleActive : {}),
                }}
              >
                {val ? "👍 Yes" : "👎 No"}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── ReviewButton ─────────────────────────────────────────────────────────
// Drop-in button for Booking cards.
// Works for both "Book Now" flow and "After Bid" flow.
// Usage: <ReviewButton booking={booking} />
export function ReviewButton({ booking }) {
  const [modal, setModal]   = useState(null); // null | 'create' | 'edit'
  const [review, setReview] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (booking?.status !== "completed") return;
    // Fetch existing review for this booking
    fetch(`${API}/reviews/my-review/${booking._id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setReview(d.data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [booking?._id, booking?.status]);

  if (booking?.status !== "completed" || !loaded) return null;

  if (!review) {
    return (
      <>
        <button style={styles.reviewTrigger} onClick={() => setModal("create")}>
          ⭐ Rate & Review
        </button>
        {modal === "create" && (
          <ReviewModal
            booking={booking}
            onClose={() => setModal(null)}
            onSuccess={r => setReview(r)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        style={{ ...styles.reviewTrigger, background: "#F0FDF4", color: "#16A34A", borderColor: "#86EFAC" }}
        onClick={() => setModal("edit")}
      >
        {review.isEditable ? "✏️ Edit Review" : "✅ Reviewed"}
      </button>
      {modal === "edit" && (
        <EditReviewModal
          review={review}
          onClose={() => setModal(null)}
          onSuccess={r => setReview(r)}
        />
      )}
    </>
  );
}

// ─── PendingReviewsBanner ──────────────────────────────────────────────────
// Show at the top of the customer dashboard when there are unreviewed bookings
export function PendingReviewsBanner() {
  const [pending, setPending] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetch(`${API}/reviews/pending`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setPending(d.data); });
  }, []);

  if (!pending.length) return null;

  return (
    <div style={styles.banner}>
      <span style={styles.bannerText}>
        🔔 You have <strong>{pending.length}</strong> completed service{pending.length > 1 ? "s" : ""} awaiting your review
      </span>
      <button style={styles.bannerBtn} onClick={() => setCurrent(pending[0])}>
        Review Now
      </button>

      {current && (
        <ReviewModal
          booking={current}
          onClose={() => setCurrent(null)}
          onSuccess={() => {
            const remaining = pending.filter(b => b._id !== current._id);
            setPending(remaining);
            setCurrent(remaining[0] ?? null);
          }}
        />
      )}
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      {children}
    </div>
  );
}

function ProviderAvatar({ provider }) {
  return provider?.profilePhoto ? (
    <img
      src={provider.profilePhoto}
      alt={provider.name}
      style={styles.avatar}
    />
  ) : (
    <div style={{ ...styles.avatar, background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
      {provider?.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 32px",
    width: "100%", maxWidth: 480,
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
    position: "relative",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20,
  },
  headerText: { display: "flex", flexDirection: "column", gap: 2 },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: "#0F172A" },
  subtitle: { margin: 0, fontSize: 13, color: "#64748B" },
  closeBtn: {
    background: "none", border: "none", fontSize: 18, cursor: "pointer",
    color: "#94A3B8", padding: 4, borderRadius: 8,
    transition: "color 0.15s",
  },
  providerRow: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 16px", background: "#F8FAFC",
    borderRadius: 12, marginBottom: 20,
  },
  avatar: {
    width: 48, height: 48, borderRadius: "50%",
    objectFit: "cover", border: "2px solid #E2E8F0",
  },
  providerName: { fontWeight: 600, color: "#1E293B", fontSize: 15 },
  providerLabel: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  section: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  optional: { fontWeight: 400, color: "#9CA3AF" },
  textarea: {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", fontSize: 14, color: "#1E293B",
    border: "1.5px solid #E2E8F0", borderRadius: 10,
    resize: "vertical", outline: "none",
    fontFamily: "inherit", lineHeight: 1.5,
    transition: "border-color 0.15s",
  },
  charCount: { fontSize: 11, color: "#CBD5E1", textAlign: "right", marginTop: 4 },
  toggleRow: { display: "flex", gap: 10 },
  toggleBtn: {
    flex: 1, padding: "10px 0",
    border: "1.5px solid #E2E8F0", borderRadius: 10,
    background: "#F8FAFC", cursor: "pointer",
    fontSize: 14, fontWeight: 500, color: "#374151",
    transition: "all 0.15s",
  },
  toggleActive: {
    background: "#EFF6FF", borderColor: "#3B82F6", color: "#1D4ED8",
  },
  error: {
    background: "#FEF2F2", color: "#DC2626",
    border: "1px solid #FECACA", borderRadius: 8,
    padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  actions: { display: "flex", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, padding: "11px 0",
    border: "1.5px solid #E2E8F0", borderRadius: 10,
    background: "#fff", cursor: "pointer",
    fontSize: 14, fontWeight: 500, color: "#64748B",
  },
  submitBtn: {
    flex: 2, padding: "11px 0",
    border: "none", borderRadius: 10,
    background: "#2563EB", cursor: "pointer",
    fontSize: 14, fontWeight: 600, color: "#fff",
    transition: "background 0.15s",
    opacity: 1,
  },
  editNote: { fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 12, marginBottom: 0 },
  reviewTrigger: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 8,
    border: "1.5px solid #FDE68A",
    background: "#FFFBEB", color: "#B45309",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    transition: "all 0.15s",
  },
  banner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px",
    background: "#EFF6FF", border: "1px solid #BFDBFE",
    borderRadius: 12, gap: 12,
  },
  bannerText: { fontSize: 14, color: "#1E40AF" },
  bannerBtn: {
    padding: "8px 18px", borderRadius: 8,
    border: "none", background: "#2563EB", color: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
};

export default ReviewButton;