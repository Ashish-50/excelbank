module.exports = {
  apps: [
    {
      name: 'excelBankprod',
      script: 'app.js', // Path to your Node.js main script
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
