import { useState, useEffect } from "react";

export default function FollowButton({ viewerId, profileId }) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/follow/${profileId}/status?viewer=${viewerId}`)
      .then(res => res.json())
      .then(data => setFollowing(data.following));
  }, [profileId, viewerId]);

  const toggleFollow = async () => {
    const method = following ? "DELETE" : "POST";

    await fetch(`http://localhost:3000/follow/${profileId}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followerId: viewerId })
    });

    setFollowing(!following);
  };

  return (
    <button onClick={toggleFollow}>
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}