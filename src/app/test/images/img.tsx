const imageContext = require.context('', false, /\.(png|jpe?g|svg|gif)$/);
export default imageContext.keys().reduce((acc, path) => {
  const key = path.replace('./', '');
  acc[key] = imageContext(path);
  return acc;
}, {});