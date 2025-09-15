import { DC } from "../../constants";

function rebuyable(config) {
  const effectFunction = config.effect || (x => x);
  const { id, maxUpgrades, description, isDisabled, noLabel, onPurchased } = config;
  return {
    rebuyable: true,
    id,
    cost: () => config.initialCost * Math.pow(config.costIncrease, player.infinityRebuyables[config.id]),
    maxUpgrades,
    description,
    effect: () => effectFunction(player.infinityRebuyables[config.id]),
    isDisabled,
    // There isn't enough room in the button to fit the EC reduction and "Next:" at the same time while still
    // presenting all the information in an understandable way, so we only show it if the upgrade is maxed
    formatEffect: config.formatEffect ||
      (value => {
        const afterECText = config.afterEC ? config.afterEC() : "";
        return value === config.maxUpgrades
          ? `Currently: ^${formatInt(1 + value)} ${afterECText}`
          : `Currently: ^${formatInt(1 + value)} | Next: ^${formatInt(2 + value)}`;
      }),
    formatCost: value => format(value, 2, 0),
    noLabel,
    onPurchased
  };
}

export const breakInfinityUpgrades = {
  totalAMMult: {
    id: "totalMult",
    cost: 5e6,
    description: "Antimatter Dimensions gain a multiplier based on total antimatter produced",
    effect: () => Math.pow(player.records.totalAntimatter.log10(), 0.5),
    formatEffect: value => formatX(value, 2, 2)
  },
  currentAMMult: {
    id: "currentMult",
    cost: 2e7,
    description: "Antimatter Dimensions gain a multiplier based on current antimatter",
    effect: () => Math.pow(Currency.antimatter.value.plus(10).log10(), 0.5),
    formatEffect: value => formatX(value, 2, 2)
  },
  galaxyBoost: {
    id: "postGalaxy",
    cost: 2e31,
    description: () => `The primary Antimatter Galaxy cost scaling is reduced by ${formatInt(15)}`,
    effect: 15
  },
  infinitiedMult: {
    id: "infinitiedMult",
    cost: 5e8,
    description: "Antimatter Dimensions gain a multiplier based on Infinities",
    effect: () => 1 + Currency.infinitiesTotal.value.plus(1).log10() * 10,
    formatEffect: value => formatX(value, 2, 2)
  },
  achievementMult: {
    id: "achievementMult",
    cost: 2e10,
    description: "Additional multiplier to Antimatter Dimensions based on Achievements completed",
    effect: () => {
      const x = Achievements.effectiveCount - 30;
      return Math.pow((x + Math.sqrt(x * x + 1)) / 2, 3) / 40 + 1;
    },
    formatEffect: value => formatX(value, 2, 2)
  },
  slowestChallengeMult: {
    id: "challengeMult",
    cost: 1e12,
    description: "Antimatter Dimensions gain a multiplier based on slowest challenge run",
    effect: () => (50 / Time.worstChallenge.totalMinutes + 1).toDecimal(),
    formatEffect: value => formatX(value, 2, 2),
    hasCap: true,
    cap: DC.D3E4
  },
  infinitiedGen: {
    id: "infinitiedGeneration",
    cost: 5e12,
    description: "Passively generate Infinities based on your fastest Infinity",
    effect: () => player.records.bestInfinity.time,
    formatEffect: value => {
      if (value === Number.MAX_VALUE && !Pelle.isDoomed) return "No Infinity generation";
      let infinities = DC.D1;
      infinities = infinities.timesEffectsOf(
        RealityUpgrade(5),
        RealityUpgrade(7),
        Ra.unlocks.continuousTTBoost.effects.infinity
      );
      infinities = infinities.times(getAdjustedGlyphEffect("infinityinfmult"));
      const timeStr = Time.bestInfinity.totalMilliseconds <= 50
        ? `${TimeSpan.fromMilliseconds(100).toStringShort()} (capped)`
        : `${Time.bestInfinity.times(2).toStringShort()}`;
      return `${quantify("Infinity", infinities)} every ${timeStr}`;
    }
  },
  autobuyMaxDimboosts: {
    id: "autobuyMaxDimboosts",
    cost: 2e15,
    description: "Dimension Boosts are bought in bulk"
  },
  autobuyerSpeed: {
    id: "autoBuyerUpgrade",
    cost: 1e12,
    description: "Autobuyers unlocked or improved by Normal Challenges work twice as fast"
  },
  tickspeedCostMult: rebuyable({
    id: 0,
    initialCost: 2e10,
    costIncrease: 5,
    maxUpgrades: 5,
    description: () => {
      let effect = `Keep up to ${formatInt(20 * player.infinityRebuyables[0])}`;
      if (!BreakInfinityUpgrade.tickspeedCostMult.isCapped) {
        effect += ` ➜ ${formatInt(20 * (1 + player.infinityRebuyables[0]))}`;
      }
      return `${effect} Dimension Boosts on Galaxy resets`;
    },
    afterEC: () => (EternityChallenge(11).completions > 0
      ? `After EC11: ${formatX(Player.tickSpeedMultDecrease, 2, 2)}`
      : ""
    ),
    formatEffect: value => "",
    noLabel: true,
    onPurchased: () => GameCache.tickSpeedMultDecrease.invalidate()
  }),
  dimCostMult: rebuyable({
    id: 1,
    initialCost: 2e12,
    costIncrease: 50,
    maxUpgrades: 9,
    description: "Dimensional Sacrifice is stronger",
    afterEC: () => (EternityChallenge(6).completions > 0
      ? `After EC6: ${formatX(Player.dimensionMultDecrease, 2, 2)}`
      : ""
    ),
    noLabel: true,
    onPurchased: () => GameCache.dimensionMultDecrease.invalidate()
  }),
  ipGen: rebuyable({
    id: 2,
    initialCost: 1e8,
    costIncrease: 10,
    maxUpgrades: 10,
    effect: value => Player.bestRunIPPM.times(value / 20),
    description: () => {
      let generation = `Generate ${formatInt(5 * player.infinityRebuyables[2])}%`;
      if (!BreakInfinityUpgrade.ipGen.isCapped) {
        generation += ` ➜ ${formatInt(5 * (1 + player.infinityRebuyables[2]))}%`;
      }
      return `${generation} of your best IP/min from your last 10 Infinities`;
    },
    isDisabled: effect => effect.eq(0),
    formatEffect: value => `${format(value, 2, 1)} IP/min`,
    noLabel: false
  })
};
