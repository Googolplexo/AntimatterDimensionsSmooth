import { DC } from "./constants";

export function effectiveBaseGalaxies() {
  let replicantiGalaxies = Replicanti.galaxies.bought;
  let freeGalaxies = player.dilation.totalTachyonGalaxies;
  freeGalaxies *= 1 + Math.max(0, Replicanti.amount.log10() / 1e6) * AlchemyResource.alternation.effectValue;
  return player.galaxies + GalaxyGenerator.galaxies + replicantiGalaxies + freeGalaxies + staticGalaxies();
}

export function getTickSpeedMultiplier() {
  if (InfinityChallenge(3).isRunning) return DC.D1;
  if (Ra.isRunning) return DC.C1D1_1245;
  let galaxies = effectiveBaseGalaxies();
  
  let baseMultiplier = DC.D0_5;
  if (NormalChallenge(5).isRunning) baseMultiplier = DC.D2.div(3);

  if (Pelle.isDoomed) galaxies *= 0.5;

  galaxies *= Pelle.specialGlyphEffect.power;
  const perGalaxy = DC.D0_8;
  return perGalaxy.pow(galaxies).times(baseMultiplier);
}

export function buyTickSpeed() {
  if (!Tickspeed.isAvailableForPurchase || !Tickspeed.isAffordable) return false;

  if (NormalChallenge(9).isRunning) {
    Tickspeed.multiplySameCosts();
  }
  Tutorial.turnOffEffect(TUTORIAL_STATE.TICKSPEED);
  Currency.antimatter.subtract(Tickspeed.cost);
  player.totalTickBought++;
  player.records.thisInfinity.lastBuyTime = player.records.thisInfinity.time;
  player.requirementChecks.permanent.singleTickspeed++;
  if (NormalChallenge(2).isRunning) player.chall2Pow = 0;
  GameUI.update();
  return true;
}

export function buyMaxTickSpeed() {
  if (!Tickspeed.isAvailableForPurchase || !Tickspeed.isAffordable) return;
  let boughtTickspeed = false;

  Tutorial.turnOffEffect(TUTORIAL_STATE.TICKSPEED);
  if (NormalChallenge(9).isRunning) {
    const goal = Player.infinityGoal;
    let cost = Tickspeed.cost;
    while (Currency.antimatter.gt(cost) && cost.lt(goal)) {
      Tickspeed.multiplySameCosts();
      Currency.antimatter.subtract(cost);
      player.totalTickBought++;
      boughtTickspeed = true;
      cost = Tickspeed.cost;
    }
  } else {
    const purchases = Tickspeed.costScale.getMaxBought(player.totalTickBought, Currency.antimatter.value, 1);
    if (purchases === null) {
      return;
    }
    Currency.antimatter.subtract(Decimal.pow10(purchases.logPrice));
    player.totalTickBought += purchases.quantity;
    boughtTickspeed = true;
  }

  if (boughtTickspeed) {
    player.records.thisInfinity.lastBuyTime = player.records.thisInfinity.time;
    if (NormalChallenge(2).isRunning) player.chall2Pow = 0;
  }
}

export function resetTickspeed() {
  player.totalTickBought = 0;
  player.chall9TickspeedCostBumps = 0;
}

export const Tickspeed = {

  get isUnlocked() {
    return AntimatterDimension(2).bought > 0 || EternityMilestone.unlockAllND.isReached ||
      PlayerProgress.realityUnlocked();
  },

  get isAvailableForPurchase() {
    return this.isUnlocked &&
      !EternityChallenge(9).isRunning &&
      !Laitela.continuumActive &&
      (player.break || this.cost.lt(Decimal.NUMBER_MAX_VALUE));
  },

  get isAffordable() {
    return Currency.antimatter.gte(this.cost);
  },

  get multiplier() {
    return getTickSpeedMultiplier();
  },

  get current() {
    return Decimal.divide(1000, this.perSecond);
  },

  get cost() {
    return this.costScale.calculateCost(player.totalTickBought + player.chall9TickspeedCostBumps);
  },

  get costScale() {
    return new ExponentialCostScaling({
      baseCost: 1000,
      baseIncrease: 10,
      costScale: 10,
      scalingCostThreshold: 10000
    });
  },

  get continuumValue() {
    if (!this.isUnlocked) return 0;
    return this.costScale.getContinuumValue(Currency.antimatter.value, 1) * Laitela.matterExtraPurchaseFactor;
  },

  get baseValue() {
    return DC.E3.timesEffectsOf(
      Achievement(36),
      Achievement(45),
      Achievement(66),
      Achievement(83)
    )
      .times(getTickSpeedMultiplier().pow(this.totalUpgrades));
  },

  get totalUpgrades() {
    let boughtTickspeed;
    if (Laitela.continuumActive) boughtTickspeed = this.continuumValue;
    else boughtTickspeed = player.totalTickBought;
    return boughtTickspeed + player.totalTickGained;
  },

  get perSecond() {
    const tickspeed = Decimal.divide(1000, this.baseValue);
    return player.dilation.active || PelleStrikes.dilation.hasStrike ? dilatedValueOf(tickspeed) : tickspeed;
  },

  multiplySameCosts() {
    for (const dimension of AntimatterDimensions.all) {
      if (dimension.cost.e === this.cost.e) dimension.costBumps++;
    }
  }
};

function timeShardTickspeedCost(x) {
  return DC.D1_005.pow((x * x - x) / 2).times(DC.D1_33.pow(x));
}

export const FreeTickspeed = {

  get amount() {
    return player.totalTickGained;
  },

  get multToNext() {
    return DC.D1_33.times(DC.D1_005.pow(this.amount));
  },

  fromShards(shards) {
    const amount = bulkBuyBinarySearch(shards, {
      costFunction: x => timeShardTickspeedCost(x),
      firstCost: DC.D1,
      cumulative: false,
    }, 0).quantity;
    return { newAmount: amount, nextShards: timeShardTickspeedCost(amount) };
  }

};
