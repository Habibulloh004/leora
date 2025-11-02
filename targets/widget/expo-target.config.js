/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'FocusLiveActivity',
  displayName: 'Focus Live Activity',
  deploymentTarget: '16.2',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.sarvar.leora'],
  },
};
