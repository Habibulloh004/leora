/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => {
  const appGroups =
    config?.ios?.entitlements?.["com.habibulloh.leora"] ??
    [`group.${config?.ios?.bundleIdentifier ?? "com.habibulloh.leora"}.focus`];

  return {
    type: "widget",
    displayName: "Focus Live Activity",
    icon: "https://github.com/expo.png",
    entitlements: {
      "com.habibulloh.leora": appGroups,
    },
    frameworks: ["SwiftUI", "ActivityKit"],
    deploymentTarget: "17.0",
  };
};
