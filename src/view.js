import onChange from 'on-change';

const handleIsValid = (value, elements) => {
  const { inputField } = elements;
  if (value) {
    inputField.classList.remove('border', 'border-danger', 'is-invalid');
  } else {
    inputField.classList.add('border', 'border-danger', 'is-invalid');
  }
};

const handleError = (value, elements, i18next) => {
  if (value === '') {
    return;
  }
  const { feedback } = elements;
  feedback.classList.add('text-danger');
  feedback.textContent = i18next.t(`errors.${value}`);
};

const handleProcessState = (value, elements, i18next) => {
  const {
    submitBtn,
    feedback,
    form,
    inputField,
  } = elements;

  switch (value) {
    case 'filling':
      submitBtn.disabled = false;
      break;
    case 'sending':
      submitBtn.disabled = true;
      break;
    case 'success':
      submitBtn.disabled = false;
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('success.rssUrl');
      form.reset();
      inputField.focus();
      break;
    case 'failed':
      submitBtn.disabled = false;
      inputField.focus();
      break;
    default:
      throw new Error(`Unknown process: ${value}`);
  }
};

const initialContainer = (initContainer, i18next, path) => {
  initContainer.replaceChildren();
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  initContainer.append(container);

  const div = document.createElement('div');
  div.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18next.t(path);
  div.append(h2);
  container.append(div);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  return { container, ul };
};

const renderFeeds = (feeds, elements, i18next) => {
  const { feedsContainer } = elements;
  const { container, ul } = initialContainer(feedsContainer, i18next, 'feeds');

  const liElements = feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);
    return li;
  });

  ul.append(...liElements);
  container.append(ul);
};

const renderModal = (post, elements) => {
  const modalTitle = elements.modal.querySelector('.modal-title');
  const modalBody = elements.modal.querySelector('.modal-body');
  const btnFullArticle = elements.modal.querySelector('.full-article');
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  btnFullArticle.setAttribute('href', post.link);
};

const renderPosts = (posts, elements, i18next, state) => {
  const { postsContainer } = elements;
  const { container, ul } = initialContainer(postsContainer, i18next, 'posts');

  const liElements = posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const a = document.createElement('a');
    if (state.uiState.clickedLinksId.has(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.setAttribute('href', post.link);
    a.dataset.id = post.id;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.dataset.id = post.id;
    button.textContent = i18next.t('postBtn');

    li.append(a, button);
    return li;
  });

  ul.append(...liElements);
  container.append(ul);
};

const renderClickedLinks = (linksId) => {
  linksId.forEach((id) => {
    const a = document.querySelector(`a[data-id="${id}"]`);
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
  });
};

export default (state, elements, i18next) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.isValid':
      handleIsValid(value, elements);
      break;
    case 'form.error':
      handleError(value, elements, i18next);
      break;
    case 'form.processState':
      handleProcessState(value, elements, i18next);
      break;
    case 'feeds':
      renderFeeds(value, elements, i18next);
      break;
    case 'posts':
      renderPosts(value, elements, i18next, state);
      break;
    case 'uiState.clickedLinksId':
      renderClickedLinks(value);
      break;
    case 'uiState.modal':
      renderModal(value, elements);
      break;
    default:
      break;
  }
});
