'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { checkIfOrderExists, markOrderAsDone, Shipping_costs } from '@/lib/orders/utils';
import LoadingDots from '@/components/LoadingDots';
import { Input } from '@/components/ui/input';
import Image from 'next/image'; // Import Image
import mobile from '@/public/assets/mobile.svg';
import visa from '@/public/assets/visa.svg';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getProductDetails } from '@/app/actions';

const additionalsIDs = [
  '726GjxFlSzV2jLMtJ1mH',
  'OwOnnRkyUjCALgDgkieM',
  'okyhnzZvPO4v4UIHOqxG',
  'JaDJO9CeY4rovchCyvjm',
];

export const Search = () => {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null); // Initialize to null
  const [loading, setloading] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  // const [activeTab, setActiveTab] = useState('orders'); // Default to 'orders'

  const handleSearch = useCallback(async () => {
    if (!orderId) return;

    setloading(true);
    try {
      const result = await checkIfOrderExists(orderId);
      console.log('result', result);
      setOrderData(result ? result[0] : null); // Extract the order object
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order. Please try again.');
      setOrderData(null);
    } finally {
      setloading(false);
    }
  }, [orderId]);

  const fetchProductDetails = useCallback(
    async (order) => {
      if (!order || !order.items) return;

      const promises = order.items.map((item) => getProductDetails(item.id));

      try {
        const results = await Promise.all(promises);

        const details = results.reduce((acc, productDetail, index) => {
          acc[order.items[index].id] = productDetail;
          return acc;
        }, {});

        setProductDetails(details);
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to fetch product details. Please try again.');
      }
    },
    [getProductDetails]
  );

  useEffect(() => {
    if (orderData) {
      fetchProductDetails(orderData);
    }
  }, [orderData, fetchProductDetails]);

  const handleMarkAsDone = useCallback(
    async (orderId) => {
      setloading(true);
      try {
        // Assuming markOrderAsDone returns the deleted ID
        const deletedID = await markOrderAsDone(orderId);

        if (deletedID) {
          toast.success('Order marked as Done successfully');
          setOrderData(null); // Clear the order data after marking as done
          router.refresh();
        } else {
          toast.error('Something went wrong');
        }
      } catch (error) {
        console.error('Error marking order as done:', error);
        toast.error('Something went wrong');
      } finally {
        setloading(false);
      }
    },
    [markOrderAsDone, router]
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-xl font-bold self-center">Search for an order</p>
      <div className="grid grid-cols-5 w-full gap-2">
        <Input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full col-span-4 "
        />
        <button
          onClick={handleSearch}
          className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center justify-center ${
            loading ? 'cursor-not-allowed bg-blue-300' : 'hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? <LoadingDots /> : 'GET'}
        </button>
      </div>

      {orderData ? (
        <div
          key={orderData.id}
          className={`flex flex-col md:flex-row gap-6 border border-white/20 p-4 rounded-lg shadow-lg mt-2`}
        >
          <div className="rounded-lg flex-grow">
            <h2 className="text-xl font-semibold mb-1">
              Order Doc ID {orderData.id}
            </h2>
            <p className="mb-6">Placed on {orderData.created_at?.slice(0, 10)}</p>

            <h3 className="text-lg font-semibold mb-2">Delivery Details</h3>
            <p className="text-green-600 mb-4">
              {orderData.status} · Confirmed
            </p>

            {orderData.items?.map((item, index) => (
              <a
                key={index}
                className="bg-white/10 hover:bg-white/20 flex items-center p-4 mb-2 rounded-lg justify-between w-full"
                target="_blank"
                href={`https://rivo.gallery/frame/${item.id}?type=${item.type}&size=${item.size}&color=${item.color}`}
                rel="noopener noreferrer"
              >
                <div className="flex w-full flex-row gap-2 items-center">
                  <span className="leading-tight relative">
                    {productDetails[item.id]?.images &&
                    productDetails[item.id]?.images[0] ? (
                      <Image
                        className="rounded-lg"
                        src={`https://rivo.gallery/frames-images/${productDetails[item.id]?.images[0]}`}
                        alt={productDetails[item.id]?.id}
                        width={100}
                        height={150}
                      />
                    ) : (
                      <div className="h-8 flex flex-col items-center justify-center">
                        <LoadingDots />
                      </div>
                    )}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-medium text-white">
                      <div className="">x{item.quantity}</div>
                    </div>
                  </span>

                  <div className="text-xs">
                    <p className="font-medium text-base">
                      {productDetails[item.id]?.name}
                    </p>
                    <p>{item.type}</p>
                    <p>
                      {item.color} - {item.size}
                    </p>
                    {additionalsIDs.includes(item.id) && (
                      <div className="mt-2 w-full  flex items-center justify-end font-medium text-white">
                        <div className="bg-blue-500 rounded-full px-2 py-1 ">
                          additionals
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="rounded-lg w-full md:w-80">
            <h3 className="text-lg font-semibold mb-4">Order invoice</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between ">
                <span> SubTotal</span>
                <span>EGP {calculateTotalPrice(orderData.items).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>
                  Total ({orderData.shipping_data?.last_name} fees)
                </span>
                <span>
                  EGP{' '}
                  {calculateTotalPrice(
                    orderData.items,
                    orderData.shipping_data?.last_name
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end items-center mb-4">
              {orderData.shipping_data?.building === 'pay-on-delivery' ? (
                'paying on delivery'
              ) : (
                <div className="flex items-center gap-2">
                  {orderData.source_data?.type === 'wallet' ? (
                    <Image
                      src={mobile}
                      alt="card logo"
                      className="w-6 h-6"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <Image
                      src={visa}
                      alt="card logo"
                      className="w-6 h-6"
                      width={40}
                      height={40}
                    />
                  )}
                  <span>Ending in {orderData.source_data?.pan?.slice(-4)}</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Delivery address (Home)
            </h3>
            <p className="mb-1 truncate">
              {orderData.shipping_data?.first_name}{' '}
              {orderData.shipping_data?.email}
            </p>
            <p className="mb-1">
              {orderData.shipping_data?.street},{' '}
              {orderData.shipping_data?.city},{' '}
              {orderData.shipping_data?.last_name},{' '}
              {orderData.shipping_data?.country}
            </p>
            <p className="flex items-center">
              {orderData.shipping_data?.phone_number}
              <span className="ml-2 text-green-600 text-sm">Verified</span>
            </p>
            {orderData.shipping_data?.country?.trim().length > 0 && (
              <p className="flex items-center gap-2">
                {orderData.shipping_data?.country}
                <span className="ml-2 text-green-600 text-sm">(+)</span>
              </p>
            )}
          </div>

          {orderData.status != 'Done' && (
            <div className="flex justify-end md:block">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl"
                onClick={() => handleMarkAsDone(orderData.id)}
                disabled={loading}
              >
                {loading ? <LoadingDots /> : 'Mark as Done'}
              </button>
            </div>
          )}
        </div>
      ) : orderData === null ? (
        <div>Order not found</div>
      ) : null}
    </div>
  );
};




const getShippingCost = (governorate) => {
  const shippingCost = Shipping_costs.find(cost => cost.hasOwnProperty(governorate));
  return shippingCost ? parseFloat(shippingCost[governorate]) : 0;
};

const calculateTotalPrice = (items, governorate) => {
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  
  const itemsTotal = items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  const shippingCost = getShippingCost(governorate);
  return itemsTotal + shippingCost;
};
