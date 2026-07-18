import { AutobuyerState } from "./autobuyer";

export class ReplicantiGalaxyAutobuyerState extends AutobuyerState {
  get data() {
    return player.auto.replicantiGalaxies;
  }

  get name() {
    return `Replicanti Galaxy`;
  }

  get isUnlocked() {
    return EternityMilestone.autobuyerReplicantiGalaxy.isReached;
  }

  get hasUnlimitedBulk() {
    return true;
  }

  tick() {
    replicantiGalaxy(true);
  }
}
