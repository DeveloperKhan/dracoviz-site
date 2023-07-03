import React, { useState, useEffect, useCallback } from 'react';
import Tabs from './tabs';
import Article from './article';
import { options } from '../utils/date-utils';

// Assuming format "EVENT:MM-DD-YYYY"
const dateTagPrefix = 'EVENT:';
const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = 6;
const orderOfMonths = {
  9: 0,
  10: 1,
  11: 2,
  12: 3,
  1: 4,
  2: 5,
  3: 6,
  4: 7,
  5: 8,
  6: 9,
};

const getRegion = (post) => {
  const regions = ["na-region", "eu-region", "latam-region", "apac-region"];
  const categories = post.categories.nodes;
  return regions.findIndex(region => categories.findIndex(category => category.slug === region) > -1);
}

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
      const region = getRegion(post);
      orderedPosts[month].push({
        day,
        post,
        region,
      });
    }
  });
  Object.keys(orderedPosts).forEach((key) => {
    orderedPosts[key].sort((a, b) => {
      if (a.day === b.day) {
        const diff = a.region - b.region;
        return diff > 0 ? 1 : -1;
      }
      // If currentMonth, and an event is upcoming...
      if (key == currentMonth) {
        // If only one event is upcoming, show that one
        if (a.day >= currentDay && b.day < currentDay) {
          return -1;
        }
        if (b.day >= currentDay && a.day < currentDay) {
          return 1;
        }
      }
      if (orderOfMonths[key] >= orderOfMonths[currentMonth]) {
        // If upcoming month, show earliest event
        return a.day - b.day;
      }
      // If past month, show latest event
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
