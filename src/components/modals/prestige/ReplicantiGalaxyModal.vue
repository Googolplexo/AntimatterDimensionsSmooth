<script>
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";

export default {
  name: "ReplicantiGalaxyModal",
  components: {
    ModalWrapperChoice
  },
  data() {
    return {
      replicanti: new Decimal(),
      divideReplicanti: false,
      canBeBought: 0,
    };
  },
  computed: {
    topLabel() {
      return `You are about to purchase ${quantifyInt("Replicanti Galaxy", this.canBeBought)}`;
    },
    message() {
      const reductionString = this.divideReplicanti
        ? ""
        : `It will reset your Replicanti to ${formatInt(0)}.`;
      return `A Replicanti Galaxy boosts Tickspeed the same way an Antimatter Galaxy does. However, it does not
        increase the cost of Antimatter Galaxies, nor is it affected by cost reductions to Antimatter Galaxies specifically.
        ${reductionString}`;
    }
  },
  methods: {
    update() {
      const galaxies = Replicanti.galaxies;
      this.replicanti.copyFrom(player.replicanti.amount);
      this.divideReplicanti = Achievement(126).isUnlocked;
      this.canBeBought = galaxies.canBuyMore ? galaxies.bulk.quantity : 0;
      if (this.replicanti.lt(galaxies.startingCost)) this.emitClose();
    },
    handleYesClick() {
      replicantiGalaxy(false);
    },
  },
};
</script>

<template>
  <ModalWrapperChoice
    option="replicantiGalaxy"
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
