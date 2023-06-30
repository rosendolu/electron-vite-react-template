const { app } = require('electron');
const path = require('path');

exports.syncDir = path.resolve(app.getPath('userData'), 'cbirc');

exports.administrativePermit = {
  count: 10,
  queryText: '',
  subTarget: [
    {
      value: 4110,
      label: '总局',
    },
    {
      value: 4111,
      label: '省局',
    },
    {
      value: 4112,
      label: '分局',
    },
  ],
  target: {
    value: 930,
    label: '行政许可',
  },
};

exports.administrativePunishment = {
  count: 10,
  queryText: '',
  subTarget: [
    {
      value: 4113,
      label: '总局',
    },
    {
      value: 4114,
      label: '省局',
    },
    {
      value: 4115,
      label: '分局',
    },
  ],
  target: {
    value: 931,
    label: '行政处罚',
  },
};
