import { Character, defaultStats, Weapon } from "~/src/types";

import ArtifactMainStatsData from "~src/Components/Artifacts/artifact_main_gen.json";
import { characterKeyToICharacter } from "~src/Components/Character";
import { weapons } from "~src/Components/Weapon";
import { ascLvlMax, StatToIndexMap } from "~src/util";
import {
  GOODArtifact,
  GOODArtifactSetKey,
  GOODCharacter,
  GOODCharacterKey,
  GOODStatKey,
  GOODWeapon,
  GOODWeaponKey,
  IGOOD,
} from "./GOODTypes";

export interface IGOODImport {
  err: string;
  characters: Character[];
}

type WeaponBank = {
  [char in GOODCharacterKey]?: Weapon;
};
//currently don't have inhouse artifact type
type GOODArtifactBank = {
  [char in GOODCharacterKey]?: GOODArtifact[];
};
type rarityValue = "1" | "2" | "3" | "4" | "5";
const convertRarity: rarityValue[] = ["1", "2", "3", "4", "5"];

export function parseFromGO(val: string): IGOODImport {
  let result: {
    err: string;
    characters: Character[];
  } = {
    err: "",
    characters: [],
  };

  if (val === "") {
    result.err = "Please paste JSON in GOOD format to continue";
    return result;
  }

  //try parsing
  let data: IGOOD;
  try {
    data = JSON.parse(val);
  } catch (e) {
    result.err = "Invalid JSON";
    return result;
  }
  if (!data.characters) {
    return {
      err: "No Characters Found",
      characters: [],
    };
  }
  if (!data.weapons) {
    return {
      err: "No Weapons Found",
      characters: [],
    };
  }
  // if (data.source !== "Genshin Optimizer") {
  //   result.err = "Only databases from Genshin Optimizer accepted";
  //   return result;
  // }

  let weaponBank: WeaponBank = {};
  let artifactBank: GOODArtifactBank = {};
  if (data.weapons) {
    weaponBank = extractWeapons(data.weapons);
  } else {
    result.err = "No weapons found";
  }

  //Store artifacts based on character
  if (data.artifacts) {
    artifactBank = extractArtifacts(data.artifacts);
  }

  //build the characters
  let chars: Character[] = buildCharactersFromGOOD(
    data.characters,
    weaponBank,
    artifactBank
  );

  result.characters = chars;
  return result;
}

const extractWeapons = (weapons: GOODWeapon[]): WeaponBank => {
  const result: WeaponBank = {};
  weapons.forEach((goodWeapon) => {
    let GOODCharKey = goodWeapon.location;
    if (GOODCharKey !== "") {
      result[GOODCharKey] = GOODWeapontoSrlWeapon(goodWeapon);
    }
  });
  return result;
};

const GOODWeapontoSrlWeapon = (weapon: GOODWeapon): Weapon => {
  return {
    name: GOODKeytoGCSIMKey(weapon.key),
    level: weapon.level,
    max_level: ascLvlMax(weapon.ascension),
    refine: weapon.refinement,
  };
};
const extractArtifacts = (artifacts: GOODArtifact[]): GOODArtifactBank => {
  const result: GOODArtifactBank = {};
  artifacts.forEach((goodArtifact) => {
    let GOODCharKey = goodArtifact.location;
    if (GOODCharKey === "") {
      return;
    } else {
      if (result[GOODCharKey] === undefined) {
        result[GOODCharKey] = [goodArtifact];
      } else {
        result[GOODCharKey]?.push(goodArtifact);
      }
    }
  });
  return result;
};

const sumArtifactStats = (artifacts: GOODArtifact[]): number[] => {
  const totalStats = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ].slice();

  artifacts.forEach((artifact) => {
    if (artifact.mainStatKey !== "" && artifact.mainStatKey !== "def") {
      const mainStatValue =
        ArtifactMainStatsData[convertRarity[artifact.rarity - 1]][
          artifact.mainStatKey
        ][artifact.level];
      const srlStat = goodStattoSrlStat(artifact.mainStatKey);
      if (srlStat === undefined) return;
      totalStats[StatToIndexMap[srlStat]] += mainStatValue;
    } else {
      console.log("pepegaW artifact");
      return;
    }

    artifact.substats.forEach((substat) => {
      const srlStat = goodStattoSrlStat(substat.key);
      if (srlStat === undefined) return;
      if (substat.key.includes("_")) {
        totalStats[StatToIndexMap[srlStat]] += substat.value / 100;
      } else {
        totalStats[StatToIndexMap[srlStat]] += substat.value;
      }
    });
  });
  return totalStats;
};

function goodStattoSrlStat(goodStat: GOODStatKey): string | undefined {
  switch (goodStat) {
    case "hp":
      return "HP";
    case "hp_":
      return "HPP";
    case "atk":
      return "ATK";
    case "atk_":
      return "ATKP";
    case "def":
      return "DEF";
    case "def_":
      return "DEFP";
    case "eleMas":
      return "EM";
    case "enerRech_":
      return "ER";
    case "heal_":
      return "Heal";
    case "critRate_":
      return "CR";
    case "critDMG_":
      return "CD";
    case "physical_dmg_":
      return "PhyP";
    case "anemo_dmg_":
      return "AnemoP";
    case "geo_dmg_":
      return "GeoP";
    case "electro_dmg_":
      return "ElectroP";
    case "hydro_dmg_":
      return "HydroP";
    case "pyro_dmg_":
      return "PyroP";
    case "cryo_dmg_":
      return "CryoP";
  }
}

const tallyArtifactSet = (
  artifacts: GOODArtifact[]
): { [key: string]: number } => {
  const setKeyTally: { [key: string]: number } = {};
  if (artifacts === undefined) {
    return {};
  }
  artifacts
    .map((artifact) => {
      return artifact.setKey.toLowerCase();
    })
    .map((setKey) => {
      if (Object.keys(setKeyTally).includes(setKey)) {
        setKeyTally[setKey] += 1;
      } else if (setKey != "") {
        setKeyTally[setKey] = 1;
      }
    }); // Tallies the set keys

  // Clamps artifact set value for better handling down the line #blamesrl
  Object.keys(setKeyTally).forEach((setKey) => {
    if (setKeyTally[setKey] < 2) {
      delete setKeyTally[setKey];
    } else if (setKeyTally[setKey] > 2 && setKeyTally[setKey] < 4) {
      setKeyTally[setKey] = 2;
    } else if (setKeyTally[setKey] > 4) {
      setKeyTally[setKey] = 4;
    }
  });
  return setKeyTally;
};

function buildCharactersFromGOOD(
  goodChars: GOODCharacter[],
  weaponBank: WeaponBank,
  goodArtifactBank: GOODArtifactBank
) {
  const result: Character[] = [];
  goodChars.forEach((goodChar) => {
    let char = GOODChartoSrlChar(goodChar, weaponBank[goodChar.key]);
    if (char === undefined) {
      //skip char
      return;
    }
    char = equipArtifacts(char, goodArtifactBank[goodChar.key]);

    result.push(char);
  });
  return result;
}

export function GOODChartoSrlChar(
  goodChar: GOODCharacter,
  weapon: Weapon | undefined
): Character | undefined {
  let today = new Date();
  //copy over all the attributes we care about; ignore anything
  //we don't need
  const name = GOODKeytoGCSIMKey(goodChar.key);
  const iChar = characterKeyToICharacter[name];
  if (iChar == undefined) {
    return undefined;
  }

  return {
    name: name,
    level: goodChar.level,
    max_level: ascLvlMax(goodChar.ascension),
    element: iChar.element,
    cons: goodChar.constellation,
    weapon: weapon ?? {
      name: "dullblade",
      refine: 1,
      level: 1,
      max_level: 20,
    },
    talents: {
      attack: goodChar.talent.auto,
      skill: goodChar.talent.skill,
      burst: goodChar.talent.burst,
    },
    //need to sum stats
    stats: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    snapshot: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    sets: {},
    date_added: today.toLocaleDateString(),
  };
}
function equipArtifacts(
  char: Character,
  charArtifacts: GOODArtifact[] | undefined
): Character {
  if (charArtifacts === undefined || charArtifacts.length === 0) {
    return char;
  } else {
    const sets = tallyArtifactSet(charArtifacts);
    const stats = sumArtifactStats(charArtifacts);
    return {
      ...char,
      stats,
      sets,
    };
  }
}

export function GOODKeytoGCSIMKey(
  goodKey: GOODArtifactSetKey | GOODCharacterKey | GOODWeaponKey
) {
  switch (goodKey) {
    case "KaedeharaKazuha":
      return "kazuha";
    case "KamisatoAyaka":
      return "ayaka";
    case "KamisatoAyato":
      return "ayato";
    case "KujouSara":
      return "sara";
    case "RaidenShogun":
      return "raiden";
    case "SangonomiyaKokomi":
      return "kokomi";
    case "YaeMiko":
      return "yaemiko";
    case "AratakiItto":
      return "itto";
  }

  const result = goodKey
    .toString()
    .replace(/[^0-9a-z]/gi, "")
    .toLowerCase();
  return result;
}
