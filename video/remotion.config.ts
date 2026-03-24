// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);

// Add custom webpack configuration for audio files
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules || []),
        {
          test: /\.mp3$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name][ext]',
          },
        },
      ],
    },
    resolve: {
      ...currentConfiguration.resolve,
      extensions: [
        ...(currentConfiguration.resolve?.extensions || []),
        '.mp3',
      ],
    },
  };
});
