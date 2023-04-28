import React, { useState, useEffect } from 'react';

// Assuming format "EVENT:MM-DD-YYYY"
const dateTagPrefix = 'EVENT:';

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
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
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
    } else {
      // console.log(post);
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

  useEffect(() => {
    const { data } = posts;
    if (data == null) {
      return;
    }
    const newOrderedPosts = orderPostsByStartMonth(data);
    setOrderedPosts(newOrderedPosts);
  }, [posts]);

  if (orderedPosts == null) {
    return null;
  }
  return <div>MEOWDY</div>;
}

export default Schedule;
