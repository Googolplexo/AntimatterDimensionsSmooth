<script>
import ReplicantiUpgradeButton, { ReplicantiUpgradeButtonSetup } from "./ReplicantiUpgradeButton";
import PrimaryButton from "@/components/PrimaryButton";
import ReplicantiGainText from "./ReplicantiGainText";
import ReplicantiGalaxyButton from "./ReplicantiGalaxyButton";

export default {
  name: "ReplicantiTab",
  components: {
    PrimaryButton,
    ReplicantiGainText,
    ReplicantiUpgradeButton,
    ReplicantiGalaxyButton,
  },
  data() {
    return {
      isUnlocked: false,
      isMaxAllUnlocked: false,
      isUnlockAffordable: false,
      isInEC8: false,
      ec8Purchases: 0,
      amount: new Decimal(),
      mult: new Decimal(),
      hasTDMult: false,
      multTD: new Decimal(),
      hasDTMult: false,
      multDT: new Decimal(),
      hasIPMult: false,
      multIP: new Decimal(),
      unlockCost: new Decimal(),
      maxReplicanti: new Decimal(),
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    replicantiChanceSetup() {
      const upgrade = ReplicantiUpgrade.chance;
      function formatChance(chance) {
        return `${formatPow(getReplicantiPower(chance), 2, 2)}`;
      }
      return new ReplicantiUpgradeButtonSetup(
        upgrade,
        value => `Replicanti power: ${formatChance(value)}`,
        cost =>
          `➜ ${formatChance(upgrade.nextValue)} Costs: ${format(cost)} IP`
      );
    },
    replicantiIntervalSetup() {
      const upgrade = ReplicantiUpgrade.interval;
      function formatInterval(interval) {
        return `${format(getReplicantiInterval(interval), 2, 2)}/s`;
      }
      return new ReplicantiUpgradeButtonSetup(
        upgrade,
        value => `Gaining: ${formatInterval(value)}`,
        cost =>
          `➜ ${formatInterval(upgrade.nextValue)} Costs: ${format(cost)} IP`
      );
    },
    maxGalaxySetup() {
      const upgrade = ReplicantiUpgrade.galaxies;
      function formatGalaxies(galaxies) {
        if (galaxies < 34) return `${formatX(1 + 1 / (galaxies + 1), 0, 3)}`;
        return `×(1+1/${formatInt(galaxies)})`;
      }
      return new ReplicantiUpgradeButtonSetup(
        upgrade,
        value => `RG cost scaling: ${formatGalaxies(value)}`,
        cost =>
          `➜ ${formatGalaxies(upgrade.nextValue)} Costs: ${format(cost)} IP`
      );
    },
    boostText() {
      const boostList = [];
      boostList.push(`a <span class="c-replicanti-description__accent">${formatX(this.mult, 2, 2)}</span>
        multiplier on all Infinity Dimensions`);
      if (this.hasTDMult) {
        boostList.push(`a <span class="c-replicanti-description__accent">${formatX(this.multTD, 2, 2)}</span>
          multiplier on all Time Dimensions from a Dilation Upgrade`);
      }
      if (this.hasDTMult) {
        const additionalEffect = GlyphAlteration.isAdded("replication") ? "and Replicanti speed " : "";
        boostList.push(`a <span class="c-replicanti-description__accent">${formatX(this.multDT, 2, 2)}</span>
          multiplier to Dilated Time ${additionalEffect}from Glyphs`);
      }
      if (this.hasIPMult) {
        boostList.push(`a <span class="c-replicanti-description__accent">${formatX(this.multIP)}</span>
          multiplier to Infinity Points from Glyph Alchemy`);
      }
      if (boostList.length === 1) return `${boostList[0]}.`;
      if (boostList.length === 2) return `${boostList[0]}<br> and ${boostList[1]}.`;
      return `${boostList.slice(0, -1).join(",<br>")},<br> and ${boostList[boostList.length - 1]}.`;
    },
    hasMaxText: () => PlayerProgress.realityUnlocked() && !Pelle.isDoomed,
    toMaxTooltip() {
      const t = this.estimateToMax;
      if (t === Number.MAX_VALUE) return "Impossibly far away";
      return (t < 0.01)
        ? "Currently increasing"
        : timeUntilReplicanti(this.maxReplicanti).toStringShort();
    }
  },
  methods: {
    update() {
      this.isUnlocked = Replicanti.areUnlocked;
      this.unlockCost = new Decimal("1e210").dividedByEffectOf(PelleRifts.vacuum.milestones[1]);
      if (!this.isUnlocked) {
        this.isUnlockAffordable = Currency.infinityPoints.gte(this.unlockCost);
        return;
      }
      this.isInEC8 = EternityChallenge(8).isRunning;
      this.isMaxAllUnlocked = this.isUnlocked && EternityMilestone.unlockReplicanti.isReached && !this.isinEC8;
      if (this.isInEC8) {
        this.ec8Purchases = player.eterc8repl;
      }
      this.amount.copyFrom(Replicanti.amount);
      this.mult.copyFrom(replicantiMult());
      this.hasTDMult = DilationUpgrade.tdMultReplicanti.isBought;
      this.multTD.copyFrom(DilationUpgrade.tdMultReplicanti.effectValue);
      this.hasDTMult = getAdjustedGlyphEffect("replicationdtgain") !== 0 && !Pelle.isDoomed;
      this.multDT = Math.clampMin(
        Decimal.log10(Replicanti.amount) *
          getAdjustedGlyphEffect("replicationdtgain"),
        1
      );
      this.hasIPMult = AlchemyResource.exponential.amount > 0 && !this.isDoomed;
      this.multIP = Replicanti.amount.powEffectOf(AlchemyResource.exponential);
      this.maxReplicanti.copyFrom(player.records.thisReality.maxReplicanti);
    },
    maxAll() {
      const r = ReplicantiUpgrade;
      for (const upgrade of [r.galaxies, r.interval, r.chance]) {
        upgrade.autobuyerTick();
      }
    }
  },
};
</script>

<template>
  <div class="l-replicanti-tab">
    <br>
    <PrimaryButton
      v-if="!isUnlocked"
      :enabled="isUnlockAffordable"
      class="o-primary-btn--replicanti-unlock"
      onclick="Replicanti.unlock();"
    >
      Unlock Replicanti
      <br>
      Cost: {{ format(unlockCost) }} IP
    </PrimaryButton>
    <template v-else>
    <div class="c-subtab-option-container">
      <PrimaryButton
        v-if="isMaxAllUnlocked"
        class="o-primary-btn--subtab-option"
        @click="maxAll"
      >
        Max all
      </PrimaryButton>
    </div>
      <p class="c-replicanti-description">
        You have
        <span class="c-replicanti-description__accent">{{ format(amount, 2, 0) }}</span>
        Replicanti, translated to
        <br>
        <span v-html="boostText" />
      </p>
      <div
        v-if="hasMaxText"
        class="c-replicanti-description"
      >
        Your maximum Replicanti reached this Reality is
        <span
          v-tooltip="toMaxTooltip"
          class="max-accent"
        >{{ format(maxReplicanti, 2) }}</span>.
      </div>
      <br>
      <div v-if="isInEC8">
        You have {{ quantifyInt("purchase", ec8Purchases) }} left within Eternity Challenge 8.
      </div>
      <div class="l-replicanti-upgrade-row">
        <ReplicantiUpgradeButton :setup="replicantiChanceSetup" />
        <ReplicantiUpgradeButton :setup="replicantiIntervalSetup" />
        <ReplicantiUpgradeButton :setup="maxGalaxySetup" />
      </div>
      <br><br>
      <ReplicantiGainText />
      <br>
      <ReplicantiGalaxyButton />
    </template>
  </div>
</template>

<style scoped>
.max-accent {
  color: var(--color-accent);
  text-shadow: 0 0 0.2rem var(--color-reality-dark);
  cursor: default;
}
</style>
