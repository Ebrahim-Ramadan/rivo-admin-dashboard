'use client'
import React, { useState } from 'react';
import { checkIfOrderExists } from '@/lib/utils'; 
import { Dashboard } from './Dashboard';
import LoadingDots from '../LoadingDots';

export const Search = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState([]);
  const [loading, setloading] = useState(false);

  const handleSearch = async () => {
    if (orderId == '') return;
    setloading(true);
    const result = await checkIfOrderExists(orderId);
    console.log('result', result);
    setOrderData(result);
    setloading(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <a href="/" className="text-blue-500 text-sm hover:text-blue-400">← Back to Dashboard</a>
      <p className="text-xl font-bold self-center">Search for an order</p>
      <div className='grid grid-cols-5 w-full gap-2'>
      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full rounded-lg p-2 border border-white/20 text-black col-span-4 text-black font-bold"
      />
      <button onClick={handleSearch} 
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center justify-center ${
        loading ? 'cursor-not-allowed bg-blue-300' : 'hover:bg-blue-700'
      }`} disabled={loading}>
          {loading ? (
            <LoadingDots/>
          ) : (
            'GET'
          )}
      </button>
      </div>
      {orderData ? (
        <Dashboard orders={orderData}  fromSearch = {true}/>
      ) : (
        orderData === false && <div>Order not found</div>
      )}
    </div>
  );
};
