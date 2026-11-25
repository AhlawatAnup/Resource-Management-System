require('../style/admin.css');
require('./admin.js');
require('./main/main.js');
require('../../common/aside/aside.js');
require('../../common/icons/icons.js');

// DASHBOARD

require('./main/dashboard/dashboard.init.js');
require('./main/resource-request/resource-request.init.js');
require('./main/machines/machine.init.js');
require('./main/profile/profile.init.js');
require('../../common/machine-availability/machine-availability.init.js');
require('../../admin/js/main/Report/report.init.js');
require('./main/edit-profile/edit-profile.init.js');
require('./main/configSettings/config-settings.init.js');

// IO RTC SOCKETS
require('./admin.socket.js');
