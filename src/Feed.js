import { useState, useEffect } from "react";
import "./Feed.css";

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts for this user
  const fetchPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log(user.id);
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

  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: newContent }),
      });
      if (!res.ok) throw new Error("Failed to create post");

      const post = await res.json();
      setPosts((prev) => [post, ...prev]); // add new post at top
      setNewContent("");
    } catch (err) {
      console.error(err);
      setError(err.message);
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
              <p>
                <strong>{post.email || "unknown"}</strong> &nbsp;
                <span className="timestamp">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </p>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}