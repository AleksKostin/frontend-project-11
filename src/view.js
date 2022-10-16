const handleIsValid = (value, elements) => {
  const { inputField } = elements;
  if (value) {
    inputField.classList.remove('border', 'border-danger', 'is-invalid');
  } else {
    inputField.classList.add('border', 'border-danger', 'is-invalid');
  }
};

const handleError = (value, elements) => {
  const {
    feedback,
    form,
    inputField,
  } = elements;

  if (value !== '') {
    // feedback.classList.remove('text-danger');
    feedback.classList.add('text-danger');
    feedback.textContent = value;
  } else {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = 'success';
    form.reset();
    inputField.focus();
  }
};

const handleProcess = (value, elements) => {
  const { submitButton } = elements;
  switch (value) {
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'success':
      submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown process: ${value}`);
  }
};

export default (elements) => (path, value) => {
  switch (path) {
    case 'form.isValid':
      handleIsValid(value, elements);
      break;
    case 'form.error':
      handleError(value, elements);
      break;
    case 'form.processState':
      handleProcess(value, elements);
      break;
    default:
      break;
  }
};
