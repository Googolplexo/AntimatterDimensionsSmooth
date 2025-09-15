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
      this.remainingTimeText = `Next Replicanti Galaxy in ${TimeSpan.fromSeconds(timeToNextRG())}`;
      this.galaxyText = (Autobuyer.replicantiGalaxy.isUnlocked && galaxies.canBuyMore)
        ? `You can get ${quantifyInt("Replicanti Galaxy", galaxies.bulk.quantity)}` : "";
    }
  }
};
</script>

<template>
  <p>{{ remainingTimeText }}<br>{{ galaxyText }}</p>
</template>

<style scoped>

</style>
