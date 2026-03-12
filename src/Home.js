import { useEffect, useState } from 'react'
import "./Home.css";
import Feed from "./Feed.js";
import Profile from "./Profile.js";
import Forum from "./Forum.js";
import Discover from "./Discover.js";

function Home( { buttonToLogout, user, authToken } ) {
  let [display, setDisplay] = useState("home");
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isPrivate, setIsPrivate] = useState(user?.is_private ?? false);

  useEffect(() => {
    setIsPrivate(user?.is_private ?? false);
  }, [user]);

  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  function logout() {
    return buttonToLogout();
  }

  function handleHomeClick() {
    return setDisplay("home");
  }

  function handleProfileClick() {
    setSelectedProfileId(null);
    return setDisplay("profile");
  }

  function handleForumClick() {
    return setDisplay("forum");
  }

  function handleDiscoverClick() {
    return setDisplay("discover");
  }

  function handleVisitProfile(profileUserId) {
    setSelectedProfileId(profileUserId);
    setDisplay("profile");
  }

  const showAccountPanel = display === "profile" && !selectedProfileId && user;

  const togglePrivacy = async () => {
    const next = !isPrivate;
    setIsPrivate(next);
    await fetch("http://localhost:3000/account/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ isPrivate: next }),
    });
  };

  const handleExport = async () => {
    const res = await fetch(`http://localhost:3000/account/export`, {
      headers: authHeaders,
    });
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

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? This will log you out."
    );
    if (!confirmed) return;

    await fetch("http://localhost:3000/account/deactivate", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
    });

    logout();
  };
  
  return (
    <div id = "home">
      <section id = "navAndTitle">
        <h1 id = "title">Agora</h1>

        <nav>
          <ul id="sidebarOptions">
            <li><button className="option" onClick = {handleHomeClick}>Home</button></li>
            <li><button className="option" onClick = {handleProfileClick}>Profile</button></li>
            <li><button className="option" onClick = {handleForumClick}>Forum</button></li>
            <li><button className="option" onClick = {handleDiscoverClick}>Discover</button></li>
          </ul>
        </nav>
      </section>


      <section id="main">
        {
          display === "home" ? 
            <Feed user={user} authToken={authToken} /> :
            display === "profile" ?
            <Profile user={user} profileUserId={selectedProfileId} authToken={authToken} /> :
            display === "forum" ?
            <Forum user={user} authToken={authToken} /> :
            display === "discover" ?
            <Discover user={user} onVisitProfile={handleVisitProfile} authToken={authToken} /> :
            <Feed user={user} authToken={authToken} />
        }
      </section>

      <section id = "api">
        <button id = "logoutButton" onClick={logout}>
          Logout
        </button>
        {showAccountPanel && (
          <div className="account-panel">
            <h3>Account Visibility</h3>
            <button type="button" className="account-toggle" onClick={togglePrivacy}>
              {isPrivate ? "Private" : "Public"}
            </button>
            <div className="account-actions">
              <button type="button" onClick={handleExport}>Export My Data</button>
              <button type="button" className="danger" onClick={handleDeactivate}>
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home;
