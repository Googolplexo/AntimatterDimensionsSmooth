import { TimeStudy } from "./normal-time-study";
import { TimeStudyState } from "./time-studies";

export class DilationTimeStudyState extends TimeStudyState {
  constructor(config) {
    super(config, TIME_STUDY_TYPE.DILATION);
  }

  get isBought() {
    return player.dilation.studies.includes(this.id);
  }

  get canBeBought() {
    return this.isAffordable && this.config.requirement();
  }

  get description() {
    return this.config.description;
  }

  get cost() {
    return typeof this.config.cost === "function" ? this.config.cost() : this.config.cost;
  }

  get totalTimeTheoremRequirement() {
    switch (this.id) {
      case 0:
        return 13700;
      case 1:
        return 120;
      default:
        return 0;
    }
  }

  purchase(quiet = false) {
    if (this.isBought || !this.canBeBought) return false;
    if (this.id === 0) {
      // ID 1 is the dilation unlock study
      if (!quiet) {
        Tab.eternity.dilation.show();
      }
      if (Perk.autounlockDilation1.canBeApplied) {
        for (const id of [4, 5, 6]) player.dilation.upgrades.add(id);
      }
      if (Perk.autounlockDilation2.canBeApplied) {
        for (const id of [7, 8, 9]) player.dilation.upgrades.add(id);
      }
      if (!Pelle.isDoomed) Currency.tachyonParticles.bumpTo(Perk.startTP.effectOrDefault(0));
      if (Ra.unlocks.unlockDilationStartingTP.canBeApplied && !isInCelestialReality() && !Pelle.isDoomed) {
        Currency.tachyonParticles.bumpTo(getTP(Ra.unlocks.unlockDilationStartingTP.effectOrDefault(0), false));
      }
      TabNotification.dilationAfterUnlock.tryTrigger();
    }
    if (this.id === 6) {
      // ID 6 is the reality unlock study
      if (!PlayerProgress.realityUnlocked()) {
        Modal.message.show(`You have reached the point of Antimatter Dimensions: Smooth that is temporarily considered
          the end. Balancing of the Reality prestige layer is being worked on. Please note that the developer does not take
          responsibility for any harm that playing with Reality mechanics may cause. The option to perform a Reality reset has been
          left for those who want to explore it, but if you choose to do so, as well as if you edit the game state through console,
          your save may be permanently damaged. It is guaranteed that you will be able to gain at least 1 Reality Machine immediately
          in the next update.`, {}, 3);
        EventHub.dispatch(GAME_EVENT.REALITY_FIRST_UNLOCKED);
      }
      if (!Perk.autounlockReality.isBought) Tab.reality.glyphs.show();
    }

    player.dilation.studies.push(this.id);
    Currency.timeTheorems.subtract(this.cost);
    return true;
  }
}

DilationTimeStudyState.studies = mapGameData(
  GameDatabase.eternity.timeStudies.dilation,
  config => new DilationTimeStudyState(config)
);

/**
 * @type {DilationTimeStudyState}
 */
TimeStudy.dilation = DilationTimeStudyState.studies[0];

/**
 * @param {number} tier
 * @returns {DilationTimeStudyState}
 */
TimeStudy.timeDimension = function(tier) {
  return DilationTimeStudyState.studies[tier - 3];
};

/**
 * @type {DilationTimeStudyState}
 */
TimeStudy.reality = DilationTimeStudyState.studies[6];

TimeStudy.boughtDilationTS = function() {
  return player.dilation.studies.map(id => DilationTimeStudyState.studies[id]);
};
