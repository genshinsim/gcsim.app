import { DebugItemView } from "./DebugItemView";
import { DebugItem, DebugRow } from "./parse";
import { useVirtual } from "react-virtual";
import AutoSizer from "react-virtualized-auto-sizer";
import React from "react";
import { Button, FormGroup, InputGroup } from "@blueprintjs/core";

type buffSetting = {
  start: number;
  end: number;
  show: boolean;
};

const Row = ({
  row,
  highlight,
  showBuffDuration,
}: {
  row: DebugRow;
  highlight: buffSetting;
  showBuffDuration: (e: DebugItem) => void;
}) => {
  const cols = row.slots.map((slot, ci) => {
    const events = slot.map((e, ei) => {
      return (
        <DebugItemView item={e} key={ei} showBuffDuration={showBuffDuration} />
      );
    });

    return (
      <div
        key={ci}
        className={
          row.active == ci
            ? "border-l-2 border-gray-500 bg-gray-400	"
            : "border-l-2 border-gray-500"
        }
      >
        {events}
      </div>
    );
  });

  const hl =
    highlight.show && row.f >= highlight.start && row.f <= highlight.end;

  //map out each col
  return (
    <div className="flex flex-row" key={row.key}>
      <div
        className={
          hl
            ? "text-right text-gray-100 border-b-2 border-gray-500 bg-blue-500"
            : "text-right text-gray-100 border-b-2 border-gray-500"
        }
        style={{ minWidth: "100px" }}
      >
        <div>{`${row.f} | ${(row.f / 60).toFixed(2)}s`}</div>
      </div>
      <div className="grid grid-cols-5 flex-grow border-b-2 border-gray-500">
        {cols}
      </div>
      <div style={{ width: "20px", minWidth: "20px" }} />
    </div>
  );
};

let lastSearchIndex: number = 0;

export function Debugger({
  data,
  team,
  searchable,
}: {
  data: DebugRow[];
  team: string[];
  searchable: { [key: number]: any };
}) {
  const parentRef = React.useRef<HTMLDivElement>(null!);
  const searchRef = React.useRef<HTMLInputElement>(null!);
  const [hl, sethl] = React.useState<buffSetting>({
    start: 0,
    end: 0,
    show: false,
  });

  const handleShowBuffDuration = (e: DebugItem) => {
    // const show = hl.show;
    let next = {
      show: true,
      start: e.added,
      end: e.ended,
    };
    sethl(next);
  };

  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef,
    keyExtractor: React.useCallback(
      (index: number) => {
        return data[index].f;
      },
      [data]
    ),
  });

  const char = team.map((c) => {
    return (
      <div
        key={c}
        className="capitalize text-lg font-medium text-gray-100 border-l-2 border-b-2 border-gray-500"
      >
        {c}
      </div>
    );
  });

  const searchAndScroll = (val: string) => {
    let total = Object.keys(searchable).length;
    for (var index = lastSearchIndex; index < total; index++) {
      for (let msg of searchable[index]) {
        if (msg.indexOf(val) > -1) {
          console.log(index, lastSearchIndex);
          lastSearchIndex = index + 1;
          rowVirtualizer.scrollToIndex(index, { align: "start" });
          return;
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FormGroup label="Search" inline>
        <InputGroup
          type="text"
          inputRef={searchRef}
          rightElement={
            <FormGroup>
              <Button
                icon="arrow-down"
                intent="warning"
                onClick={() => {
                  searchAndScroll(searchRef.current.value);
                }}
              />
              <Button
                icon="reset"
                intent="warning"
                onClick={() => {
                  searchRef.current.value = "";
                  lastSearchIndex = 0;
                  rowVirtualizer.scrollToIndex(0);
                }}
              />
            </FormGroup>
          }
        />
      </FormGroup>
      <div className="h-full ml-2 mr-2 p-2 rounded-md bg-gray-600 text-xs grow flex flex-col min-w-[60rem] min-h-[20rem]">
        <AutoSizer defaultHeight={100}>
          {({ height, width }) => (
            <div
              ref={parentRef}
              style={{
                minHeight: "100px",
                height: height,
                width: width,
                overflow: "auto",
                position: "relative",
              }}
              id="resize-inner"
            >
              <div className="flex flex-row debug-header">
                <div
                  className={
                    "font-medium text-lg text-gray-100 border-b-2 border-gray-500 text-right "
                  }
                  style={{ minWidth: "100px" }}
                >
                  F | Sec
                </div>
                <div className="grid grid-cols-5 flex-grow">
                  <div className="font-medium text-lg text-gray-100 border-l-2 border-b-2 border-gray-500">
                    Sim
                  </div>
                  {char}
                </div>
                <div style={{ width: "20px", minWidth: "20px" }} />
              </div>
              <div
                className="ListInner"
                style={{
                  // Set the scrolling inner div of the parent to be the
                  // height of all items combined. This makes the scroll bar work.
                  height: `${rowVirtualizer.totalSize}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {
                  // The meat and potatoes, an array of the virtual items
                  // we currently want to render and their index in the original data.
                }
                {rowVirtualizer.virtualItems.map((virtualRow) => (
                  <div
                    key={virtualRow.index}
                    // ref={virtualRow.measureRef}
                    ref={(el) => virtualRow.measureRef(el)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      // Positions the virtual elements at the right place in container.
                      // minHeight: `${virtualRow.size - 10}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    // id={"virtual-row-"+virtualRow.key}
                  >
                    <Row
                      row={data[virtualRow.index]}
                      highlight={hl}
                      showBuffDuration={handleShowBuffDuration}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}
