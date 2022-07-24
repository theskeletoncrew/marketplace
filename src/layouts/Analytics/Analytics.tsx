import React, { ReactElement, useEffect, useState } from 'react'
import { gql, useQuery, QueryResult, OperationVariables } from '@apollo/client'
import Head from 'next/head'
import { PublicKey } from '@solana/web3.js'
import {
  always,
  and,
  equals,
  find,
  gt,
  ifElse,
  isNil,
  length,
  not,
  pipe,
  prop,
  when,
} from 'ramda'
import Link from 'next/link'
import { DollarSign, Tag } from 'react-feather'
import { truncateAddress, addressAvatar } from '../../modules/address'
import {
  Activity,
  Marketplace,
  GetActivities,
  GetPriceChartData,
  AuctionHouse,
  PriceChart,
} from '@holaplex/marketplace-js-sdk'
import { format } from 'timeago.js'
import cx from 'classnames'
import { BasicLayout, NavigationLink } from '../Basic'
import Chart from './../../components/Chart'
import { Controller, useForm, useWatch } from 'react-hook-form'
import Select from 'react-select'
import { TokenInfo } from '@solana/spl-token-registry'
import { useTokenList } from '../../hooks/tokenList'
import Price from '../../components/Price'
import { isSol } from '../../modules/sol'
import { subDays } from 'date-fns'

const moreThanOne = pipe(length, (len) => gt(len, 1))

const GET_MARKETPLACE_INFO = gql`
  query GetMarketplaceInfo($subdomain: String!) {
    marketplace(subdomain: $subdomain) {
      subdomain
      ownerAddress
      stats {
        nfts
      }
      auctionHouses {
        address
        treasuryMint
        stats {
          mint
          floor
          average
          volume24hr
          volumeTotal
        }
      }
    }
  }
`

interface GetMarketplaceInfo {
  marketplace: Marketplace
}

interface AnalyticsLayoutProps {
  marketplace: Marketplace
  creators?: string[]
  priceChartQuery: QueryResult<GetPriceChartData, OperationVariables>
  activitiesQuery: QueryResult<GetActivities, OperationVariables>
  title: ReactElement
  metaTitle: string
}

interface TokenFilter {
  token: ValueType<OptionType>
}

type OptionType = { label: string; value: number }

const PriceData = ({
  token,
  price,
  priceType,
  loading,
}: {
  token?: TokenInfo
  price: number
  priceType: string
  loading: boolean
}) => (
  <div className="flex flex-col">
    <span className="text-gray-300 uppercase font-semibold block w-full mb-2">
      {priceType}
    </span>
    {loading ? (
      <div className="block bg-gray-800 w-20 h-10 rounded" />
    ) : (
      <Price token={token} price={price} style="text-3xl font-bold" />
    )}
  </div>
)

export const AnalyticsLayout = ({
  marketplace,
  priceChartQuery,
  activitiesQuery,
  title,
  metaTitle,
}: AnalyticsLayoutProps) => {
  const marketplaceQuery = useQuery<GetMarketplaceInfo>(GET_MARKETPLACE_INFO, {
    variables: {
      subdomain: marketplace.subdomain,
    },
  })
  const marketplaceData = marketplaceQuery.data?.marketplace

  const [tokenMap, loadingTokens] = useTokenList()
  const tokens = marketplaceData?.auctionHouses.map(({ treasuryMint }) =>
    tokenMap.get(treasuryMint)
  )
  const defaultToken = tokens?.filter((token) => isSol(token?.address || ''))[0]

  const { control, getValues, reset, watch } = useForm<TokenFilter>()
  useWatch({ name: 'token', control })
  const selectedToken = getValues().token
  const selectedAuctionHouse = find(
    pipe(prop('treasuryMint'), equals(selectedToken?.value))
  )(marketplaceData?.auctionHouses || []) as AuctionHouse

  const stats = selectedAuctionHouse?.stats

  let {
    data: activitiesData,
    loading: activitiesLoading,
    refetch: activitiesRefetch,
  } = activitiesQuery
  let [activities, setActivities] = useState<Activity[]>(
    activitiesData?.activities || []
  )

  const startDate = subDays(new Date(), 6).toISOString()
  const endDate = new Date().toISOString()
  let {
    data: priceChartsData,
    loading: priceChartsLoading,
    refetch: priceChartsRefetch,
  } = priceChartQuery
  let [priceCharts, setPriceCharts] = useState<PriceChart>(
    priceChartsData?.charts!
  )

  const loading =
    marketplaceQuery.loading ||
    priceChartsLoading ||
    activitiesLoading ||
    loadingTokens

  useEffect(() => {
    const subscription = watch(({ token }) => {
      if (token) {
        const ah = find(pipe(prop('treasuryMint'), equals(token.value)))(
          marketplaceData?.auctionHouses || []
        ) as AuctionHouse

        activitiesRefetch({
          auctionHouses: [ah?.address || ''],
        }).then(({ data }) => {
          setActivities(data?.activities || [])
        })

        priceChartsRefetch({
          auctionHouses: [ah?.address || ''],
          startDate,
          endDate,
        }).then(({ data }) => {
          setPriceCharts(data?.charts || {})
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [
    activitiesRefetch,
    marketplaceData?.auctionHouses,
    priceChartsRefetch,
    watch,
  ])

  useEffect(() => {
    reset({
      token: { value: defaultToken?.address, label: defaultToken?.symbol },
    })
  }, [defaultToken, reset])

  return (
    <BasicLayout marketplace={marketplace} active={NavigationLink.Activity}>
      <Head>
        <title>{metaTitle}</title>
        <link rel="icon" href={marketplace.logoUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={marketplace.name} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:image" content={marketplace.bannerUrl} />
        <meta property="og:description" content={marketplace.description} />
      </Head>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <p className="mt-6 mb-2 max-w-prose">Activity and analytics for</p>
          {title}
        </div>
        <div className="flex flex-col">
          <p className="mt-6 mb-2 max-w-prose">Token</p>
          {loading ? (
            <div className="block bg-gray-800 w-20 h-10 rounded" />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <Controller
                control={control}
                name="token"
                render={({ field }) => {
                  return (
                    <Select
                      className="select-base-theme"
                      classNamePrefix="base"
                      value={field.value}
                      options={
                        tokens?.map((token) => ({
                          value: token?.address,
                          label: token?.symbol,
                        })) as OptionsType<OptionType>
                      }
                      onChange={(next: ValueType<OptionType>) => {
                        field.onChange(next)
                      }}
                    />
                  )
                }}
              />
            </form>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        <PriceData
          token={tokenMap.get(selectedToken?.value)}
          price={stats?.floor?.toNumber() || 0}
          priceType="Floor Price"
          loading={loading}
        />

        <PriceData
          token={tokenMap.get(selectedToken?.value)}
          price={stats?.average?.toNumber() || 0}
          priceType="Avg Price"
          loading={loading}
        />

        <PriceData
          token={tokenMap.get(selectedToken?.value)}
          price={stats?.volume24hr?.toNumber() || 0}
          priceType="Vol Last 24h"
          loading={loading}
        />

        <PriceData
          token={tokenMap.get(selectedToken?.value)}
          price={stats?.volumeTotal?.toNumber() || 0}
          priceType="Vol All Time"
          loading={loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-12 my-20">
        <div className="flex flex-col w-full">
          <span className="uppercase text-gray-300 text-xs font-semibold mb-6">
            Floor Price LAST 7 DAYS
          </span>
          {loading ? (
            <div className="w-full h-[200px] bg-gray-800 rounded-md" />
          ) : (
            <Chart height={200} chartData={priceCharts.listingFloor} />
          )}
        </div>
        <div className="flex flex-col w-full">
          <span className="uppercase text-gray-300 text-xs font-semibold mb-6">
            Average Price LAST 7 DAYS
          </span>
          {loading ? (
            <div className="w-full h-[200px] bg-gray-800 rounded-md" />
          ) : (
            <Chart height={200} chartData={priceCharts.salesAverage} />
          )}
        </div>
      </div>
      <h2 className="mt-14 mb-12 text-xl md:text-2xl text-bold">Activity</h2>
      <div className="mb-10">
        {ifElse(
          (activities: Activity[]) =>
            and(pipe(length, equals(0))(activities), not(loading)),
          always(
            <div className="w-full p-10 text-center border border-gray-800 rounded-lg">
              <h3>No activities found</h3>
              <p className="text-gray-500 mt-">
                There are currently no activities for this NFT.
              </p>
            </div>
          ),
          (activities: Activity[]) => (
            <section className="w-full">
              <header className="grid px-4 mb-2 grid-cols-5">
                <span className="label col-span-2">EVENT</span>
                <span className="label">WALLETS</span>
                <span className="label">PRICE</span>
                <span className="label">WHEN</span>
              </header>
              {loading ? (
                <>
                  <article className="bg-gray-800 mb-4 h-16 rounded" />
                  <article className="bg-gray-800 mb-4 h-16 rounded" />
                  <article className="bg-gray-800 mb-4 h-16 rounded" />
                  <article className="bg-gray-800 mb-4 h-16 rounded" />
                </>
              ) : (
                activities.map((a: Activity) => {
                  const hasWallets = moreThanOne(a.wallets)
                  return (
                    <article
                      key={a.id}
                      className="grid grid-cols-5 p-4 mb-4 border border-gray-700 rounded"
                    >
                      <Link href={`/nfts/${a.nft.address}`} passHref>
                        <a className="flex gap-2 items-center col-span-2">
                          <img
                            className="object-cover h-12 w-12 rounded-lg"
                            src={a.nft.image}
                          />
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{a.nft.name}</div>
                            <div className="flex">
                              {a.activityType === 'purchase' ? (
                                <DollarSign
                                  className="mr-2 self-center text-gray-300"
                                  size="16"
                                />
                              ) : (
                                <Tag
                                  className="mr-2 self-center text-gray-300"
                                  size="16"
                                />
                              )}
                              <div className="text-xs -ml-1">
                                {a.activityType === 'purchase'
                                  ? 'Sold'
                                  : 'Listed'}
                              </div>
                            </div>
                          </div>
                        </a>
                      </Link>
                      <div
                        className={cx('flex items-center self-center ', {
                          '-ml-6': hasWallets,
                        })}
                      >
                        {hasWallets && (
                          <img
                            src="/images/uturn.svg"
                            className="mr-2 text-gray-300 w-4"
                            alt="wallets"
                          />
                        )}
                        <div className="flex flex-col">
                          <a
                            href={`https://holaplex.com/profiles/${a.wallets[0].address}`}
                            rel="nofollower"
                            className="text-sm flex items-center gap-1"
                          >
                            <img
                              className="rounded-full h-5 w-5 object-cover border-2 border-gray-900 "
                              src={
                                when(
                                  isNil,
                                  always(
                                    addressAvatar(
                                      new PublicKey(a.wallets[0].address)
                                    )
                                  )
                                )(
                                  a.wallets[0].profile?.profileImageUrlLowres
                                ) as string
                              }
                            />
                            {a.wallets[0].profile?.handle
                              ? `@${a.wallets[0].profile?.handle}`
                              : truncateAddress(a.wallets[0].address)}
                          </a>
                          {hasWallets && (
                            <a
                              href={`https://holaplex.com/profiles/${a.wallets[1].address}`}
                              rel="nofollower"
                              className="text-sm flex items-center gap-1"
                            >
                              <img
                                className="rounded-full h-5 w-5 object-cover border-2 border-gray-900"
                                src={
                                  when(
                                    isNil,
                                    always(
                                      addressAvatar(
                                        new PublicKey(a.wallets[1].address)
                                      )
                                    )
                                  )(
                                    a.wallets[1].profile?.profileImageUrlLowres
                                  ) as string
                                }
                              />
                              {a.wallets[1].profile?.handle
                                ? `@${a.wallets[1].profile?.handle}`
                                : truncateAddress(a.wallets[1].address)}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="self-center">
                        <Price
                          price={a.price.toNumber()}
                          token={tokenMap.get(a.auctionHouse.treasuryMint)}
                        />
                      </div>
                      <div className="self-center text-sm">
                        {format(a.createdAt, 'en_US')}
                      </div>
                    </article>
                  )
                })
              )}
            </section>
          )
        )(activities)}
      </div>
    </BasicLayout>
  )
}
