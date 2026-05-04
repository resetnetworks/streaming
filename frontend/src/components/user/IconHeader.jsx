import React, { use } from 'react'
import { assets } from '../../assets/assets'
import useNavigation from '../../hooks/useAuthNavigation'

const IconHeader = () => {
  const {navigateToHome} = useNavigation();

  function handleClick(){
   
  }
  return (
    <>
    <div className='w-full flex items-center flex-col'>
    <img src={assets.reset_icon} className="xl:w-10 w-8 py-3 block cursor-pointer" alt="reset studio icon" onClick={navigateToHome}/>
    <div className="gradiant-line"></div>
    </div>
    </>
  )
}

export default IconHeader