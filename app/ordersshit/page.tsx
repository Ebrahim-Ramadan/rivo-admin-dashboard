import React from 'react'
import { Dashboard } from './Dashboard'
export const Home = () => {
  return (
    <div  className="flex flex-col gap-4 w-full">
<div className='flex flex-row justify-between p-2 [&>*]:navbararrow'>
  <a href='/'> ← Back to Dashboard</a>
  <a href='/ordersshit/search'> To Search &#8594;</a>
</div>
<Dashboard/>
    </div>
  )
}

export default Home