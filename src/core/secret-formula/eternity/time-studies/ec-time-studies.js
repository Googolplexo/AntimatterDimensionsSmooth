import { DC } from "../../../constants";
import { replicantiMult } from "../../../replicanti";

export const ecTimeStudies = [
  {
    id: 1,
    cost: 20,
    requirement: [171],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Eternities",
      current: () => Currency.eternities.value,
      required: completions => new Decimal(20000 + Math.min(completions, Enslaved.isRunning ? 999 : 4) * 20000),
      formatValue: formatInt
    }
  },
  {
    id: 2,
    cost: 25,
    requirement: [171],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Tickspeed upgrades from Time Dimensions",
      current: () => player.totalTickGained,
      required: completions => 230 + Math.min(completions, 4) * 40,
      formatValue: formatInt
    }
  },
  {
    id: 3,
    cost: 30,
    requirement: [171],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "ID multiplier from Replicanti",
      current: replicantiMult,
      required: completions => DC.E200.times(DC.E50.pow(Math.min(completions, 4))),
      formatValue: value => formatX(value, 2, 2)
    }
  },
  {
    id: 4,
    cost: 55,
    requirement: [143],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Infinities",
      current: () => Currency.infinitiesTotal.value,
      required: completions => new Decimal(4e10 + Math.min(completions, 4) * 1.5e10),
      formatValue: value => format(value, 2)
    }
  },
  {
    id: 5,
    cost: 120,
    requirement: [42],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "total Galaxies",
      current: () => totalGalaxies(),
      required: completions => 900 + Math.min(completions, 4) * 400,
      formatValue: formatInt
    }
  },
  {
    id: 6,
    cost: 105,
    requirement: [121],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Replicanti Galaxies",
      current: () => player.replicanti.galaxies,
      required: completions => 45 + Math.min(completions, 4) * 5,
      formatValue: formatInt
    }
  },
  {
    id: 7,
    cost: 135,
    requirement: [111],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "antimatter",
      current: () => Currency.antimatter.value,
      required: completions => DC.E8E6.pow(Math.min(completions, 4)).times(DC.E9E6),
      formatValue: value => format(value)
    }
  },
  {
    id: 8,
    cost: 200,
    requirement: [123],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Infinity Points",
      current: () => Currency.infinityPoints.value,
      required: completions => DC.E30000.pow(Math.min(completions, 4)).times(DC.E70000),
      formatValue: value => format(value)
    }
  },
  {
    id: 9,
    cost: 365,
    requirement: [141, 142, 143],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Infinity Power",
      current: () => Currency.infinityPower.value,
      required: completions => DC.E3500.pow(Math.min(completions, 4)).times(DC.E26000),
      formatValue: value => format(value)
    }
  },
  {
    id: 10,
    cost: 550,
    requirement: [181],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      resource: "Eternity Points",
      current: () => Currency.eternityPoints.value,
      required: completions => DC.E20.pow(Math.min(completions, 4)).times(DC.E100),
      formatValue: value => format(value, 2)
    }
  },
  {
    id: 11,
    cost: 1,
    requirement: [231, 232],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      path: "Antimatter Dimension",
      forbiddenStudies: [72, 73],
    }
  },
  {
    id: 12,
    cost: 1,
    requirement: [233, 234],
    reqType: TS_REQUIREMENT_TYPE.AT_LEAST_ONE,
    secondary: {
      path: "Time Dimension",
      forbiddenStudies: [71, 72],
    }
  }
];
