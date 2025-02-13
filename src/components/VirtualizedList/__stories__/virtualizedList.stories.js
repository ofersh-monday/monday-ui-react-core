import React, { useState, useMemo, useCallback } from "react";
import { action } from "@storybook/addon-actions";
import { text, boolean, number, select } from "@storybook/addon-knobs";
import { withPerformance } from "storybook-addon-performance";
import VirtualizedList from "../VirtualizedList";
import Button from "../../Button/Button";
import {
  StoryStateRow,
  StoryStateColumn,
  ComponentStateDescription,
  FlexLayout,
  Divider
} from "../../storybook-helpers";
import DarkThemeContainer from "../../../StoryBookComponents/DarkThemeContainer/DarkThemeContainer";
import StoryWrapper from "../../../StoryBookComponents/StoryWrapper/StoryWrapper";

const generateItems = (defaultItemHeight = 30, itemsCount) => {
  const items = [];
  for (let i = 0; i < itemsCount; i++) {
    const height = (i > 0 && i % 15) === 0 ? 60 : defaultItemHeight;
    items.push({ value: `Item ${i}`, height, id: i });
  }
  return items;
};

const itemRenderer = (item, index, style) => {
  const backgroundColor = index % 2 === 0 ? "white" : "#f8f8f0";
  return (
    <div key={index} style={style}>
      <div
        style={{
          backgroundColor,
          height: item.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {item.value}
      </div>
    </div>
  );
};

const VirtualizedListWrapper = ({ defaultItemHeight, itemsCount = 10000 }) => {
  const [scrollToId, setScrollToId] = useState(null);
  const [verticalScrollbarVisible, setVerticalScrollbarVisible] = useState(null);
  const [scrollToDisabled, setScrollToDisabled] = useState(false);
  const [lastScrolledId, setLastScrolledId] = useState(null);
  const [nextScrollToId, setNextScrollToId] = useState(itemsCount - 1);
  const [visibleItems, setVisibleItems] = useState(null);
  const items = useMemo(() => generateItems(defaultItemHeight, itemsCount), [defaultItemHeight, itemsCount]);
  const onClickToScroll = useCallback(() => {
    setScrollToId(nextScrollToId);
    setLastScrolledId("");
    setScrollToDisabled(true);
  }, [setScrollToId, setScrollToDisabled, items, nextScrollToId]);
  const onScrollToFinished = useCallback(() => {
    setLastScrolledId(nextScrollToId);
    setScrollToId(null);
    setNextScrollToId(Math.round(Math.random() * items.length));
    setScrollToDisabled(false);
  }, [nextScrollToId, items, setNextScrollToId, setLastScrolledId]);
  const onItemsRendered = useCallback(
    data => {
      setVisibleItems(data);
    },
    [setVisibleItems]
  );

  const onVerticalScrollbarVisiblityChange = useCallback(
    isVisible => {
      setVerticalScrollbarVisible(isVisible);
    },
    [setVerticalScrollbarVisible]
  );

  return (
    <div
      style={{
        width: 430,
        height: number("Container Height", 300),
        border: "1px solid black",
        overflow: "hidden",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div style={{ width: 200, height: "100%", marginRight: "40px" }}>
        <VirtualizedList
          items={items}
          itemRenderer={itemRenderer}
          scrollToId={scrollToId}
          id="Knobs"
          scrollDuration={number("Scroll Duration", 200)}
          onScrollToFinished={onScrollToFinished}
          onItemsRendered={onItemsRendered}
          onVerticalScrollbarVisiblityChange={onVerticalScrollbarVisiblityChange}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Button
          size={Button.sizes.MEDIUM}
          kind={Button.kinds.PRIMARY}
          onClick={onClickToScroll}
          disabled={scrollToDisabled}
        >
          {`Scroll to Item ${nextScrollToId}`}
        </Button>
        <div style={{ marginTop: 16, opacity: lastScrolledId ? 1 : 0 }}>{`Scrolled to Item ${lastScrolledId}`}</div>
        {visibleItems && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
            <div>{`First item: ${visibleItems.firstItemId}`}</div>
            <div>{`Center item: ${visibleItems.centerItemId}`}</div>
            <div>{`Last   item: ${visibleItems.lastItemId}`}</div>
            <div>{`Vertical scrollbar: ${verticalScrollbarVisible ? "Visible" : "Hidden"}`}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Sandbox = () => (
  <VirtualizedListWrapper defaultItemHeight={number("Item Height", 30)} itemsCount={number("Items Count", 10000)} />
);

export default {
  title: "Components|VirtualizedList",
  component: VirtualizedList,
  decorators: [withPerformance]
};
