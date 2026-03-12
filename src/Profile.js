import { useState } from 'react';
import ProfileForm from "./ProfileForm.js";
import ProfileInfo from "./ProfileInfo.js";

export default function Profile({ user, profileUserId }) {
  const [fillProfile, setFillProfile] = useState(false);
  const [refreshProfile, setRefreshProfile] = useState(0);

  function fillInfo() {
    setFillProfile(true);
  }

  function closeModal() {
    setFillProfile(false);
  }

  const viewingOwnProfile = !profileUserId || (user && profileUserId === user.id);

  return (
    <div>
      <ProfileInfo 
        user={user}
        profileUserId={profileUserId}
        refreshTrigger={refreshProfile}
        fillInfo={viewingOwnProfile ? fillInfo : null}
      />

      {viewingOwnProfile && fillProfile && (
        <ProfileForm
          user={user}
          closeModal={closeModal}
          onSubmitComplete={() => setRefreshProfile(prev => prev + 1)}
        />
      )}
    </div>
  );
}
