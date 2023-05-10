import React from 'react';

function Tab({
  option, selected, onSelect,
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
    </li>
  );
}

function Tabs({
  options, value, onSelect,
}) {
  return (
    <ul className="event-tab-list">
      {options.map((option) => (
        <Tab
          option={option}
          selected={value === option.value}
          onSelect={onSelect}
          key={option.value}
        />
      ))}
    </ul>
  );
}

export default Tabs;
