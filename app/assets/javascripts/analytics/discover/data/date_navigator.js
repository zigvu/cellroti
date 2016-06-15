/*------------------------------------------------
  Date navigation for calendar
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.DateNavigator = function(){
  var self = this;
  this.curData = undefined;
  this.curBeginDate = Date();
  this.curEndDate = Date();
  this.minBeginDate = Date();
  this.maxEndDate = Date();
  var months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  this.setMinMaxDatesRange = function(beginDate, endDate){
    self.minBeginDate = beginDate;
    self.maxEndDate = endDate;
  };

  this.setDates = function(beginDate, endDate){
    // make sure beginDate is earlier
    var bd, ed;
    if(beginDate > endDate){
      bd = endDate;
      ed = beginDate;
    } else {
      bd = beginDate;
      ed = endDate;
    }
    // make sure dates are within bounds
    if(beginDate < self.minBeginDate){ bd = self.minBeginDate; }
    if(endDate > self.maxEndDate){ ed = self.maxEndDate; }

    if(beginDate == self.curBeginDate && endDate == self.curEndDate){
      return false;
    } else {
      self.curBeginDate = bd;
      self.curEndDate = ed;
      console.log("Begin date: " + bd + ", End date: " + ed);
      return true;
    }
  };

  this.setDatesOnIdx = function(idx){
    var selDate = self.curData[idx];
    return self.setDates(selDate.begin_date, selDate.end_date);
  };

  this.getCurDates = function(){
    return { begin_date: self.curBeginDate, end_date: self.curEndDate };
  };

  this.getData = function(){
    var beginDate = self.curBeginDate;
    var endDate = self.curEndDate;
    var numWeeks = _.countBy(getWeeksFromDate(beginDate, endDate), function(w){
      return w.current ? 'true' : 'false';
    }).true;
    // since we can't cross boundaries, check if same value at each date level
    if(beginDate.getFullYear() != endDate.getFullYear()) {
      self.curData = self.getYearData(beginDate, endDate);
    } else if(beginDate.getMonth() != endDate.getMonth()) {
      self.curData = self.getMonthData(beginDate, endDate);
    } else if(numWeeks > 1) {
      self.curData = self.getWeekData(beginDate, endDate);
    } else if(beginDate.getDate() != endDate.getDate()) {
      self.curData = self.getDayData(beginDate, endDate);
    } else if(beginDate.getDate() == endDate.getDate()) {
      self.curData = self.getHourData(beginDate, endDate);
    } else {
      console.log("ZIGVU.Analytics.Discover.DateNavigator: Error: Unknown date range");
      self.curData = undefined;
      return self.curData;
    }
    // enforce boundaries
    _.each(self.curData, function(cd){
      if(cd.begin_date < self.maxEndDate && cd.end_date > self.minBeginDate){
        cd.enabled = true;
      } else {
        cd.enabled = false;
      }
    });
    return self.curData;
  };

  this.getYearData = function(beginDate, endDate){
    var idx = 0, valueX0 = 0.0, valueX1 = 0.1;
    var yearData = [{
      idx: idx, type: 'all', text: 'All',
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: self.minBeginDate, end_date: self.maxEndDate
    }];

    var beginYr = beginDate.getFullYear(), endYr = endDate.getFullYear();
    for(var i = beginYr; i <= endYr; i++){
      idx += 1; valueX0 = valueX1; valueX1 += (0.9/(endYr - beginYr + 1));
      var yearRange = getYearRange(new Date(i, 0, 1));
      yearData.push({
        idx: idx, type: 'year', text: '' + i,
        value_x0: valueX0, value_x1: valueX1, enabled: true, current: true,
        begin_date: yearRange[0], end_date: yearRange[1]
      });
    }

    return yearData;
  };

  this.getMonthData = function(beginDate, endDate){
    var idx = 0, valueX0 = 0.0, valueX1 = 0.1;
    var monthData = [{
      idx: idx, type: 'all', text: 'All',
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: self.minBeginDate, end_date: self.maxEndDate
    }];

    var beginYr = beginDate.getFullYear();
    var yearRange = getYearRange(new Date(beginYr, 0, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    monthData.push({
      idx: idx, type: 'year', text: '' + beginYr,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: yearRange[0], end_date: yearRange[1]
    });

    var curDateYM, isCurrent, monthRange;
    var beginDateYM = new Date(beginDate.getFullYear(), beginDate.getMonth());
    var endDateYM = new Date(endDate.getFullYear(), endDate.getMonth());
    _.each(months, function(mo, i){
      curDateYM = new Date(beginDate.getFullYear(), i);
      isCurrent = beginDateYM <= curDateYM && endDateYM >= curDateYM;
      monthRange = getMonthRange(curDateYM);

      idx += 1; valueX0 = valueX1; valueX1 += 0.8 / months.length;
      monthData.push({
        idx: idx, type: 'month', text: mo,
        value_x0: valueX0, value_x1: valueX1, enabled: true, current: isCurrent,
        begin_date: monthRange[0], end_date: monthRange[1]
      });
    });
    return monthData;
  };

  this.getWeekData = function(beginDate, endDate){
    var idx = 0, valueX0 = 0.0, valueX1 = 0.1;
    var weekData = [{
      idx: idx, type: 'all', text: 'All',
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: self.minBeginDate, end_date: self.maxEndDate
    }];

    var beginYr = beginDate.getFullYear();
    var yearRange = getYearRange(new Date(beginYr, 0, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    weekData.push({
      idx: idx, type: 'year', text: '' + beginYr,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: yearRange[0], end_date: yearRange[1]
    });

    var beginMo = beginDate.getMonth();
    var monthRange = getMonthRange(new Date(beginYr, beginMo, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    weekData.push({
      idx: idx, type: 'month', text: months[beginMo],
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: monthRange[0], end_date: monthRange[1]
    });

    var weekDaysCol = getWeeksFromDate(beginDate, endDate);
    _.each(weekDaysCol, function(wd){
      idx += 1; valueX0 = valueX1; valueX1 += 0.7 / weekDaysCol.length;
      weekData.push({
        idx: idx, type: 'week', text: 'Week ' + wd.week_num,
        value_x0: valueX0, value_x1: valueX1, enabled: true, current: wd.current,
        begin_date: wd.range[0], end_date: wd.range[1]
      });
    });
    return weekData;
  };

  this.getDayData = function(beginDate, endDate){
    var idx = 0, valueX0 = 0.0, valueX1 = 0.1;
    var dayData = [{
      idx: idx, type: 'all', text: 'All',
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: self.minBeginDate, end_date: self.maxEndDate
    }];

    var beginYr = beginDate.getFullYear();
    var yearRange = getYearRange(new Date(beginYr, 0, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    dayData.push({
      idx: idx, type: 'year', text: '' + beginYr,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: yearRange[0], end_date: yearRange[1]
    });

    var beginMo = beginDate.getMonth();
    var monthRange = getMonthRange(new Date(beginYr, beginMo, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    dayData.push({
      idx: idx, type: 'month', text: months[beginMo],
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: monthRange[0], end_date: monthRange[1]
    });

    var weekDaysCol = getWeeksFromDate(beginDate, endDate);
    var wd = _.find(weekDaysCol, function(wd){ return wd.current; });
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    dayData.push({
      idx: idx, type: 'week', text: 'Week ' + wd.week_num,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: wd.range[0], end_date: wd.range[1]
    });

    var weekDays = [], i;
    for(i = beginDate.getDate(); i <= endDate.getDate(); i++){
      weekDays.push(new Date(beginYr, beginMo, i));
    }
    _.each(weekDays, function(wd){
      var dayRange = getDayRange(wd);
      idx += 1; valueX0 = valueX1; valueX1 += 0.6 / weekDays.length;
      dayData.push({
        idx: idx, type: 'day', text: '' + wd.getDate(),
        value_x0: valueX0, value_x1: valueX1, enabled: true, current: true,
        begin_date: dayRange[0], end_date: dayRange[1]
      });
    });

    return dayData;
  };

  this.getHourData = function(beginDate, endDate){
    var idx = 0, valueX0 = 0.0, valueX1 = 0.1;
    var hourData = [{
      idx: idx, type: 'all', text: 'All',
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: self.minBeginDate, end_date: self.maxEndDate
    }];

    var beginYr = beginDate.getFullYear();
    var yearRange = getYearRange(new Date(beginYr, 0, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    hourData.push({
      idx: idx, type: 'year', text: '' + beginYr,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: yearRange[0], end_date: yearRange[1]
    });

    var beginMo = beginDate.getMonth();
    var monthRange = getMonthRange(new Date(beginYr, beginMo, 1));
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    hourData.push({
      idx: idx, type: 'month', text: months[beginMo],
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: monthRange[0], end_date: monthRange[1]
    });

    var weekDaysCol = getWeeksFromDate(beginDate, endDate);
    var wd = _.find(weekDaysCol, function(wd){ return wd.current; });
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    hourData.push({
      idx: idx, type: 'week', text: 'Week ' + wd.week_num,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: wd.range[0], end_date: wd.range[1]
    });

    var dayRange = getDayRange(beginDate);
    idx += 1; valueX0 = valueX1; valueX1 += 0.1;
    hourData.push({
      idx: idx, type: 'day', text: '' + beginDate.getDate(),
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: false,
      begin_date: dayRange[0], end_date: dayRange[1]
    });

    var format = d3.time.format("%I:%M %p");
    var pTime = format(beginDate) + " - " + format(endDate);
    idx += 1; valueX0 = valueX1; valueX1 += 0.5;
    hourData.push({
      idx: idx, type: 'hour', text: pTime,
      value_x0: valueX0, value_x1: valueX1, enabled: true, current: true,
      begin_date: beginDate, end_date: endDate
    });

    return hourData;
  };

  function consolidateWeekDays(weekNum, weekDays, beginDate, endDate){
    var found, lastDay;
    var year = beginDate.getFullYear(), month = beginDate.getMonth();
    found = _.find(weekDays, function(wd){
      return wd.getDate() >= beginDate.getDate() && wd.getDate() <= endDate.getDate();
    });
    found = found ? true : false;
    lastDay = new Date(year, month, _.last(weekDays).getDate(), 23, 59, 59, 999);
    return {week_num: weekNum, current: found, range: [_.first(weekDays), lastDay]};
  }
  function getWeeksFromDate(beginDate, endDate){
    var weekDaysCol = [], weekDays = [], weekNum = 0, i;
    var year = beginDate.getFullYear(), month = beginDate.getMonth();
    for(i = 1; i <= (new Date(year, month + 1, 0)).getDate(); i++){
      var d = new Date(year, month, i);
      weekDays.push(d);
      // if saturday and current date in weekData, make current
      if(d.getDay() == 6){
        weekNum++;
        weekDaysCol.push(consolidateWeekDays(weekNum, weekDays, beginDate, endDate));
        weekDays = [];
      }
    }
    if(weekDays.length > 0){
      weekNum++;
      weekDaysCol.push(consolidateWeekDays(weekNum, weekDays, beginDate, endDate));
    }
    return weekDaysCol;
  }

  function getYearRange(d){
    return [
      new Date(d.getFullYear(), 0, 1),
      new Date((new Date(d.getFullYear(), 12, 0)).getTime() - 1)
    ];
  }
  function getMonthRange(d){
    return [
      new Date(d.getFullYear(), d.getMonth(), 1),
      new Date((new Date(d.getFullYear(), d.getMonth() + 1, 1)).getTime() - 1)
    ];
  }
  function getDayRange(d){
    return [
      new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      new Date((new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)).getTime() - 1)
    ];
  }
};
