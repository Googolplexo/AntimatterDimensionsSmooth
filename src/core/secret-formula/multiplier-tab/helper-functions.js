import { DC } from "../../constants";

export const MultiplierTabHelper = {
  // Helper method for counting enabled dimensions
  activeDimCount(type) {
    switch (type) {
      case "AD":
        // Technically not 100% correct, but within EC7 any AD8 production is going to be irrelevant compared to AD7
        // and making the UI behave as if it's inactive produces a better look overall
        return Math.clamp(AntimatterDimensions.all.filter(ad => ad.isProducing).length,
          1, EternityChallenge(7).isRunning ? 7 : 8);
      case "ID":
        return InfinityDimensions.all.filter(id => id.isProducing).length;
      case "TD":
        return TimeDimensions.all.filter(td => td.isProducing).length;
      default:
        throw new Error("Unrecognized Dimension type in Multiplier tab GameDB entry");
    }
  },

  // Helper method for galaxy strength multipliers affecting all galaxy types (this is used a large number of times)
  globalGalaxyMult() {
    return Effects.product(
      TimeStudy(212),
      TimeStudy(232),
      Achievement(178),
      PelleUpgrade.galaxyPower,
      PelleRifts.decay.milestones[1]
    ) * Pelle.specialGlyphEffect.power;
  },

  // Helper method to check for whether an achievement affects a particular dimension or not. Format of dimStr is
  // expected to be a three-character string "XXN", eg. "AD3" or "TD2"
  achievementDimCheck(ach, dimStr) {
    switch (ach) {
      case 23:
        return dimStr === "AD8";
      case 28:
      case 31:
      case 68:
      case 71:
        return dimStr === "AD1";
      case 94:
        return dimStr === "ID1";
      case 34:
        return dimStr.substr(0, 2) === "AD" && Number(dimStr.charAt(2)) !== 8;
      case 64:
        return dimStr.substr(0, 2) === "AD" && Number(dimStr.charAt(2)) <= 4;
      default:
        return true;
    }
  },

  // Helper method to check for whether a time study affects a particular dimension or not, see achievementDimCheck()
  timeStudyDimCheck(ts, dimStr) {
    switch (ts) {
      case 11:
        return dimStr === "TD1";;
      case 72:
        return dimStr === "ID4";
      case 73:
        return dimStr === "TD3";
      case 214:
        return dimStr === "AD8";
      case 227:
        return dimStr === "TD4";
      case 234:
        return dimStr === "AD1";
      default:
        return true;
    }
  },

  // Helper method to check for whether an IC reward affects a particular dimension or not, see achievementDimCheck()
  ICDimCheck(ic, dimStr) {
    switch (ic) {
      case 1:
      case 6:
        return dimStr.substr(0, 2) === "ID";
      case 3:
      case 4:
        return dimStr.substr(0, 2) === "AD";
      case 8:
        return dimStr.substr(0, 2) === "AD" && Number(dimStr.charAt(2)) > 1 && Number(dimStr.charAt(2)) < 8;
      default:
        return false;
    }
  },

  // Helper method to check for whether an EC reward affects a particular dimension or not, see achievementDimCheck()
  ECDimCheck(ec, dimStr) {
    switch (ec) {
      case 1:
      case 10:
        return dimStr.substr(0, 2) === "TD";
      case 2:
        return dimStr === "ID1";
      case 4:
      case 9:
        return dimStr.substr(0, 2) === "ID";
      case 7:
        return dimStr === "ID8";
      default:
        return false;
    }
  },

  blackHoleSpeeds() {
    const currBH = BlackHoles.list
      .filter(bh => bh.isUnlocked)
      .map(bh => (bh.isActive ? bh.power : 1))
      .reduce((x, y) => x * y, 1);

    // Calculate an average black hole speedup factor
    const bh1 = BlackHole(1);
    const bh2 = BlackHole(2);
    const avgBH = 1 + (bh1.isUnlocked ? bh1.dutyCycle * (bh1.power - 1) : 0) +
        (bh2.isUnlocked ? bh1.dutyCycle * bh2.dutyCycle * bh1.power * (bh2.power - 1) : 0);

    return {
      current: currBH,
      average: avgBH
    };
  },

  pluralizeDimensions(dims) {
    return dims === 1 ? "Dimension\xa0" : "Dimensions";
  },

  // All of the following NC12-related functions are to make the parsing within the GameDB entry easier in terms of
  // which set of Dimensions are actually producing within NC12 - in nearly every case, one of the odd/even sets will
  // produce significantly more than the other, so we simply assume the larger one is active and the other isn't
  evenDimNC12Production() {
    const nc12Pow = tier => ([2, 4, 6].includes(tier) ? 0.1 * (8 - tier) : 0);
    const maxTier = Math.clampMin(2 * Math.floor(MultiplierTabHelper.activeDimCount("AD") / 2), 2);
    return AntimatterDimensions.all
      .filter(ad => ad.isProducing && ad.tier % 2 === 0)
      .map(ad => ad.multiplier.times(ad.amount.pow(nc12Pow(ad.tier))))
      .reduce((x, y) => x.times(y), DC.D1)
      .times(AntimatterDimension(maxTier).totalAmount);
  },

  oddDimNC12Production() {
    const maxTier = Math.clampMin(2 * Math.floor(MultiplierTabHelper.activeDimCount("AD") / 2 - 0.5) + 1, 1);
    return AntimatterDimensions.all
      .filter(ad => ad.isProducing && ad.tier % 2 === 1)
      .map(ad => ad.multiplier)
      .reduce((x, y) => x.times(y), DC.D1)
      .times(AntimatterDimension(maxTier).totalAmount);
  },

  actualNC12Production() {
    return Decimal.max(this.evenDimNC12Production(), this.oddDimNC12Production());
  },

  multInNC12(dim) {
    const nc12Pow = tier => ([2, 4, 6].includes(tier) ? 0.1 * (8 - tier) : 0);
    const ad = AntimatterDimension(dim);
    return ad.isProducing ? ad.multiplier.times(ad.totalAmount.pow(nc12Pow(dim))) : DC.D1;
  },

  isNC12ProducingEven() {
    return this.evenDimNC12Production().gt(this.oddDimNC12Production());
  }
};
