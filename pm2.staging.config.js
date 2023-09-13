module.exports = {
  apps: [
    {
      name: 'excelBankstaging',
      script: 'app.js',
      env: {
        NODE_ENV: 'staging',
      },
    },
  ],
};
