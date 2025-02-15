import { NextPageContext } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { isNil, isEmpty } from 'ramda'
import { useRouter } from 'next/router'
import { AppProps } from 'next/app'
import client from '../../client'
import { Marketplace } from '../../types.d'
import { DropCard } from '../../components/DropCard'
import { drops } from 'src/utils/drops'
import { ReactElement } from 'react'
import { BannerLayout } from 'src/layouts/Banner'

const SUBDOMAIN = process.env.MARKETPLACE_SUBDOMAIN

interface GetMarketplace {
  marketplace: Marketplace | null
}

export async function getServerSideProps({ req }: NextPageContext) {
  const subdomain = req?.headers['x-holaplex-subdomain'] || SUBDOMAIN

  const response = await client.query<GetMarketplace>({
    fetchPolicy: 'no-cache',
    query: gql`
      query GetMarketplacePage($subdomain: String!) {
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
            auctionHouseTreasury
            treasuryWithdrawalDestination
            feeWithdrawalDestination
            authority
            creator
            auctionHouseFeeAccount
            bump
            treasuryBump
            feePayerBump
            sellerFeeBasisPoints
            requiresSignOff
            canChangeSalePrice
          }
        }
      }
    `,
    variables: {
      subdomain,
    },
  })

  const {
    data: { marketplace },
  } = response

  if (isNil(marketplace)) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      marketplace,
    },
  }
}

interface DropsPageProps extends AppProps {
  marketplace: Marketplace
}

function DropsShow({ marketplace }: DropsPageProps) {
  const { publicKey } = useWallet()
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Art Drops | Skeleton Crew</title>
        <link rel="icon" href={marketplace.logoUrl} />
        <link rel="stylesheet" href="https://use.typekit.net/nxe8kpf.css" />
        <meta property="og:site_name" content="Skeleton Crew" />
        <meta property="og:title" content="Art Drops | Skeleton Crew" />
        <meta property="og:image" content={marketplace.bannerUrl} />
        <meta property="og:description" content={marketplace.description} />
      </Head>
      <div className="w-full max-w-[1800px] px-4 sm:px-8">
        <div className="relative grid justify-between w-full grid-cols-12 gap-4 mt-20 mb-10">
          <div className="col-span-12 mb-6 md:col-span-8">
            <img
              src={marketplace.logoUrl}
              alt={'Skeleton Crew'}
              className="absolute object-cover bg-gray-900 border-4 border-gray-900 rounded-full w-28 h-28 -top-32"
            />
            <h2 className="text-xl text-gray-300">Skeleton Crew</h2>
            <h1 className="mb-4">Art Drops</h1>
            <p>Limited Edition Auctions, Raffles &amp; Sales</p>
          </div>
        </div>
        <div className="flex">
          <div className=" md:mx-auto">
            {isEmpty(drops) ? (
              <div className="w-full p-10 text-center border border-gray-800 rounded-lg">
                <h3>No Drops found</h3>
                <p className="text-gray-500 mt-">
                  Please check back again later.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4 xl:gap-8">
                {(drops || []).map((drop) => {
                  return (
                    <li key={drop.url}>
                      <DropCard drop={drop} />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

interface DropsLayoutProps {
  marketplace: Marketplace
  children: ReactElement
}

DropsShow.getLayout = function GetLayout({
  marketplace,
  children,
}: DropsLayoutProps) {
  return <BannerLayout marketplace={marketplace}>{children}</BannerLayout>
}

export default DropsShow
