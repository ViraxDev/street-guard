document.addEventListener('readystatechange', function() {
    if (document.readyState === 'complete') {
        let spinner = document.getElementById('loading-spinner');
        let top = document.getElementById('top');

        if (spinner) {
            setTimeout(function() {
                spinner.style.opacity = '0';
                spinner.style.transition = 'opacity 0.3s ease-out';
                top.style.display = 'block';

                setTimeout(function() {
                    spinner.style.display = 'none';
                }, 300);
            }, 100);
        }
    }
});
