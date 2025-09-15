import { DC } from "../../constants";

export const infinityChallenges = [
  {
    id: 1,
    description: `all Normal Challenge restrictions are active at once, with the exception of the
      Tickspeed (C9) and Big Crunch (C12) Challenges.`,
    goal: DC.E800,
    isQuickResettable: true,
    reward: {
      description: () => `${formatX(1.3, 1, 1)} on all Infinity Dimensions for each Infinity Challenge completed`,
      effect: () => Math.pow(1.3, InfinityChallenges.completed.length),
      formatEffect: value => formatX(value, 1, 1)
    },
    unlockAM: DC.E10000,
  },
  {
    id: 2,
    description: () => `Dimensional Sacrifice happens automatically every ${formatInt(400)} milliseconds once you have
      an 8th Antimatter Dimension.`,
    goal: DC.E10000,
    isQuickResettable: false,
    reward: {
      description: () => `Dimensional Sacrifice bonus is cubed`,
      effect: 3
    },
    unlockAM: DC.E10500,
  },
  {
    id: 3,
    description: () =>
      `Tickspeed upgrades are always ${formatX(1)}. For every Tickspeed upgrade purchase, you instead get a static
      multiplier on all Antimatter Dimensions which increases based on Antimatter Galaxies.`,
    goal: DC.E2700,
    isQuickResettable: false,
    effect: () => Decimal.pow(1.05 + (player.galaxies * 0.005), player.totalTickBought),
    formatEffect: value => formatX(value, 2, 2),
    reward: {
      description: `Antimatter Dimension multiplier based on Antimatter Galaxies and Tickspeed purchases`,
      effect: () => (Laitela.continuumActive
        ? Decimal.pow(1.05 + (player.galaxies * 0.005), Tickspeed.continuumValue)
        : Decimal.pow(1.05 + (player.galaxies * 0.005), player.totalTickBought)),
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E14000,
  },
  {
    id: 4,
    description: () =>
      `only the latest bought Antimatter Dimension's production is normal. All other Antimatter Dimensions
      produce less (${formatPow(0.25, 2, 2)}).`,
    goal: DC.E10000,
    isQuickResettable: true,
    effect: 0.25,
    reward: {
      description: () => `Dimension Boosts don't reset anything; all Antimatter Dimensions recieve a ${formatX(2.5, 2, 2)} multiplier per Galaxy`,
      effect: () => DC.D2_5.pow(totalGalaxies()),
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E26500,
  },
  {
    id: 5,
    description:
      `buying Antimatter Dimensions 1-4 causes all cheaper AD costs to increase.
      Buying Antimatter Dimensions 5-8 causes all more expensive AD costs to increase.`,
    goal: DC.E8000,
    isQuickResettable: true,
    reward: {
      description: () =>
        `Reduce the requirements for Dimension Boosts by ${formatInt(1)}; reduce the primary Antimatter Galaxy cost scaling by ${formatInt(7)}`,
      effect: 7
    },
    unlockAM: DC.E31000,
  },
  {
    id: 6,
    description: () =>
      `exponentially rising matter divides the multiplier on all of your Antimatter Dimensions
      once you have at least ${formatInt(1)} 2nd Antimatter Dimension.`,
    goal: DC.E30000,
    isQuickResettable: true,
    effect: () => Currency.matter.value.clampMin(1),
    formatEffect: value => `/${format(value, 1, 2)}`,
    reward: {
      description: "Infinity Dimension multiplier based on tickspeed",
      effect: () => Tickspeed.perSecond.log10().toDecimal().div(200).plus(1),
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E35000,
  },
  {
    id: 7,
    description: () => 
      `you cannot buy Antimatter Galaxies. Dimension Boost multiplier
      is increased to ${formatX(10)}.`,
    goal: DC.E12500,
    isQuickResettable: false,
    effect: 10,
    reward: {
      description: () => `Multiply Infinity Point gain based on Dimension Boosts`,
      effect: () => player.dimensionBoosts * 1000 + 1000,
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E39000,
  },
  {
    id: 8,
    description: () =>
      `AD production rapidly and continually drops over time. Purchasing Antimatter Dimension or Tickspeed
        upgrades sets production back to ${formatPercents(1)} before it starts dropping again.`,
    goal: DC.E40000,
    isQuickResettable: true,
    effect: () => DC.D0_8446303389034288.pow(
      Math.max(0, player.records.thisInfinity.time - player.records.thisInfinity.lastBuyTime)),
    reward: {
      description:
        "You get a multiplier to AD 2-7 based on 1st and 8th AD multipliers",
      effect: () => (AntimatterDimension(1).multiplier.plus(10).log10() * AntimatterDimension(8).multiplier.plus(10).log10()).toDecimal().pow(3),
      formatEffect: value => formatX(value, 2, 2)
    },
    unlockAM: DC.E43000,
  },
];
