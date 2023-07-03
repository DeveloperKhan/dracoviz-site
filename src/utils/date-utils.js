export const options = [
  {
    value: 9,
    label: 'Sep',
  },
  {
    value: 10,
    label: 'Oct',
  },
  {
    value: 11,
    label: 'Nov',
  },
  {
    value: 12,
    label: 'Dec',
  },
  {
    value: 1,
    label: 'Jan',
  },
  {
    value: 2,
    label: 'Feb',
  },
  {
    value: 3,
    label: 'Mar',
  },
  {
    value: 4,
    label: 'Apr',
  },
  {
    value: 5,
    label: 'May',
  },
  {
    value: 6,
    label: 'Jun',
  },
];

export function getDateFromTag(tag) {
  if (tag == null) {
    return;
  }
  const [month, day, year] = tag.replace("EVENT:", "").split("-");
  const monthLabel = options.find(o => o.value.toString() === month)?.label ?? month;
  return `${monthLabel} ${day}, ${year}`;
}