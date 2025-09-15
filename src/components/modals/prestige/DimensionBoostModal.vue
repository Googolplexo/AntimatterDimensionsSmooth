<script>
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";

export default {
  name: "DimensionBoostModal",
  components: {
    ModalWrapperChoice
  },
  props: {
    bulk: {
      type: Boolean,
      required: true,
    }
  },
  computed: {
    topLabel() {
      return `You are about to do a Dimension Boost Reset`;
    },
    message() {
      const keepDimensions = canKeepDimensionsOnSoftReset(PRESTIGE_EVENT.DIMENSION_BOOST)
        ? `not actually reset anything due to an upgrade you have which prevents everything
          from being reset in this situation. You will still gain the multiplier from the Boost, as usual.`
        : `reset your Antimatter, Antimatter Dimensions, and Tickspeed. Are you sure you want to do this?`;

      return `This will ${keepDimensions}`;
    },
  },
  methods: {
    handleYesClick() {
      requestDimensionBoost(this.bulk);
      EventHub.ui.offAll(this);
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    option="dimensionBoost"
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
