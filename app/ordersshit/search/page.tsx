import React from 'react'
import { Search } from './Search'
export const Home = () => {
  return (
    <div  className="flex flex-col gap-4 w-full px-2">
<div className='flex flex-row justify-between p-2 [&>*]:navbararrow'>
  <a href='/ordersshit'> ← Back to Orders</a>
</div>
<Search/>

    </div>
  )
}

export default Home