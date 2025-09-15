import { DC } from "../../constants";

export const eternityUpgrades = {
  idMultEP: {
    id: 1,
    cost: 5,
    description: "Infinity Dimension multiplier based on unspent Eternity Points",
    effect: () => generalDilatedValueOf(Currency.eternityPoints.value, 0.5).pow(2).plus(1),
    formatEffect: value => formatX(value, 2, 1)
  },
  idMultEternities: {
    id: 2,
    cost: 10,
    description: () => "Infinity Dimension multiplier based on Eternities",
    effect: () => generalDilatedValueOf(Currency.eternities.value, 1.5).times(100).plus(1),
    formatEffect: value => formatX(value, 2, 1)
  },
  idMultICRecords: {
    id: 3,
    cost: 5e4,
    description: "Infinity Dimension multiplier based on sum of Infinity Challenge times",
    effect: () => DC.D2.pow(30 / Math.clampMin(Time.infinityChallengeSum.totalSeconds, 0.61)),
    cap: DC.C2P30D0_61,
    formatEffect: value => formatX(value, 2, 1)
  },
  tdMultAchs: {
    id: 4,
    cost: 1e19,
    description: "Your Achievement bonus affects Time Dimensions",
    effect: () => Achievements.power,
    formatEffect: value => formatX(value, 2, 1)
  },
  tdMultTheorems: {
    id: 5,
    cost: 1e40,
    description: "Time Dimension multiplier based on your unspent Time Theorems",
    effect: () => Currency.timeTheorems.value.plus(1),
    formatEffect: value => formatX(value, 2, 1)
  },
  tdMultRealTime: {
    id: 6,
    cost: 1e50,
    description: () => (Pelle.isDoomed
      ? "Time Dimensions are multiplied based on time spent in this Armageddon"
      : "Time Dimensions are multiplied by days played"
    ),
    effect: () => (Pelle.isDoomed ? 1 + Time.thisReality.totalDays : Time.totalTimePlayed.totalDays),
    formatEffect: value => formatX(value, 2, 1)
  }
};
