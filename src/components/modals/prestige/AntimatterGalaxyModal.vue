<script>
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";

export default {
  name: "AntimatterGalaxyModal",
  components: {
    ModalWrapperChoice
  },
  props: {
    bulk: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      newGalaxies: 0,
      keepAntimatter: false,
      keepDimensions: false,
      keepDimBoost: false
    };
  },
  computed: {
    topLabel() {
      if (this.bulk) return `You are about to purchase ${quantifyInt("Antimatter Galaxy", this.newGalaxies)}`;
      return `You are about to purchase an Antimatter Galaxy`;
    },
    message() {
      let reset = [];
      if (!this.keepAntimatter) reset.push("Antimatter");
      if (!this.keepDimensions) reset.push("Antimatter Dimensions", "Tickspeed");
      if (!this.keepDimBoost) reset.push("Dimension Boosts");
      const resetList = makeEnumeration(reset);
      let tickspeedFixed = "";
      if (InfinityChallenge(3).isRunning) {
        tickspeedFixed = `Infinity Challenge ${InfinityChallenge(3).id}`;
      } else if (Ra.isRunning) {
        tickspeedFixed = `${Ra.displayName}'s Reality`;
      }
      const tickspeedInfo = (tickspeedFixed === "")
        ? "you will receive a boost to Tickspeed Upgrades."
        : `you will not receive a boost to Tickspeed Upgrades, because you are in ${tickspeedFixed}.`;
      const message = (resetList === "")
        ? `This will reset nothing, and ${tickspeedInfo}`
        : `This will reset your ${resetList}. However, ${tickspeedInfo}`;

      if (this.bulk) return `Are you sure you want to purchase
      ${quantifyInt("Antimatter Galaxy", this.newGalaxies)}? ${message}`;
      return `Are you sure you want to purchase an Antimatter Galaxy? ${message}`;
    }
  },
  created() {
    this.on$(GAME_EVENT.DIMBOOST_AFTER, () =>
      (BreakInfinityUpgrade.autobuyMaxDimboosts.isBought ? undefined : this.emitClose()));
  },
  methods: {
    update() {
      if (this.bulk) {
        const req = Galaxy.requirement;
        const dim = AntimatterDimension(req.tier);
        const bulk = bulkBuyBinarySearch(dim.totalAmount, {
          costFunction: x => Galaxy.requirementAt(x).amount,
          cumulative: false,
        }, player.galaxies);
        if (bulk) {
          this.newGalaxies = Galaxy.buyableGalaxies(Math.round(dim.totalAmount.toNumber())) - player.galaxies;
        }
      }
      this.keepAntimatter = canKeepAntimatterOnSoftReset(PRESTIGE_EVENT.ANTIMATTER_GALAXY);
      this.keepDimensions = canKeepDimensionsOnSoftReset(PRESTIGE_EVENT.ANTIMATTER_GALAXY);
      this.keepDimBoost = canKeepDimBoostsOnGalaxy();
    },
    handleYesClick() {
      requestGalaxyReset(this.bulk);
      EventHub.ui.offAll(this);
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    option="antimatterGalaxy"
    @confirm="handleYesClick"
  >
    <template #header>
      {{ topLabel }}
    </template>

    <div class="c-modal-message__text">
      {{ message }}
    </div>
  </ModalWrapperChoice>
</template>
