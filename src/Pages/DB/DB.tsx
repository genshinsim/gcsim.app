import { Button, Callout, InputGroup } from "@blueprintjs/core";
import React from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Disclaimer } from "./Disclaimer";
import AutoSizer from "react-virtualized-auto-sizer";
import IngameNamesJson from "../../../public/locales/IngameNames.json";

// todo use translation for char names
const charNames = IngameNamesJson.English.character_names;
type CharEntry = [keyof typeof charNames, string];

function CharCard({ charEntry }: { charEntry: CharEntry }) {
  const tooLongNames = [
    "Kaedehara Kazuha",
    "Kamisato Ayaka",
    "Raiden Shogun",
    "Sangonomiya Kokomi",
    "Kamisato Ayato",
    "Shikanoin Heizou",
    "Traveler (Anemo)",
    "Traveler (Geo)",
    "Traveler (Electro)",
    "Traveler (Pyro)",
  ];
  const rareCharNames = [
    "amber",
    "barbara",
    "beidou",
    "bennett",
    "chongyun",
    "diona",
    "fischl",
    "gorou",
    "kaeya",
    "kujousara",
    "lisa",
    "kuki",
    "ningguang",
    "noelle",
    "razor",
    "heizou",
    "rosaria",
    "sucrose",
    "sayu",
    "thoma",
    "xiangling",
    "xinyan",
    "xingqiu",
    "yanfei",
    "yunjin",
  ];

  const [_, setLocation] = useLocation();
  const [shortName, name] = charEntry;
  console.log(name);

  const legendaryCss = "hover:bg-opacity-30     bg-opacity-60 bg-[#FFB13F] ";
  const rareCss = "hover:bg-opacity-30     bg-opacity-60 bg-[#D28FD6]";
  return (
    <div className=" border-gray-700 border-2  rounded-md">
      <div
        className={rareCharNames.includes(shortName) ? rareCss : legendaryCss}
        onClick={() => setLocation(`/db/${shortName}`)}
      >
        <img
          src={`/images/avatar/${shortName}.png`}
          alt={name}
          className="margin-auto"
        />
      </div>
      <div>
        {tooLongNames.includes(name) ? (
          <div className="text-xs   text-center">{name}</div>
        ) : (
          <div className="text-md   text-center">{name}</div>
        )}
      </div>
    </div>
  );
}

const LOCALSTORAGE_DISC_KEY = "gcsim-db-disclaimer-show";

function CharsView({ characters }: { characters: CharEntry[] }) {
  // TODO consider removing this, idk what does it do lol
  return (
    <div className="h-full w-full pl-2 pr-2">
      <div className="grid grid-cols-12 gap-2">
        {characters.map((entry) => (
          <div
            key={entry[0]}
            className=""
            // ref={virtualRow.measureRef}
          >
            <CharCard charEntry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DB() {
  const { t } = useTranslation();
  const [searchString, setSearchString] = React.useState<string>("");
  const [showDisclaimer, setShowDisclaimer] = React.useState<boolean>(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_DISC_KEY);
    return saved !== "false";
  });
  // TODO do not recalc this on every render
  const hideDisclaimer = () => {
    localStorage.setItem(LOCALSTORAGE_DISC_KEY, "false");
    setShowDisclaimer(false);
  };
  // we remove them becuase nobody plays them lol
  // just kidding, travelerelectro and so on is used
  // TODO do not recalc this on every render
  const charsEntries = (Object.entries(charNames) as CharEntry[]).filter(
    ([shortName]) => !["aether", "lumine"].includes(shortName)
  );
  const filteredChars = searchString
    ? charsEntries.filter(([, longName]) =>
        longName.toLocaleLowerCase().includes(searchString)
      )
    : charsEntries;
  return (
    <div className="flex flex-col h-full m-2 w-full xs:w-full sm:w-[640px] hd:w-full wide:w-[1160px] ml-auto mr-auto ">
      <LolDanger />
      <div className="flex flex-row items-center">
        <div className=" flex flex-row gap-x-1">
          <ShowFaqsButton setShowDisclaimer={setShowDisclaimer} />
          <InputGroup
            leftIcon="search"
            placeholder={t("db.type_to_search")}
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
      </div>
      <div className="border-b-2 mt-2 border-gray-300" />
      <div className="p-2 grow ">
        <CharsView characters={filteredChars} />
      </div>
      <Disclaimer
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        hideAlways={hideDisclaimer}
      />
    </div>
  );
}

function ShowFaqsButton({
  setShowDisclaimer,
}: {
  setShowDisclaimer: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Button
      intent="primary"
      onClick={() => {
        localStorage.setItem(LOCALSTORAGE_DISC_KEY, "true");
        setShowDisclaimer(true);
      }}
    >
      Show FAQs
    </Button>
  );
}

function LolDanger() {
  return (
    <span className="ml-auto mr-auto mb-4">
      <Callout intent="danger" className="max-w-[600px] mt-4">
        The database viewer links are currently down due to lack of maintainer.
        In light of the fact that the rewrite should be live soon (targetted
        before patch 3.0), we have elected to leave the links offline as they
        will soon no longer work with the new core (and will need to be updated
        accordingly).
        <br />
        <br />
        However, for now you can still use load in simulator button to rerun the
        simulations yourself.
      </Callout>
    </span>
  );
}
