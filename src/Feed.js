import { useState, useEffect } from "react";
import "./Feed.css";

const REPORT_REASONS = [
  "Spam",
  "Harassment or hate",
  "Misinformation",
  "Graphic or violent content",
  "Other",
];

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(
    user?.has_acknowledged_policy ?? false
  );
  const [openMenuId, setOpenMenuId] = useState(null);

  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    setPolicyAccepted(user?.has_acknowledged_policy ?? false);
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/posts/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const createPost = async () => {
    const res = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, content: newContent }),
    });
    if (!res.ok) throw new Error("Failed to create post");

    const post = await res.json();
    setPosts((prev) => [post, ...prev]);
    setNewContent("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (!policyAccepted) {
      setShowPolicy(true);
      return;
    }

    try {
      await createPost();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const acknowledgePolicy = async () => {
    if (!user) return;
    await fetch("http://localhost:3000/policy/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    setPolicyAccepted(true);
    setShowPolicy(false);
    setPolicyChecked(false);

    if (newContent.trim()) {
      try {
        await createPost();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openReportModal = (postId) => {
    setReportTarget({ contentType: "post", contentId: postId });
    setReportReason("");
    setReportDetails("");
    setOpenMenuId(null);
  };

  const submitReport = async () => {
    if (!user || !reportTarget || !reportReason) return;

    const reason = reportDetails.trim()
      ? `${reportReason}: ${reportDetails.trim()}`
      : reportReason;

    await fetch("http://localhost:3000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporterId: user.id,
        contentType: reportTarget.contentType,
        contentId: reportTarget.contentId,
        reason,
      }),
    });

    setReportTarget(null);
    setReportReason("");
    setReportDetails("");
  };

  const deletePost = async (postId) => {
    if (!user) return;

    const res = await fetch(`http://localhost:3000/posts/${postId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }
    );

    if (res.ok) {
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setOpenMenuId(null);
    }
  };

  if (!user) {
    return <p>Please log in to see the feed.</p>;
  }

  return (
    <div className="feed-container">
      <h2>Feed</h2>

      <form className="post-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
        />
        <button type="submit">Post</button>
      </form>

      {loading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header-row">
                <p>
                  <strong>{post.username || post.email || "unknown"}</strong> &nbsp;
                  <span className="timestamp">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </p>
                <div className="post-menu">
                  <button
                    type="button"
                    className="post-menu-btn"
                    onClick={() =>
                      setOpenMenuId(openMenuId === post.id ? null : post.id)
                    }
                  >
                    ...
                  </button>
                  {openMenuId === post.id && (
                    <div className="post-menu-dropdown">
                      <button
                        type="button"
                        onClick={() => openReportModal(post.id)}
                      >
                        Report a problem
                      </button>
                      {post.user_id === user.id && (
                        <button
                          type="button"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      )}

      {showPolicy && (
        <div className="policy-backdrop">
          <div className="policy-modal">
            <h3>Community Guidelines</h3>
            <p>
              Please keep posts respectful, avoid harassment or hate, and don’t
              share private information. Content that violates these guidelines
              may be removed.
            </p>
            <label className="policy-check">
              <input
                type="checkbox"
                checked={policyChecked}
                onChange={(event) => setPolicyChecked(event.target.checked)}
              />
              I agree to follow these guidelines.
            </label>
            <div className="policy-actions">
              <button type="button" onClick={() => setShowPolicy(false)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={!policyChecked}
                onClick={acknowledgePolicy}
              >
                Agree and post
              </button>
            </div>
          </div>
        </div>
      )}

      {reportTarget && (
        <div className="policy-backdrop">
          <div className="report-modal">
            <h3>Report a problem</h3>
            <p>What best describes the issue?</p>
            <div className="report-options">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={`report-option${reportReason === reason ? " active" : ""}`}
                  onClick={() => setReportReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            <label className="report-details">
              Additional details (optional)
              <textarea
                rows={3}
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
              />
            </label>
            <div className="policy-actions">
              <button type="button" onClick={() => setReportTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={!reportReason}
                onClick={submitReport}
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
