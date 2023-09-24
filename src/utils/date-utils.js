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
  {
    value: 8,
    label: 'Aug',
  },
];

export function getDateFromTag(tag) {
  if (tag == null) {
    return '';
  }
  const [month, day, year] = tag.replace('EVENT:', '').split('-');
  if (month == null || year == null) {
    return '';
  }
  const monthLabel = options.find((o) => o.value.toString() === month.replace(/^0+(\d)/, '$1'))?.label ?? month;
  return `${monthLabel} ${day?.replace(/^0+(\d)/, '$1')}, ${year}`;
}
