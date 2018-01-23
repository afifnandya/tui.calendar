/*eslint-disable*/
var domutil = require('common/domutil');
var datetime = require('common/datetime');
var TimeMove = require('handler/time/move');
var TZDate = require('common/timezone').Date;

describe('handler/time.move', function() {
    var util = tui.util,
        mockInstance;

    it('checkExpectedCondition()', function() {
        mockInstance = jasmine.createSpyObj('TimeMove', ['_getTimeView']);
        var target = document.createElement('div');
        expect(TimeMove.prototype.checkExpectCondition(target)).toBe(false);
        expect(mockInstance._getTimeView).not.toHaveBeenCalled();

        domutil.addClass(target, '/* @echo CSS_PREFIX */time-schedule');
        TimeMove.prototype.checkExpectCondition.call(mockInstance, target);

        expect(mockInstance._getTimeView).toHaveBeenCalledWith(target);
    });

    it('_getTimeView() return Time view instance by schedule target.', function() {
        var container = document.createElement('div');
        domutil.addClass(container, '/* @echo CSS_PREFIX */time-date');
        domutil.addClass(container, 'tui-view-20');

        var target = document.createElement('div');
        domutil.addClass(target, '/* @echo CSS_PREFIX */time-schedule');

        container.appendChild(target);

        mockInstance.timeGridView = {
            children: {
                items: {
                    20: 'good'
                }
            }
        };

        expect(TimeMove.prototype._getTimeView.call(mockInstance, target)).toBe('good');

        expect(TimeMove.prototype._getTimeView.call(mockInstance, document.createElement('div'))).toBe(false);

        domutil.removeClass(container, 'tui-view-20');
        expect(TimeMove.prototype._getTimeView.call(mockInstance, target)).toBe(false);
    });

    describe('_updateSchedule()', function() {
        var baseControllerMock;

        beforeEach(function() {
            baseControllerMock = jasmine.createSpyObj('Base', ['updateSchedule']);
            baseControllerMock.schedules = {
                items: {
                    '20': {
                        getStarts: function() {
                            return new TZDate(2015, 4, 1, 9, 30);
                        },
                        getEnds: function() {
                            return new TZDate(2015, 4, 1, 10, 30);
                        },
                        start: new TZDate(2015, 4, 1, 9, 30),
                        end: new TZDate(2015, 4, 1, 10, 30),
                        duration: function() {
                            return new TZDate(datetime.millisecondsFrom('hour', 1));
                        }
                    }
                }
            }

            mockInstance = {
                baseController: baseControllerMock,
                fire: jasmine.createSpy('fire')
            };
        });

        it('update schedule model by schedule data.', function() {
            var oneHour = datetime.millisecondsFrom('hour', 1);
            var scheduleData = {
                targetModelID: 20,
                nearestRange: [0, oneHour],
                relatedView: {
                    getDate: function() { return new TZDate(2015, 4, 1); }
                },
                currentView: {
                    getDate: function() { return new TZDate(2015, 4, 1); }
                }
            };
            TimeMove.prototype._updateSchedule.call(mockInstance, scheduleData);

            expect(mockInstance.fire).toHaveBeenCalledWith('beforeUpdateSchedule', {
                schedule: baseControllerMock.schedules.items[20],
                start: new TZDate(2015, 4, 1, 10),
                end: new TZDate(2015, 4, 1, 11)
            });
        });

        it('limit updatable start and end.', function() {
            var oneHour = datetime.millisecondsFrom('hour', 1);
            baseControllerMock.schedules.items['20'].start = new TZDate(2015, 4, 1);
            baseControllerMock.schedules.items['20'].start = new TZDate(2015, 4, 1, 0, 30);
            baseControllerMock.schedules.items['20'].getStarts = function() {
                return new TZDate(2015, 4, 1)
            };
            baseControllerMock.schedules.items['20'].getEnds = function() {
                return new TZDate(2015, 4, 1, 0, 30)
            };
            baseControllerMock.schedules.items['20'].duration = function() {
                return new TZDate(30 * 60 * 1000);
            };

            var scheduleData = {
                targetModelID: 20,
                nearestRange: [oneHour, 0],
                relatedView: {
                    getDate: function() { return new TZDate(2015, 4, 1); }
                },
                currentView: {
                    getDate: function() { return new TZDate(2015, 4, 1); }
                }
            };

            TimeMove.prototype._updateSchedule.call(mockInstance, scheduleData);

            expect(mockInstance.fire).toHaveBeenCalledWith('beforeUpdateSchedule', {
                schedule: baseControllerMock.schedules.items[20],
                start: new TZDate(2015, 4, 1),
                end: new TZDate(2015, 4, 1, 0, 30)
            });

            baseControllerMock.updateSchedule.calls.reset();
            scheduleData.nearestRange = [0, datetime.millisecondsFrom('hour', 25)];
            TimeMove.prototype._updateSchedule.call(mockInstance, scheduleData);

            expect(mockInstance.fire).toHaveBeenCalledWith('beforeUpdateSchedule', {
                schedule: baseControllerMock.schedules.items[20],
                start: new TZDate(2015, 4, 1, 23, 29, 59),
                end: new TZDate(2015, 4, 1, 23, 59, 59)
            });
        });
    });
});
