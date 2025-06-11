import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const IconHeader = () => {

  const navigate = useNavigate()
  return (
    <>
    <div className='w-full flex items-center flex-col'>
    <img src={assets.reset_icon} className="w-10 py-3 block cursor-pointer" alt="reset studio icon" onClick={()=>{navigate("/")}}/>
    <div className="gradiant-line"></div>
    </div>
    </>
  )
}

export default IconHeader