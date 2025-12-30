import { DC } from "../../constants";

const specialInfinityGlyphDisabledEffectText = () => (PelleRifts.chaos.milestones[1].canBeApplied
  ? "The Pelle-Specific effect from Infinity Glyphs is also disabled."
  : "");

export const eternityChallenges = [
  {
    id: 1,
    description: "Time Dimensions are disabled.",
    goal: DC.E18000,
    goalIncrease: DC.E1750,
    reward: {
      description: "Time Dimension multiplier based on time spent this Eternity",
      effect: completions =>
        Decimal.pow(player.records.thisEternity.time / 1000 + 1, Math.sqrt(completions) * 0.3),
      formatEffect: value => formatX(value, 2, 1)
    },
    // These will get notation-formatted and scrambled between for the final goal
    scrambleText: ["1e2600", "1e201600"],
  },
  {
    id: 2,
    description: "Infinity Dimensions are disabled.",
    goal: DC.E9500,
    pelleGoal: DC.E1750,
    goalIncrease: DC.E2625,
    reward: {
      description: "1st Infinity Dimension multiplier based on Infinity Power",
      effect: completions =>
        generalDilatedValueOf(Currency.infinityPower.value.plus(9), Math.sqrt(completions) / 10).plus(1).div(10).pow(50),
      formatEffect: value => formatX(value, 2, 1)
    }
  },
  {
    id: 3,
    description: "8th Antimatter Dimension doesn't produce anything. Dimensional Sacrifice is disabled.",
    goal: DC.E7000,
    pelleGoal: DC.E925,
    goalIncrease: DC.E1500,
    reward: {
      description: "Dimensional Sacrifice is stronger",
      effect: completions => 1 + completions * 1.4,
      formatEffect: value => formatPow(value, 1, 1)
    }
  },
  {
    id: 4,
    description: `all Infinity multipliers and generators are disabled. The goal must be reached within a certain
      number of Infinities or else you will fail the Challenge.`,
    goal: DC.E33000,
    goalIncrease: DC.E18000,
    restriction: completions => Math.max(16 - 4 * completions, 0),
    checkRestriction: restriction => Currency.infinities.lte(restriction),
    formatRestriction: restriction => (restriction === 0
      ? "without any Infinities"
      : `in ${quantifyInt("Infinity", restriction)} or less`),
    failedRestriction: "(Too many Infinities for more)",
    reward: {
      description: "Infinity Dimension multiplier based on unspent IP",
      effect: completions =>
        generalDilatedValueOf(Currency.infinityPoints.value.plus(9), Math.sqrt(completions) / 10).plus(1).div(10).pow(7),
      formatEffect: value => formatX(value, 2, 1)
    }
  },
  {
    id: 5,
    description: () => `The primary Antimatter Galaxy cost scaling is increased by ${formatInt(200)}.
      Dimension Boost costs scale much more steeply.`,
    goal: DC.E2500,
    pelleGoal: DC.E1400,
    goalIncrease: DC.E7125,
    effect: -200,
    reward: {
      description: "Gain free Galaxies",
      effect: completions => completions * 3,
      formatEffect: value => `${formatInt(value)} Galaxies`
    }
  },
  {
    id: 6,
    // The asterisk, if present, will get replaced with strings generated from the scramble text
    description: () => {
      if (Enslaved.isRunning) return "you *. The cost of reducing the Replicanti Galaxy cost scaling is massively reduced.";
      return "you cannot gain Antimatter Galaxies normally. The cost of reducing the Replicanti" +
              " Galaxy cost scaling is massively reduced.";
    },
    goal: DC.E3500,
    pelleGoal: DC.E1500,
    goalIncrease: DC.E625,
    reward: {
      description: "Increase the Replicanti power based on 2nd Time Dimensions",
      effect: completions => Math.pow(TimeDimension(2).amount.log10(), 0.3) * completions / 3,
      formatEffect: value => `+${format(value, 2, 2)}`
    },
    scrambleText: ["cannot gain Antimatter Galaxies normally", "c㏰'퐚 gai鸭 Anti꟢at랜erﻪﶓa⁍axie㮾 䂇orma㦂l"],
  },
  {
    id: 7,
    description:
      "1st Time Dimensions produce 8th Infinity Dimensions instead of Time Shards. " +
      "The multiplier from Infinity Power applies to the 8th Antimatter Dimension only.",
    goal: DC.E2500,
    pelleGoal: DC.E2900,
    goalIncrease: DC.E4375,
    effect: () => TimeDimension(1).productionPerSecond,
    reward: {
      description: "Infinity Dimension multiplier based on bought Time Theorems",
      effect: completions => {
        const tt = player.timestudy;
        return DC.D15.pow(Math.sqrt(tt.amBought + tt.ipBought + tt.epBought) * completions);
      },
      formatEffect: value => formatX(value, 2, 1)
    }
  },
  {
    id: 8,
    description: () => `you can only upgrade Infinity Dimensions ${formatInt(50)} times and Replicanti
      upgrades ${formatInt(40)} times. Infinity Dimension and Replicanti upgrade autobuyers are disabled.`,
    goal: DC.E18000,
    pelleGoal: DC.E2800,
    goalIncrease: DC.E8000,
    reward: {
      description: "Replicanti Galaxies are cheaper based on total Galaxies",
      effect: completions => DC.D1_07.pow(Math.sqrt(totalGalaxies()) * completions),
      formatEffect: value => `${formatX(value, 2, 1)} cheaper`
    }
  },
  {
    id: 9,
    description: () => `you cannot buy Tickspeed upgrades. Infinity Power multiplies
      Time Dimensions instead of Antimater Dimensions with reduced effect. ${specialInfinityGlyphDisabledEffectText()}`,
    goal: DC.E23000,
    pelleGoal: DC.E2900,
    goalIncrease: DC.E6750,
    reward: {
      description: "Infinity Dimension multiplier based on Time Shards",
      effect: completions =>
        generalDilatedValueOf(Currency.timeShards.value.plus(9), 0.25).plus(1).div(10).pow(20 * completions),
      formatEffect: value => formatX(value, 2, 1)
    }
  },
  {
    id: 10,
    description: () => {
      let description = `Time Dimensions and Infinity Dimensions are disabled. You gain an immense boost from
        Infinities to Antimatter Dimensions (Infinities${formatPow(950)}). ${specialInfinityGlyphDisabledEffectText()}`;
      EternityChallenge(10).applyEffect(v => description += ` Currently: ${formatX(v, 2, 1)}`);
      return description;
    },
    goal: DC.E3000,
    pelleGoal: DC.E3200,
    goalIncrease: DC.E300,
    effect: () => Decimal.pow(Currency.infinitiesTotal.value, 950).clampMin(1).pow(TimeStudy(31).effectOrDefault(1)),
    reward: {
      description: "Time Dimension multiplier based on Infinities",
      effect: completions => {
        const mult = Currency.infinitiesTotal.value.times(2.783e-6).pow(0.4 + 0.1 * completions).clampMin(1);
        return mult.powEffectOf(TimeStudy(31));
      },
      formatEffect: value => {
        // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
        const mult = formatX(value, 2, 1);
        return TimeStudy(31).canBeApplied
          ? `${formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)} (After TS31: ${mult})`
          : mult;
      }
    }
  },
  {
    id: 11,
    description: () => `all Dimension multipliers and powers are disabled except for the multipliers from
      Infinity Power and Dimension Boosts (to Antimatter Dimensions). ${specialInfinityGlyphDisabledEffectText()}`,
    goal: DC.E450,
    pelleGoal: DC.E11200,
    goalIncrease: DC.E200,
    pelleGoalIncrease: DC.E1400,
    reward: {
      description: "Further reduce Tickspeed cost multiplier growth",
      effect: completions => completions * 0.07,
      formatEffect: value => {
        const total = Math.round(Player.tickSpeedMultDecrease + Effects.sum(EternityChallenge(11).reward)) - value;
        return `-${format(value, 2, 2)} (${formatX(total, 2, 2)} total)`;
      }
    }
  },
  {
    id: 12,
    description: () => (PlayerProgress.realityUnlocked()
      ? `the game runs ×${formatInt(1000)} slower; all other game speed effects are disabled. The goal must be reached
        within a certain amount of time or you will fail the Challenge. ${specialInfinityGlyphDisabledEffectText()}`
      : `the game runs ×${formatInt(1000)} slower. The goal must be reached
        within a certain amount of time or you will fail the Challenge.`),
    goal: DC.E110000,
    pelleGoal: DC.E208000,
    goalIncrease: DC.E12000,
    restriction: completions => Math.max(10 - 2 * completions, 1) / 10,
    checkRestriction: restriction => Time.thisEternity.totalSeconds < restriction,
    formatRestriction: restriction => `in ${quantify("in-game second", restriction, 0, 1)} or less.`,
    failedRestriction: "(Too slow for more)",
    reward: {
      description: "Infinity Dimension cost multipliers are reduced",
      effect: completions => 1 - completions * 0.008,
      formatEffect: value => `x${formatPow(value, 3, 3)}`
    }
  }
];
