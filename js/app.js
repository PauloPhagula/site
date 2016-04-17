(function($){
    var config = {
        form_url: "https://formspree.io/pphagula+dareenzo.github.io@gmail.com"
    },
        texts = {
            'error-email-label': "Invalid Email",
            'error-message-label': "Invalid message",
            'error-captcha-label': "Invalid Captcha",
            'general_error_title': "An error happend while submiting your form. Please try again.",
            'success-label': "Message sent. Thanks!"
        }
    ;

    var humanCheckX  = parseInt(Math.random(0,1) * 10 + 1), 
        humanCheckY  = parseInt(Math.random(0,1) * 10 + 1),
        $form        = $('#contact-form'),
        $error       = $('#contact-form-msg'),
        $humanCheck  = $('#human-check'),
        $userEmail   = $('#user_email'),
        $userMessage = $('#user_message')
    ;

    $humanCheck.attr('placeholder', humanCheckX + '+' + humanCheckY + '=?');
    $form.submit(function (e) {
        var $this = $(this),
            formData;

        e.preventDefault();

        feedback();

        if (!validateForm())
            return;

        formData = $this.serializeArray();

        var request = [];

        $.each(formData, function(ind,c){
            if (c.name == 'human-check' || c.name == 'human-check-2')
                return;

            request.push(c);
        });

        $.ajax({
            type: 'POST',
            data: $.param(request),
            url: config.form_url,
            error: function(err){
                feedback('error');
            },
            success: function(res){
                feedback('success');
                $form.find('input[type!="submit"],textarea').val('');
            }
        });
    });

    function validateForm(){
        if (!$userEmail.val() || !/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test($userEmail.val())) {
            feedback('error_email');
            return false;
        }

        if (!$userMessage.val()) {
            feedback('error_message');
            return false;
        }

        if ($humanCheck.val() != (humanCheckX + humanCheckY)) {
            feedback('error_captcha');
            return false;
        }

        return true;
    }

    function feedback(name) {
        if (!name)
            return $error.addClass('hidden').html('');

        var langTexts = texts,
            className = 'alert alert-danger',
            $focusEl,
            text;

        switch(name){
            case "error_email":
                text = langTexts['error-email-label'];
                $focusEl = $userEmail;
            break;

            case "error_message":
                text = langTexts['error-message-label'];
                $focusEl = $userEmail;
            break;

            case "error_captcha":
                text = langTexts['error-captcha-label'];
                $focusEl = $humanCheck;
            break;

            case "success":
                text = langTexts['success-label'];
                className = 'alert alert-success';
            break;

            default: 
                text = langTexts['general_error_title'];
            break;
        }

        $error
            .html(text)
            .removeClass('alert alert-danger alert-success')
            .addClass(className)
            .removeClass('hidden');

        if ($focusEl) {
            $focusEl.focus();
            $('body,html').stop().animate({
                scrollTop: $focusEl.offset().top - 60
            });
        }
    }
})(jQuery);