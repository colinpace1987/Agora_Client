import { useEffect, useState } from "react";
import "./ProfileInfo.css";
import FollowButton from "./FollowButton";

function ProfileInfo({ user, fillInfo, refreshTrigger, profileUserId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(user?.is_private ?? false);
  const [requests, setRequests] = useState([]);

  const targetUserId = profileUserId || user?.id;
  const viewingOwnProfile = user && targetUserId === user.id;

  useEffect(() => {
    setIsPrivate(user?.is_private ?? false);
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const viewerQuery = user?.id ? `?viewer=${user.id}` : "";
        const res = await fetch(`http://localhost:3000/profiles/${targetUserId}${viewerQuery}`);
        if (res.status === 403) {
          setProfile(null);
          setError("This profile is private.");
          return;
        }
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
  }, [targetUserId, refreshTrigger, user]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      if (!viewingOwnProfile) return;

      try {
        const res = await fetch(`http://localhost:3000/follow/requests?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setRequests(data);
      } catch {
        setRequests([]);
      }
    };

    fetchRequests();
  }, [user, viewingOwnProfile]);

  const togglePrivacy = async () => {
    if (!user) return;
    const next = !isPrivate;
    setIsPrivate(next);
    await fetch("http://localhost:3000/account/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, isPrivate: next }),
    });
  };

  const approveRequest = async (requestId) => {
    await fetch(`http://localhost:3000/follow/requests/${requestId}/approve`, {
      method: "POST",
    });
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const rejectRequest = async (requestId) => {
    await fetch(`http://localhost:3000/follow/requests/${requestId}`, {
      method: "DELETE",
    });
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const handleDeactivate = async () => {
    if (!user) return;
    await fetch("http://localhost:3000/account/deactivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    alert("Account deactivated. Please refresh to log out.");
  };

  const handleExport = async () => {
    if (!user) return;
    const res = await fetch(`http://localhost:3000/account/export/${user.id}`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agora-export.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="profile-info">
      {viewingOwnProfile && fillInfo && (
        <button id="completeProfile" onClick={fillInfo}>
          Complete Profile
        </button>
      )}

      {viewingOwnProfile && (
        <div className="profile-settings">
          <div className="profile-toggle">
            <span>Private account</span>
            <button type="button" onClick={togglePrivacy}>
              {isPrivate ? "On" : "Off"}
            </button>
          </div>
          <div className="profile-actions">
            <button type="button" onClick={handleExport}>Export My Data</button>
            <button type="button" onClick={handleDeactivate} className="danger">Deactivate Account</button>
          </div>
        </div>
      )}

      {!viewingOwnProfile && user && targetUserId && (
        <FollowButton
          viewerId={user.id}
          profileId={targetUserId}
        />
      )}

      {viewingOwnProfile && requests.length > 0 && (
        <div className="follow-requests">
          <h3>Follow requests</h3>
          {requests.map((req) => (
            <div key={req.id} className="follow-request">
              <span>{req.email}</span>
              <div className="follow-request-actions">
                <button type="button" onClick={() => approveRequest(req.id)}>Approve</button>
                <button type="button" onClick={() => rejectRequest(req.id)} className="danger">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading profile...</p>
      ) : error ? (
        <p>{error}</p>
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
