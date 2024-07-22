import { MultiplierTabHelper } from "./helper-functions";
import { MultiplierTabIcons } from "./icons";

// See index.js for documentation
export const galaxies = {
  // Note: none of the galaxy types use the global multiplier that applies to all of them within multValue, which
  // very slightly reduces performance impact and is okay because it's applied consistently
  antimatter: {
    name: "Antimatter Galaxies",
    displayOverride: () => {
      const num = player.galaxies + GalaxyGenerator.galaxies;
      return `${formatInt(num)}`;
    },
    multValue: () => Decimal.pow10(player.galaxies + GalaxyGenerator.galaxies),
    isActive: true,
    icon: MultiplierTabIcons.ANTIMATTER,
  },
  replicanti: {
    name: "Replicanti Galaxies",
    displayOverride: () => {
      const num = Replicanti.galaxies.total;
      return `${formatInt(num)}`;
    },
    multValue: () => {
      let rg = Replicanti.galaxies.bought;
      rg *= (1 + Effects.sum(TimeStudy(132), TimeStudy(133)));
      rg += Replicanti.galaxies.extra;
      rg += Math.min(Replicanti.galaxies.bought, ReplicantiUpgrade.galaxies.value) *
          Effects.sum(EternityChallenge(8).reward);
      return Decimal.pow10(rg);
    },
    isActive: () => Replicanti.areUnlocked,
    icon: MultiplierTabIcons.SPECIFIC_GLYPH("replication"),
  },
  tachyon: {
    name: "Tachyon Galaxies",
    displayOverride: () => {
      const num = player.dilation.totalTachyonGalaxies;
      return `${formatInt(num)}`;
    },
    multValue: () => {
      const num = player.dilation.totalTachyonGalaxies;
      const mult = 1 + Math.max(0, Replicanti.amount.log10() / 1e6) * AlchemyResource.alternation.effectValue;
      return Decimal.pow10(num * mult);
    },
    isActive: () => player.dilation.totalTachyonGalaxies > 0,
    icon: MultiplierTabIcons.SPECIFIC_GLYPH("dilation"),
  },
  infinity: {
    name: "Infinity Upgrades",
    displayOverride: () => {
      const num = Effects.sum(InfinityUpgrade.galaxyBoost);
      return `${formatInt(num)}`;
    },
    multValue: () => new Decimal(10),
    isActive: () => InfinityUpgrade.galaxyBoost.isBought,
    icon: MultiplierTabIcons.UPGRADE("infinity"),
  },
  nerfPelle: {
    name: "Doomed Reality",
    displayOverride: () => `All Galaxy strength /${formatInt(2)}`,
    powValue: 0.5,
    isActive: () => Pelle.isDoomed,
    icon: MultiplierTabIcons.PELLE,
  }
};
