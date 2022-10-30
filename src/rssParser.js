const rssParser = (rssData) => {
  const parser = new DOMParser();
  const parsedContent = parser.parseFromString(rssData, 'application/xml');
  if (parsedContent.querySelector('parsererror')) {
    throw new Error('notValidRss');
  }
  const titleFeed = parsedContent.querySelector('title').textContent;
  const descriptionFeed = parsedContent.querySelector('description').textContent;
  const feed = {
    title: titleFeed,
    description: descriptionFeed,
  };

  const items = parsedContent.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const titlePost = item.querySelector('title').textContent;
    const descriptionPost = item.querySelector('description').textContent;
    const linkPost = item.querySelector('link').textContent;
    return {
      title: titlePost,
      description: descriptionPost,
      link: linkPost,
    };
  });

  return { feed, posts };
};

export default rssParser;
