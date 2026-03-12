import { useEffect, useState } from "react";
import "./ProfileInfo.css";
import FollowButton from "./FollowButton";

function ProfileInfo({ user, fillInfo, refreshTrigger, profileUserId, authToken }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);

  const targetUserId = profileUserId || user?.id;
  const viewingOwnProfile = user && targetUserId === user.id;
  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

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
        const res = await fetch(`http://localhost:3000/profiles/${targetUserId}`, {
          headers: authHeaders,
        });
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
  }, [targetUserId, refreshTrigger, authToken]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      if (!viewingOwnProfile) return;

      try {
        const res = await fetch(`http://localhost:3000/follow/requests`, {
          headers: authHeaders,
        });
        if (!res.ok) return;
        const data = await res.json();
        setRequests(data);
      } catch {
        setRequests([]);
      }
    };

    fetchRequests();
  }, [user, viewingOwnProfile, authToken]);

  const approveRequest = async (requestId) => {
    await fetch(`http://localhost:3000/follow/requests/${requestId}/approve`, {
      method: "POST",
      headers: authHeaders,
    });
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const rejectRequest = async (requestId) => {
    await fetch(`http://localhost:3000/follow/requests/${requestId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

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
          authToken={authToken}
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
