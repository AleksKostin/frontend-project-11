import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watcher from './view.js';
import resources from './locales/index.i18next.js';
import rssParser from './rssParser.js';

yup.setLocale({
  string: {
    url: 'notValidUrl',
  },
  mixed: {
    notOneOf: 'notOneOf',
  },
});

const getRssContent = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app/get');
  newUrl.searchParams.set('disableCache', 'true');
  newUrl.searchParams.set('url', url);
  return axios.get(newUrl);
};

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
    clickedLinks: [],
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
        watchedState.addedUrls.push(currentValue);
        watchedState.form.processState = 'success';
        watchedState.feeds.unshift(content.feed);
        watchedState.posts.push(...content.posts);
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

  const updateRssPosts = () => {
    watchedState.addedUrls.forEach((url) => {
      getRssContent(url)
        .then((response) => {
          const parseContent = rssParser(response.data.contents);
          const { posts } = parseContent;
          const oldLinksPosts = watchedState.posts.map((post) => post.link);
          const newRssPosts = posts.filter((post) => !oldLinksPosts.includes(post.link));
          watchedState.posts.unshift(...newRssPosts);
        })
        .catch((error) => new Error(error));
    });
    setTimeout(updateRssPosts, 5000);
  };

  updateRssPosts();
};

export default runApp;
