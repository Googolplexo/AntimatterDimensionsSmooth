<script>
import PrimaryButton from "@/components/PrimaryButton";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";

export default {
  name: "ReplicantiGalaxyButton",
  components: {
    PrimaryButton,
    PrimaryToggleButton
  },
  data() {
    return {
      isAvailable: false,
      isAutoUnlocked: false,
      isAutoActive: false,
      isAutoEnabled: false,
      isDivideUnlocked: false,
      boughtGalaxies: 0,
      extraGalaxies: 0,
      cost: new Decimal(0)
    };
  },
  computed: {
    resetActionDisplay() {
      return this.isDivideUnlocked && !Pelle.isDoomed
        ? "Get"
        : "Reset the Replicanti amount for";
    },
    galaxyCountDisplay() {
      const bought = this.boughtGalaxies;
      const extra = this.extraGalaxies;
      const galaxyCount = extra > 0 ? `${formatInt(bought)}+${formatInt(extra)}` : formatInt(bought);
      return `Currently: ${galaxyCount}`;
    },
    galaxyCostDisplay() {
      return `Cost: ${format(this.cost, 2, 2)} Replicanti`;
    },
    autobuyer() {
      return Autobuyer.replicantiGalaxy;
    },
    autobuyerTextDisplay() {
      const auto = this.isAutoActive;
      const disabled = !this.isAutoEnabled;
      return `Auto Galaxy ${auto ? "ON" : "OFF"}${disabled ? " (disabled)" : ""}`;
    },
  },
  methods: {
    update() {
      const rg = Replicanti.galaxies;
      this.isAvailable = rg.canBuyMore;
      this.cost = rg.currentCost;
      this.boughtGalaxies = rg.bought;
      this.extraGalaxies = rg.extra;
      this.isDivideUnlocked = Achievement(126).isUnlocked;
      const auto = Autobuyer.replicantiGalaxy;
      this.isAutoUnlocked = auto.isUnlocked;
      this.isAutoActive = auto.isActive;
      this.isAutoEnabled = auto.isEnabled;
    },
    handleAutoToggle(value) {
      Autobuyer.replicantiGalaxy.isActive = value;
      this.update();
    },
    handleClick() {
      replicantiGalaxyRequest();
    }
  }
};
</script>

<template>
  <div class="l-spoon-btn-group">
    <PrimaryButton
      :enabled="isAvailable"
      class="o-primary-btn--replicanti-galaxy"
      @click="handleClick"
    >
      {{ resetActionDisplay }} a Replicanti Galaxy
      <br>
      {{ galaxyCountDisplay }}
      <br>
      {{ galaxyCostDisplay }}
    </PrimaryButton>
    <PrimaryToggleButton
      v-if="isAutoUnlocked"
      :value="isAutoActive"
      :on="autobuyerTextDisplay"
      :off="autobuyerTextDisplay"
      class="l--spoon-btn-group__little-spoon o-primary-btn--replicanti-galaxy-toggle"
      @input="handleAutoToggle"
    />
  </div>
</template>

<style scoped>

</style>
