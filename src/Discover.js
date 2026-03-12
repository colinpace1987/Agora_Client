import { useEffect, useMemo, useState } from "react";
import "./Discover.css";

export default function Discover({ user, onVisitProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/profiles");
        if (!res.ok) {
          let detail = "";
          const raw = await res.text();
          try {
            const body = JSON.parse(raw);
            detail = body?.error || body?.detail || raw;
          } catch {
            detail = raw;
          }
          throw new Error(detail ? `Failed to fetch profiles: ${detail}` : "Failed to fetch profiles");
        }
        const data = await res.json();
        const filtered = user
          ? data.filter((profile) => profile.user_id !== user.id)
          : data;
        setProfiles(filtered);
        if (filtered.length > 0) {
          setSelectedId((prev) => prev ?? filtered[0].user_id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user]);

  const visibleProfiles = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter((profile) => {
      const haystack = [
        profile.username,
        profile.profession,
        profile.degree,
        profile.bio,
        ...(profile.qualities || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [profiles, query]);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.user_id === selectedId),
    [profiles, selectedId]
  );

  const canVisit = !!selectedProfile && typeof onVisitProfile === "function";

  return (
    <div className="discover">
      <header className="discover-header">
        <div>
          <p className="discover-eyebrow">Meet people worth following</p>
          <h1>Discover</h1>
          <p className="discover-subtitle">
            Explore profiles across the Agora and visit someone new.
          </p>
        </div>
        <div className="discover-search">
          <label htmlFor="discover-search">Search profiles</label>
          <input
            id="discover-search"
            type="search"
            placeholder="Search by name, profession, or interests"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span>{visibleProfiles.length} profiles</span>
        </div>
      </header>

      <section className="discover-content">
        <div className="discover-list">
          {loading ? (
            <p className="discover-status">Loading profiles...</p>
          ) : error ? (
            <p className="discover-status error">{error}</p>
          ) : visibleProfiles.length === 0 ? (
            <p className="discover-status">No profiles match your search.</p>
          ) : (
            visibleProfiles.map((profile) => (
              <button
                key={profile.user_id}
                className={`discover-card${
                  selectedId === profile.user_id ? " active" : ""
                }`}
                onClick={() => setSelectedId(profile.user_id)}
                type="button"
              >
                <div className="discover-card-heading">
                  <h2>{profile.username}</h2>
                  <span>{profile.profession || "No profession listed"}</span>
                </div>
                <p>{profile.bio || "No bio added yet."}</p>
                <div className="discover-tags">
                  {(profile.qualities || []).slice(0, 3).map((quality) => (
                    <span key={quality}>{quality}</span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        <aside className="discover-detail">
          {selectedProfile ? (
            <>
              <div className="discover-detail-header">
                <div>
                  <h2>{selectedProfile.username}</h2>
                  <p>
                    {selectedProfile.profession || "No profession listed"} ·{" "}
                    {selectedProfile.degree || "No degree listed"}
                  </p>
                </div>
              </div>
              <div className="discover-detail-body">
                <div>
                  <h3>Bio</h3>
                  <p>{selectedProfile.bio || "No bio added yet."}</p>
                </div>
                <div>
                  <h3>Qualities</h3>
                  <div className="discover-tags">
                    {(selectedProfile.qualities || []).length > 0 ? (
                      selectedProfile.qualities.map((quality) => (
                        <span key={quality}>{quality}</span>
                      ))
                    ) : (
                      <span className="discover-empty-tag">
                        No qualities listed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {canVisit && (
                <button
                  className="discover-visit"
                  type="button"
                  onClick={() => onVisitProfile(selectedProfile.user_id)}
                >
                  Visit profile
                </button>
              )}
            </>
          ) : (
            <div className="discover-empty">
              <h2>Select a profile</h2>
              <p>Choose someone from the list to preview their profile.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
