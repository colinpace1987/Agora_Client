import { useEffect, useState } from "react";
import "./ProfileInfo.css";
import FollowButton from "./FollowButton";

function ProfileInfo({ user, fillInfo, refreshTrigger }) {
  const [profile, setProfile] = useState(null);

  // Fetch function can be called both on mount and after submit
  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:3000/profiles/${user.id}`);
      if (!res.ok) throw new Error("Profile not found");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.log("No profile yet"); 
      setProfile(null);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:3000/profiles/${user.id}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data);
      } catch {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [user, refreshTrigger]); // re-fetch when refreshTrigger changes
  return (
    <div className="profile-info">
      {user && (
        <button id="completeProfile" onClick={fillInfo}>
          Complete Profile
        </button>
      )}
{/* 
      {user.id !== profileId && (
        <FollowButton
          user={user.id}
          profileId={profileUser.id}
        />
      )} */}

      {profile ? (
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


