<script>
export default {
  name: "ReplicantiGainText",
  data() {
    return {
      remainingTimeText: "",
      galaxyText: ""
    };
  },
  methods: {
    update() {
      const galaxies = Replicanti.galaxies;
      const canBulk = Autobuyer.replicantiGalaxy.isUnlocked && galaxies.canBuyMore;
      const bulk = galaxies.bulk;
      function timeUntil(goal) {
        return `${TimeSpan.fromSeconds(goal.minus(Replicanti.amount).clampMin(0).div(getReplicantiInterval(ReplicantiUpgrade.interval.value)).toNumber())}`;
      }
      this.remainingTimeText = `Next Replicanti Galaxy in ${canBulk
        ? timeUntil(bulk.purchasePrice.plus(RGCost(galaxies.startingCost, galaxies.bought + bulk.quantity + 1, galaxies.max)))
        : timeUntil(galaxies.currentCost)}`;
      this.galaxyText = canBulk ? `You can get ${quantifyInt("Replicanti Galaxy", bulk.quantity)}` : "";
    }
  }
};
</script>

<template>
  <p>{{ remainingTimeText }}<br>{{ galaxyText }}</p>
</template>

<style scoped>

</style>
