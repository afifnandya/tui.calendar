/*eslint-disable*/
var datetime = require('common/datetime');
var Schedule = require('model/Schedule');
var ScheduleViewModel = require('model/viewModel/ScheduleViewModel');
var Time = require('view/week/time');
var TZDate = require('common/timezone').Date;

describe('View/Time', function() {
    it('_parseDateGroup()', function() {
        var str = '20150501';
        var actual = Time.prototype._parseDateGroup(str).getTime();
        var expected = (new Date('2015-05-01T00:00:00+09:00')).getTime();

        expect(actual).toEqual(expected);
    });

    it('getScheduleViewBound()', function() {
        var schedule = Schedule.create({
            start: '2015-05-01T09:00:00+09:00',
            end: '2015-05-01T10:00:00+09:00'
        });
        var mock = {
            options: {
                minHeight: 0,
                defaultMarginBottom: 0
            }
        };
        var viewModel = ScheduleViewModel.create(schedule);

        var result = Time.prototype.getScheduleViewBound.call(mock, viewModel, {
            todayStart: new Date('2015-05-01T00:00:00+09:00'),
            baseMS: datetime.millisecondsFrom('hour', 24),
            baseHeight: 230,
            baseLeft: [0, 50],
            baseWidth: 50,
            columnIndex: 1
        });

        expect(result.top).toBeCloseTo(86, 0);
        expect(result.left).toBe(50);
        expect(result.width).toBe(null);
        expect(result.height).toBeCloseTo(10, 0);
    });
});
