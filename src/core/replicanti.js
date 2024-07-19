import { DC } from "./constants";

// Slowdown parameters for replicanti growth, interval will increase by scaleFactor for every scaleLog10
// OoM past the cap (default is 308.25 (log10 of 1.8e308), 1.2, Number.MAX_VALUE)
export const ReplicantiGrowth = {
  get scaleLog10() {
    return Math.log10(Number.MAX_VALUE);
  },
  get scaleFactor() {
    if (PelleStrikes.eternity.hasStrike && Replicanti.amount.gte(DC.E2000)) return 10;
    if (Pelle.isDoomed) return 2;
    return AlchemyResource.cardinality.effectValue;
  }
};

// Internal function to add RGs; called both from within the fast replicanti code and from the function
// used externally. Only called in cases of automatic RG and does not actually modify replicanti amount
function addReplicantiGalaxies(newGalaxies) {
  if (newGalaxies > 0) {
    player.replicanti.galaxies += newGalaxies;
    player.requirementChecks.eternity.noRG = false;
    const keepResources = Pelle.isDoomed
      ? PelleUpgrade.replicantiGalaxyEM40.canBeApplied
      : EternityMilestone.replicantiNoReset.isReached;
    if (!keepResources) {
      player.dimensionBoosts = 0;
      softReset(0, true, true);
    }
  }
}

export function RGCost(start, bought, max) {
  const scale = new Decimal(1 + 1 / (max + 1));
  return start.times(scale.pow((bought) * (bought - 1) / 2))
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
  player.replicanti.timer = 0;
  Replicanti.amount = Achievement(126).isUnlocked && !Pelle.isDoomed
    ? Replicanti.amount.minus(bulk.purchasePrice)
    : DC.D0;
  addReplicantiGalaxies(galaxyGain);
}

// Only called on manual RG requests
export function replicantiGalaxyRequest() {
  if (!Replicanti.galaxies.canBuyMore) return;
  if (RealityUpgrade(6).isLockingMechanics) RealityUpgrade(6).tryShowWarningModal();
  else if (player.options.confirmations.replicantiGalaxy) Modal.replicantiGalaxy.show();
  else replicantiGalaxy(false);
}

// Produces replicanti quickly below e308, will auto-bulk-RG if production is fast enough
// Returns the remaining unused gain factor
function fastReplicantiBelow308(log10GainFactor, isAutobuyerActive) {
  const shouldBuyRG = isAutobuyerActive && !RealityUpgrade(6).isLockingMechanics;
  // More than e308 galaxies per tick causes the game to die, and I don't think it's worth the performance hit of
  // Decimalifying the entire calculation.  And yes, this can and does actually happen super-lategame.
  const uncappedAmount = DC.E1.pow(log10GainFactor.plus(Replicanti.amount.log10()));
  // Checking for uncapped equaling zero is because Decimal.pow returns zero for overflow for some reason
  if (log10GainFactor.gt(Number.MAX_VALUE) || uncappedAmount.eq(0)) {
    if (shouldBuyRG) {
      addReplicantiGalaxies(Replicanti.galaxies.max - player.replicanti.galaxies);
    }
    Replicanti.amount = replicantiCap();
    // Basically we've used nothing.
    return log10GainFactor;
  }

  if (!shouldBuyRG) {
    const remainingGain = log10GainFactor.minus(replicantiCap().log10() - Replicanti.amount.log10()).clampMin(0);
    Replicanti.amount = Decimal.min(uncappedAmount, replicantiCap());
    return remainingGain;
  }

  const gainNeededPerRG = Decimal.NUMBER_MAX_VALUE.log10();
  const replicantiExponent = log10GainFactor.toNumber() + Replicanti.amount.log10();
  const toBuy = Math.floor(Math.min(replicantiExponent / gainNeededPerRG,
    Replicanti.galaxies.max - player.replicanti.galaxies));
  const maxUsedGain = gainNeededPerRG * toBuy + replicantiCap().log10() - Replicanti.amount.log10();
  const remainingGain = log10GainFactor.minus(maxUsedGain).clampMin(0);
  Replicanti.amount = Decimal.pow10(replicantiExponent - gainNeededPerRG * toBuy)
    .clampMax(replicantiCap());
  addReplicantiGalaxies(toBuy);
  return remainingGain;
}

export function getIntervalBoost(x) {
  return DC.D1_1.pow(x).times(x * x / 4 + x / 2 + 1);
}

// When the amount is exactly the cap, there are two cases: the player can go
// over cap (in which case interval should be as if over cap) or the player
// has just crunched and is still at cap due to "Is this safe?" reward
// (in which case interval should be as if not over cap). This is why we have
// the overCapOverride parameter, to tell us which case we are in.
export function getReplicantiInterval(Interval) {
  let interval = getIntervalBoost(Interval).times(totalReplicantiSpeedMult());

  if ((TimeStudy(133).isBought && !Achievement(138).isUnlocked)) {
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

  const preCelestialEffects = Effects.product(
    TimeStudy(62),
    TimeStudy(213),
    RealityUpgrade(2),
    RealityUpgrade(6),
    RealityUpgrade(23),
  );
  totalMult = totalMult.times(preCelestialEffects);
  if (TimeStudy(132).isBought) {
    totalMult = totalMult.times(Perk.studyPassive.isBought ? 3 : 1.5);
  }

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

export function replicantiCap() {
  return EffarigUnlock.infinity.canBeApplied
    ? Currency.infinitiesTotal.value
      .pow(TimeStudy(31).isBought ? 120 : 30)
      .clampMin(1)
      .times(Decimal.NUMBER_MAX_VALUE)
    : Decimal.NUMBER_MAX_VALUE;
}

// eslint-disable-next-line complexity
export function replicantiLoop(diff) {
  if (!player.replicanti.unl) return;
  PerformanceStats.start("Replicanti");
  EventHub.dispatch(GAME_EVENT.REPLICANTI_TICK_BEFORE);
  const areRGsBeingBought = Replicanti.galaxies.areBeingBought;
 
  Replicanti.amount = Replicanti.amount.plus(getReplicantiInterval(player.replicanti.interval).times(diff / 1000));

  if (areRGsBeingBought) {
    const buyer = Autobuyer.replicantiGalaxy;
    const isAuto = buyer.canTick && buyer.isEnabled;
    // There might be a manual and auto tick simultaneously; pass auto === true iff the autobuyer is ticking and
    // we aren't attempting to manually buy RG, because this controls modals appearing or not
    replicantiGalaxy(isAuto && !Replicanti.galaxies.isPlayerHoldingR);
  }
  player.records.thisReality.maxReplicanti = player.records.thisReality.maxReplicanti
    .clampMin(Replicanti.amount);
  EventHub.dispatch(GAME_EVENT.REPLICANTI_TICK_AFTER);
  PerformanceStats.end();
}

export function replicantiMult() {
  return Replicanti.amount.div(100).plus(1).pow(Replicanti.chance / 10 + 2)
    .plusEffectOf(TimeStudy(21))
    .timesEffectOf(TimeStudy(102))
    .pow(getAdjustedGlyphEffect("replicationpow"));
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

  get cap() { return undefined; }
  get isCapped() { return false; }

  /** @abstract */
  get autobuyerMilestone() { throw new NotImplementedError(); }

  get canBeBought() {
    return !this.isCapped && Currency.infinityPoints.gte(this.cost) && player.eterc8repl !== 0;
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

    get cap() {
      // Chance never goes over 100%.
      return 9999999999999999999999999999999999999999999999999999999999999;
    }

    get isCapped() {
      return this.nearestPercent(this.value) >= this.cap;
    }

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

    // Rounding errors suck
    nearestPercent(x) {
      return Math.round(100 * x) / 100;
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

    get cap() {
      return -1;
    }

    get isCapped() {
      return this.value <= this.cap;
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
      const logBase = 270;
      const logBaseIncrease = 10;
      const logCostScaling = 5;
      let logCost = logBase + count * logBaseIncrease + (count * (count - 1) / 2) * logCostScaling;
      return Decimal.pow10(logCost);
    }

    get autobuyerMilestone() {
      return EternityMilestone.autobuyerReplicantiInterval;
    }

    applyModifiers(value) {
      return getReplicantiInterval(undefined, value);
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

    get distantRGStart() {
      return 9999999999999999999999999999999999999999999999999999999999999;
    }

    get remoteRGStart() {
      return 9999999999999999999999999999999999999999999999999999999999999;
    }

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

    get extra() {
      return Effects.max(0, TimeStudy(131)) + PelleRifts.decay.milestones[2].effectOrDefault(0);
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
    const unlocked = force ? false : EternityMilestone.unlockReplicanti.isReached;
    player.replicanti = {
      unl: unlocked,
      amount: DC.D0,
      timer: 0,
      chance: 0,
      chanceCost: DC.E230,
      interval: 0,
      intervalCost: DC.E270,
      boughtGalaxyCap: 0,
      galaxies: 0,
      galCost: DC.E570,
      galaxyCost: DC.E5,
    };
  },
  unlock(freeUnlock = false) {
    const cost = DC.E210.dividedByEffectOf(PelleRifts.vacuum.milestones[1]);
    if (player.replicanti.unl) return;
    if (freeUnlock || Currency.infinityPoints.gte(cost)) {
      if (!freeUnlock) Currency.infinityPoints.subtract(cost);
      player.replicanti.unl = true;
      player.replicanti.timer = 0;
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
  galaxies: {
    isPlayerHoldingR: false,
    get bought() {
      return player.replicanti.galaxies;
    },
    get extra() {
      return Math.floor((Effects.sum(
        TimeStudy(225),
        TimeStudy(226)
      ) + Effarig.bonusRG) * TimeStudy(303).effectOrDefault(1));
    },
    get total() {
      return this.bought + this.extra;
    },
    get max() {
      return ReplicantiUpgrade.galaxies.value + ReplicantiUpgrade.galaxies.extra;
    },
    get startingCost() {
      return DC.E5
    },
    get currentCost() {
      return RGCost(this.startingCost, this.bought, this.max);
    },
    get canBuyMore() {
      return Replicanti.amount.gte(this.currentCost);
    },
    get areBeingBought() {
      const buyer = Autobuyer.replicantiGalaxy;
      // If the confirmation is enabled, we presume the player wants to confirm each Replicanti Galaxy purchase
      return (buyer.canTick && buyer.isEnabled) ||
        (!player.options.confirmations.replicantiGalaxy && this.isPlayerHoldingR);
    },
    get bulk() {
      if (!this.canBuyMore) return;
      if (!Autobuyer.replicantiGalaxy.isUnlocked) return { quantity: 1, purchasePrice: this.currentCost };
      return bulkBuyBinarySearch(Replicanti.amount, {
        costFunction: x => RGCost(this.startingCost, x, this.max),
        firstCost: this.currentCost,
        cumulative: true,
      }, this.bought);
    },
  },
  get isUncapped() {
    return true;
  }
};
