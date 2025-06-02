import React from 'react'
import { assets } from '../assets/assets'

const IconHeader = () => {
  return (
    <>
    <div className='w-full flex items-center flex-col'>
    <img src={assets.reset_icon} className="w-10 py-3 block" alt="reset studio icon" />
    <div className="gradiant-line"></div>
    </div>
    </>
  )
}

export default IconHeader