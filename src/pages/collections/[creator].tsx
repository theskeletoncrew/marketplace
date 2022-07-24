import {
  gql,
  useQuery,
  useLazyQuery,
  QueryResult,
  OperationVariables,
} from '@apollo/client'
import { useWallet } from '@solana/wallet-adapter-react'
import cx from 'classnames'
import { subDays } from 'date-fns'
import { NextPage, NextPageContext } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  always,
  any,
  equals,
  filter,
  ifElse,
  indexOf,
  isEmpty,
  isNil,
  length,
  map,
  modify,
  zip,
  forEach,
  not,
  or,
  partial,
  pipe,
  prop,
  when,
} from 'ramda'
import React, { useEffect, useState, ReactElement } from 'react'
import { Filter } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import Select from 'react-select'
import { toSOL } from '../../modules/sol'
import { BannerLayout } from './../../layouts/Banner'
import {
  GetNftCounts,
  GetWalletCounts,
  GET_LISTED_TOKEN_NFT_COUNT,
  GET_NFT_COUNTS,
  GET_WALLET_COUNTS,
} from '..'
import client from '../../client'
import Button, { ButtonSize, ButtonType } from '../../components/Button'
import { List } from '../../components/List'
import { NftCard } from '../../components/NftCard'
import { useSidebar } from '../../hooks/sidebar'
import {
  truncateAddress,
  collectionNameByAddress,
  collectionDescriptionByAddress,
  howrareisJSONByAddress,
  moonrankJSONByAddress,
} from '../../modules/address'
import {
  AttributeFilter,
  Creator,
  Marketplace,
  Nft,
  PresetNftFilter,
  GetPriceChartData,
} from '@holaplex/marketplace-js-sdk'
import { useTokenList } from 'src/hooks/tokenList'

import { ADDRESSES } from '../../utils/utilities'

const SUBDOMAIN = process.env.MARKETPLACE_SUBDOMAIN

type OptionType = { label: string; value: string }
type OptionsType = Array<OptionType>
type ValueType = OptionType | OptionsType | null | void

interface GetNftsData {
  nfts: Nft[]
  creator: Creator
}

const GET_NFTS = gql`
  query GetNfts(
    $creators: [PublicKey!]!
    $owners: [PublicKey!]
    $listed: Boolean
    $auctionHouses: [PublicKey!]
    $offerers: [PublicKey!]
    $limit: Int!
    $offset: Int!
    $attributes: [AttributeFilter!]
  ) {
    nfts(
      creators: $creators
      owners: $owners
      auctionHouses: $auctionHouses
      listed: $listed
      offerers: $offerers
      limit: $limit
      offset: $offset
      attributes: $attributes
    ) {
      address
      name
      description
      image
      owner {
        address
        associatedTokenAccountAddress
      }
      creators {
        address
        verified
        twitterHandle
        profile {
          handle
          profileImageUrlLowres
          bannerImageUrl
        }
      }
      offers {
        id
      }
      listings {
        id
        auctionHouse {
          address
          treasuryMint
        }
        price
      }
    }
  }
`

const GET_COLLECTION_INFO = gql`
  query GetCollectionInfo($creator: String!, $auctionHouses: [PublicKey!]!) {
    creator(address: $creator) {
      address
      stats(auctionHouses: $auctionHouses) {
        auctionHouse {
          address
          treasuryMint
        }
        volume24hr
        average
        floor
      }
      counts {
        creations
      }
      attributeGroups {
        name
        variants {
          name
          count
        }
      }
    }
  }
`

export const GET_PRICE_CHART_DATA = gql`
  query GetPriceChartData(
    $auctionHouses: [PublicKey!]!
    $creators: [PublicKey!]!
    $startDate: DateTimeUtc!
    $endDate: DateTimeUtc!
  ) {
    charts(
      auctionHouses: $auctionHouses
      creators: $creators
      startDate: $startDate
      endDate: $endDate
    ) {
      salesAverage {
        price
        date
      }
    }
  }
`

export async function getServerSideProps({ req, query }: NextPageContext) {
  const subdomain = req?.headers['x-holaplex-subdomain']

  const {
    data: { marketplace, creator },
  } = await client.query<GetCollectionPage>({
    fetchPolicy: 'no-cache',
    query: gql`
      query GetCollectionPage($subdomain: String!, $creator: String!) {
        marketplace(subdomain: $subdomain) {
          subdomain
          name
          description
          logoUrl
          bannerUrl
          ownerAddress
          creators {
            creatorAddress
            storeConfigAddress
          }
          auctionHouses {
            address
            treasuryMint
            authority
          }
        }
        creator(address: $creator) {
          address
        }
      }
    `,
    variables: {
      subdomain: subdomain || SUBDOMAIN,
      creator: query.creator,
    },
  })

  if (
    or(
      any(isNil)([marketplace, creator]),
      or(
        creator?.address == ADDRESSES.DUPLICATE_COLLECTION,
        pipe(
          map(prop('creatorAddress')),
          indexOf(query.creator),
          equals(-1)
        )(marketplace?.creators || [])
      )
    )
  ) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      marketplace,
      creator,
    },
  }
}

interface GetCollectionPage {
  marketplace: Marketplace | null
  creator: Creator | null
}

interface GetCollectionInfo {
  creator: Creator
}

interface CreatorPageProps extends AppProps {
  marketplace: Marketplace
  creator: Creator
}

interface NftFilterForm {
  attributes: AttributeFilter[]
  preset: PresetNftFilter
  tokens: string[]
}

const startDate = subDays(new Date(), 6).toISOString()
const endDate = new Date().toISOString()

function CreatorShow({ marketplace, creator }: CreatorPageProps) {
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const [hasMore, setHasMore] = useState(true)
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const router = useRouter()
  const [listedCountQueryMap, setListedCountQueryMap] = useState<
    Map<String, QueryResult<GetNftCounts, OperationVariables>>
  >(new Map())
  const auctionHouses = map(prop('address'))(marketplace.auctionHouses || [])

  const {
    data,
    loading: loadingNfts,
    refetch,
    fetchMore,
    variables,
  } = useQuery<GetNftsData>(GET_NFTS, {
    variables: {
      creators: [router.query.creator],
      auctionHouses: auctionHouses,
      offset: 0,
      limit: 24,
    },
  })

  const collectionQuery = useQuery<GetCollectionInfo>(GET_COLLECTION_INFO, {
    variables: {
      creator: router.query.creator,
      auctionHouses: auctionHouses,
    },
  })

  const nftCountsQuery = useQuery<GetNftCounts>(GET_NFT_COUNTS, {
    variables: {
      creators: [router.query.creator],
      auctionHouses: auctionHouses,
    },
  })

  useEffect(() => {
    if (!marketplace.auctionHouses) {
      return
    }

    ;(async () => {
      const nextListedCountQueryMap = new Map()

      const tokenCounts = await Promise.all(
        marketplace.auctionHouses.map(({ address }) =>
          client.query<GetNftCounts>({
            query: GET_LISTED_TOKEN_NFT_COUNT,
            variables: {
              creators: [router.query.creator],
              auctionHouse: address,
            },
          })
        )
      )

      pipe(
        zip(marketplace.auctionHouses),
        forEach(([auctionHouse, queryResult]) => {
          nextListedCountQueryMap.set(auctionHouse.treasuryMint, queryResult)
        })
      )(tokenCounts)

      setListedCountQueryMap(nextListedCountQueryMap)
    })()
  }, [marketplace.auctionHouses])

  const [getWalletCounts, walletCountsQuery] = useLazyQuery<GetWalletCounts>(
    GET_WALLET_COUNTS,
    {
      variables: {
        address: publicKey?.toBase58(),
        creators: [router.query.creator],
        auctionHouses: auctionHouses,
      },
    }
  )

  const priceChartDataQuery = useQuery<GetPriceChartData>(
    GET_PRICE_CHART_DATA,
    {
      variables: {
        auctionHouses: auctionHouses,
        creators: [router.query.creator],
        startDate: startDate,
        endDate: endDate,
      },
    }
  )

  const { watch, control, getValues } = useForm<NftFilterForm>({
    defaultValues: { preset: PresetNftFilter.All, tokens: [] },
  })
  const [tokenMap, loadingTokens] = useTokenList()

  const tokens = marketplace?.auctionHouses?.map(({ treasuryMint }) =>
    tokenMap.get(treasuryMint)
  )

  const loading =
    loadingNfts ||
    collectionQuery.loading ||
    nftCountsQuery.loading ||
    walletCountsQuery.loading

  useEffect(() => {
    if (publicKey) {
      getWalletCounts()
    }
  }, [publicKey, getWalletCounts])

  useEffect(() => {
    const subscription = watch(({ attributes, preset }) => {
      let selectedAuctionHouses = auctionHouses
      if (
        preset === PresetNftFilter.Listed &&
        tokens?.some((t) => t !== undefined)
      ) {
        selectedAuctionHouses = marketplace.auctionHouses
          ?.filter(({ treasuryMint }) => tokens?.includes(treasuryMint))
          .map(({ address }) => address) as string[]
      }

      const pubkey = publicKey?.toBase58()
      const nextAttributes = attributes
        ? pipe(
            filter(pipe(prop('values'), isEmpty, not)),
            map(modify('values', map(prop('value'))))
          )(attributes)
        : undefined

      const owners = ifElse(
        equals(PresetNftFilter.Owned),
        always([pubkey]),
        always(null)
      )(preset as PresetNftFilter)

      const offerers = ifElse(
        equals(PresetNftFilter.OpenOffers),
        always([pubkey]),
        always(null)
      )(preset as PresetNftFilter)

      const listed = ifElse(
        equals(PresetNftFilter.Listed),
        always(true),
        always(null)
      )(preset as PresetNftFilter)

      refetch({
        creators: [router.query.creator],
        auctionHouses: selectedAuctionHouses,
        attributes: nextAttributes,
        owners,
        offerers,
        listed,
        offset: 0,
      }).then(({ data: { nfts } }) => {
        pipe(pipe(length, equals(variables?.limit)), setHasMore)(nfts)
      })
    })
    return () => subscription.unsubscribe()
  }, [
    watch,
    publicKey,
    marketplace,
    refetch,
    variables?.limit,
    router.query.creator,
    creator,
  ])

  const moonrank = moonrankJSONByAddress(router.query?.creator as string)
  const howrareis = howrareisJSONByAddress(router.query?.creator as string)

  return (
    <>
      <Head>
        <title>
          {truncateAddress(router.query?.creator as string)} NFT Collection |{' '}
          {marketplace.name}
        </title>
        <link rel="icon" href={marketplace.logoUrl} />
        <link rel="stylesheet" href="https://use.typekit.net/nxe8kpf.css" />
        <meta property="og:site_name" content={marketplace.name} />
        <meta
          property="og:title"
          content={`${truncateAddress(
            router.query?.creator as string
          )} NFT Collection | ${marketplace.name}`}
        />
        <meta property="og:image" content={marketplace.bannerUrl} />
        <meta property="og:description" content={marketplace.description} />
      </Head>
      <div className="w-full max-w-[1800px] px-4 sm:px-8">
        <div className="relative grid justify-between w-full grid-cols-12 gap-4 mt-20 mb-10">
          <div className="col-span-12 mb-6 md:col-span-8">
            <img
              src={marketplace.logoUrl}
              alt={marketplace.name}
              className="absolute object-cover bg-gray-900 border-4 border-gray-900 rounded-full w-28 h-28 -top-32"
            />
            <h2 className="text-xl text-gray-300">{marketplace.name}</h2>
            <h1 className="mb-4">
              {collectionNameByAddress(router.query?.creator as string)}
            </h1>
            <p>
              {collectionDescriptionByAddress(router.query?.creator as string)}
            </p>
          </div>
          <div className="grid grid-cols-2 col-span-12 gap-4 md:col-span-4 md:-mt-8">
            <div>
              <span className="block w-full mb-2 text-sm font-semibold text-gray-300 uppercase">
                Floor
              </span>
              {loading ? (
                <div className="block w-20 h-6 bg-gray-800 rounded" />
              ) : (
                <span className="text-xl sol-amount font-semibold">
                  {toSOL(
                    ifElse(isEmpty, always(0), (stats) =>
                      stats[0].floor.toNumber()
                    )(collectionQuery.data?.creator.stats) as number
                  )}
                </span>
              )}
            </div>
            <div>
              <span className="block w-full mb-2 text-sm font-semibold text-gray-300 uppercase">
                Vol Last 24 hrs
              </span>
              {loading ? (
                <div className="block w-20 h-6 bg-gray-800 rounded" />
              ) : (
                <span className="text-xl sol-amount font-semibold">
                  {toSOL(
                    ifElse(isEmpty, always(0), (stats) =>
                      stats[0].volume24hr.toNumber()
                    )(collectionQuery.data?.creator.stats) as number
                  )}
                </span>
              )}
            </div>
            <div>
              <span className="block w-full mb-2 text-sm font-semibold text-gray-300 uppercase">
                Avg Sale Price
              </span>
              {loading ? (
                <div className="block w-16 h-6 bg-gray-800 rounded" />
              ) : (
                <span className="text-xl sol-amount font-semibold">
                  {toSOL(
                    ifElse(isEmpty, always(0), (stats) =>
                      stats[0].average.toNumber()
                    )(collectionQuery.data?.creator.stats) as number
                  )}
                </span>
              )}
            </div>
            <div>
              <span className="block w-full mb-2 text-sm font-semibold text-gray-300 uppercase">
                NFTs
              </span>
              {loading ? (
                <div className="block w-24 h-6 bg-gray-800 rounded" />
              ) : (
                <span className="text-xl font-semibold">
                  {collectionQuery.data?.creator.counts?.creations || 0}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="relative">
            <div
              className={cx(
                'fixed top-0 right-0 bottom-0 left-0 z-10 bg-gray-900 flex-row flex-none space-y-2 md:sticky md:block md:w-80 md:mr-10 overflow-auto h-screen',
                {
                  hidden: not(sidebarOpen),
                }
              )}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                }}
                className="px-4 py-4 sm:px-0"
              >
                <ul className="flex flex-col gap-2 flex-grow mb-6">
                  <li>
                    <Controller
                      control={control}
                      name="preset"
                      render={({ field: { value, onChange } }) => (
                        <label
                          htmlFor="preset-all"
                          className={cx(
                            'flex items-center w-full px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800',
                            {
                              'bg-gray-800': loading,
                            }
                          )}
                        >
                          <input
                            onChange={onChange}
                            className="mr-3 appearance-none rounded-full h-3 w-3 
                                border border-gray-100 bg-gray-700 
                                checked:bg-gray-100 focus:outline-none bg-no-repeat bg-center bg-contain"
                            type="radio"
                            name="preset"
                            disabled={loading}
                            hidden={loading}
                            value={PresetNftFilter.All}
                            id="preset-all"
                            checked={value === PresetNftFilter.All}
                          />
                          {loading ? (
                            <div className="h-6 w-full" />
                          ) : (
                            <div className="w-full flex justify-between">
                              <div>All</div>
                              <div className="text-gray-300">
                                {nftCountsQuery.data?.nftCounts.total}
                              </div>
                            </div>
                          )}
                        </label>
                      )}
                    />
                  </li>
                  <li>
                    <Controller
                      control={control}
                      name="preset"
                      render={({ field: { value, onChange } }) => (
                        <label
                          htmlFor="preset-listed"
                          className={cx(
                            'flex items-center w-full px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800',
                            {
                              'bg-gray-800': loading,
                            }
                          )}
                        >
                          <input
                            onChange={onChange}
                            className="mr-3 appearance-none rounded-full h-3 w-3 
                                border border-gray-100 bg-gray-700 
                                checked:bg-gray-100 focus:outline-none bg-no-repeat bg-center bg-contain"
                            disabled={loading}
                            hidden={loading}
                            type="radio"
                            name="preset"
                            value={PresetNftFilter.Listed}
                            id="preset-listed"
                          />
                          {loading ? (
                            <div className="h-6 w-full" />
                          ) : (
                            <div className="w-full flex justify-between">
                              <div>Current listings</div>
                              <div className="text-gray-300">
                                {nftCountsQuery.data?.nftCounts.listed}
                              </div>
                            </div>
                          )}
                        </label>
                      )}
                    />
                  </li>
                  {connected && (
                    <>
                      <li>
                        <Controller
                          control={control}
                          name="preset"
                          render={({ field: { value, onChange } }) => (
                            <label
                              htmlFor="preset-owned"
                              className={cx(
                                'flex items-center w-full px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800',
                                {
                                  'bg-gray-800': loading,
                                }
                              )}
                            >
                              <input
                                onChange={onChange}
                                className="mr-3 appearance-none rounded-full h-3 w-3 
                                    border border-gray-100 bg-gray-700 
                                    checked:bg-gray-100 focus:outline-none bg-no-repeat bg-center bg-contain"
                                type="radio"
                                name="preset"
                                disabled={loading}
                                hidden={loading}
                                value={PresetNftFilter.Owned}
                                id="preset-owned"
                              />
                              {loading ? (
                                <div className="h-6 w-full" />
                              ) : (
                                <div className="w-full flex justify-between">
                                  <div>Owned by me</div>
                                  <div className="text-gray-300">
                                    {
                                      walletCountsQuery.data?.wallet?.nftCounts
                                        .owned
                                    }
                                  </div>
                                </div>
                              )}
                            </label>
                          )}
                        />
                      </li>
                      <li>
                        <Controller
                          control={control}
                          name="preset"
                          render={({ field: { value, onChange } }) => (
                            <label
                              htmlFor="preset-open"
                              className={cx(
                                'flex items-center w-full px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800',
                                {
                                  'bg-gray-800': loading,
                                }
                              )}
                            >
                              <input
                                onChange={onChange}
                                className="mr-3 appearance-none rounded-full h-3 w-3 
                                    border border-gray-100 bg-gray-700 
                                    checked:bg-gray-100 focus:outline-none bg-no-repeat bg-center bg-contain"
                                disabled={loading}
                                hidden={loading}
                                type="radio"
                                name="preset"
                                value={PresetNftFilter.OpenOffers}
                                id="preset-open"
                              />
                              {loading ? (
                                <div className="h-6 w-full" />
                              ) : (
                                <div className="w-full flex justify-between">
                                  <div>My open offers</div>
                                  <div className="text-gray-300">
                                    {
                                      walletCountsQuery.data?.wallet?.nftCounts
                                        .offered
                                    }
                                  </div>
                                </div>
                              )}
                            </label>
                          )}
                        />
                      </li>
                    </>
                  )}
                </ul>
                <div className="flex flex-col flex-grow gap-4">
                  {loading ? (
                    <>
                      <div className="flex flex-col flex-grow gap-2">
                        <label className="block h-4 bg-gray-800 rounded w-14" />
                        <div className="block w-full h-10 bg-gray-800 rounded" />
                      </div>
                      <div className="flex flex-col flex-grow gap-2">
                        <label className="block h-4 bg-gray-800 rounded w-14" />
                        <div className="block w-full h-10 bg-gray-800 rounded" />
                      </div>
                      <div className="flex flex-col flex-grow gap-2">
                        <label className="block h-4 bg-gray-800 rounded w-14" />
                        <div className="block w-full h-10 bg-gray-800 rounded" />
                      </div>
                      <div className="flex flex-col flex-grow gap-2">
                        <label className="block h-4 bg-gray-800 rounded w-14" />
                        <div className="block w-full h-10 bg-gray-800 rounded" />
                      </div>
                    </>
                  ) : (
                    collectionQuery.data?.creator.attributeGroups.map(
                      ({ name: group, variants }, index) => (
                        <div
                          className="flex flex-col flex-grow gap-2"
                          key={group}
                        >
                          <label className="label">{group}</label>
                          <Controller
                            control={control}
                            name={`attributes.${index}`}
                            defaultValue={{ traitType: group, values: [] }}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <Select
                                  value={value.values}
                                  isMulti
                                  className="select-base-theme"
                                  classNamePrefix="base"
                                  onChange={(next: ValueType<OptionType>) => {
                                    onChange({ traitType: group, values: next })
                                  }}
                                  options={
                                    variants.map(({ name, count }) => ({
                                      value: name,
                                      label: `${name} (${count})`,
                                    })) as OptionsType<OptionType>
                                  }
                                />
                              )
                            }}
                          />
                        </div>
                      )
                    )
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="grow">
            <List
              data={data?.nfts}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={async (inView) => {
                if (not(inView)) {
                  return
                }

                const {
                  data: { nfts },
                } = await fetchMore({
                  variables: {
                    ...variables,
                    offset: length(data?.nfts || []),
                  },
                })

                when(isEmpty, partial(setHasMore, [false]))(nfts)
              }}
              loadingComponent={<NftCard.Skeleton />}
              emptyComponent={
                <div className="w-full p-10 text-center border border-gray-800 rounded-lg">
                  <h3>No NFTs found</h3>
                  <p className="text-gray-500 mt-">
                    No NFTs found matching these criteria.
                  </p>
                </div>
              }
              itemRender={(nft) => {
                return (
                  <Link
                    href={`/nfts/${nft.address}`}
                    key={nft.address}
                    passHref
                  >
                    <a>
                      <NftCard
                        nft={nft}
                        marketplace={marketplace}
                        tokenMap={tokenMap}
                        moonrank={
                          (moonrank && moonrank[nft.mintAddress]) || undefined
                        }
                        howrareis={
                          (howrareis && howrareis[nft.mintAddress]) || undefined
                        }
                      />
                    </a>
                  </Link>
                )
              }}
            />
          </div>
        </div>
        <Button
          size={ButtonSize.Small}
          icon={<Filter size={16} className="mr-2" />}
          className="fixed z-10 bottom-4 md:hidden"
          onClick={toggleSidebar}
        >
          Filter
        </Button>
      </div>
    </>
  )
}

interface CreatorShowLayoutProps {
  marketplace: Marketplace
  children: ReactElement
}

CreatorShow.getLayout = function GetLayout({
  marketplace,
  children,
}: CreatorShowLayoutProps): ReactElement {
  return <BannerLayout marketplace={marketplace}>{children}</BannerLayout>
}

export default CreatorShow
