import { Button, Chip, H2, P } from '@/components'
import voucherData from '@/dummy/voucherData'
import cx from '@/helper/cx'
import SellerPanelLayout from '@/layout/SellerPanelLayout'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  useDeleteSellerVouchers,
  useSellerVouchers,
} from '@/api/seller/voucher'
import Table from '@/components/table'
import type { VoucherData } from '@/types/api/voucher'
import type { APIResponse, PaginationData } from '@/types/api/response'
import moment from 'moment'
import formatMoney from '@/helper/formatMoney'
import { useModal } from '@/hooks'
import { useDispatch } from 'react-redux'
import { closeModal } from '@/redux/reducer/modalReducer'
import { HiTrash } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
function Vouchers() {
  const [voucherStatus, setVoucherStatus] = useState('')

  const sellerVoucher = useSellerVouchers(voucherStatus)

  const modal = useModal()
  const dispatch = useDispatch()
  const deleteSellerVoucher = useDeleteSellerVouchers()

  const ChangeVoucherStatusPage = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    setVoucherStatus(e.currentTarget.value)
  }

  function deleteVoucher(id: string) {
    deleteSellerVoucher.mutate(id)
  }

  useEffect(() => {
    if (deleteSellerVoucher.isSuccess) {
      toast.success('Successfully delete voucher')
      dispatch(closeModal())
    }
  }, [deleteSellerVoucher.isSuccess])

  useEffect(() => {
    if (deleteSellerVoucher.isError) {
      const errmsg = deleteSellerVoucher.failureReason as AxiosError<
        APIResponse<null>
      >
      toast.error(errmsg.response?.data.message as string)
    }
  }, [deleteSellerVoucher.isError])
  const formatSub = (pagination?: PaginationData<VoucherData>) => {
    if (pagination) {
      if (pagination.rows?.length) {
        return pagination.rows.map((data) => {
          return {
            'Created Date': (
              <div>{moment(data.created_at).format('dddd, DD MMM YYYY')}</div>
            ),
            Code: <div>{data.code}</div>,
            Qouta: <div>{data.quota}</div>,
            Status: (
              <div>
                {Date.now() >= Date.parse(data.actived_date) &&
                Date.now() <= Date.parse(data.expired_date) ? (
                  <Chip type="success"> On Going</Chip>
                ) : (
                  <></>
                )}
                {Date.now() < Date.parse(data.actived_date) ? (
                  <Chip type="secondary">Will Come</Chip>
                ) : (
                  <></>
                )}
                {Date.now() > Date.parse(data.expired_date) ? (
                  <Chip type="error">Has Ended</Chip>
                ) : (
                  <></>
                )}
              </div>
            ),
            'Active Date': (
              <div>
                <P>{moment(data.actived_date).format('DD MMMM YYYY')}</P>
                <P className="font-bold">until</P>
                <P>{moment(data.expired_date).format('DD MMMM YYYY')}</P>
              </div>
            ),
            Discount: (
              <div>
                {data.discount_percentage > 0 &&
                data.discount_fix_price <= 0 ? (
                  <>{data.discount_percentage}%</>
                ) : (
                  <></>
                )}
                {data.discount_percentage <= 0 &&
                data.discount_fix_price > 0 ? (
                  <>
                    Rp
                    {formatMoney(data.discount_fix_price)}
                  </>
                ) : (
                  <></>
                )}
              </div>
            ),

            Action: (
              <div className="flex w-fit flex-col gap-1">
                {Date.now() < Date.parse(data.actived_date) ? (
                  <Button
                    buttonType="primary"
                    outlined
                    onClick={() => {
                      modal.edit({
                        title: 'Delete Voucher',
                        content: (
                          <>
                            <P>Do you really want to delete this voucher?</P>
                            <div className="mt-4 flex justify-end gap-2">
                              <Button
                                type="button"
                                outlined
                                buttonType="primary"
                                onClick={() => {
                                  dispatch(closeModal())
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                buttonType="primary"
                                onClick={() => {
                                  deleteVoucher(data.id)
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </>
                        ),
                        closeButton: false,
                      })
                    }}
                  >
                    <HiTrash /> Delete
                  </Button>
                ) : (
                  <></>
                )}
              </div>
            ),
          }
        })
      }
    }
    return [
      {
        'Created Date': '',
        Code: '',
        Status: '',
        Qouta: '',
        'Active Date': '',
        'Discount ': '',
      },
    ]
  }
  return (
    <div>
      <Head>
        <title>Murakali | Voucher Panel</title>
      </Head>
      <SellerPanelLayout selectedPage="voucher">
        <H2>Vouchers</H2>
        <div className="mt-3 flex h-full flex-col rounded border bg-white p-6 ">
          <div className="my-4 flex h-fit w-fit max-w-full space-x-10 overflow-x-auto overflow-y-hidden whitespace-nowrap border-b-[2px]">
            <button
              onClick={() => setVoucherStatus('')}
              className={cx(
                'h-full border-b-[3px] transition-all',
                voucherStatus === '' ? 'border-primary' : 'border-transparent'
              )}
            >
              All Order
            </button>
            {voucherData.map((status, index) => {
              return (
                <button
                  key={index}
                  onClick={(e) => ChangeVoucherStatusPage(e)}
                  value={status.id}
                  className={cx(
                    'h-full whitespace-nowrap border-b-[3px] transition-all',
                    voucherStatus === status.id
                      ? 'border-primary'
                      : 'border-transparent'
                  )}
                >
                  {status.name}
                </button>
              )
            })}
          </div>
          <div className="max-w-full overflow-auto">
            {sellerVoucher.isLoading ? (
              <Table data={formatSub()} isLoading />
            ) : sellerVoucher.isSuccess ? (
              <Table
                data={formatSub(sellerVoucher.data?.data)}
                isLoading={false}
                empty={sellerVoucher.data?.data?.rows?.length === 0}
              />
            ) : (
              <div>{'Error'}</div>
            )}
          </div>
        </div>
      </SellerPanelLayout>
      Vouchers
    </div>
  )
}

export default Vouchers