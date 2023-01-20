import { useSellerPromotions } from '@/api/seller/promotion'
import { Button, Chip, H2, P, PaginationNav, TextInput } from '@/components'
import Table from '@/components/table'
import PromotionStatusData from '@/dummy/promotionStatusData'
import cx from '@/helper/cx'
import SellerPanelLayout from '@/layout/SellerPanelLayout'
import type { SellerPromotion } from '@/types/api/promotion'
import type { PaginationData } from '@/types/api/response'
import moment from 'moment'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { HiDuplicate, HiPencil, HiPlus } from 'react-icons/hi'
import formatMoney from '@/helper/formatMoney'

function PromotionSeller() {
  const router = useRouter()
  const [promoStatus, setPromoStatus] = useState('1')
  const getSellerPromotions = useSellerPromotions(promoStatus)
  const promoStatusData = PromotionStatusData

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const formatData = (data?: PaginationData<SellerPromotion>) => {
    if (data?.rows?.length > 0) {
      return data.rows.map((row) => ({
        'Promotion Name': <div>{row.promotion_name}</div>,
        Product: (
          <div className="flex gap-3">
            <div className="w-[96px] flex-1">
              {row.product_thumbnail_url !== null ? (
                <Image
                  width={96}
                  height={96}
                  src={row.product_thumbnail_url}
                  alt={row.product_name}
                  className={'aspect-square h-24 w-24'}
                />
              ) : (
                <Image
                  width={96}
                  height={96}
                  src={'/asset/image-empty.jpg'}
                  alt={row.product_name}
                  className={'aspect-square h-24 w-24'}
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-1">
              <P className="w-[15rem] font-semibold line-clamp-2">
                {row.product_name}
              </P>
            </div>
          </div>
        ),
        Quantity: (
          <div>
            <div className="flex gap-2">
              <P className="">{row.quota}</P>
            </div>
          </div>
        ),
        Status: (
          <div>
            {new Date() < new Date(row.actived_date) &&
            new Date() < new Date(row.expired_date) ? (
              <div>
                <Chip type="accent">Will Come</Chip>
              </div>
            ) : new Date() > new Date(row.actived_date) &&
              new Date() < new Date(row.expired_date) ? (
              <div>
                <Chip type="primary">OnGoing</Chip>
              </div>
            ) : new Date() > new Date(row.actived_date) &&
              new Date() > new Date(row.expired_date) ? (
              <div>
                <Chip type="gray">Has Ended</Chip>
              </div>
            ) : (
              <></>
            )}
          </div>
        ),
        Period: (
          <div>
            <P>{moment(row.actived_date).format('DD MMM YYYY HH:mm:ss')}</P>
            {' - '}
            <P>{moment(row.expired_date).format('DD MMM YYYY HH:mm:ss')}</P>
          </div>
        ),
        Discount: (
          <div>
            {row.discount_percentage > 0 && row.discount_fix_price <= 0 ? (
              <>{row.discount_percentage}%</>
            ) : (
              <></>
            )}
            {row.discount_percentage <= 0 && row.discount_fix_price > 0 ? (
              <>
                Rp
                {formatMoney(row.discount_fix_price)}
              </>
            ) : (
              <></>
            )}
          </div>
        ),

        Action: (
          <div className="flex flex-col gap-2">
            <Button
              buttonType="gray"
              size="sm"
              className="rounded"
              onClick={() => {
                router.push({
                  pathname: '/seller-panel/promotion/' + row.id,
                })
              }}
            >
              Look Detail
            </Button>
            <Button
              size="sm"
              buttonType="ghost"
              outlined
              onClick={() => {
                router.push(
                  '/seller-panel/products/manage?intent=edit&product_id=' +
                    row.id
                )
              }}
            >
              <HiPencil /> Edit
            </Button>
            <Button
              size="sm"
              buttonType="ghost"
              onClick={() => {
                router.push(
                  '/seller-panel/products/manage?intent=add&product_id=' +
                    row.id
                )
              }}
            >
              <HiDuplicate /> Duplicate
            </Button>
          </div>
        ),
      }))
    }

    return [
      {
        'Promotion Name': '',
        Product: '',
        Quantity: '',
        Status: '',
        Period: '',
        Discount: '',
        Action: '',
      },
    ]
  }

  const ChangePromoStatusPage = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    setPromoStatus(e.currentTarget.value)
  }

  useEffect(() => {
    if (promoStatus === '') {
      setPromoStatus('1')
    }
    router.push({
      pathname: '/seller-panel/promotion',
      query: {
        promo_status: promoStatus,
      },
    })
  }, [promoStatus])
  return (
    <div>
      <Head>
        <title>Murakali | Seller Panel</title>
      </Head>
      <SellerPanelLayout selectedPage="promotion">
        <div className="flex w-full items-center justify-between">
          <H2>Promotion List</H2>
          <Button
            size={'sm'}
            buttonType="primary"
            outlined
            onClick={() => {
              router.push('/seller-panel/promotion/manage?intent=add')
            }}
          >
            <HiPlus /> Add Promotion
          </Button>
        </div>
        <div className="mt-3 flex max-w-full flex-col overflow-auto rounded border bg-white px-6 pt-6">
          <div className="my-4 flex h-fit w-fit max-w-full space-x-10 overflow-x-auto overflow-y-hidden whitespace-nowrap border-b-[2px]">
            {promoStatusData.map((status, index) => {
              return (
                <button
                  key={index}
                  onClick={(e) => ChangePromoStatusPage(e)}
                  value={status.id}
                  className={cx(
                    'h-full whitespace-nowrap border-b-[3px] transition-all',
                    promoStatus === status.id
                      ? 'border-primary'
                      : 'border-transparent'
                  )}
                >
                  {status.name}
                </button>
              )
            })}
          </div>
          <Table
            empty={getSellerPromotions.isLoading || getSellerPromotions.isError}
            data={formatData(getSellerPromotions.data?.data)}
            isLoading={getSellerPromotions.isLoading}
          />
          <div className="mt-3 flex min-h-[6rem] items-center gap-2">
            <P>Showing</P>
            <TextInput
              inputSize="sm"
              className="w-[4rem]"
              full
              value={limit}
              type={'number'}
              min={1}
              max={100}
              onChange={(e) => {
                const parsed = parseInt(e.target.value)
                setLimit(
                  Number.isNaN(parsed)
                    ? 0
                    : parsed < 0
                    ? 0
                    : parsed >= 100
                    ? 100
                    : parsed
                )
              }}
            />
            <P>of {getSellerPromotions.data?.data?.total_rows} entries</P>
          </div>
        </div>
        {getSellerPromotions.data?.data ? (
          <div className="mt-4 flex h-[8rem] w-full justify-center">
            <PaginationNav
              page={page}
              total={getSellerPromotions.data.data.total_pages}
              onChange={(p) => setPage(p)}
            />
          </div>
        ) : (
          <></>
        )}
      </SellerPanelLayout>
    </div>
  )
}

export default PromotionSeller