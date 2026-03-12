import { useEffect, useState } from "react";
import "./ProfileInfo.css";
import FollowButton from "./FollowButton";

function ProfileInfo({ user, fillInfo, refreshTrigger, profileUserId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = profileUserId || user?.id;
  const viewingOwnProfile = user && targetUserId === user.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/profiles/${targetUserId}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, refreshTrigger]);

  return (
    <div className="profile-info">
      {viewingOwnProfile && fillInfo && (
        <button id="completeProfile" onClick={fillInfo}>
          Complete Profile
        </button>
      )}

      {!viewingOwnProfile && user && targetUserId && (
        <FollowButton
          viewerId={user.id}
          profileId={targetUserId}
        />
      )}

      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <div>
          <h2>{profile.username}</h2>
          <p>Profession: {profile.profession}</p>
          <p>Degree: {profile.degree}</p>
          <p>Bio: {profile.bio}</p>
          <p>Qualities: {profile.qualities?.join(", ")}</p>
        </div>
      ) : (
        <p>No profile yet.</p>
      )}
    </div>
  );
}

export default ProfileInfo;
