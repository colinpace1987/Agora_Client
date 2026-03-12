import { useState } from 'react'
import "./Home.css";
import Feed from "./Feed.js";
import Profile from "./Profile.js";
import Forum from "./Forum.js";
import Discover from "./Discover.js";

function Home( { buttonToLogout, user } ) {
  let [display, setDisplay] = useState("home");
  const [selectedProfileId, setSelectedProfileId] = useState(null);

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
            <Feed user={user} /> :
            display === "profile" ?
            <Profile user={user} profileUserId={selectedProfileId} /> :
            display === "forum" ?
            <Forum user={user} /> :
            display === "discover" ?
            <Discover user={user} onVisitProfile={handleVisitProfile} /> :
            <Feed user={user} />
        }
      </section>

      <section id = "api">
        <button id = "logoutButton" onClick={logout}>
          Logout
        </button>
      </section>
    </div>
  )
}

export default Home;
