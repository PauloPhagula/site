(function(){

  if (window.location.href.split('/').filter(function(part) { return part.length; }).pop() !== 'contact') {
    return;
  }

  var config = { form_url: 'https://formspree.io/pphagula+dareenzo.github.io@gmail.com' },
    texts = {
      'error-email-label': 'Invalid Email',
      'error-message-label': 'Invalid message',
      'error-captcha-label': 'Invalid Captcha',
      'general-error-title': 'An error happened while submitting your form. Please try again.',
      'success-label': 'Message sent. Thanks!'
    }
  ;

  var humanCheckX  = parseInt(Math.random(0,1) * 10 + 1),
    humanCheckY  = parseInt(Math.random(0,1) * 10 + 1),
    $form        = document.getElementById('contact-form'),
    $error       = document.getElementById('contact-form-msg'),
    $humanCheck  = document.getElementById('human-check'),
    $userEmail   = document.getElementById('user_email'),
    $userMessage = document.getElementById('user_message')
  ;

  $humanCheck.setAttribute('placeholder', humanCheckX + '+' + humanCheckY + '=?');
  $form.addEventListener('submit', function (e) {
    var self = this,
      formData,
      xhr;
    e.preventDefault();

    feedback();

    if (!validateForm())
      return;

    var data = {
      'user_email': $userEmail.value,
      'user_message': $userMessage.value,
      '_subject': 'New submission from dareenzo.github.io!',
      '_gotcha': null
    };

    formData = new FormData();

    // We push our data into our FormData object
    for (var name in data) {
      formData.append(name, data[name]);
    }

    xhr = createCORSRequest('POST', config.form_url);

    if (xhr) {
      xhr.addEventListener('load', function(event) {
        feedback('success');
        self.reset();
        humanCheckX  = parseInt(Math.random(0,1) * 10 + 1);
        humanCheckY  = parseInt(Math.random(0,1) * 10 + 1);
        $humanCheck.setAttribute('placeholder', humanCheckX + '+' + humanCheckY + '=?');
      });

      xhr.addEventListener('error', function(event){
        feedback('error');
      });

      xhr.send(formData);
    }
  });

  function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr){
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != 'undefined'){
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      xhr = null;
    }
    return xhr;
  }

  function validateForm() {
    if (!$userEmail.value || !/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test($userEmail.value)) {
      feedback('error_email');
      return false;
    }

    if (!$userMessage.value) {
      feedback('error_message');
      return false;
    }

    if ($humanCheck.value != (humanCheckX + humanCheckY)) {
      feedback('error_captcha');
      return false;
    }

    return true;
  }

  function feedback(name) {
    if (!name) {
      $error.classList.add('hidden');
      $error.innerHTML = '';
      return;
    }

    var langTexts = texts,
      className = ['alert', 'alert-danger'],
      $focusEl,
      text;

    switch (name) {
      case 'error_email':
        text = langTexts['error-email-label'];
        $focusEl = $userEmail;
      break;

      case 'error_message':
        text = langTexts['error-message-label'];
        $focusEl = $userEmail;
      break;

      case 'error_captcha':
        text = langTexts['error-captcha-label'];
        $focusEl = $humanCheck;
      break;

      case 'success':
        text = langTexts['success-label'];
        className = ['alert','alert-success'];
      break;

      default:
        text = langTexts['general-error-title'];
      break;
    }

    $error.innerHTML = text;
    $error.classList.remove('alert');
    $error.classList.remove('alert-danger');
    $error.classList.remove('alert-success');
    className.forEach(function(item, i) {
      $error.classList.add(item);
    });
    $error.classList.remove('hidden');

    if ($focusEl) {
      $focusEl.focus();
      // $('body,html').stop().animate({
      //     scrollTop: $focusEl.offset().top - 60
      // });
    }
  }
})();
