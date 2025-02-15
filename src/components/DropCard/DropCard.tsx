import React from 'react'
import Link from 'next/link'
import { Drop, DropToken, DropType } from '../../utils/drops'
import { DropCountdown } from './DropCountdown'
import cx from 'classnames'

interface DropCardProps {
  drop: Drop
}

export const DropCard = ({ drop }: DropCardProps) => {
  const live = drop.startDate && drop.startDate < new Date()
  const timeDiff = drop.startDate
    ? drop.startDate.getTime() - new Date().getTime()
    : -1

  const typeString = (type: DropType): string => {
    if (type == DropType.AUCTION) {
      return 'auctioned'
    }
    if (type == DropType.DUTCH_AUCTION) {
      return 'dutch auctioned'
    }
    if (type == DropType.RAFFLE) {
      return 'raffled'
    }
    if (type == DropType.FIXED_PRICE) {
      return 'sold'
    }
    return ''
  }

  const card = (
    <article
      className={cx('overflow-hidden rounded-lg bg-gray-900 shadow-card', {
        'transform cursor-pointer transition duration-100 hover:scale-[1.02]':
          live,
        'cursor-default': !live,
      })}
    >
      <div className="block relative">
        <img
          alt="Placeholder"
          className={cx('w-full aspect-square object-cover', {
            grayscale: !live,
          })}
          src={drop.image}
        />
      </div>
      <header className="p-4 flex flex-col justify-stretch items-center sm:justify-center">
        <h4 className="lg:text-base mb-2 text-sm truncate flex-row sm:flex-col">
          {drop.title}
        </h4>
        <h5 className="lg:text-sm mb-2 text-sm truncate flex-row sm:flex-col">
          {drop.artist}
        </h5>
        <h6 className="lg:text-xs mb-2 text-sm truncate flex-row sm:flex-col">
          {drop.quantity == 1 ? '1/1' : `1/${drop.quantity} edition`}
          {', '}
          {typeString(drop.dropType)} in{' '}
          {drop.tokenType == DropToken.SKULL ? '$SKULL' : 'SOL'}
        </h6>
        <div className="flex items-center"></div>
      </header>
      <footer className="flex justify-center items-center gap-2 px-4 h-20 border-t-gray-800 border-t-2">
        {live ? (
          <a href={drop.url}>
            <button className="button tertiary small grow-0 mx-auto">
              {drop.isSoldOut
                ? drop.quantity > 1
                  ? 'SOLD OUT'
                  : 'SOLD'
                : 'BUY'}
            </button>
          </a>
        ) : drop.startDate ? (
          <button className="button tertiary small grow-0 mx-auto" disabled>
            {timeDiff / (12 * 60 * 60 * 1000) < 1 ? (
              <DropCountdown
                date={drop.startDate}
                prefix={'Drops in'}
                status={'View'}
                onComplete={() => window.location.reload()}
              />
            ) : (
              <>
                {drop.startDate.toLocaleDateString('en', {
                  weekday: 'short',
                  month: 'numeric',
                  day: 'numeric',
                })}{' '}
                @{' '}
                {drop.startDate.toLocaleTimeString('en', {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </>
            )}
          </button>
        ) : (
          <button className="button tertiary small grow-0 mx-auto">
            Check Back Soon
          </button>
        )}
      </footer>
    </article>
  )

  return live ? <a href={drop.url}>{card}</a> : card
}
