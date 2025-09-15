import { DC } from "./constants";

export class Sacrifice {
  // This is tied to the "buying an 8th dimension" achievement in order to hide it from new players before they reach
  // sacrifice for the first time.
  static get isVisible() {
    return Achievement(18).isUnlocked || PlayerProgress.realityUnlocked();
  }

  static get canSacrifice() {
    return DimBoost.purchasedBoosts > 4 && !EternityChallenge(3).isRunning && this.nextBoost.gt(1.01) &&
      AntimatterDimension(8).totalAmount.gt(0) && (Currency.antimatter.lt(Player.infinityLimit) || Achievement(118).isUnlocked) &&
      !Enslaved.isRunning;
  }

  static get disabledCondition() {
    if (NormalChallenge(10).isRunning) return "8th Dimensions are disabled";
    if (EternityChallenge(3).isRunning) return "Eternity Challenge 3";
    if (DimBoost.purchasedBoosts < 5) return `Requires ${formatInt(5)} Dimension Boosts`;
    if (AntimatterDimension(8).totalAmount.eq(0)) return "No 8th Antimatter Dimensions";
    if (this.nextBoost.lte(1.01)) return `${formatX(1)} multiplier`;
    if (Player.isInAntimatterChallenge) return "Challenge goal reached";
    return "Need to Crunch";
  }

  // The code path for calculating the sacrifice exponent is pretty convoluted, but needs to be structured this way
  // in order to mostly replicate old pre-Reality behavior. There are two key things to note in how sacrifice behaves
  // which are not immediately apparent here; IC2 changes the formula by getting rid of a log10 (and therefore makes
  // sacrifice significantly stronger despite the much smaller exponent) and pre-Reality behavior assumed that the
  // player would already have ach32/57 by the time they complete IC2. As Reality resets achievements, we had to
  // assume that all things boosting sacrifice can be gotten independently, which resulted in some odd effect stacking.
  static get sacrificeExponent() {
    return Effects.product(
      Achievement(32),
      Achievement(57),
      Achievement(88),
      InfinityChallenge(2).reward,
      TimeStudy(228),
      TimeStudy(304)) * (11 - Player.dimensionMultDecrease) * 2;
  }

  static get nextBoost() {
    const nd1Amount = AntimatterDimension(1).amount;
    if (nd1Amount.eq(0)) return DC.D1;
    const sacrificed = player.sacrificed.plus(DC.E10);
    let prePowerSacrificeMult = new Decimal((nd1Amount.plus(sacrificed).log10() / 10) / Math.max(sacrificed.log10() / 10, 1));

    return prePowerSacrificeMult.clampMin(1).pow(this.sacrificeExponent);
  }

  static get totalBoost() {
    if (player.sacrificed.eq(0)) return DC.D1;

    let prePowerBoost = new Decimal(player.sacrificed.plus(DC.E10).log10() / 10);

    return prePowerBoost.pow(this.sacrificeExponent);
  }
}

export function sacrificeReset() {
  if (!Sacrifice.canSacrifice) return false;
  if ((!player.break || (!InfinityChallenge.isRunning && NormalChallenge.isRunning)) &&
    Currency.antimatter.gt(Decimal.NUMBER_MAX_VALUE)) return false;
  if (
    NormalChallenge(8).isRunning &&
    (Sacrifice.totalBoost.gte(Decimal.NUMBER_MAX_VALUE))
  ) {
    return false;
  }
  EventHub.dispatch(GAME_EVENT.SACRIFICE_RESET_BEFORE);
  const nextBoost = Sacrifice.nextBoost;
  player.chall8TotalSacrifice = player.chall8TotalSacrifice.times(nextBoost);
  player.sacrificed = player.sacrificed.plus(AntimatterDimension(1).amount);
  const isAch118Unlocked = Achievement(118).canBeApplied;
  if (!isAch118Unlocked) {
    AntimatterDimensions.resetAmountUpToTier(NormalChallenge(12).isRunning ? 6 : 7);
  }
  player.requirementChecks.infinity.noSacrifice = false;
  EventHub.dispatch(GAME_EVENT.SACRIFICE_RESET_AFTER);
  return true;
}

export function sacrificeBtnClick() {
  if (!Sacrifice.isVisible || !Sacrifice.canSacrifice) return;
  if (player.options.confirmations.sacrifice) {
    Modal.sacrifice.show();
  } else {
    sacrificeReset();
  }
}
