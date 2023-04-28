import React, { useState, useEffect, useCallback } from 'react';
import Tabs from './tabs';
import Article from './article';

// Assuming format "EVENT:MM-DD-YYYY"
const dateTagPrefix = 'EVENT:';
const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth() + 1;
const options = [
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

function getPostStartDate(post) {
  const { tags } = post;
  const { nodes } = tags;
  if (nodes == null || nodes.length === 0) {
    return null;
  }
  const targetTag = nodes.find((tag) => tag.name.startsWith(dateTagPrefix));
  if (targetTag == null) {
    return null;
  }
  return targetTag.name.replace(dateTagPrefix, '').trim().replace(/\b0/g, '').split('-');
}

function orderPostsByStartMonth(posts) {
  const orderedPosts = {
    9: [],
    10: [],
    11: [],
    12: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };
  posts.forEach((post) => {
    const startDate = getPostStartDate(post);
    if (startDate != null) {
      const [month, day] = startDate;
      orderedPosts[month].push({
        day,
        post,
      });
    }
  });
  Object.keys(orderedPosts).forEach((key) => {
    orderedPosts[key].sort((a, b) => {
      // If currentMonth, prioritize element within 3 days of current day
      if (key === currentMonth && a.day + 3 <= currentDay && a.day >= currentDay) {
        return -1;
      }
      if (key === currentMonth && b.day + 3 < currentDay && b.day >= currentDay) {
        return 1;
      }
      // If not currentMonth
      return b.day - a.day;
    });
  });
  return orderedPosts;
}

function Schedule(posts) {
  const [orderedPosts, setOrderedPosts] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    const { data } = posts;
    if (data == null) {
      return;
    }
    const newOrderedPosts = orderPostsByStartMonth(data);
    setOrderedPosts(newOrderedPosts);
  }, [posts]);

  const getArticles = useCallback(() => orderedPosts[selectedMonth].map(({ post }, index) => (
    <Article post={post} variant={index === 0 ? 'large' : 'medium'} key={post.id} />
  )), [selectedMonth, orderedPosts]);

  const onSelect = (value) => {
    setSelectedMonth(value);
  };

  if (orderedPosts == null) {
    return null;
  }
  return (
    <div id="event-schedule">
      <Tabs
        options={options}
        orderedPosts={orderedPosts}
        onSelect={onSelect}
        value={selectedMonth}
      />
      <div style={{ paddingTop: '1rem' }}>
        {getArticles()}
      </div>
    </div>
  );
}

export default Schedule;
