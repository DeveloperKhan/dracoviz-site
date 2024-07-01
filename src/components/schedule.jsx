import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'gatsby';
import Tabs from './tabs';
import Article from './article';
import { options, getCurrentMonth, getDateFromTag } from '../utils/date-utils';

// Assuming format "EVENT:MM-DD-YYYY"
const dateTagPrefix = 'EVENT:';
const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = getCurrentMonth(currentDate);
const currentYear = currentDate.getFullYear();
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
  8: 10,
};

const getRegion = (post) => {
  const regions = ['na-region', 'eu-region', 'latam-region', 'apac-region'];
  const categories = post.categories.nodes;
  return regions.findIndex((region) => {
    const index = categories.findIndex((category) => category.slug === region);
    return index > -1;
  });
};

function getPostStartDate(post, prefix) {
  const { tags } = post;
  const { nodes } = tags;
  if (nodes == null || nodes.length === 0) {
    return null;
  }
  const targetTag = nodes.find((tag) => tag.name.startsWith(prefix ?? dateTagPrefix));
  if (targetTag == null) {
    return null;
  }
  return targetTag.name.replace(prefix ?? dateTagPrefix, '').trim().replace(/\b0/g, '').split('-');
}

function getPostsForUpcomingRegistration(posts) {
  const postsWithTag = posts?.map((post) => {
    const regDate = getPostStartDate(post, 'REGISTRATION:');
    const startDate = getPostStartDate(post);
    if (regDate == null || startDate == null) {
      return null;
    }
    const [month, day, year] = startDate;
    const yearInvalid = parseInt(year, 10) < currentYear;
    const yearMatch = parseInt(year, 10) === currentYear;
    const monthInvalid = orderOfMonths[month] < orderOfMonths[currentMonth];
    const monthMatch = orderOfMonths[month] === orderOfMonths[currentMonth];
    const dayInvalid = parseInt(day, 10) < currentDay && yearMatch && monthMatch;
    if (yearInvalid || monthInvalid || dayInvalid) {
      return null;
    }
    return (
      <Link to={post.uri} style={{ textDecoration: 'none' }}>
        <div className="event-registration-cell">
          {post.title}
          <br />
          <small>{getDateFromTag(post.tags.nodes[0].name)}</small>
        </div>
      </Link>
    );
  });
  return postsWithTag.filter((x) => x != null);
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
    8: [],
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
      // eslint-disable-next-line eqeqeq
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

  const renderUpcoming = useCallback(() => getPostsForUpcomingRegistration(posts?.data), [posts]);

  const onSelect = (value) => {
    setSelectedMonth(value);
  };

  if (orderedPosts == null) {
    return null;
  }

  const filteredOptions = options.filter((o) => orderedPosts[o.value]?.length > 0);
  const upcoming = renderUpcoming();

  return (
    <div id="event-schedule">
      <div className="event-upcoming">
        {upcoming.length > 0 && <h5>Registration open for the following events</h5>}
        <div className="event-upcoming-row">
          {upcoming}
        </div>
      </div>
      <div className="event-schedule-row">
        <Tabs
          options={filteredOptions}
          orderedPosts={orderedPosts}
          onSelect={onSelect}
          value={selectedMonth}
        />
        <div style={{ paddingTop: '1rem' }}>
          {getArticles()}
        </div>
      </div>
    </div>
  );
}

export default Schedule;
