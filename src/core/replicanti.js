import { DC } from "./constants";

// Internal function to add RGs; called both from within the fast replicanti code and from the function
// used externally. Only called in cases of automatic RG and does not actually modify replicanti amount
function addReplicantiGalaxies(newGalaxies) {
  if (newGalaxies > 0) {
    player.replicanti.galaxies += newGalaxies;
    player.requirementChecks.eternity.noRG = false;
    player.records.secondsSinceLastRG = 0;
  }
}

export function RGCost(start, bought, max) {
  const scale = new Decimal(1 + 1 / (max + 1));
  return start.times(scale.pow((bought) * (bought - 1) / 2));
}

// Function called externally for gaining RGs, which adjusts replicanti amount before calling the function
// which actually adds the RG. Called externally both automatically and manually
export function replicantiGalaxy(auto) {
  if (RealityUpgrade(6).isLockingMechanics) {
    if (!auto) RealityUpgrade(6).tryShowWarningModal();
    return;
  }
  if (!Replicanti.galaxies.canBuyMore) return;
  const bulk = Replicanti.galaxies.bulk
  const galaxyGain = bulk.quantity;
  if (galaxyGain < 1) return;
  if (!Achievement(126).isUnlocked || Pelle.isDoomed) Replicanti.amount = Replicanti.start;
  addReplicantiGalaxies(galaxyGain);
}

// Only called on manual RG requests
export function replicantiGalaxyRequest() {
  if (!Replicanti.galaxies.canBuyMore) return;
  if (RealityUpgrade(6).isLockingMechanics) RealityUpgrade(6).tryShowWarningModal();
  else if (player.options.confirmations.replicantiGalaxy) Modal.replicantiGalaxy.show();
  else replicantiGalaxy(false);
}

export function getIntervalBoost(x) {
  return DC.D1_1.pow(x).times(x * x / 4 + x / 2 + 1);
}

export function getReplicantiInterval(Interval) {
  let interval = getIntervalBoost(Interval).times(totalReplicantiSpeedMult());

  if (TimeStudy(133).isBought && !Achievement(138).isUnlocked) {
    interval = interval.div(10);
  }

  if (V.isRunning) {
    // This is a boost if interval < 1, but that only happens in EC12
    // and handling it would make the replicanti code a lot more complicated.
    interval = interval.pow(0.5);
  }

  return interval;
}

// This only counts the "external" multipliers - that is, it doesn't count any speed changes due to being over the cap.
// These multipliers are separated out largely for two reasons - more "dynamic" multipliers (such as overcap scaling
// and celestial nerfs) interact very weirdly and the game balance relies on this behavior, and we also use this same
// value in the multiplier tab too
export function totalReplicantiSpeedMult() {
  let totalMult = DC.D1;

  // These are the only effects active in Pelle - the function shortcuts everything else if we're in Pelle
  totalMult = totalMult.times(PelleRifts.decay.effectValue);
  totalMult = totalMult.times(Pelle.specialGlyphEffect.replication);
  totalMult = totalMult.times(ShopPurchase.replicantiPurchases.currentMult);
  if (Pelle.isDisabled("replicantiIntervalMult")) return totalMult;

  totalMult = totalMult.timesEffectsOf(
    TimeStudy(21),
    TimeStudy(62),
    TimeStudy(131),
    TimeStudy(213),
    RealityUpgrade(2),
    RealityUpgrade(6),
    RealityUpgrade(23),
  );

  if (Achievement(134).isUnlocked) {
    totalMult = totalMult.times(2);
  }
  totalMult = totalMult.times(getAdjustedGlyphEffect("replicationspeed"));
  if (GlyphAlteration.isAdded("replication")) {
    totalMult = totalMult.times(
      Math.clampMin(Decimal.log10(Replicanti.amount) * getSecondaryGlyphEffect("replicationdtgain"), 1));
  }
  totalMult = totalMult.timesEffectsOf(AlchemyResource.replication, Ra.unlocks.continuousTTBoost.effects.replicanti);

  return totalMult;
}

export function replicantiGainPerSecond() {
  return getReplicantiInterval(player.replicanti.interval).plusEffectOf(TimeStudy(132));
}

export function replicantiLoop(diff) {
  if (!player.replicanti.unl) return;
  const areRGsBeingBought = Replicanti.galaxies.areBeingBought;
 
  Replicanti.amount = Replicanti.amount.plus(replicantiGainPerSecond().times(diff / 1000));

  if (areRGsBeingBought) {
    replicantiGalaxy(true);
  }
  player.records.thisReality.maxReplicanti = player.records.thisReality.maxReplicanti
    .clampMin(Replicanti.amount);
}

export function getReplicantiPower(chance) {
  return chance / 10 + 2 + Effects.sum(TimeStudy(22), TimeStudy(102));
}

export function replicantiMult() {
  return Replicanti.amount.div(100).plus(1).pow(getReplicantiPower(Replicanti.chance));
}

/** @abstract */
class ReplicantiUpgradeState {
  /** @abstract */
  get id() { throw new NotImplementedError(); }
  /** @abstract */
  get value() { throw new NotImplementedError(); }

  /** @abstract */
  set value(value) { throw new NotImplementedError(); }

  /** @abstract */
  get nextValue() { throw new NotImplementedError(); }

  /** @abstract */
  get cost() { throw new NotImplementedError(); }
  /** @abstract */
  set cost(value) { throw new Error("Use baseCost to set cost"); }

  /** @abstract */
  get costIncrease() { throw new NotImplementedError(); }

  get baseCost() { return this.cost; }
  /** @abstract */
  set baseCost(value) { throw new NotImplementedError(); }

  /** @abstract */
  get autobuyerMilestone() { throw new NotImplementedError(); }

  get canBeBought() {
    return Currency.infinityPoints.gte(this.cost) && player.eterc8repl !== 0;
  }

  purchase() {
    if (!this.canBeBought) return;
    Currency.infinityPoints.subtract(this.cost);
    this.baseCost = Decimal.times(this.baseCost, this.costIncrease);
    this.value = this.nextValue;
    if (EternityChallenge(8).isRunning) player.eterc8repl--;
    GameUI.update();
  }

  autobuyerTick() {
    while (this.canBeBought) {
      this.purchase();
    }
  }
}

export const ReplicantiUpgrade = {
  chance: new class ReplicantiChanceUpgrade extends ReplicantiUpgradeState {
    get id() { return 1; }

    get value() { return player.replicanti.chance; }
    set value(value) { player.replicanti.chance = value; }

    get nextValue() {
      return this.value + 1;
    }

    get cost() {
      return player.replicanti.chanceCost.dividedByEffectOf(PelleRifts.vacuum.milestones[1]);
    }

    get baseCost() { return player.replicanti.chanceCost; }
    set baseCost(value) { player.replicanti.chanceCost = value; }

    get costIncrease() { return DC.E5.pow(this.value + 3); }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiChance;
    }

    autobuyerTick() {
      // This isn't a hot enough autobuyer to worry about doing an actual inverse.
      const bulk = bulkBuyBinarySearch(Currency.infinityPoints.value, {
        costFunction: x => this.baseCostAfterCount(x),
        firstCost: this.cost,
        cumulative: true,
      }, this.value);
      if (!bulk) return;
      Currency.infinityPoints.subtract(bulk.purchasePrice);
      this.value += bulk.quantity;
      this.baseCost = this.baseCostAfterCount(this.value);
    }

    baseCostAfterCount(count) {
      const logBase = 230;
      const logBaseIncrease = 15;
      const logCostScaling = 5;
      let logCost = logBase + count * logBaseIncrease + (count * (count - 1) / 2) * logCostScaling;
      return Decimal.pow10(logCost);
    }
  }(),
  interval: new class ReplicantiIntervalUpgrade extends ReplicantiUpgradeState {
    get id() { return 2; }

    get value() { return player.replicanti.interval; }
    set value(value) { player.replicanti.interval = value; }

    get nextValue() {
      return this.value + 1;
    }

    get cost() {
      return player.replicanti.intervalCost.dividedByEffectOf(PelleRifts.vacuum.milestones[1]);
    }

    get baseCost() { return player.replicanti.intervalCost; }
    set baseCost(value) { player.replicanti.intervalCost = value; }

    get costIncrease() { return DC.E5.pow(this.value + 2); }

    autobuyerTick() {
      // This isn't a hot enough autobuyer to worry about doing an actual inverse.
      const bulk = bulkBuyBinarySearch(Currency.infinityPoints.value, {
        costFunction: x => this.baseCostAfterCount(x),
        firstCost: this.cost,
        cumulative: true,
      }, this.value);
      if (!bulk) return;
      Currency.infinityPoints.subtract(bulk.purchasePrice);
      this.value += bulk.quantity;
      this.baseCost = this.baseCostAfterCount(this.value);
    }

    baseCostAfterCount(count) {
      const logBase = 270;
      const logBaseIncrease = 10;
      const logCostScaling = 5;
      let logCost = logBase + count * logBaseIncrease + (count * (count - 1) / 2) * logCostScaling;
      return Decimal.pow10(logCost);
    }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiInterval;
    }
  }(),
  galaxies: new class ReplicantiGalaxiesUpgrade extends ReplicantiUpgradeState {
    get id() { return 3; }

    get value() { return player.replicanti.boughtGalaxyCap; }
    set value(value) { player.replicanti.boughtGalaxyCap = value; }

    get nextValue() {
      return this.value + 1;
    }

    get cost() {
      return this.baseCost.dividedByEffectsOf(TimeStudy(233), PelleRifts.vacuum.milestones[1]);
    }

    get baseCost() { return player.replicanti.galCost; }
    set baseCost(value) { player.replicanti.galCost = value; }

    get costIncrease() {
      const galaxies = this.value;
      let increase = EternityChallenge(6).isRunning
        ? DC.E2.pow(galaxies).times(DC.E2)
        : DC.E55.pow(galaxies).times(DC.E75);
      return increase;
    }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiMaxGalaxies;
    }

    autobuyerTick() {
      // This isn't a hot enough autobuyer to worry about doing an actual inverse.
      const bulk = bulkBuyBinarySearch(Currency.infinityPoints.value, {
        costFunction: x => this.baseCostAfterCount(x).dividedByEffectOf(TimeStudy(233)),
        firstCost: this.cost,
        cumulative: true,
      }, this.value);
      if (!bulk) return;
      Currency.infinityPoints.subtract(bulk.purchasePrice);
      this.value += bulk.quantity;
      this.baseCost = this.baseCostAfterCount(this.value);
    }

    baseCostAfterCount(count) {
      const logBase = 570;
      const logBaseIncrease = EternityChallenge(6).isRunning ? 2 : 75;
      const logCostScaling = EternityChallenge(6).isRunning ? 2 : 55;
      let logCost = logBase + count * logBaseIncrease + (count * (count - 1) / 2) * logCostScaling;
      return Decimal.pow10(logCost);
    }
  }(),
};

export const Replicanti = {
  get areUnlocked() {
    return player.replicanti.unl;
  },
  reset(force = false) {
    const unlocked = !force && (PelleUpgrade.replicantiStayUnlocked.canBeApplied || (!Pelle.isDoomed && EternityMilestone.unlockReplicanti.isReached));
    player.replicanti = {
      unl: unlocked,
      amount: DC.D0,
      chance: 0,
      chanceCost: DC.E230,
      interval: 0,
      intervalCost: DC.E270,
      boughtGalaxyCap: 0,
      galaxies: 0,
      galCost: DC.E570,
      galaxyCost: DC.D5E4,
    };
  },
  unlock(freeUnlock = false) {
    const cost = DC.E210.dividedByEffectOf(PelleRifts.vacuum.milestones[1]);
    if (player.replicanti.unl) return;
    if (freeUnlock || Currency.infinityPoints.gte(cost)) {
      if (!freeUnlock) Currency.infinityPoints.subtract(cost);
      player.replicanti.unl = true;
      Replicanti.amount = DC.D1;
    }
  },
  get amount() {
    return player.replicanti.amount;
  },
  set amount(value) {
    player.replicanti.amount = value;
  },
  get chance() {
    return ReplicantiUpgrade.chance.value;
  },
  get start() {
    return (TimeStudy(33).isBought && !Pelle.isDoomed)
      ? this.galaxies.currentCost.div(2)
      : DC.D0;
  },
  galaxies: {
    get bought() {
      return player.replicanti.galaxies;
    },
    get max() {
      return ReplicantiUpgrade.galaxies.value;
    },
    get startingCost() {
      return DC.D5E4.dividedByEffectsOf(TimeStudy(42), TimeStudy(133));
    },
    get currentCost() {
      return RGCost(this.startingCost, this.bought, this.max);
    },
    get canBuyMore() {
      return Replicanti.amount.gte(this.currentCost);
    },
    get areBeingBought() {
      const buyer = Autobuyer.replicantiGalaxy;
      return (buyer.canTick && buyer.isEnabled);
    },
    get bulk() {
      if (!this.canBuyMore) return;
      if (!Autobuyer.replicantiGalaxy.isUnlocked) return { quantity: 1, purchasePrice: this.currentCost };
      return bulkBuyBinarySearch(player.replicanti.amount, {
        costFunction: x => RGCost(this.startingCost, x, this.max),
        firstCost: this.currentCost,
        cumulative: true,
      }, this.bought);
    },
  }
};
