import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import axios from 'axios';
import watcher from './view.js';
import resources from './locales/index.i18next.js';
import rssParser from './rssParser.js';

const setLocale = () => (
  yup.setLocale({
    string: {
      url: 'notValidUrl',
    },
    mixed: {
      notOneOf: 'notOneOf',
    },
  })
);

const getRssContent = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app/get');
  newUrl.searchParams.set('disableCache', 'true');
  newUrl.searchParams.set('url', url);
  return axios.get(newUrl);
};

const setPostsId = (posts, feedId) => posts.map((post) => ({
  ...post,
  id: _.uniqueId(),
  feedId,
}));

const runApp = () => {
  const defaultLang = 'ru';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const elements = {
    inputField: document.querySelector('#url-input'),
    form: document.querySelector('.rss-form'),
    submitBtn: document.querySelector('form button'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const state = {
    form: {
      isValid: true,
      processState: 'filling',
      inputValue: '',
      error: '',
    },
    feeds: [],
    posts: [],
    addedUrls: [],
    uiState: {
      clickedLinksId: new Set(),
      modal: null,
    },
  };

  const watchedState = watcher(state, elements, i18nextInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';
    const formData = new FormData(e.target);
    const currentValue = formData.get('url');
    const schema = yup.string().url().notOneOf(watchedState.addedUrls);
    schema.validate(currentValue)
      .then(() => {
        watchedState.form.error = '';
        return getRssContent(currentValue);
      })
      .then((response) => {
        const content = rssParser(response.data.contents);
        watchedState.form.isValid = true;
        watchedState.form.processState = 'success';
        watchedState.addedUrls.push(currentValue);
        const feedId = _.uniqueId();
        content.feed.id = feedId;
        content.feed.url = currentValue;
        const posts = setPostsId(content.posts, feedId);
        watchedState.feeds.unshift(content.feed);
        watchedState.posts.push(...posts);
      })
      .catch((er) => {
        watchedState.form.isValid = false;
        watchedState.form.processState = 'failed';
        if (er.name === 'ValidationError') {
          watchedState.form.error = er.errors;
        } else if (er.code === 'ERR_NETWORK') {
          watchedState.form.error = 'errNetwork';
        } else {
          watchedState.form.error = 'notValidRss';
        }
      });
  });

  elements.postsContainer.addEventListener('click', (event) => {
    const el = event.target;
    const currentPost = watchedState.posts.find((post) => post.id === el.dataset.id);
    watchedState.uiState.modal = currentPost;
    watchedState.uiState.clickedLinksId.add(el.dataset.id);
  });

  const updateRssPosts = () => {
    const promises = watchedState.feeds.map((feed) => (
      getRssContent(feed.url)
        .then((response) => {
          const parseContent = rssParser(response.data.contents);
          const { posts } = parseContent;
          const oldLinksPosts = watchedState.posts.map((post) => post.link);
          const newPosts = posts.filter((post) => !oldLinksPosts.includes(post.link));
          const newPostsWithId = setPostsId(newPosts, feed.id);
          watchedState.posts.unshift(...newPostsWithId);
        })
        .catch((error) => new Error(error))
    ));
    Promise.all(promises).finally(() => setTimeout(() => updateRssPosts(), 5000));
  };

  setLocale();
  updateRssPosts();
};

export default runApp;
