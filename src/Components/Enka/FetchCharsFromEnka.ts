import EnkaToGOOD from "./foreignConverter";

interface EnkaResponse {
    playerInfo: any
    avatarInfoList: any[]
}

export default async function FetchandValidateDataFromEnka(validUid: string) {
  const enkaResponse = await fetch(
    `https://enka.gcsim.workers.dev/${validUid}`
  );
  if (!enkaResponse.ok) {
    throw new Error(`Failed to fetch ${validUid}`);
  }


  const enkaData = await enkaResponse.json();
  console.log(EnkaToGOOD(enkaData.avatarInfoList))
  return enkaData;
}

// function EnkaCharToSrlChar(enkaChar :EnkaCharacter) :Character{
//   return {
//     name: EnkaNameToSrlName(),
//     level:
//   }
// }

function EnkaNameToSrlName(): string {
  throw new Error("Function not implemented.");
}

// https://github.com/EnkaNetwork/API-docs/blob/master/api.md
interface EnkaData {
  playerInfo: object;
  avatarInfoList: EnkaCharacter[];
}

interface EnkaCharacter {
  //Name
  avatarId: number;

  //Constellation id
  talentIdList?: number[];

  //There are other objects in this field, but I don't know what they are for.
  //Denoting the useful ones here for now.
  propMap: {
    //Ascension
    1002: {
      type: 1002;
      ival: string;
      val: string;
    };
    //Level
    4001: {
      type: 4001;
      ival: string;
      val: string;
    };
  };

  //Total Stat Obj, can't use it as it combines base and artifact stats #blamesrl
//   fightPropMap: any;

  //???
  skillDepotId: number;

  //Talents unlocked
  inherentProudSkillList: number[];

  //Talent Levels
  skillLevelMap: {
    [key: number]: number;
  };

  //TODO: Figure out what this is
  equipList: [
    {
      itemId: 93544;
      reliquary: {
        level: 21;
        mainPropId: 14001;
        appendPropIdList: [
          501223,
          501201,
          501061,
          501231,
          501062,
          501201,
          501204,
          501204,
          501202
        ];
      };
      flat: {
        nameTextMapHash: "2293242820";
        setNameTextMapHash: "4144069251";
        rankLevel: 5;
        reliquaryMainstat: {
          mainPropId: "FIGHT_PROP_HP";
          statValue: 4780;
        };
        reliquarySubstats: [
          {
            appendPropId: "FIGHT_PROP_CRITICAL_HURT";
            statValue: 7;
          },
          {
            appendPropId: "FIGHT_PROP_CRITICAL";
            statValue: 16.3;
          },
          {
            appendPropId: "FIGHT_PROP_ATTACK_PERCENT";
            statValue: 8.7;
          },
          {
            appendPropId: "FIGHT_PROP_CHARGE_EFFICIENCY";
            statValue: 4.5;
          }
        ];
        itemType: "ITEM_RELIQUARY";
        icon: "UI_RelicIcon_15019_4";
        equipType: "EQUIP_BRACER";
      };
    },
    {
      itemId: 71524;
      reliquary: {
        level: 21;
        mainPropId: 12001;
        appendPropIdList: [
          501201,
          501224,
          501061,
          501084,
          501201,
          501202,
          501202,
          501063,
          501082
        ];
      };
      flat: {
        nameTextMapHash: "2098993868";
        setNameTextMapHash: "933076627";
        rankLevel: 5;
        reliquaryMainstat: {
          mainPropId: "FIGHT_PROP_ATTACK";
          statValue: 311;
        };
        reliquarySubstats: [
          {
            appendPropId: "FIGHT_PROP_CRITICAL";
            statValue: 11.7;
          },
          {
            appendPropId: "FIGHT_PROP_CRITICAL_HURT";
            statValue: 7.8;
          },
          {
            appendPropId: "FIGHT_PROP_ATTACK_PERCENT";
            statValue: 9.3;
          },
          {
            appendPropId: "FIGHT_PROP_DEFENSE";
            statValue: 42;
          }
        ];
        itemType: "ITEM_RELIQUARY";
        icon: "UI_RelicIcon_14001_2";
        equipType: "EQUIP_NECKLACE";
      };
    },
    {
      itemId: 71554;
      reliquary: {
        level: 21;
        mainPropId: 10004;
        appendPropIdList: [
          501051,
          501224,
          501032,
          501234,
          501053,
          501224,
          501223,
          501233,
          501231
        ];
      };
      flat: {
        nameTextMapHash: "2835521076";
        setNameTextMapHash: "933076627";
        rankLevel: 5;
        reliquaryMainstat: {
          mainPropId: "FIGHT_PROP_ATTACK_PERCENT";
          statValue: 46.6;
        };
        reliquarySubstats: [
          {
            appendPropId: "FIGHT_PROP_ATTACK";
            statValue: 31;
          },
          {
            appendPropId: "FIGHT_PROP_CRITICAL_HURT";
            statValue: 22.5;
          },
          {
            appendPropId: "FIGHT_PROP_HP_PERCENT";
            statValue: 4.7;
          },
          {
            appendPropId: "FIGHT_PROP_CHARGE_EFFICIENCY";
            statValue: 16.8;
          }
        ];
        itemType: "ITEM_RELIQUARY";
        icon: "UI_RelicIcon_14001_5";
        equipType: "EQUIP_SHOES";
      };
    },
    {
      itemId: 71513;
      reliquary: {
        level: 21;
        mainPropId: 15004;
        appendPropIdList: [
          501223,
          501202,
          501051,
          501092,
          501202,
          501224,
          501202,
          501221
        ];
      };
      flat: {
        nameTextMapHash: "3716289628";
        setNameTextMapHash: "933076627";
        rankLevel: 5;
        reliquaryMainstat: {
          mainPropId: "FIGHT_PROP_ATTACK_PERCENT";
          statValue: 46.6;
        };
        reliquarySubstats: [
          {
            appendPropId: "FIGHT_PROP_CRITICAL_HURT";
            statValue: 20.2;
          },
          {
            appendPropId: "FIGHT_PROP_CRITICAL";
            statValue: 9.3;
          },
          {
            appendPropId: "FIGHT_PROP_ATTACK";
            statValue: 14;
          },
          {
            appendPropId: "FIGHT_PROP_DEFENSE_PERCENT";
            statValue: 5.8;
          }
        ];
        itemType: "ITEM_RELIQUARY";
        icon: "UI_RelicIcon_14001_1";
        equipType: "EQUIP_RING";
      };
    },
    {
      itemId: 71533;
      reliquary: {
        level: 21;
        mainPropId: 13008;
        appendPropIdList: [
          501201,
          501083,
          501061,
          501093,
          501062,
          501202,
          501063,
          501204
        ];
      };
      flat: {
        nameTextMapHash: "673920708";
        setNameTextMapHash: "933076627";
        rankLevel: 5;
        reliquaryMainstat: {
          mainPropId: "FIGHT_PROP_CRITICAL_HURT";
          statValue: 62.2;
        };
        reliquarySubstats: [
          {
            appendPropId: "FIGHT_PROP_CRITICAL";
            statValue: 9.7;
          },
          {
            appendPropId: "FIGHT_PROP_DEFENSE";
            statValue: 21;
          },
          {
            appendPropId: "FIGHT_PROP_ATTACK_PERCENT";
            statValue: 14;
          },
          {
            appendPropId: "FIGHT_PROP_DEFENSE_PERCENT";
            statValue: 6.6;
          }
        ];
        itemType: "ITEM_RELIQUARY";
        icon: "UI_RelicIcon_14001_3";
        equipType: "EQUIP_DRESS";
      };
    },
    {
      itemId: 15502;
      weapon: {
        level: 90;
        promoteLevel: 6;
        affixMap: {
          "115502": 0;
        };
      };
      flat: {
        nameTextMapHash: "828711395";
        rankLevel: 5;
        weaponStats: [
          {
            appendPropId: "FIGHT_PROP_BASE_ATTACK";
            statValue: 608;
          },
          {
            appendPropId: "FIGHT_PROP_ATTACK_PERCENT";
            statValue: 49.6;
          }
        ];
        itemType: "ITEM_WEAPON";
        icon: "UI_EquipIcon_Bow_Amos";
      };
    }
  ];
}
