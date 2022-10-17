import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './view.js';
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

const getRssContent = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);

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

  const state = onChange({
    form: {
      isValid: true,
      processState: 'filling',
      inputValue: '',
      error: '',
    },
    feeds: [],
    posts: [],
    addedUrls: [],
  }, render(elements, i18nextInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    // state.form.error = [];
    state.form.processState = 'sending';
    const formData = new FormData(e.target);
    const currentValue = formData.get('url');
    const schema = yup.string().url().notOneOf(state.addedUrls);
    schema.validate(currentValue)
      .then(() => {
        state.form.error = '';
        return getRssContent(currentValue);
      })
      .then((response) => {
        const content = rssParser(response.data.contents);
        state.form.isValid = true;
        state.addedUrls.push(currentValue);
        state.form.processState = 'success';
        state.feeds.unshift(content.feed);
        state.posts.unshift(...content.posts);
      })
      .catch((er) => {
        state.form.isValid = false;
        state.form.processState = 'failed';
        // console.log(Object.entries(er));
        if (er.name === 'ValidationError') {
          state.form.error = er.errors;
        } else if (er.code === 'ERR_NETWORK') {
          state.form.error = 'errNetwork';
        } else {
          state.form.error = 'notValidRss';
        }
      });
  });
};

export default runApp;
