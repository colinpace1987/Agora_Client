import { useEffect, useMemo, useState } from "react";
import "./Forum.css";

const REPORT_REASONS = [
  "Spam",
  "Harassment or hate",
  "Misinformation",
  "Graphic or violent content",
  "Other",
];

export default function Forum({ user }) {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState("");

  const [showPolicy, setShowPolicy] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(
    user?.has_acknowledged_policy ?? false
  );

  const [openPostMenu, setOpenPostMenu] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ title: "", content: "" });

  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    setPolicyAccepted(user?.has_acknowledged_policy ?? false);
  }, [user]);

  const wordCount = useMemo(() => {
    return newPost.content.trim()
      ? newPost.content.trim().split(/\s+/).length
      : 0;
  }, [newPost.content]);

  const editWordCount = useMemo(() => {
    return editDraft.content.trim()
      ? editDraft.content.trim().split(/\s+/).length
      : 0;
  }, [editDraft.content]);

  const canSubmitPost =
    newPost.title.trim() && newPost.content.trim() && wordCount <= 1000;
  const canSaveEdit =
    editDraft.title.trim() && editDraft.content.trim() && editWordCount <= 1000;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        setError(null);
        const res = await fetch("http://localhost:3000/forum/posts");
        if (!res.ok) throw new Error("Failed to fetch forum posts");
        const data = await res.json();
        setPosts(data);
        if (data.length > 0 && !selectedPostId) {
          setSelectedPostId(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [selectedPostId]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedPostId) return;
      try {
        setLoadingDetail(true);
        setError(null);
        const postRes = await fetch(
          `http://localhost:3000/forum/posts/${selectedPostId}`
        );
        if (!postRes.ok) throw new Error("Failed to load post");
        const postData = await postRes.json();
        setSelectedPost(postData);
        setEditDraft({ title: postData.title, content: postData.content });

        const commentRes = await fetch(
          `http://localhost:3000/forum/posts/${selectedPostId}/comments`
        );
        if (!commentRes.ok) throw new Error("Failed to load comments");
        const commentData = await commentRes.json();
        setComments(commentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedPostId]);

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
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    if (!policyAccepted) {
      setShowPolicy(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: newPost.title,
          content: newPost.content,
        }),
      });
      if (!res.ok) throw new Error("Failed to create forum post");
      const post = await res.json();
      setPosts((prev) => [post, ...prev]);
      setSelectedPostId(post.id);
      setNewPost({ title: "", content: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!user || !selectedPostId || !newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:3000/forum/posts/${selectedPostId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, content: newComment }),
        }
      );
      if (!res.ok) throw new Error("Failed to add comment");
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      setPosts((prev) =>
        prev.map((item) =>
          item.id === selectedPostId
            ? { ...item, comment_count: Number(item.comment_count || 0) + 1 }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const openReportModal = (contentType, contentId) => {
    setReportTarget({ contentType, contentId });
    setReportReason("");
    setReportDetails("");
    setOpenPostMenu(false);
    setOpenCommentMenuId(null);
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

    const res = await fetch(`http://localhost:3000/forum/posts/${postId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }
    );

    if (res.ok) {
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setSelectedPostId(null);
      setSelectedPost(null);
      setOpenPostMenu(false);
    }
  };

  const startEdit = () => {
    if (!selectedPost) return;
    setEditDraft({ title: selectedPost.title, content: selectedPost.content });
    setEditing(true);
    setOpenPostMenu(false);
  };

  const cancelEdit = () => {
    if (!selectedPost) return;
    setEditDraft({ title: selectedPost.title, content: selectedPost.content });
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!user || !selectedPost) return;

    const res = await fetch(`http://localhost:3000/forum/posts/${selectedPost.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: editDraft.title,
          content: editDraft.content,
        }),
      }
    );

    if (!res.ok) return;
    const updated = await res.json();
    setSelectedPost(updated);
    setPosts((prev) =>
      prev.map((post) => (post.id === updated.id ? { ...post, ...updated } : post))
    );
    setEditing(false);
  };

  return (
    <div className="forum">
      <header className="forum-header">
        <div>
          <p className="forum-eyebrow">Agora Forum</p>
          <h1>Long-form discussions</h1>
          <p className="forum-subtitle">
            Share deeper ideas, ask questions, and respond thoughtfully.
          </p>
        </div>
      </header>

      <section className="forum-content">
        <div className="forum-list">
          {loadingPosts ? (
            <p className="forum-status">Loading posts...</p>
          ) : error ? (
            <p className="forum-status error">{error}</p>
          ) : posts.length === 0 ? (
            <p className="forum-status">No forum posts yet.</p>
          ) : (
            posts.map((post) => (
              <button
                key={post.id}
                type="button"
                className={`forum-card${
                  selectedPostId === post.id ? " active" : ""
                }`}
                onClick={() => setSelectedPostId(post.id)}
              >
                <h2>{post.title}</h2>
                <p className="forum-meta">
                  {post.email || "Unknown"} ·{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="forum-excerpt">
                  {post.content.length > 180
                    ? `${post.content.slice(0, 180)}...`
                    : post.content}
                </p>
                <span className="forum-count">
                  {post.comment_count || 0} comments
                </span>
              </button>
            ))
          )}
        </div>

        <aside className="forum-detail">
          <div className="forum-compose">
            <h2>Start a new thread</h2>
            <form onSubmit={handlePostSubmit}>
              <label>Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(event) =>
                  setNewPost((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Enter a clear, descriptive title"
              />

              <label>Post</label>
              <textarea
                rows={6}
                value={newPost.content}
                onChange={(event) =>
                  setNewPost((prev) => ({ ...prev, content: event.target.value }))
                }
                placeholder="Write your long-form post here (max 1000 words)"
              />
              <div className={`forum-word-count${wordCount > 1000 ? " over" : ""}`}>
                {wordCount} / 1000 words
              </div>
              <button type="submit" disabled={!canSubmitPost}>
                Publish
              </button>
            </form>
          </div>

          <div className="forum-thread">
            {loadingDetail ? (
              <p className="forum-status">Loading thread...</p>
            ) : selectedPost ? (
              <>
                <div className="forum-thread-header">
                  <div>
                    {editing ? (
                      <>
                        <input
                          type="text"
                          value={editDraft.title}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                        />
                        <div className={`forum-word-count${editWordCount > 1000 ? " over" : ""}`}>
                          {editWordCount} / 1000 words
                        </div>
                      </>
                    ) : (
                      <>
                        <h2>{selectedPost.title}</h2>
                        <p className="forum-meta">
                          {selectedPost.email || "Unknown"} ·{" "}
                          {new Date(selectedPost.created_at).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="post-menu">
                    <button
                      type="button"
                      className="post-menu-btn"
                      onClick={() => setOpenPostMenu((prev) => !prev)}
                    >
                      ...
                    </button>
                    {openPostMenu && (
                      <div className="post-menu-dropdown">
                        <button
                          type="button"
                          onClick={() => openReportModal("forum_post", selectedPost.id)}
                        >
                          Report a problem
                        </button>
                        {selectedPost.user_id === user?.id && (
                          <>
                            <button type="button" onClick={startEdit}>
                              Edit
                            </button>
                            <button type="button" onClick={() => deletePost(selectedPost.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {editing ? (
                  <div className="forum-edit">
                    <textarea
                      rows={6}
                      value={editDraft.content}
                      onChange={(event) =>
                        setEditDraft((prev) => ({
                          ...prev,
                          content: event.target.value,
                        }))
                      }
                    />
                    <div className="forum-edit-actions">
                      <button type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                      <button type="button" onClick={saveEdit} disabled={!canSaveEdit}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="forum-body">{selectedPost.content}</p>
                )}

                <div className="forum-comments">
                  <h3>Comments</h3>
                  {comments.length === 0 ? (
                    <p className="forum-status">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="forum-comment">
                        <div className="forum-comment-header">
                          <p className="forum-meta">
                            {comment.email || "Unknown"} ·{" "}
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                          <div className="post-menu">
                            <button
                              type="button"
                              className="post-menu-btn"
                              onClick={() =>
                                setOpenCommentMenuId(
                                  openCommentMenuId === comment.id ? null : comment.id
                                )
                              }
                            >
                              ...
                            </button>
                            {openCommentMenuId === comment.id && (
                              <div className="post-menu-dropdown">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openReportModal("forum_comment", comment.id)
                                  }
                                >
                                  Report a problem
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form className="forum-comment-form" onSubmit={handleCommentSubmit}>
                  <label>Add a comment</label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Share a thoughtful response..."
                  />
                  <button type="submit" disabled={!newComment.trim()}>
                    Comment
                  </button>
                </form>
              </>
            ) : (
              <p className="forum-status">Select a post to read the thread.</p>
            )}
          </div>
        </aside>
      </section>

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
                Agree and continue
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
