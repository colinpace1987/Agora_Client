import { useEffect, useState } from "react";

export default function FollowButton({ viewerId, profileId }) {
  const [following, setFollowing] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!viewerId || !profileId) return;
    fetch(`http://localhost:3000/follow/${profileId}/status?viewer=${viewerId}`)
      .then((res) => res.json())
      .then((data) => {
        setFollowing(!!data.following);
        setPending(!!data.pending);
      })
      .catch(() => {
        setFollowing(false);
        setPending(false);
      });
  }, [profileId, viewerId]);

  const toggleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (following) {
        await fetch(`http://localhost:3000/follow/${profileId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: viewerId }),
        });
        setFollowing(false);
        setPending(false);
      } else if (!pending) {
        const res = await fetch(`http://localhost:3000/follow/${profileId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: viewerId }),
        });
        const data = await res.json();
        setFollowing(!!data.following);
        setPending(!!data.pending);
      }
    } finally {
      setLoading(false);
    }
  };

  let label = "Follow";
  if (following) label = "Unfollow";
  if (pending) label = "Requested";

  return (
    <button onClick={toggleFollow} disabled={loading || pending}>
      {label}
    </button>
  );
}
