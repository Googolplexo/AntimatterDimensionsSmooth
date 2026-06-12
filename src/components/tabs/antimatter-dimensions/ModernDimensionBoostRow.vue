<script>
export default {
  name: "ModernDimensionBoostRow",
  data() {
    return {
      requirement: {
        tier: 1,
        amount: 0
      },
      isBuyable: false,
      purchasedBoosts: 0,
      lockText: null,
      unlockedByBoost: null,
      creditsClosed: false,
      hasTutorial: false,
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    dimName() {
      return AntimatterDimension(this.requirement.tier).shortDisplayName;
    },
    classObject() {
      return {
        "o-primary-btn o-primary-btn--new o-primary-btn--dimension-reset": true,
        "tutorial--glow": this.isBuyable && this.hasTutorial,
        "o-primary-btn--disabled": !this.isBuyable,
        "o-pelle-disabled-pointer": this.creditsClosed
      };
    }
  },
  methods: {
    update() {
      const requirement = DimBoost.requirement;
      this.requirement.tier = requirement.tier;
      this.requirement.amount = requirement.amount;
      this.isBuyable = requirement.isSatisfied && DimBoost.canBeBought;
      this.purchasedBoosts = DimBoost.totalBoosts;
      this.lockText = DimBoost.lockText;
      this.unlockedByBoost = DimBoost.unlockedByBoost;
      this.creditsClosed = GameEnd.creditsEverClosed;
      this.hasTutorial = Tutorial.isActive(TUTORIAL_STATE.DIMBOOST);
    },
    dimensionBoost(bulk) {
      if (!DimBoost.requirement.isSatisfied || !DimBoost.canBeBought) return;
      manualRequestDimensionBoost(bulk);
    }
  }
};
</script>

<template>
  <div class="reset-container dimboost">
    <h4>Dimension Boost ({{ formatInt(this.purchasedBoosts) }})</h4>
    <span>Requires: {{ formatInt(requirement.amount) }} {{ dimName }} Antimatter D</span>
    <button
      :class="classObject"
      @click.exact="dimensionBoost(true)"
      @click.shift.exact="dimensionBoost(false)"
    >
      {{ unlockedByBoost }}
      <div
        v-if="hasTutorial"
        class="fas fa-circle-exclamation l-notification-icon"
      />
    </button>
  </div>
</template>
