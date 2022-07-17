import Avatars from "./GenshinData/AvatarExcelConfigData.json";
import Weapons from "./GenshinData/WeaponExcelConfigData.json";
import EqAffix from "./GenshinData/EquipAffixExcelConfigData.json";
import Rel from "./GenshinData/ReliquaryExcelConfigData.json";

//THESE 2 ARE THE SAME IDK WHY
import RelSet from "./GenshinData/ReliquarySetExcelConfigData.json";
import RelMP from "./GenshinData/ReliquaryMainPropExcelConfigData.json";

import RelAffix from "./GenshinData/ReliquaryAffixExcelConfigData.json";
import ManualText from "./GenshinData/ManualTextMapConfigData.json";
import TextMap from "./GenshinData/EnkaTextMapEN.json";

// : { [key: string]: number }
ManualTextMap = {};
ManualText.forEach((text) => {
  ManualTextMap[text.textMapId] = text.textMapContentTextMapHash;
});

const G = {
  Items: {},
  EqAffix: {},
  RelSet: {},
  RelMP: {},
  RelAffix: {},
  Avatars: {},
};

Avatars.forEach((avatar) => {
  let a = (G.Avatars[avatar.id] = {});
  if (avatar.nameTextMapHash) {
    a.Name = TextMap.en[avatar.nameTextMapHash.toString()];
  }
});
Weapons.forEach((b) => {
  let a = (G.Items[b.id] = {});
  if (b.nameTextMapHash) {
    a.Name = TextMap[b.nameTextMapHash];
  }
  if (b.icon) a.Icon = b.icon;
  if (b.itemType) a.ItemType = b.itemType;
  if (b.weaponType) a.WeaponType = b.weaponType;
  if (b.skillAffix) a.SkillAffix = b.skillAffix;
});
Rel.forEach((b) => {
  let a = (G.Items[b.id] = {});
  if (b.nameTextMapHash) {
    a.Name = TextMap[b.nameTextMapHash];
  }
  if (b.icon) a.Icon = b.icon;
  if (b.itemType) a.ItemType = b.itemType;
  if (b.equipType) a.EquipType = b.equipType;
  if (b.maxLevel) a.MaxLevel = b.maxLevel;
  if (b.setId) a.SetId = b.setId;
});
EqAffix.forEach((b) => {
  let a = (G.EqAffix[b.id] = {});
  if (b.nameTextMapHash) {
    a.Name = TextMap[b.nameTextMapHash];
  }
  if (b.paramList) a.ParamList = b.paramList;
  if (b.affixId) a.AffixId = b.affixId;
});
RelSet.forEach((b) => {
  let a = (G.RelSet[b.setId] = {});
  if (b.EquipAffixId) a.EquipAffixId = b.EquipAffixId;
});
RelMP.forEach((b) => {
  let a = (G.RelMP[b.id] = {});
  if (b.propType) {
    a.Name = TextMap[ManualTextMap[b.propType]];
    a.PropType = b.propType;
  }
});
RelAffix.forEach((b) => {
  let a = (G.RelAffix[b.id] = {});
  if (b.depotId) a.DepotId = b.depotId;
  if (b.propType) {
    a.Name = TextMap[ManualTextMap[b.propType]];
    a.PropType = b.propType;
  }
  if (b.propValue) a.PropValue = b.propValue;
});

export default function EnkaToGOOD(avatarInfoList) {
  const GOOD = {
    format: "GOOD",
    version: 1,
    source: "gcsimFromEnka",
  };

  GOOD.characters = avatarInfoList.map((avatar) => {
    let reference = G.Avatars[avatar.avatarId];
    if (!reference) {
      avatar.NOTFOUND = true;
      return;
    }
    avatar.Name = reference.Name;
    let character = {};
    character.key = FRZ.goodize(avatar.Name);
    character.level = parseInt(avatar.propMap["4001"].val);
    character.ascension = parseInt(avatar.propMap["1002"].val);
    character.constellation = avatar.talentIdList?.length || 0;
    character.talent = {};
    //Characters with 7 talents like AYAKA might be bugged (kokomi is fine?)//
    // characters with unodered talents like traveler(i htink) will not work
    character.talent["auto"] = Object.entries(avatar.skillLevelMap)[0][1];
    character.talent["skill"] = Object.entries(avatar.skillLevelMap)[1][1];
    character.talent["burst"] = Object.entries(avatar.skillLevelMap)[2][1];
    return character;
  });

  GOOD.artifacts = avatarInfoList.map((avatar) => {
    return avatar["equipList"]
      .map((item) => {
        let reference = G.Items[item.itemId];
        if (item.weapon) {
          console.log("weapon");
          return;
        } else if (!reference) {
          return;
        }
        let artifact = {
          setKey: FRZ.goodize(TextMap.en[item.flat.setNameTextMapHash]),
          slotKey: FRZ.rels[item.flat.equipType],
          level: item.reliquary.level - 1,
          rarity: item.flat.rankLevel,
          mainStatKey: FRZ.stats[G.RelMP[item.reliquary.mainPropId].PropType],
          location: FRZ.goodize(G.Avatars[avatar.avatarId].Name),
        };

        let substats = new Map();
        item.reliquary.appendPropIdList.forEach((prop) => {
          let key = FRZ.stats[G.RelAffix[prop].PropType];
          if (substats.has(key))
            substats.set(key, substats.get(key) + G.RelAffix[prop].PropValue);
          else substats.set(key, G.RelAffix[prop].PropValue);
        });
        artifact.substats = Array.from(substats, ([key, value]) => {
          if (key[key.length - 1] == "_")
            value =
              Math.round((value * 100 + Number.EPSILON + 0.0001) * 10) / 10;
          else value = +Math.round(value).toFixed(1);

          return { key: key, value: value };
        });
        return artifact;
      })
      .filter((x) => x != undefined);
  });

  GOOD.weapons = avatarInfoList.map((avatar) => {
    return avatar["equipList"]
      .map((item) => {
        if (item.reliquary) {
          return;
        }
        let reference = G.Items[item.itemId];
        if (!reference) {
          console.log("not found");
          return;
        }
        let weapon = {};

        weapon.key = FRZ.goodize(
          TextMap.en[item.flat.nameTextMapHash].toString()
        );
        weapon.level = item.weapon.level;
        weapon.ascension = item.weapon.promoteLevel;
        weapon.refinement =
          (Object.entries(item.weapon.affixMap)[0] != null
            ? Object.entries(item.weapon.affixMap)[0][1]
            : 0) + 1;
        weapon.location = G.Avatars[avatar.avatarId].Name;
        weapon.lock = false;
        return weapon;
      })
      .filter((x) => x != undefined);
  });

  return GOOD;
}

const FRZ = {
  goodize: (string) => {
    function toTitleCase(str) {
      return str.replace(/-/g, " ").replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
    return toTitleCase(string || "").replace(/[^A-Za-z]/g, "");
  },
  rels: {
    EQUIP_BRACER: "flower",
    EQUIP_NECKLACE: "plume",
    EQUIP_SHOES: "sands",
    EQUIP_RING: "goblet",
    EQUIP_DRESS: "circlet",
  },
  stats: {
    FIGHT_PROP_HP: "hp",
    FIGHT_PROP_HP_PERCENT: "hp_",
    FIGHT_PROP_ATTACK: "atk",
    FIGHT_PROP_ATTACK_PERCENT: "atk_",
    FIGHT_PROP_DEFENSE: "def",
    FIGHT_PROP_DEFENSE_PERCENT: "def_",
    FIGHT_PROP_CHARGE_EFFICIENCY: "enerRech_",
    FIGHT_PROP_ELEMENT_MASTERY: "eleMas",
    FIGHT_PROP_CRITICAL: "critRate_",
    FIGHT_PROP_CRITICAL_HURT: "critDMG_",
    FIGHT_PROP_HEAL_ADD: "heal_",
    FIGHT_PROP_FIRE_ADD_HURT: "pyro_dmg_",
    FIGHT_PROP_ELEC_ADD_HURT: "electro_dmg_",
    FIGHT_PROP_ICE_ADD_HURT: "cryo_dmg_",
    FIGHT_PROP_WATER_ADD_HURT: "hydro_dmg_",
    FIGHT_PROP_WIND_ADD_HURT: "anemo_dmg_",
    FIGHT_PROP_ROCK_ADD_HURT: "geo_dmg_",
    FIGHT_PROP_GRASS_ADD_HURT: "dendro_dmg_",
    FIGHT_PROP_PHYSICAL_ADD_HURT: "physical_dmg_",
  },
  rarities: { 1: 1, 5: 2, 13: 3, 17: 4, 21: 5 },
};

//Why the fuck is this called G
// interface G {
//     Items: any;
//     EqAffix: any;
//     RelSet: any;
//     RelMP: any;
//     RelAffix: any;
//     Avatars: {[key: number]: EnkaAvatar}
// }

// type EnkaAvatar = {
//         Name?: string
// };
