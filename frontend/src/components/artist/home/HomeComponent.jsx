import React from 'react'
import CardStat from './CardStat'
import Map from './Map'
import ListItem from './ListItem'

const HomeComponent = () => {
  return (
    <>
      {/* Entire Dashboard */}
      <div className='p-6 relative min-h-[500px]'>

        {/* Glassmorphism Lock Overlay */}
        <div className="absolute inset-0 bg-[#020216]/65 backdrop-blur-[6px] z-[999] flex flex-col items-center justify-center text-center p-6 select-none pointer-events-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#3380FF]/20 to-[#4DB3FF]/20 border border-[#4DB3FF]/40 flex items-center justify-center mb-4 shadow-lg shadow-[#4DB3FF]/10">
            <svg className="w-8 h-8 text-[#4DB3FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-white text-xl font-bold tracking-wider font-jura">Dashboard in Development</h3>
          <p className="text-gray-300 text-xs md:text-sm mt-2 max-w-sm font-medium leading-relaxed">
            The frontend mockup is ready. Full analytics tracking will be unlocked once backend API integration is completed.
          </p>
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
