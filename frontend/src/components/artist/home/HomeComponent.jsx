import React from 'react'
import { MdLockOutline } from 'react-icons/md'
import CardStat from './CardStat'
import Map from './Map'
import ListItem from './ListItem'

const HomeComponent = () => {
  return (
    <>
      {/* Single Locked Overlay for Entire Dashboard */}
      <div className='p-6 relative'>
        {/* Locked Overlay - Covers Everything */}
        <div className='absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm flex items-center justify-center z-[999]'>
          <div className='text-center text-white max-w-md mx-auto px-6'>
            <MdLockOutline className='w-24 h-24 mx-auto mb-6 opacity-80' />
            <div className='text-4xl font-bold mb-2'>Coming Soon</div>
            <div className='text-xl opacity-90'>Dashboard analytics locked</div>
            <div className='text-lg mt-4 opacity-75'>Advanced features arriving soon</div>
          </div>
        </div>

        {/* Scrollable CardStat Container */}
        <div className='w-full overflow-x-auto pb-3'>
          <div className='flex justify-between space-x-4 min-w-max px-1'>
            <CardStat label="streams" value="42.3k" />
            <CardStat label="listeners" value="18.7k" />
            <CardStat label="revenue" value="$2.4k" />
            <CardStat label="growth" value="+12%" />
            <CardStat label="engagement" value="64%" />
            <CardStat label="downloads" value="8.9k" />
            <CardStat label="shares" value="1.2k" />
          </div>
        </div>
         

          <Map />

        
        
        {/* Scrollable List Items Container */}
        <div className='w-full overflow-x-auto pb-4'>
          <div className='flex justify-between space-x-4 min-w-max px-1'>
            <ListItem />
            <ListItem ItemName="top albums"/>
            <ListItem ItemName="top singles"/>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeComponent
