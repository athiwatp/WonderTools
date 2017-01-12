import jetpack from 'fs-jetpack';

export default (appPath) => {
  return jetpack.cwd(appPath).read('env.json', 'json');
};
