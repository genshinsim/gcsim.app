import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Character, maxStatLength, Talent, Weapon } from "~/src/types";
import { characterKeyToICharacter } from "~src/Components/Character";
import { AppThunk } from "~src/store";
import { ascLvlMin, maxLvlToAsc } from "~src/util";
import { WorkerPool } from "~src/WorkerPool";
import { charToCfg } from "./helper";
export let pool: WorkerPool = new WorkerPool();

type RunStats = {
  progress: number;
  result: number;
  time: number;
  err: string;
};

export interface Sim {
  team: Character[];
  edit_index: number;
  ready: number;
  workers: number;
  cfg: string;
  advanced_cfg: string;
  adv_cfg_err: string;
  run: RunStats;
  showTips: boolean;
}

export const defaultRunStat: RunStats = {
  progress: -1,
  result: -1,
  time: -1,
  err: "",
};

const initialState: Sim = {
  team: [],
  edit_index: -1,
  ready: 0,
  workers: 3,
  cfg: "",
  advanced_cfg: "",
  adv_cfg_err: "",
  run: defaultRunStat,
  showTips: true,
};

const defWep: { [key: string]: string } = {
  bow: "dullblade",
  catalyst: "dullblade",
  claymore: "dullblade",
  sword: "dullblade",
  polearm: "dullblade",
};

const updateConfig = (team: Character[], cfg: string): string => {
  let next: string = "####----GENERATED CHARACTER BLOCK DO NOT EDIT----####\n";
  //generate new
  team.forEach((c) => {
    next += charToCfg(c) + "\n";
  });
  next += "####----END GENERATED CHARACTER BLOCK DO NOT EDIT----####";
  // console.log(next);
  //try finding block,
  let m = charBlockRegEx.exec(cfg);
  if (m) {
    cfg = cfg.replace(charBlockRegEx, next);
    return cfg;
  }
  // console.log("existing block not found, looking for option row");
  //if not found insert after options block
  m = optionsRegex.exec(cfg);
  if (m) {
    // let rpl = "$1\n\n" + next;
    cfg = cfg.replace(optionsRegex, next + "\n\n$1");
    return cfg;
  }
  // console.log("option row not found, adding at beginning");
  //if options block not found, insert at beginning
  cfg = next + "\n" + cfg;

  return cfg;
};

export function setTotalWorkers(count: number): AppThunk {
  return function (dispatch, getState) {
    //do nothing if ready
    pool.setWorkerCount(count, (x: number) => {
      //call back for ready
      dispatch(simActions.setWorkerReady(x));
    });
    dispatch(simActions.setWorkers(count));
  };
}

export function updateAdvConfig(cfg: string): AppThunk {
  return function (dispatch) {
    dispatch(simActions.setAdvCfg(cfg));
    const setConfig = () =>
      new Promise((resolve, reject) => {
        pool.setCfg(cfg, (val) => {
          // console.log("set config callback: " + val);
          try {
            const res = JSON.parse(val);
            console.log(res);
            if (res.err) {
              reject(res.err);
            } else {
              resolve(res);
            }
          } catch {
            reject("unexpected err parsing json");
          }
        });
      });

    setConfig()
      .then((res) => {
        console.log(res);
        // dispatch(simActions.setAdvCfg(cfg));
        dispatch(simActions.setAdvCfgErr(""));
      })
      .catch((err) => {
        //set error state
        dispatch(simActions.setAdvCfgErr(err));
      });
  };
}

const optionsRegex = /^(options.+;)/;
const charBlockRegEx =
  /####----GENERATED CHARACTER BLOCK DO NOT EDIT----####[^]+####----END GENERATED CHARACTER BLOCK DO NOT EDIT----####/;

export const simSlice = createSlice({
  name: "sim",
  initialState: initialState,
  reducers: {
    setShowTips: (state, action: PayloadAction<boolean>) => {
      state.showTips = action.payload;
    },
    setRunStats: (state, action: PayloadAction<RunStats>) => {
      state.run = action.payload;
      return state;
    },
    setWorkers: (state, action: PayloadAction<number>) => {
      state.workers = action.payload;
      return state;
    },
    setWorkerReady: (state, action: PayloadAction<number>) => {
      state.ready = action.payload;
      return state;
    },
    setCfg: (state, action: PayloadAction<string>) => {
      state.cfg = action.payload;
      return state;
    },
    setAdvCfg: (state, action: PayloadAction<string>) => {
      state.advanced_cfg = action.payload;
      return state;
    },
    setAdvCfgErr: (state, action: PayloadAction<string>) => {
      state.adv_cfg_err = action.payload;
      return state;
    },
    setCharacterNameAndEle: (
      state,
      action: PayloadAction<{ name: string; ele: string }>
    ) => {
      state.team[state.edit_index].name = action.payload.name;
      state.team[state.edit_index].element = action.payload.ele;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterLvl: (state, action: PayloadAction<{ val: number }>) => {
      state.team[state.edit_index].level = action.payload.val;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterMaxLvl: (state, action: PayloadAction<{ val: number }>) => {
      let m = action.payload.val;
      let l = state.team[state.edit_index].level;
      let asc = maxLvlToAsc(m);
      if (l > m) {
        l = m;
      } else if (l < ascLvlMin(asc)) {
        l = ascLvlMin(asc);
      }

      state.team[state.edit_index].max_level = m;
      state.team[state.edit_index].level = l;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterCon: (state, action: PayloadAction<{ val: number }>) => {
      state.team[state.edit_index].cons = action.payload.val;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterSetBonus: (
      state,
      action: PayloadAction<{ set: string; val: number }>
    ) => {
      state.team[state.edit_index].sets[action.payload.set] =
        action.payload.val;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    addCharacterSet: (state, action: PayloadAction<{ set: string }>) => {
      state.team[state.edit_index].sets[action.payload.set] = 0;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    deleteCharacterSet: (state, action: PayloadAction<{ set: string }>) => {
      delete state.team[state.edit_index].sets[action.payload.set];
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterWeapon: (state, action: PayloadAction<{ val: Weapon }>) => {
      let w = action.payload.val;
      let asc = maxLvlToAsc(w.max_level);
      if (w.level > w.max_level) {
        w.level = w.max_level;
      } else if (w.level < ascLvlMin(asc)) {
        w.level = ascLvlMin(asc);
      }
      state.team[state.edit_index].weapon = w;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterTalent: (state, action: PayloadAction<{ val: Talent }>) => {
      state.team[state.edit_index].talents = action.payload.val;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    setCharacterStats: (
      state,
      action: PayloadAction<{ index: number; val: number }>
    ) => {
      if (action.payload.index < 0 || action.payload.index > maxStatLength) {
        return state;
      }
      state.team[state.edit_index].stats[action.payload.index] =
        action.payload.val;
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    addCharacter: (state, action: PayloadAction<{ character: Character }>) => {
      if (state.team.length >= 4) return state;
      state.team.push(action.payload.character);

      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    deleteCharacter: (state, action: PayloadAction<{ index: number }>) => {
      if (
        action.payload.index < 0 ||
        action.payload.index >= state.team.length
      ) {
        return state;
      }
      state.team.splice(action.payload.index, 1);
      let cfg = updateConfig(state.team, state.cfg);
      state.cfg = cfg;
      return state;
    },
    editCharacter: (state, action: PayloadAction<{ index: number }>) => {
      //if index < 0 then it means it's closed; but it shouldn't be bigger than max length
      if (action.payload.index >= state.team.length) {
        return state;
      }
      state.edit_index = action.payload.index;
      return state;
    },
  },
});

export const simActions = simSlice.actions;

export type SimSlice = {
  [simSlice.name]: ReturnType<typeof simSlice["reducer"]>;
};
