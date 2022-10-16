import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';
// import _ from 'lodash';
// import axios from 'axios';

// yup.setLocale({
// });

// const rssSchema = (links) => yup.string().url().notOneOf(links);

const runApp = () => {
  const elements = {
    inputField: document.querySelector('#url-input'),
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('form button'),
    feedback: document.querySelector('.feedback'),
  };

  const state = onChange({
    form: {
      isValid: true,
      processState: 'filling',
      inputValue: '',
      error: '',
    },
    feeds: [],
  }, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    // state.form.error = [];
    state.form.processState = 'sending';
    const formData = new FormData(e.target);
    const currentValue = formData.get('url');
    const schema = yup.string().url().notOneOf(state.feeds);
    schema.validate(currentValue)
      .catch((er) => {
        state.form.isValid = false;
        state.form.error = er.errors;
        state.form.processState = 'filling';
        throw new Error(er.errors);
      })
      .then(() => {
        state.form.isValid = true;
        state.form.error = '';
        state.feeds.push(currentValue);
        state.form.processState = 'success';
      });
  });
};

export default runApp;
