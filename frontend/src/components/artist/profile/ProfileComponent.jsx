import React, { useState } from 'react'
import ProfileHeroSection from './ProfileHeroSection'
import ProfileDetailSection from './ProfileDetailSection'
import AccountSettingsModal from './AccountSettingsModal'

const ProfileComponent = ({ workspace }) => {
  const [settingsModalMode, setSettingsModalMode] = useState(null);

  return (
    <>
      <ProfileHeroSection 
        workspace={workspace} 
        onOpenSettings={setSettingsModalMode}
      />
      <ProfileDetailSection workspace={workspace} />

      <AccountSettingsModal
        isOpen={!!settingsModalMode}
        initialMode={settingsModalMode || "email"}
        onClose={() => setSettingsModalMode(null)}
      />
    </>
  )
}

export default ProfileComponent