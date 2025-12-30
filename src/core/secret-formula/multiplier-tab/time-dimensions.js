import { DC } from "../../constants";
import { PlayerProgress } from "../../player-progress";

import { MultiplierTabHelper } from "./helper-functions";
import { MultiplierTabIcons } from "./icons";

// See index.js for documentation
export const TD = {
  total: {
    name: dim => {
      if (dim) return `TD ${dim} Multiplier`;
      if (EternityChallenge(7).isRunning) return "ID8 Production";
      return "Time Shard Production";
    },
    displayOverride: dim => (dim
      ? formatX(TimeDimension(dim).multiplier, 2)
      : `${format(TimeDimension(1).productionPerSecond, 2)}/sec`
    ),
    multValue: dim => (dim
      ? TimeDimension(dim).multiplier
      : TimeDimensions.all
        .filter(td => td.isProducing)
        .map(td => td.multiplier)
        .reduce((x, y) => x.times(y), DC.D1)),
    isActive: dim => (dim
      ? TimeDimension(dim).isProducing
      : (PlayerProgress.realityUnlocked() || TimeDimension(1).isProducing)),
    dilationEffect: () => {
      const baseEff = player.dilation.active
        ? 0.75 * Effects.product(DilationUpgrade.dilationPenalty)
        : 1;
      return baseEff * (Effarig.isRunning ? Effarig.multDilation : 1);
    },
    isDilated: true,
    overlay: ["Δ", "<i class='fa-solid fa-cube' />"],
    icon: dim => MultiplierTabIcons.DIMENSION("TD", dim),
  },
  purchase: {
    name: dim => (dim ? `Purchased TD ${dim}` : "Purchases"),
    multValue: dim => {
      const getMult = td => {
        const d = TimeDimension(td);
        const bought = td === 8 ? Math.clampMax(d.bought, 1e8) : d.bought;
        return Decimal.pow(d.powerMultiplier, bought);
      };
      if (dim) return getMult(dim);
      return TimeDimensions.all
        .filter(td => td.isProducing)
        .map(td => getMult(td.tier))
        .reduce((x, y) => x.times(y), DC.D1);
    },
    isActive: () => !EternityChallenge(1).isRunning && !EternityChallenge(10).isRunning,
    icon: dim => MultiplierTabIcons.PURCHASE("TD", dim),
  },
  highestDim: {
    name: () => `Amount of highest Dimension`,
    displayOverride: () => {
      const dim = MultiplierTabHelper.activeDimCount("TD");
      return `TD ${dim}, ${formatInt(TimeDimension(dim).amount)}`;
    },
    multValue: () => TimeDimension(MultiplierTabHelper.activeDimCount("TD")).amount,
    isActive: () => TimeDimension(1).isProducing,
    icon: MultiplierTabIcons.DIMENSION("TD"),
  },
  achievementMult: {
    name: "Eternity Upgrade - Achievement Multiplier",
    multValue: dim => Decimal.pow(EternityUpgrade.tdMultAchs.effectOrDefault(1),
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    isActive: () => EternityUpgrade.tdMultAchs.canBeApplied && !Pelle.isDoomed,
    icon: MultiplierTabIcons.ACHIEVEMENT,
  },
  achievement: {
    name: "Achievement Rewards",
    multValue: dim => {
      const baseMult = DC.D1.timesEffectsOf(Achievement(128));
      return Decimal.pow(baseMult, dim ? 1 : MultiplierTabHelper.activeDimCount("TD"));
    },
    isActive: () => Achievement(128).canBeApplied,
    icon: MultiplierTabIcons.ACHIEVEMENT,
  },
  timeStudy: {
    name: dim => (dim ? `Time Studies (TD ${dim})` : "Time Studies"),
    multValue: dim => {
      const allMult = DC.D1.timesEffectsOf(
        TimeStudy(83),
        TimeStudy(93),
        TimeStudy(103),
        TimeStudy(171),
        TimeStudy(221),
        TimeStudy(301),
      );

      const dimMults = Array.repeat(DC.D1, 9);
      for (let tier = 1; tier <= 8; tier++) {
        dimMults[tier] = dimMults[tier].timesEffectsOf(
          tier === 1 ? TimeStudy(11) : null,
          tier === 3 ? TimeStudy(73) : null,
          tier === 4 ? TimeStudy(227) : null
        );
      }

      if (dim) return allMult.times(dimMults[dim]);
      let totalMult = DC.D1;
      for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount("TD"); tier++) {
        totalMult = totalMult.times(dimMults[tier]).times(allMult);
      }
      return totalMult;
    },
    isActive: () => TimeDimension(1).isProducing,
    icon: MultiplierTabIcons.TIME_STUDY
  },
  eternityUpgrade: {
    name: dim => (dim ? `Other Eternity Upgrades (TD ${dim})` : "Other Eternity Upgrades"),
    multValue: dim => {
      const allMult = DC.D1.timesEffectsOf(
        EternityUpgrade.tdMultTheorems,
        EternityUpgrade.tdMultRealTime,
      );
      return Decimal.pow(allMult, dim ? 1 : MultiplierTabHelper.activeDimCount("TD"));
    },
    isActive: () => TimeDimension(1).isProducing,
    icon: MultiplierTabIcons.UPGRADE("eternity"),
  },

  eu1: {
    name: () => "Unspent Time Theorems",
    multValue: dim => Decimal.pow(EternityUpgrade.tdMultTheorems.effectOrDefault(1),
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    isActive: () => EternityUpgrade.tdMultTheorems.canBeApplied,
    icon: MultiplierTabIcons.UPGRADE("eternity"),
  },
  eu2: {
    name: () => "Days played",
    multValue: dim => Decimal.pow(EternityUpgrade.tdMultRealTime.effectOrDefault(1),
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    isActive: () => EternityUpgrade.tdMultRealTime.canBeApplied,
    icon: MultiplierTabIcons.UPGRADE("eternity"),
  },

  eternityChallenge: {
    name: dim => (dim ? `Eternity Challenges (TD ${dim})` : "Eternity Challenges"),
    multValue: dim => {
      let allMult = DC.D1.timesEffectsOf(
        EternityChallenge(1).reward,
        EternityChallenge(10).reward);
      return Decimal.pow(allMult, dim ? 1 : MultiplierTabHelper.activeDimCount("TD"));
    },
    isActive: () => PlayerProgress.eternityUnlocked(),
    icon: MultiplierTabIcons.CHALLENGE("eternity")
  },
  infinityPower: {
    name: "Infinity Power (Eternity Challenge 9)",
    multValue: dim => {
      const mult = Currency.infinityPower.value.cbrt().plus(1);
      return Decimal.pow(mult, dim ? 1 : MultiplierTabHelper.activeDimCount("TD"));
    },
    isActive: () => EternityChallenge(9).isRunning,
    icon: MultiplierTabIcons.INFINITY_POWER,
  },
  dilationUpgrade: {
    name: "Dilation Upgrade - Replicanti Multiplier",
    multValue: dim => {
      const mult = Replicanti.areUnlocked && Replicanti.amount.gt(1)
        ? DilationUpgrade.tdMultReplicanti.effectValue
        : DC.D1;
      return Decimal.pow(mult, dim ? 1 : MultiplierTabHelper.activeDimCount("TD"));
    },
    isActive: () => DilationUpgrade.tdMultReplicanti.canBeApplied,
    icon: MultiplierTabIcons.UPGRADE("dilation"),
  },
  realityUpgrade: {
    name: "Reality Upgrade - Temporal Transcendence",
    multValue: dim => Decimal.pow(RealityUpgrade(22).effectOrDefault(1),
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    isActive: () => !Pelle.isDoomed && RealityUpgrade(22).canBeApplied,
    icon: MultiplierTabIcons.UPGRADE("reality"),
  },
  glyph: {
    name: "Glyph Effects",
    powValue: () => getAdjustedGlyphEffect("timepow") * getAdjustedGlyphEffect("effarigdimensions"),
    isActive: () => PlayerProgress.realityUnlocked(),
    icon: MultiplierTabIcons.GENERIC_GLYPH
  },
  alchemy: {
    name: "Glyph Alchemy",
    multValue: dim => Decimal.pow(AlchemyResource.dimensionality.effectOrDefault(1),
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    powValue: () => AlchemyResource.time.effectOrDefault(1) * Ra.momentumValue,
    isActive: () => Ra.unlocks.unlockGlyphAlchemy.canBeApplied,
    icon: MultiplierTabIcons.ALCHEMY,
  },
  imaginaryUpgrade: {
    name: "Imaginary Upgrade - Suspicion of Interference",
    powValue: () => ImaginaryUpgrade(11).effectOrDefault(1),
    isActive: () => ImaginaryUpgrade(11).canBeApplied,
    icon: MultiplierTabIcons.UPGRADE("imaginary"),
  },
  pelle: {
    name: "Pelle Rift Effects",
    multValue: dim => Decimal.pow(PelleRifts.chaos.effectOrDefault(1),
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    powValue: () => PelleRifts.paradox.effectOrDefault(DC.D1).toNumber(),
    isActive: () => Pelle.isDoomed,
    icon: MultiplierTabIcons.PELLE,
  },
  iap: {
    name: "Shop Tab Purchases",
    multValue: dim => Decimal.pow(ShopPurchase.allDimPurchases.currentMult,
      dim ? 1 : MultiplierTabHelper.activeDimCount("TD")),
    isActive: () => ShopPurchaseData.totalSTD > 0,
    icon: MultiplierTabIcons.IAP,
  },

  nerfV: {
    name: "V's Reality",
    powValue: () => 0.5,
    isActive: () => V.isRunning,
    icon: MultiplierTabIcons.GENERIC_V,
  },
  nerfCursed: {
    name: "Cursed Glyphs",
    powValue: () => getAdjustedGlyphEffect("curseddimensions"),
    isActive: () => getAdjustedGlyphEffect("curseddimensions") !== 1,
    icon: MultiplierTabIcons.SPECIFIC_GLYPH("cursed"),
  },
};
