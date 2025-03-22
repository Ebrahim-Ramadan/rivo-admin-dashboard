'use client';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import mobile from '@/public/assets/mobile.svg';
import visa from '@/public/assets/visa.svg';
import Image from "next/image";
import { getProductDetails } from '@/app/actions';
import { markOrderAsDone, Shipping_costs, getAllOrders } from '@/lib/orders/utils';
import LoadingDots from '@/components/LoadingDots';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"

const additionalsIDs = [
  '726GjxFlSzV2jLMtJ1mH','OwOnnRkyUjCALgDgkieM','okyhnzZvPO4v4UIHOqxG','JaDJO9CeY4rovchCyvjm'
]

export const Dashboard = ({  }) => {
  const router = useRouter();
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setorders] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const refetchOrders = useCallback(async () => {
    const { orders, hasMore } = await getAllOrders();
    setorders(orders);
    setHasMore(hasMore);
  }, []);

  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  const loadMoreOrders = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const { orders: nextOrders, hasMore: moreAvailable } = await getAllOrders(true);
      setorders(prevOrders => [...prevOrders, ...nextOrders]);
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore]);

  const fetchProductDetails = useCallback(async (orders) => {
    const promises = orders.flatMap(order => order.items.map(item => getProductDetails(item.id)));

    try {
      const results = await Promise.all(promises);

      const details = results.reduce((acc, productDetail, index) => {
        let currentIndex = index;
        for (const order of orders) {
          if (currentIndex < order.items.length) {
            acc[order.items[currentIndex].id] = productDetail;
            break;
          }
          currentIndex -= order.items.length;
        }
        return acc;
      }, {});

      setProductDetails(details);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  }, [getProductDetails]);

  useEffect(() => {
    if (orders) {
      fetchProductDetails(orders);
    }
  }, [orders, fetchProductDetails]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      activeTab === 'orders' ? order.status === 'Received' : order.status === 'Done'
    );
  }, [orders, activeTab]);

  const toggleTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleMarkAsDone = useCallback(async (orderId) => {
    setLoading(true);
    try {
      const deletedID = await markOrderAsDone(orderId);
      if (deletedID) {
        toast.success('Order marked as Done successfully');
        // refetchOrders(); // Refetch orders to update the list
        setorders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      } else {
        toast.error('Something went wrong');
      }
    } catch (error) {
      console.error('Error marking order as done:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [markOrderAsDone]);


  return (
    <div className='flex flex-col gap-4 px-2'>
      
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded-lg ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveTab('orders')}
        >
          Recieved
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'done' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveTab('done')}
        >
          Done
        </button>
      </div>
      <div className='flex justify-end items-center w-full'>
{filteredOrders.length}
      </div>
      {filteredOrders.map((order) => {
        const orderId = Object.keys(order)[0];
        const orderData = order[orderId];
        return (
          <div key={order.id} className={`flex flex-col md:flex-row gap-6 border border-white/20 p-4 rounded-lg shadow-lg mt-2`}>
            <div className="rounded-lg flex-grow">
              <h2 className="text-xl font-semibold mb-1">Order Doc ID {order.id}</h2>
              <p className="mb-6">Placed on {order.created_at.slice(0, 10)}</p>

              <h3 className="text-lg font-semibold mb-2">Delivery Details</h3>
              <p className="text-green-600 mb-4">{order.status} · Confirmed</p>

              {order.items?.map((item, index) => (
                <a key={index} className="bg-white/10 hover:bg-white/20 flex items-center p-4 mb-2 rounded-lg justify-between w-full" target='_blank' href={`https://rivo.gallery/frame/${item.id}?type=${item.type}&size=${item.size}&color=${item.color}`}>
                  <div className="flex w-full flex-row gap-2 items-center">
                    <span className="leading-tight relative">
                      {productDetails[item.id]?.images[0] ? (
                        <Image
                          className="rounded-lg"
                          src={`https://rivo.gallery/frames-images/${productDetails[item.id]?.images[0]}`}

                          alt={productDetails[item.id]?.id}
                          width={100}
                          height={150}
                        />
                      ) : (
                        <div className="h-8 flex flex-col items-center justify-center"><LoadingDots/></div>
                      )}
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-medium text-white">
                        <div className="">x{item.quantity}</div>
                      </div>
                      
                    </span>

                    <div className="text-xs " >
                   
                      
                      <p className="font-medium text-base">{productDetails[item.id]?.name}</p>
                      <p>{item.type}</p>
                      <p>{item.color} - {item.size}</p>
                      {additionalsIDs.includes(item.id) &&
                      <div className="mt-2 w-full  flex items-center justify-end font-medium text-white">
                      <div className="bg-blue-500 rounded-full px-2 py-1 ">additionals</div>
                    </div>
                      }
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
                  <span>EGP {calculateTotalPrice(order.items).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total ({order.shipping_data?.last_name} fees)</span>
                  <span>EGP {calculateTotalPrice(order.items, order.shipping_data?.last_name).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end items-center mb-4">
              {order.shipping_data?.building == 'pay-on-delivery'?"paying on delivery":
               <div className="flex items-center gap-2">
               {orderData.source_data?.type == 'wallet' ? 
             <Image src={mobile} alt="card logo" className="w-6 h-6" width={40} height={40} />
             : 
             <Image src={visa} alt="card logo" className="w-6 h-6" width={40} height={40} />
             }
               <span>Ending in {orderData.source_data?.pan?.slice(-4)}</span>
             </div>
              }
              </div>

              <h3 className="text-xl font-semibold mb-2">Delivery address (Home)</h3>
              <p className="mb-1 truncate">{order.shipping_data?.first_name} {order.shipping_data?.email}</p>
              <p className="mb-1">{order.shipping_data?.street}, {order.shipping_data?.city},{order.shipping_data?.last_name}, {order.shipping_data?.country}</p>
              <p className="flex items-center">
                {order.shipping_data?.phone_number}
                <span className="ml-2 text-green-600 text-sm">Verified</span>
              </p>
              {order.shipping_data?.country.trim().length >0 &&
            <p className="flex items-center gap-2">
            {/* <PhoneIcon size='16'/> */}
            {order.shipping_data?.country}
            <span className="ml-2 text-green-600 text-sm">(+)</span>

            

           </p>
            }
            </div>
            
                { activeTab === 'orders' &&
                <div className="flex justify-end md:block">
                <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl"
                  onClick={async () => {
                    setLoading(true);
                    const deletedID = await handleMarkAsDone(order.id);
                    if (deletedID) {
                      toast.success('Order marked as Done successfully');
                      setLoading(false);
                      router.refresh()
                    } else {
                      toast.error('Something went wrong');
                      setLoading(false);  // Ensure to set loading to false in case of error
                    }
                  }}
                >
                  Mark as Done
                  </button>
            </div>
                  }
                
          </div>
        );
      })}
      {hasMore && (
           <div className="flex justify-center mt-4 mb-8">
             <button 
               onClick={loadMoreOrders}
               disabled={loadingMore}
               className={`${loadingMore?'':'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50`}
             >
               {loadingMore ? <LoadingDots /> : 'Load More Orders'}
             </button>
           </div>
         )}
    </div>
  );
};

// Import the necessary components or define the ratios inline
const ratios = [1/0.761, 1/0.71, 1/0.826, 1/0.725, 1/0.671]; // Inverted ratios from the first file

const getShippingCost = (governorate) => {
  const shippingCost = Shipping_costs.find(cost => cost.hasOwnProperty(governorate));
  return shippingCost ? parseFloat(shippingCost[governorate]) : 0;
};

const calculateTotalPrice = (items, governorate) => {
  if (!items || !Array.isArray(items)) {
    return 0;
  }
  
  const itemsTotal = items.reduce((total, item) => {
    // Get the base price
    let itemPrice = item.price || 0;
    
    // Apply special pricing for Wooden Tableau items
    if (item.type === 'Wooden Tableau') {
      const sizes = ['20×30', '30×40', '40×50', '50×60', '50×70', '60×90']; // Example sizes, replace with actual sizes
      const sizeIndex = sizes.indexOf(item.size);
      
      if (sizeIndex >= 0 && sizeIndex < ratios.length) {
        // Apply the ratio to increase the price
        itemPrice = itemPrice * ratios[sizeIndex];
      }
    }
    
    // Multiply by quantity and add to total
    return total + (itemPrice * (item.quantity || 0));
  }, 0);
  
  const shippingCost = getShippingCost(governorate);
  return itemsTotal + shippingCost;
};