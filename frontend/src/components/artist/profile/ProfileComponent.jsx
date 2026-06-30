import React from 'react'
import ProfileHeroSection from './ProfileHeroSection'
import ProfileDetailSection from './ProfileDetailSection'

const ProfileComponent = ({ workspace }) => {

  return (
      <>
      <ProfileHeroSection workspace={workspace} />
      <ProfileDetailSection workspace={workspace} />
      </>
      
  )
}

export default ProfileComponent