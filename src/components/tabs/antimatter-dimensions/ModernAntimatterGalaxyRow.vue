<script>
export default {
  name: "ModernAntimatterGalaxyRow",
  data() {
    return {
      galaxies: {
        normal: 0,
        replicanti: 0,
        dilation: 0,
        static: 0
      },
      requirement: {
        tier: 1,
        amount: 0
      },
      canBeBought: false,
      lockText: null,
      canBulkBuy: false,
      creditsClosed: false,
      hasTutorial: false,
      keepAntimatter: false,
      keepDimensions: false,
      keepDimBoost: false,
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    dimName() {
      return AntimatterDimension(this.requirement.tier).shortDisplayName;
    },
    buttonText() {
      if (this.lockText !== null) return this.lockText;
      const reset = [];
      if (!this.keepAntimatter) reset.push("Antimatter");
      if (!this.keepDimensions) reset.push("Antimatter Dimensions", "Tickspeed");
      if (!this.keepDimBoost) reset.push("Dimension Boosts");
      return reset.length === 0
        ? `Multiply the power of Tickspeed upgrades by 1.25`
        : `Reset your ${makeEnumeration(reset)} to multiply the power of Tickspeed upgrades by 1.25`;
    },
    sumText() {
      const parts = [Math.max(this.galaxies.normal, 0)];
      if (this.galaxies.replicanti) parts.push(this.galaxies.replicanti);
      if (this.galaxies.dilation) parts.push(this.galaxies.dilation);
      if (this.galaxies.static) parts.push(this.galaxies.static);
      const sum = parts.map(this.formatGalaxies).join(" + ");
      if (parts.length >= 2) {
        return `${sum} = ${this.formatGalaxies(parts.sum())}`;
      }
      return sum;
    },
    classObject() {
      return {
        "o-primary-btn o-primary-btn--new o-primary-btn--dimension-reset": true,
        "tutorial--glow": this.canBeBought && this.hasTutorial,
        "o-primary-btn--disabled": !this.canBeBought,
        "o-pelle-disabled-pointer": this.creditsClosed
      };
    }
  },
  methods: {
    update() {
      this.galaxies.normal = player.galaxies + GalaxyGenerator.galaxies;
      this.galaxies.replicanti = Replicanti.galaxies.bought;
      this.galaxies.dilation = player.dilation.totalTachyonGalaxies;
      this.galaxies.static = staticGalaxies();
      const requirement = Galaxy.requirement;
      this.requirement.amount = requirement.amount;
      this.requirement.tier = requirement.tier;
      this.canBeBought = requirement.isSatisfied && Galaxy.canBeBought;
      this.lockText = Galaxy.lockText;
      this.canBulkBuy = EternityMilestone.autobuyMaxGalaxies.isReached;
      this.creditsClosed = GameEnd.creditsEverClosed;
      this.hasTutorial = Tutorial.isActive(TUTORIAL_STATE.GALAXY);
      this.keepAntimatter = canKeepAntimatterOnSoftReset(PRESTIGE_EVENT.ANTIMATTER_GALAXY);
      this.keepDimensions = canKeepDimensionsOnSoftReset(PRESTIGE_EVENT.ANTIMATTER_GALAXY);
      this.keepDimBoost = canKeepDimBoostsOnGalaxy();
    },
    buyGalaxy(bulk) {
      if (!this.canBeBought) return;
      manualRequestGalaxyReset(this.canBulkBuy && bulk);
    },
    formatGalaxies(num) {
      return num > 1e8 ? format(num, 2) : formatInt(num);
    },
  }
};
</script>

<template>
  <div class="reset-container galaxy">
    <h4>Antimatter Galaxies ({{ sumText }})</h4>
    <span>Requires: {{ formatInt(requirement.amount) }} {{ dimName }} Antimatter D</span>
    <button
      :class="classObject"
      @click.exact="buyGalaxy(true)"
      @click.shift.exact="buyGalaxy(false)"
    >
      {{ buttonText }}
      <div
        v-if="hasTutorial"
        class="fas fa-circle-exclamation l-notification-icon"
      />
    </button>
  </div>
</template>
