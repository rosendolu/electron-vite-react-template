module.exports = {
  packagerConfig: {
    // 可找网站直接生成 windows https://www.butterpig.top/icopro
    icon: './assets/icon/app', // no file extension required
    ignore: ['local/', 'logs/', 'out/'],
  },

  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
    // {
    //   name: '@electron-forge/maker-appx',
    //   config: {
    //     publisher: 'CN=developmentca',
    //     devCert: '/Users/neptune/github/electron-vite-react-template/app/local/certificate.pfx',
    //     certPass: 'zhoubindaydayup',
    //   },
    // },
  ],
};
