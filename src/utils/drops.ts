export interface Drop {
  url: string
  title: string
  artist: string
  image: string
  startDate: Date | null
  tokenType: DropToken
  quantity: number
  dropType: DropType
  isSoldOut?: boolean
}

export enum DropType {
  DUTCH_AUCTION,
  AUCTION,
  RAFFLE,
  FIXED_PRICE,
}

export enum DropToken {
  SOL,
  SKULL,
}

export const drops: Drop[] = [
  {
    url: 'https://raffles.skeletoncrew.rip/raffles/HyHMTMqHEunBmrzUgBVryL1qgp57yyGCmKZyUY1aB3si',
    title: 'What was that?',
    artist: 'Zen0',
    image:
      'https://assets2.holaplex.tools/arweave/W3GVmm7BJkztUpOjZ7tLVj8RNiHpX89eLEqq7FBJpfo?width=400',
    startDate: new Date('2022-06-16T10:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 1,
    dropType: DropType.RAFFLE,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/CKKBGkhKcXQsds1axT7vn7SkgVbo75nDJWFs7tW9Z94Z',
    title: 'Lost Soul',
    artist: 'J. R. Coffron',
    image:
      'https://assets2.holaplex.tools/arweave/a5nvA9Mvtjkpu9B-OIDY-41pdpIx-lmdSoY_SOTzZ8M?width=400',
    startDate: new Date('2022-06-07T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 33,
    dropType: DropType.FIXED_PRICE,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/GihTUpoe1GB8rCj6odBaJ4oeuPmuP9KPVsy9BBHYkHdt',
    title: 'one byte',
    artist: 'Walmeer',
    image:
      'https://assets2.holaplex.tools/arweave/SWEGcHq-SWpViQgmFmHt-IzvkeNXg-y78NTePpysdZQ?width=400',
    startDate: new Date('2022-06-07T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 33,
    dropType: DropType.FIXED_PRICE,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/AZ5Ly6QeHGCs5ViAJMAbnbSYqPrCs7k2qs3v7BnPJseW',
    title: 'Spring',
    artist: 'ALPERH',
    image:
      'https://assets2.holaplex.tools/arweave/JYiNS0sI9uzT2nnhq7rGuvRQ3n8VAX7NbKfQqrJm-lw?width=400',
    startDate: new Date('2022-04-28T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 33,
    dropType: DropType.FIXED_PRICE,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/7PYFDF5KRibgVaRp9y2QocKoBKVYqXpjmPxFRUALwRh7',
    title: 'the sky realm',
    artist: 'mint rain',
    image:
      'https://assets2.holaplex.tools/arweave/ONyetPZKXBaqzGOPpf-3KMzavhhce6t3Mgb26orAJ9o?width=400',
    startDate: new Date('2022-06-10T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/VbxFyg1vfuyEDzTTST3qMjwYMYootbkdcfe1b9iCLy5',
    title: 'Ush Sipa the Wanderer',
    artist: 'J. R. Coffron',
    image:
      'https://assets2.holaplex.tools/arweave/rGWy37arOdkeaWyfXwzwzQsogNHr85yRM9f5eajygS0?width=400',
    startDate: new Date('2022-06-09T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/3GQFJDiah6pzgpjm3XCtr4hmVs4XWq6gGANa8Vot7PP3',
    title: 'beyond the alley',
    artist: 'walmeer',
    image:
      'https://assets2.holaplex.tools/arweave/UfXZAOAN7lOp-jDzeNn0HOhr9PzyYvi05tdYChkSzL4?width=400',
    startDate: new Date('2022-06-08T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/6E7vyo4gpdcMFjhcPzL3qbhEMy99E7QGKsp2z5fVqaa5',
    title: 'the seeker',
    artist: 'mint rain',
    image:
      'https://assets2.holaplex.tools/arweave/ccTjwW9hdKmRJF-FBIuJp8W2xfzZHUlXPe1D57z6mb8?width=400',
    startDate: new Date('2022-06-08T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 33,
    dropType: DropType.FIXED_PRICE,
    isSoldOut: true,
  },
  {
    url: 'https://raffles.skeletoncrew.rip/raffles/7xDXyg3sifaCqXbFBepJ53nDMbpHMAPA85brFhCawqWq',
    title: 'Too Many',
    artist: 'NASHOTOBI',
    image:
      'https://assets2.holaplex.tools/arweave/5mitvw1lEsB7rgYMFRbmZJbETTPME2M60bNP6gaBxAQ?width=400',
    startDate: new Date('2022-05-23T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 1,
    dropType: DropType.RAFFLE,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/FRkQzNy6iaYNv63zebvX8uqCCHgqeYufcbSthfbQZ2UL',
    title: 'SPIKE',
    artist: 'IISO GHOSTLORD',
    image:
      'https://assets2.holaplex.tools/arweave/yRQJpCbnyhQSjuQ0MKYFzCMLrIJ6o3l7VBGPUbCtVpE?width=400',
    startDate: new Date('2022-05-05T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    url: 'https://raffles.skeletoncrew.rip/raffles/8W3MC8RRPf5ePVepULHVNBY898e7yhrFTwsKX5GsvyW1',
    title: 'Skull Thought',
    artist: 'YELLOW TRASH CAN',
    image:
      'https://assets2.holaplex.tools/arweave/ILTwWlCp-xR-kJObe8y_0FYL_1SvyDZYGSQqGrnKJkc?width=400',
    startDate: new Date('2022-05-05T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 1,
    dropType: DropType.RAFFLE,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/ECLx5NFYqz3vAcq44Q6Joga5kdqZ915CWFY67vMisAHn',
    title: 'Trash Girl',
    artist: 'YELLOW TRASH CAN',
    image:
      'https://assets2.holaplex.tools/arweave/QFNoJ3Xb9dh8uWmdubFQvwk51Tr78YVU5tbmncB1Jw0?width=400',
    startDate: new Date('2022-05-04T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    url: 'https://raffles.skeletoncrew.rip/raffles/9RZGj3imfhtBKh6bVzd8oAfZ8xx5pMkM1YKxXW7Fi8ab',
    title: 'Spirits in the jungle',
    artist: 'Jason Wolcott',
    image:
      'https://assets2.holaplex.tools/arweave/-6rcSAeJlVlLBH35NvdvHiZd2OVu63olmAjO7wJu9Yk?width=400',
    startDate: new Date('2022-05-04T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 1,
    dropType: DropType.RAFFLE,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/Gm6i9BNpp5wbnr1xNPGBgi351dRYQQGDGGwArUTnYQyB',
    title: 'OVERWORKED',
    artist: 'Jason Wolcott',
    image:
      'https://assets2.holaplex.tools/arweave/CpbqjqNIW4W0YsTGzmKkzy_Bz4OuEKPvwGrtzBgMAqU?width=400',
    startDate: new Date('2022-05-03T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/6cvc4abkHmGHYeeWjoHmJsgqeymeY4ubg9dCNBx82GHm',
    title: 'THORN',
    artist: 'IISO GHOSTLORD',
    image:
      'https://assets2.holaplex.tools/arweave/bnx0rcQlXU5FY7nCAp5V29xYqp-EWEcgKZzSuc_jpPU?width=400',
    startDate: new Date('2022-05-03T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 1,
    dropType: DropType.RAFFLE,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/2uab1CzL7QcZPx8VjA3x7E76c1fCwc8yiksm8V2zuqij',
    title: "Lover's Afterlife",
    artist: 'SIMON KIM',
    image:
      'https://assets2.holaplex.tools/arweave/cFA3z9QDTbz-8Qc0PRnHwpDpbWFttdAWOiOHyi90JEM?width=400',
    startDate: new Date('2022-04-29T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/9KvBDmtADcjtfvUeFqSzC1khVPHgqLnHUy1Qnwe2JHZs',
    title: 'Thulsa Boom',
    artist: 'SIMPLE MONSTER PARTY',
    image:
      'https://assets2.holaplex.tools/arweave/X9LPRXxxEwo-KSDaKGAFDAe13iQiUHonyURIt7mz_kQ?width=400',
    startDate: new Date('2022-04-28T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    url: 'https://drops.skeletoncrew.rip/#/auction/DrpwfNU7TBhfrrcfbD2QZ81T1SMZwkFpqphtZEzDNkeo',
    title: 'Lodger',
    artist: 'ALPERH',
    image:
      'https://assets2.holaplex.tools/arweave/cb4qSKUYJsWvlakQwD_lPQmfL_w31N0BUZsAfipDl0c?width=400',
    startDate: new Date('2022-04-27T12:00:00-04:00'),
    tokenType: DropToken.SOL,
    quantity: 1,
    dropType: DropType.AUCTION,
    isSoldOut: true,
  },
  {
    // url: 'https://drops.skeletoncrew.rip/#/auction/7HrbMuUg1J1afD5XVzXtnFjrWDo4RqvXipWrqs5TFgDM',
    url: 'https://drops.skeletoncrew.rip/#/auction/7PhpJXk4HTiVGJnVo8vxAz2cdichR1bCz12JEkp1WL45',
    title: 'Tiger of Eden',
    artist: 'SIMON KIM',
    image:
      'https://assets2.holaplex.tools/arweave/h1aitptLE3IPGfXmScF8TRxY12d8zRyyDj22sED2jgA?width=400',
    startDate: new Date('2022-04-27T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 33,
    dropType: DropType.FIXED_PRICE,
    isSoldOut: true,
  },
  {
    // url: 'https://drops.skeletoncrew.rip/#/auction/6979Txui2UodrUjvhdYoSquAdCq4cpdMevanNC2fVKST',
    url: 'https://drops.skeletoncrew.rip/#/auction/H7m3bGpnSqDyyTv2nLMxCCxpDGmJBC7JcMxnD5HVvUYt',
    title: 'Cable Manager',
    artist: 'SIMPLE MONSTER PARTY',
    image:
      'https://assets2.holaplex.tools/arweave/5Kykvt3Rl_ug_mUuqhIawCG8x-1W_Cz9dzZ89qI__Bc?width=400',
    startDate: new Date('2022-04-27T12:00:00-04:00'),
    tokenType: DropToken.SKULL,
    quantity: 33,
    dropType: DropType.FIXED_PRICE,
    isSoldOut: true,
  },
]
