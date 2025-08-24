import $ from "jquery";

$(document).ready(function () {
    init();
})

function init() {
    onPhotoChange([$('#profile-image'), $('#upload-cover-image')]);
}

function onPhotoChange(elements) {
    elements.forEach(function (element) {
        element.on("change", function(){
            if($(this).prop('files').length > 0)
            {
                let formData = new FormData();
                let file = $(this).prop('files')[0];

                formData.append('photo', file);
                formData.append('property', $(this).data('property'));

                $('#top').addClass('opacity-50 disabled');

                $.ajax({
                    url: $(this).data('path-upload'),
                    type: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'html',
                    success: function (data) {
                        let picturesBloc = $(data).find('#pictures-bloc');
                        let miniAvatar = $(data).find('#mini-avatar');
                        $('#pictures-bloc').replaceWith(picturesBloc);
                        $('#mini-avatar').replaceWith(miniAvatar);

                        init();

                        $('#top').removeClass('opacity-50 disabled');
                    }
                });
            }
        });
    });
}
