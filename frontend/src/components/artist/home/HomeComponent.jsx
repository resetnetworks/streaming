import React from 'react'
import CardStat from './CardStat'
import Map from './Map'
import ListItem from './ListItem'

const HomeComponent = () => {
  return (
    <>
      {/* Scrollable CardStat Container - Same as ListItem */}
      <div className='p-6'>
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