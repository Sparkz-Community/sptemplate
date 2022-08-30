export default function testHostStr(arr, configStr = '', host) {
  return arr.concat(configStr.split(',')).some(str => host.includes(str) && str !== '');
}
