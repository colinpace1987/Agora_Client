import { useState } from 'react';
import ProfileForm from "./ProfileForm.js";
import ProfileInfo from "./ProfileInfo.js";

export default function Profile({ user }) {
  const [fillProfile, setFillProfile] = useState(false);
  
  // ADD THIS: a trigger for re-fetching profile
  const [refreshProfile, setRefreshProfile] = useState(0);

  function fillInfo() {
    setFillProfile(true);
  }

  function closeModal() {
    setFillProfile(false);
  }

  return (
    <div>
      {/* Pass user, refreshTrigger, and fillInfo */}
      <ProfileInfo 
        user={user} 
        refreshTrigger={refreshProfile} 
        fillInfo={fillInfo} 
      />

      {/* Conditionally render ProfileForm as modal */}
      {fillProfile && (
        <ProfileForm
          user={user}
          closeModal={closeModal}
          onSubmitComplete={() => setRefreshProfile(prev => prev + 1)} // increments trigger
        />
      )}
    </div>
  );
}