import { Button, ButtonGroup, Tab, Tabs } from "@blueprintjs/core";
import React from "react";
import { Config } from "./Config";
import { SimResults } from "./DataType";
import { Debugger } from "./DebugView";
import { Details } from "./Details";
import { Options, OptionsProp } from "./Options";
import { DebugRow, parseLog } from "./parse";
import Summary from "./Summary";
import Share from "./Share";
import { parseLogV2 } from "./parsev2";
import { Trans, useTranslation } from "react-i18next";

const opts = [
  "procs",
  "damage",
  "pre_damage_mods",
  "hurt",
  "heal",
  "calc",
  "reaction",
  "element",
  "snapshot",
  "snapshot_mods",
  "status",
  "action",
  "queue",
  "energy",
  "character",
  "enemy",
  "hook",
  "sim",
  "task",
  "artifact",
  "weapon",
  "shield",
  "construct",
  "icd",
];

const defOpts = [
  "damage",
  "element",
  "action",
  "energy",
  "pre_damage_mods",
  "status",
];

type ViewProps = {
  classes?: string;
  selected: string[];
  handleSetSelected: (next: string[]) => void;
  data: SimResults;
  parsed: DebugRow[];
  handleClose: () => void;
};

function ViewOnly(props: ViewProps) {
  let { t } = useTranslation();

  const [tabID, setTabID] = React.useState<string>("result");
  const [optOpen, setOptOpen] = React.useState<boolean>(false);

  const handleTabChange = (next: string) => {
    setTabID(next);
  };

  const optProps: OptionsProp = {
    isOpen: optOpen,
    handleClose: () => {
      setOptOpen(false);
    },
    handleToggle: (t: string) => {
      const i = props.selected.indexOf(t);
      let next = [...props.selected];
      if (i === -1) {
        next.push(t);
      } else {
        next.splice(i, 1);
      }
      props.handleSetSelected(next);
    },
    handleClear: () => {
      props.handleSetSelected([]);
    },
    handleResetDefault: () => {
      props.handleSetSelected(defOpts);
    },
    selected: props.selected,
    options: opts,
  };

  return (
    <div
      className={props.classes + " p-4 rounded-lg bg-gray-800 flex flex-col"}
    >
      <div className="flex flex-row  bg-gray-800 w-full">
        <Tabs
          selectedTabId={tabID}
          onChange={handleTabChange}
          className="w-full"
        >
          <Tab
            id="result"
            title={t("viewer.summary")}
            className="focus:outline-none"
          />
          <Tab
            id="details"
            title={t("viewer.details")}
            className="focus:outline-none"
          />
          <Tab
            id="config"
            title={t("viewer.config")}
            className="focus:outline-none"
          />
          <Tab
            id="debug"
            title={t("viewer.debug")}
            className="focus:outline-none"
          />
          <Tab
            id="share"
            title={t("viewer.share")}
            className="focus:outline-none"
          />
          <Tabs.Expander />
          <Button icon="cross" intent="danger" onClick={props.handleClose} />
        </Tabs>
      </div>
      <div className="mt-2 grow mb-4">
        {
          {
            result: (
              // <div className="bg-gray-600 rounded-md m-2 p-2">
              //   <div className=" m-2 w-full xs:w-[300px] sm:w-[640px] hd:w-full wide:w-[1160px] ml-auto mr-auto ">
              <Summary data={props.data} />
              //   </div>
              // </div>
            ),
            config: <Config data={props.data} />,
            debug: (
              <Debugger data={props.parsed} team={props.data.char_names} />
            ),
            details: <Details data={props.data} />,
            share: <Share data={props.data} />,
          }[tabID]
        }
      </div>
      {tabID === "debug" ? (
        <div className="w-full pl-2 pr-2">
          <ButtonGroup fill>
            <Button
              onClick={() => setOptOpen(true)}
              icon="cog"
              intent="primary"
            >
              <Trans>viewer.debug_settings</Trans>
            </Button>
          </ButtonGroup>
        </div>
      ) : null}

      <Options {...optProps} />
    </div>
  );
}

type ViewerProps = {
  data: SimResults;
  className?: string;
  handleClose: () => void;
};

const SAVED_DEBUG_KEY = "gcsim-debug-settings";

export function Viewer(props: ViewerProps) {
  const [selected, setSelected] = React.useState<string[]>(() => {
    const saved = localStorage.getItem(SAVED_DEBUG_KEY);
    if (saved) {
      const initialValue = JSON.parse(saved);
      return initialValue || defOpts;
    }
    return defOpts;
  });

  //string
  console.log(props.data);

  // if (!valid) {
  //   console.log(validate.errors);
  //   return (
  //     <div
  //       className={
  //         props.className +
  //         " p-4 rounded-lg bg-gray-800 flex flex-col w-full place-content-center items-center"
  //       }
  //     >
  //       <div className="mb-4 text-center">
  //         The data you have provided is not a valid format.{" "}
  //         <span className="font-bold">
  //           Please make sure you are using gcsim version 0.4.25 or higher.
  //         </span>
  //         <br />
  //         <br />
  //         Please click the close button and upload a valid file.
  //       </div>
  //       <div>
  //         <Button intent="danger" icon="cross" onClick={props.handleClose}>
  //           Click Here To Close
  //         </Button>
  //       </div>
  //       <div className="mt-8 rounded-md p-4 bg-gray-600">
  //         <p>
  //           If you think this error is invalid, please show the following
  //           message to the developers
  //         </p>
  //         <pre>{JSON.stringify(validate.errors, null, 2)}</pre>
  //       </div>
  //     </div>
  //   );
  // }

  let parsed: DebugRow[];
  if (props.data.v2) {
    console.log("parsing as v2: " + props.data.debug);
    parsed = parseLogV2(
      props.data.active_char,
      props.data.char_names,
      props.data.debug,
      selected
    );
  } else {
    console.log("parsing as v1: " + props.data.debug);
    parsed = parseLog(
      props.data.active_char,
      props.data.char_names,
      props.data.debug,
      selected
    );
  }

  console.log(parsed);

  const handleSetSelected = (next: string[]) => {
    setSelected(next);
    localStorage.setItem(SAVED_DEBUG_KEY, JSON.stringify(next));
  };

  let viewProps = {
    classes: props.className,
    selected: selected,
    handleSetSelected: handleSetSelected,
    data: props.data,
    parsed: parsed,
    handleClose: props.handleClose,
  };

  return <ViewOnly {...viewProps} />;
}
