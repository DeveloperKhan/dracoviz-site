import React from 'react';
import classnames from 'classnames';

function Tab({
  option, length, selected, onSelect,
}) {
  const onClick = () => {
    onSelect(option.value);
  };
  return (
    <li
      className="event-tab"
      onClick={onClick}
      role="tab"
      aria-hidden
      aria-selected={selected ? 'true' : 'false'}
    >
      {option.label}
      <div className={classnames('pill', { 'pill-accent': !selected, 'pill-white': selected })}>{length}</div>
    </li>
  );
}

function Tabs({
  options, value, orderedPosts, onSelect,
}) {
  return (
    <ul className="event-tab-list">
      {options.map((option) => (
        <Tab
          option={option}
          selected={value === option.value}
          length={orderedPosts[option.value].length}
          onSelect={onSelect}
          key={option.value}
        />
      ))}
    </ul>
  );
}

export default Tabs;
