import SimpleBar from 'simplebar';
window.SimpleBar = SimpleBar;

import('./theme/simplebar/simplebar.min.css');
import('./theme/css/theme.css');
import('./theme/css/user-rtl.css');
import('./theme/css/user.css');
import('@popperjs/core');
import { Toast, Tooltip } from 'bootstrap';
import AnchorJS from 'anchor-js';
import is from 'is_js';
import('./theme/vendors/fontawesome/all.min.js');
import _ from 'lodash';
import('./theme/vendors/list.js/list.min.js');
import('./theme/theme.js');
import('./photo-upload.js')
import('lazysizes')

window.Toast = Toast;
window.Tooltip = Tooltip;
window.AnchorJS = AnchorJS;
window.is = is;
window._ = _;

let isRTL = JSON.parse(localStorage.getItem('isRTL'));
if (isRTL) {
    let linkDefault = document.getElementById('style-default');
    let userLinkDefault = document.getElementById('user-style-default');
    linkDefault.setAttribute('disabled', true);
    userLinkDefault.setAttribute('disabled', true);
    document.querySelector('html').setAttribute('dir', 'rtl');
} else {
    let linkRTL = document.getElementById('style-rtl');
    let userLinkRTL = document.getElementById('user-style-rtl');

    if (linkRTL !== null) {
        linkRTL.setAttribute('disabled', true);
    }

    if (userLinkRTL) {
        userLinkRTL.setAttribute('disabled', true);
    }
}
