import { useEffect, useMemo, useState } from "react";
import "./Forum.css";

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

  const wordCount = useMemo(() => {
    return newPost.content.trim()
      ? newPost.content.trim().split(/\s+/).length
      : 0;
  }, [newPost.content]);

  const canSubmitPost =
    newPost.title.trim() && newPost.content.trim() && wordCount <= 1000;

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
      setError(null);
      try {
        setLoadingDetail(true);
        const postRes = await fetch(
          `http://localhost:3000/forum/posts/${selectedPostId}`
        );
        if (!postRes.ok) throw new Error("Failed to load post");
        const postData = await postRes.json();
        setSelectedPost(postData);

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

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

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
                <h2>{selectedPost.title}</h2>
                <p className="forum-meta">
                  {selectedPost.email || "Unknown"} ·{" "}
                  {new Date(selectedPost.created_at).toLocaleString()}
                </p>
                <p className="forum-body">{selectedPost.content}</p>

                <div className="forum-comments">
                  <h3>Comments</h3>
                  {comments.length === 0 ? (
                    <p className="forum-status">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="forum-comment">
                        <p className="forum-meta">
                          {comment.email || "Unknown"} ·{" "}
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
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
    </div>
  );
}
