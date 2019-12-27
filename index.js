const common = require('./common')
const color = require('./color')

module.exports = {
  PATH:   common.PATH,
  CrossPath: common.CrossPath,
  FileOps: common.FileOps,
  collecOps: common.collecOps,
  fileOps: common.fileOps,
  strip: common.strip,
  split: common.split,
  addPrefix: common.addPrefix,
  addSuffix: common.addSuffix,
  test: common.text,
  pathParser: common.pathParser,

  green: color.green,
  red: color.red,
  blue: color.blue,

  // package
  common,
  color,
}
