import { useGetDefaultAddress } from '@/api/user/address'
import { useLocationCost } from '@/api/user/location'
import { useGetUserProfile } from '@/api/user/profile'
import { Button, P, Spinner } from '@/components'
import formatMoney from '@/helper/formatMoney'
import { useModal } from '@/hooks'
import type { LocationCostRequest } from '@/types/api/location'
import { Menu } from '@headlessui/react'
import React, { useEffect, useState } from 'react'
import ChooseDestination from './ChooseDestination'

interface DeliveryInformationProps {
  weight: number
  shopID: string
  productID: string
}

const DeliveryInformation: React.FC<DeliveryInformationProps> = ({
  weight,
  shopID,
  productID,
}) => {
  const user = useGetUserProfile()
  const defaultAddress = useGetDefaultAddress(
    true,
    false,
    Boolean(user.data?.data.id)
  )

  const locationCost = useLocationCost()

  const [destination, setDestination] = useState({
    city: 'Jakarta Selatan',
    city_id: 153,
  })
  const [minMax, setMinMax] = useState({ min: 0, max: 0 })
  useEffect(() => {
    if (destination.city_id !== 0 && weight !== 0) {
      const temp: LocationCostRequest = {
        destination: destination.city_id,
        weight: weight,
        shop_id: shopID,
        product_ids: [productID],
      }
      locationCost.mutate(temp)
    }
  }, [destination, weight])

  useEffect(() => {
    if (locationCost.data?.data) {
      let max = locationCost.data?.data.data.shipping_option[0].fee
      let min = locationCost.data?.data.data.shipping_option[0].fee

      locationCost.data?.data.data.shipping_option.forEach(function (location) {
        if (location.fee > max) {
          max = location.fee
        }
        if (min > location.fee) {
          min = location.fee
        }
      })

      setMinMax({ min: min, max: max })
    }
  }, [locationCost.isSuccess])

  useEffect(() => {
    if (defaultAddress.isSuccess) {
      setDestination({
        city: defaultAddress.data?.data?.rows[0].city,
        city_id: defaultAddress.data?.data?.rows[0].city_id,
      })
    }
  }, [defaultAddress.isSuccess])

  const modal = useModal()

  return (
    <div className="rounded-md border-2 border-solid border-gray-200 px-2 py-2">
      <P className="font-bold">Delivery Estimation</P>
      <div>
        <div className="flex flex-row flex-wrap ">
          <Button
            onClick={() => {
              if (weight !== 0) {
                modal.edit({
                  title: 'Choose Destination',
                  content: (
                    <ChooseDestination
                      setDestination={(cityId: number, city: string) => {
                        setDestination({ city: city, city_id: cityId })
                      }}
                    />
                  ),
                  closeButton: false,
                })
              }
            }}
            className="flex-start btn flex w-fit  gap-4 border-none bg-white py-0 text-black hover:bg-white hover:text-primary"
          >
            {' '}
            To {destination.city}
          </Button>
          <div className="block">
            <Menu>
              <Menu.Button className="btn  w-fit gap-2  border-none bg-white py-0 text-start text-black hover:bg-white hover:text-primary">
                Delivery Fee Rp.{' '}
                {minMax.max === 0 && minMax.min === 0 ? (
                  <>
                    -
                    <span className="text-start  italic text-gray-400">
                      {' '}
                      Choose variant first
                    </span>
                  </>
                ) : (
                  <>
                    {formatMoney(minMax.min)} - Rp. {formatMoney(minMax.max)}
                  </>
                )}
              </Menu.Button>

              {!locationCost.isLoading ? (
                locationCost.isSuccess ? (
                  locationCost.data?.data?.data?.shipping_option.length > 0 ? (
                    <div>
                      <Menu.Items className="absolute max-h-44 w-56 origin-top-left divide-y divide-gray-100  overflow-x-hidden overflow-y-scroll rounded-md bg-white shadow-lg focus:outline-none ">
                        {locationCost.data.data.data.shipping_option.map(
                          (shipping, index) => (
                            <div key={index} className={'flex justify-center'}>
                              <Menu.Item>
                                {() => (
                                  <Button className="btn m-1 mx-auto  h-20 w-44 gap-2 border-gray-300 bg-white text-primary outline hover:border-white hover:bg-primary hover:text-white">
                                    <a className="flex flex-col gap-1">
                                      <span className="text-lg font-bold">
                                        {shipping.courier.name}
                                      </span>
                                      <span className="">
                                        Rp. {shipping.fee}
                                      </span>
                                      <span>
                                        {shipping.etd.replace(/\D/g, '')} Days
                                      </span>
                                    </a>
                                  </Button>
                                )}
                              </Menu.Item>
                            </div>
                          )
                        )}
                      </Menu.Items>
                    </div>
                  ) : (
                    <></>
                  )
                ) : (
                  <Menu.Items className="absolute w-56 origin-top-left divide-y divide-gray-100 rounded-md  bg-white text-center italic text-gray-400 shadow-lg focus:outline-none ">
                    Choose variant first
                  </Menu.Items>
                )
              ) : (
                <>
                  <Spinner />
                </>
              )}
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryInformation