// Generated by CoffeeScript 1.6.2
(function() {
  var TimeTable;

  $(document).ready(function() {
    var search_btn;

    TimeTable.on_init();
    $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>載入中...</td></tr>");
    $("#keyword").focus(function() {
      return $("#search").html("搜尋");
    });
    search_btn = function() {
      return $("#search").html(function() {
        if ($("#search").html() === "搜尋") {
          if ($("#keyword").val()) {
            TimeTable.on_search($("#keyword").val());
            return "<i class=\"icon-remove\"></i> 取消搜尋";
          }
        } else {
          $("#keyword").val("");
          TimeTable.on_runMydata();
          return "搜尋";
        }
      });
    };
    $("#keyword").keypress(function(event) {
      var keycode;

      keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode === "13" ? $("#keyword").val() : void 0) {
        return search_btn();
      }
    });
    $("#search").click(function() {
      return search_btn();
    });
    $("#print").click(function() {
      return TimeTable.printScheduler();
    });
    $("#menu1").on("click", "li", function() {
      var new_kid, new_kind, new_schoolyear, new_semester, pre_schoolyear, pre_semester, request;

      pre_schoolyear = $("#tabName").attr("data-schoolyear");
      pre_semester = $("#tabName").attr("data-semester");
      new_schoolyear = $(this).find("a").attr("schoolyear");
      new_semester = $(this).find("a").attr("semester");
      if (pre_schoolyear !== new_schoolyear || pre_semester !== new_semester) {
        $("#tabName").attr("data-schoolyear", new_schoolyear).attr("data-semester", new_semester).html($(this).find("a").html());
        $("#menu1 li.active").removeClass("active");
        $(this).addClass("active");
        new_kind = $("#menu2 li.active a").attr("kind");
        new_kid = $("#menu2 li.active a").attr("kid");
        request = {
          SchoolYear: new_schoolyear,
          Semester: new_semester,
          kind: new_kind,
          kid: new_kid
        };
        TimeTable.getScheduler(request);
        if (new_kind === "class") {
          return TimeTable.getClassBusy(new_kid);
        }
      }
    });
    $("#menu2").on("click", "li", function() {
      var new_kid, new_kind, pre_kid, pre_kind, request;

      pre_kind = $("#tabSearch").attr("data-kind");
      pre_kid = $("#tabSearch").attr("data-kid");
      new_kind = $(this).find("a").attr("kind");
      new_kid = $(this).find("a").attr("kid");
      if (pre_kind !== new_kind || pre_kid !== new_kid) {
        $("#timeTable td[rel=tooltip]").tooltip("hide");
        $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>載入中...</td></tr>");
        $("#tabSearch").attr("data-kind", new_kind).attr("data-kid", new_kid).html($(this).find("a").html());
        $("#tabName").attr("data-schoolyear", "").attr("data-semester", "").html("");
        $("#menu2 li.active").removeClass("active");
        $(this).addClass("active");
        request = {
          kind: new_kind,
          kid: new_kid
        };
        return TimeTable.getSemester(request);
      }
    });
    $("#timeTable, #myTabContent").on("click", "a[kind]", function() {
      var keyword, kid, kind;

      kind = $(this).attr("kind");
      kid = $(this).attr("kid");
      keyword = $(this).html();
      if (kind && kid) {
        $("#keyword").val(keyword);
        $("#search").html("<i class=\"icon-remove\"></i> 取消搜尋");
        return TimeTable.setTCCDropDownList({
          Kind: kind,
          ID: kid,
          Name: keyword
        });
      }
    });
    return $("#class").on("click", "li.nav-header", function() {
      if ($(this).find("i.icon-chevron-down").size()) {
        $(this).nextUntil("li.nav-header").hide();
      } else {
        $(this).nextUntil("li.nav-header").show();
      }
      return $(this).find("i").toggleClass("icon-chevron-down icon-chevron-up");
    });
  });

  TimeTable = (function() {
    var getAllSearchItem, getClassBusy, getScheduler, getSemester, getTimetable, initialize, printScheduler, process, runMydata, search, setSemeDownList, setTCCDropDownList, set_error_message, _all_timetable, _alloptions, _classes, _classrooms, _connection, _curr_classbusy, _curr_scheduler, _curr_timetable, _myself, _runing, _system_position, _teachers;

    _system_position = gadget.params.system_position || "teacher";
    _myself = {
      tcc_list: null,
      semester_list: null,
      scheduler_list: null
    };
    _teachers = null;
    _classes = null;
    _classrooms = null;
    _alloptions = [];
    _all_timetable = {};
    _curr_scheduler = [];
    _curr_timetable = [];
    _curr_classbusy = [];
    _runing = {
      scheduler: false,
      classbusy: false
    };
    _connection = null;
    if (_system_position === "student") {
      _connection = gadget.getContract("ischool.scheduler.student");
    } else {
      _connection = gadget.getContract("ischool.scheduler.teacher");
    }
    initialize = function() {
      return _connection.send({
        service: "_.GetMyInfo",
        body: {},
        result: function(response, error, http) {
          var _ref, _ref1;

          if (error !== null) {
            return set_error_message("#mainMsg", "GetMyInfo", error);
          } else {
            if (_system_position === "student") {
              if (((_ref = response.Response) != null ? _ref.Student : void 0) != null) {
                return $(response.Response.Student).each(function(index, item) {
                  return setTCCDropDownList({
                    Kind: "class",
                    ID: item.ClassID,
                    Name: item.ClassName
                  });
                });
              }
            } else if (_system_position === "teacher") {
              if (((_ref1 = response.Response) != null ? _ref1.Teacher : void 0) != null) {
                return $(response.Response.Teacher).each(function(index, item) {
                  return setTCCDropDownList({
                    Kind: "teacher",
                    ID: item.TeacherID,
                    Name: item.TeacherName
                  });
                });
              }
            }
          }
        }
      });
    };
    getAllSearchItem = function() {
      var checkResult, getClasses, getClassrooms, getTeachers;

      checkResult = function() {
        if (_teachers && _classes && _classrooms) {
          return _alloptions = _teachers.concat(_classes, _classrooms);
        }
      };
      getTeachers = function() {
        return _connection.send({
          service: "_.GetTeachers",
          body: "",
          result: function(response, error, http) {
            var items, teacher_list, _ref;

            if (error !== null) {
              return set_error_message("#mainMsg", "GetTeachers", error);
            } else {
              items = [];
              teacher_list = [];
              if (((_ref = response.Response) != null ? _ref.Teacher : void 0) != null) {
                $(response.Response.Teacher).each(function(index, item) {
                  items.push({
                    Kind: "teacher",
                    ID: item.ID,
                    Name: item.TeacherName
                  });
                  return teacher_list.push("<li><a href=\"#\" kind=\"teacher\" kid=\"" + (item.ID || "") + "\">" + item.TeacherName + "</a></li>");
                });
              }
              _teachers = items;
              checkResult();
              return $("#teacher ul").html(teacher_list.join(""));
            }
          }
        });
      };
      getClasses = function() {
        return _connection.send({
          service: "_.GetClasses",
          body: "",
          result: function(response, error, http) {
            var class_list, grader_name, grader_year, items, _ref;

            if (error !== null) {
              return set_error_message("#mainMsg", "GetClasses", error);
            } else {
              items = [];
              class_list = [];
              grader_year = null;
              grader_name = null;
              if (((_ref = response.Response) != null ? _ref.Class : void 0) != null) {
                $(response.Response.Class).each(function(index, item) {
                  items.push({
                    Kind: "class",
                    ID: item.ID,
                    Name: item.ClassName
                  });
                  if (item.GraderYear !== grader_year) {
                    if (item.GraderYear === "") {
                      grader_name = "未分年級";
                    } else {
                      grader_name = item.GraderYear + "年級";
                    }
                    class_list.push("<li class=\"nav-header\"><a href=\"#\"><i class=\"icon-chevron-down\"></i> " + grader_name + "</a></li>");
                    grader_year = item.GraderYear;
                  }
                  return class_list.push("<li><a href=\"#\" kind=\"class\" kid=\"" + (item.ID || "") + "\">" + (item.ClassName || "") + "</a></li>");
                });
              }
              _classes = items;
              checkResult();
              return $("#class ul").html(class_list.join(""));
            }
          }
        });
      };
      getClassrooms = function() {
        return _connection.send({
          service: "_.GetClassrooms",
          body: "",
          result: function(response, error, http) {
            var classroom_list, items, _ref;

            if (error !== null) {
              return set_error_message("#mainMsg", "GetClassrooms", error);
            } else {
              items = [];
              classroom_list = [];
              if (((_ref = response.Response) != null ? _ref.Classroom : void 0) != null) {
                $(response.Response.Classroom).each(function(index, item) {
                  items.push({
                    Kind: "classroom",
                    ID: item.Uid,
                    Name: item.Name
                  });
                  return classroom_list.push("<li><a href=\"#\" kind=\"classroom\" kid=\"" + (item.Uid || "") + "\">" + (item.Name || "") + "</a></li>");
                });
              }
              _classrooms = items;
              checkResult();
              return $("#place ul").html(classroom_list.join(""));
            }
          }
        });
      };
      return _connection.ready(function() {
        getTeachers();
        getClasses();
        return getClassrooms();
      });
    };
    process = function() {
      var beginTime, check_timetable, course_group_name, course_time, def_time, extendTimetable, flag, flag_h, flag_x, getTDCSS, getTableCSS, ii, info, jj, kind, kk, max_Period, max_Weekday, minutesLater, that, tool_tip, tooltip_html, tt, weekday_name, _tbody, _thead;

      getTDCSS = function(_len) {
        if (_len <= 1) {
          return "my-list1";
        } else if (_len >= 4) {
          return "my-list4";
        } else {
          return "my-list" + _len;
        }
      };
      getTableCSS = function(_len) {
        if (_len <= 6) {
          return "my-row6";
        } else if (_len >= 12) {
          return "my-row12";
        } else {
          return "my-row" + _len;
        }
      };
      kind = $("#menu2 li.active a").attr("kind") || "teacher";
      if (_runing.scheduler && (kind === "class" ? _runing.classbusy : true)) {
        check_timetable = true;
        max_Weekday = 0;
        max_Period = 0;
        _thead = [];
        _tbody = [];
        extendTimetable = {};
        ii = null;
        jj = null;
        weekday_name = null;
        tt = null;
        def_time = [];
        flag_x = null;
        flag_h = null;
        course_time = null;
        tool_tip = null;
        tooltip_html = null;
        beginTime = null;
        minutesLater = null;
        that = null;
        info = null;
        course_group_name = null;
        $(_curr_timetable).each(function(key, value) {
          if (!_all_timetable[value]) {
            return check_timetable = false;
          }
        });
        if (check_timetable) {
          if (_curr_scheduler.length === 0) {
            return $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>目前無資料</td></tr>");
          } else {
            extendTimetable = {};
            $(_curr_timetable).each(function(key, value) {
              max_Weekday = (_all_timetable[value].max_Weekday > max_Weekday ? _all_timetable[value].max_Weekday : max_Weekday);
              max_Period = (_all_timetable[value].max_Period > max_Period ? _all_timetable[value].max_Period : max_Period);
              return $.extend(extendTimetable, _all_timetable[value]);
            });
            ii = 0;
            while (ii <= max_Period) {
              if (ii === 0) {
                _thead.push("<tr>");
              } else {
                _tbody.push("<tr>");
              }
              jj = 0;
              while (jj <= max_Weekday) {
                if (ii === 0) {
                  weekday_name = (jj === 0 ? "&nbsp;" : $.funGetDayName(jj || ""));
                  _thead.push("<th>" + weekday_name + "</th>");
                } else {
                  if (jj === 0) {
                    course_time = "";
                    kk = 1;
                    while (kk <= max_Weekday) {
                      tt = extendTimetable["" + ii + kk];
                      if (tt) {
                        beginTime = new Date(tt.BeginTime);
                        minutesLater = new Date(tt.BeginTime);
                        minutesLater.setMinutes(minutesLater.getMinutes() + parseInt(tt.Duration, 10));
                        course_time = $.formatDate(beginTime, "HHmm") + "<br />|<br />" + $.formatDate(minutesLater, "HHmm");
                        def_time[ii] = {
                          orgBeginTime: tt.BeginTime,
                          duration: tt.Duration
                        };
                        break;
                      }
                      kk += 1;
                    }
                    if (!def_time[ii]) {
                      def_time[ii] = {
                        orgBeginTime: "",
                        duration: ""
                      };
                    }
                    _tbody.push("<th>" + ii + "<div class=\"my-time\">" + course_time + "</div></th>");
                  } else {
                    flag = "";
                    course_time = "";
                    tool_tip = [];
                    tooltip_html = "";
                    info = [];
                    course_group_name = "";
                    tt = extendTimetable["" + ii + jj];
                    if (tt) {
                      if (def_time[ii].orgBeginTime !== tt.BeginTime || def_time[ii].duration !== tt.Duration) {
                        beginTime = new Date(tt.BeginTime);
                        minutesLater = new Date(tt.BeginTime);
                        minutesLater.setMinutes(minutesLater.getMinutes() + parseInt(tt.Duration, 10));
                        course_time = "<li class=\"my-time\">( " + ($.formatDate(beginTime, "HHmm") + "-" + $.formatDate(minutesLater, "HHmm")) + " )</li>";
                      }
                      if (tt.Disable === "t") {
                        _tbody.push("<td class=\"" + (getTDCSS(1)) + "\">\n  <table class=\"my-subtable\">\n    <tr>\n      <td>\n        <ul>\n          <li class=\"my-subject\">" + tt.DisableMessage + "</li>\n          " + course_time + "\n        </ul>\n      </td>\n    </tr>\n  </table>\n</td>");
                      } else {
                        if (_curr_classbusy["" + ii + jj]) {
                          _tbody.push("<td class=\"" + (getTDCSS(1)) + "\">\n  <table class=\"my-subtable\">\n    <tr>\n      <td>\n        <ul>\n          <li class=\"my-subject\">" + _curr_classbusy["" + ii + jj] + "</li>\n          " + course_time + "\n        </ul>\n      </td>\n    </tr>\n  </table>\n</td>");
                        } else {
                          if (_curr_scheduler[ii] && _curr_scheduler[ii][jj]) {
                            that = _curr_scheduler[ii][jj];
                            $(that).each(function(index, item) {
                              var classlink, classname, classroomlink, classroomname, subject, teacherlink, teachername;

                              switch (item.WeekFlag) {
                                case "1":
                                  flag_h = "<li class=\"my-week\">(單)</li>";
                                  flag_x = "(單)";
                                  break;
                                case "2":
                                  flag_h = "<li class=\"my-week\">(雙)</li>";
                                  flag_x = "(雙)";
                                  break;
                                default:
                                  flag_h = "";
                                  flag_x = "";
                              }
                              subject = (item.Subject || "") + (item.level ? $.arabic2roman(item.level) : "");
                              teachername = item.TeacherName || "";
                              classroomname = item.ClassroomName || "";
                              classname = item.ClassName || "";
                              teacherlink = teachername ? "<a href=\"#\" kind=\"teacher\" kid=\"" + (item.TeacherID || "") + "\">" + teachername + "</a>" : "";
                              classroomlink = classroomname ? "<a href=\"#\" kind=\"classroom\" kid=\"" + (item.ClassroomID || "") + "\">" + classroomname + "</a>" : "";
                              classlink = classname ? "<a href=\"#\" kind=\"class\" kid=\"" + (item.ClassID || "") + "\">" + classname + "</a>" : "";
                              if (index > 3) {
                                switch (kind) {
                                  case "teacher":
                                    tool_tip.push("<li>" + flag_x + classname + " - " + subject + " - " + classroomname + "</li>");
                                    break;
                                  case "classroom":
                                    tool_tip.push("<li>" + flag_x + classname + " - " + subject + " - " + teachername + "</li>");
                                    break;
                                  case "class":
                                    tool_tip.push("<li>" + flag_x + subject + " - " + teachername + " - " + classroomname + "</li>");
                                }
                              } else {
                                switch (kind) {
                                  case "teacher":
                                    info.push("<tr>\n  <td>\n    <ul>\n      " + flag_h + "\n      <li class=\"my-class\">" + classlink + "</li>\n      <li class=\"my-subject\">" + subject + "</li>\n      <li class=\"my-classroom\">" + classroomlink + "</li>\n    </ul>\n  </td>\n</tr>");
                                    break;
                                  case "classroom":
                                    info.push("<tr>\n  <td>\n    <ul>\n      " + flag_h + "\n      <li class=\"my-class\">" + classlink + "</li>\n      <li class=\"my-subject\">" + subject + "</li>\n      <li class=\"my-teacher\">" + teacherlink + "</li>\n    </ul>\n  </td>\n</tr>");
                                    break;
                                  case "class":
                                    info.push("<tr>\n  <td>\n    <ul>\n      " + flag_h + "\n      <li class=\"my-subject\">" + subject + "</li>\n      <li class=\"my-teacher\">" + teacherlink + "</li>\n      <li class=\"my-classroom\">" + classroomlink + "</li>\n    </ul>\n  </td>\n</tr>");
                                }
                              }
                              if (kind === "class" && item.CourseGroup) {
                                course_group_name = "【" + item.CourseGroup + "】" || "";
                              }
                              if (index > 3) {
                                return info.push("<div class=\"my-more\">" + (that.length - 4) + "</div>");
                              }
                            });
                            if (course_group_name || tool_tip.length > 0) {
                              tooltip_html = "rel=\"tooltip\" data-placement=\"top\" data-original-title=\"" + course_group_name + "<ol>" + (tool_tip.join("")) + "</ol>";
                            }
                            _tbody.push("<td class=\"" + (getTDCSS(that.length)) + "\" " + tooltip_html + ">\n  <div class=\"my-container-more\" style=\"position:relative;\">\n    <table class=\"my-subtable\">" + (info.join("")) + "</table>\n    ${course_time}\n  </div>\n</td>");
                          } else {
                            _tbody.push("<td class=\"" + (getTDCSS(1)) + "\"></td>");
                          }
                        }
                      }
                    } else {
                      _tbody.push("<td class=\"" + (getTDCSS(1)) + "\"></td>");
                    }
                  }
                }
                jj += 1;
              }
              if (ii === 0) {
                _thead.push("</tr>");
              } else {
                _tbody.push("</tr>");
              }
              ii += 1;
            }
            $("#timeTable").find("table").removeClass().addClass("table table-bordered " + getTableCSS(max_Period)).end().find("thead").html(_thead.join("")).end().find("tbody").html(_tbody.join("")).find("td[rel=tooltip]").tooltip();
            if (!_myself.scheduler_list) {
              return _myself.scheduler_list = $("#timeTable").html();
            }
          }
        }
      }
    };
    runMydata = function() {
      var tmp;

      tmp = null;
      if (!(_myself.tcc_list && _myself.semester_list && _myself.scheduler_list)) {
        return initialize();
      } else {
        tmp = $("<div />").append(_myself.semester_list).find("li.active a");
        $("#tabName").attr("data-schoolyear", tmp.attr("schoolyear")).attr("data-semester", tmp.attr("semester")).html(tmp.html());
        tmp = $($("<div>").append(_myself.tcc_list).find("li.active a"));
        $("#tabSearch").attr("data-kind", tmp.attr("kind")).attr("data-kid", tmp.attr("kid")).html(tmp.html());
        $("#menu2").html(_myself.tcc_list);
        $("#menu1").html(_myself.semester_list);
        return $("#timeTable").html(_myself.scheduler_list);
      }
    };
    getSemester = function(request) {
      var items, kid, kind, m2;

      kind = request.kind || "";
      kid = request.kid || "";
      m2 = $("#menu2 li.active a");
      items = [];
      if (kind && kid) {
        switch (kind) {
          case "teacher":
            request.TeacherID = kid;
            break;
          case "classroom":
            request.ClassroomID = kid;
            break;
          case "class":
            request.ClassID = kid;
            break;
          default:
            return false;
        }
        return _connection.send({
          service: "_.GetSemester",
          body: {
            Request: request
          },
          result: function(response, error, http) {
            var _ref;

            if (error !== null) {
              set_error_message("#mainMsg", "GetSemester", error);
            } else {
              if (m2.attr("kind") === kind && m2.attr("kid") === kid) {
                if (((_ref = response.Schedule) != null ? _ref.CourseSection : void 0) != null) {
                  $(response.Schedule.CourseSection).each(function(index, item) {
                    return items.push({
                      SchoolYear: item.SchoolYear,
                      Semester: item.Semester
                    });
                  });
                }
              }
            }
            return setSemeDownList(items);
          }
        });
      }
    };
    getScheduler = function(request) {
      var kid, kind, m1, m2, schoolyear, semester;

      _runing.scheduler = false;
      schoolyear = request.SchoolYear || "";
      semester = request.Semester || "";
      kind = request.kind || "";
      kid = request.kid || "";
      m2 = $("#menu2 li.active a");
      m1 = $("#menu1 li.active a");
      _curr_scheduler = [];
      _curr_timetable = [];
      if (schoolyear && semester && kind && kid) {
        switch (kind) {
          case "teacher":
            request.TeacherID = kid;
            break;
          case "classroom":
            request.ClassroomID = kid;
            break;
          case "class":
            request.ClassID = kid;
            break;
          default:
            return false;
        }
        return _connection.send({
          service: "_.GetScheduler",
          body: {
            Request: request
          },
          result: function(response, error, http) {
            var _ref;

            if (error !== null) {
              return set_error_message("#mainMsg", "GetScheduler", error);
            } else {
              if (m2.attr("kind") === kind && m2.attr("kid") === kid && m1.attr("schoolyear") === schoolyear && m1.attr("semester") === semester) {
                if (((_ref = response.Schedule) != null ? _ref.CourseSection : void 0) != null) {
                  $(response.Schedule.CourseSection).each(function(index, item) {
                    var ii, len, period, _results;

                    if (item.TimetableID) {
                      if ($.inArray(item.TimetableID, _curr_timetable) < 0) {
                        getTimetable(item.TimetableID);
                        _curr_timetable.push(item.TimetableID);
                      }
                      len = parseInt(item.Length || 0, 10);
                      if (len > 0) {
                        period = parseInt(item.Period || 0, 10);
                        ii = period;
                        _results = [];
                        while (ii < len + period) {
                          if (!_curr_scheduler[ii]) {
                            _curr_scheduler[ii] = [];
                          }
                          if (!_curr_scheduler[ii][item.Weekday]) {
                            _curr_scheduler[ii][item.Weekday] = [];
                          }
                          _curr_scheduler[ii][item.Weekday].push(item);
                          _results.push(ii++);
                        }
                        return _results;
                      }
                    }
                  });
                }
                if (_curr_scheduler.length > 0) {
                  _runing.scheduler = true;
                  return process();
                } else {
                  return $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>目前無資料</td></tr>");
                }
              }
            }
          }
        });
      }
    };
    getTimetable = function(ttid) {
      if (ttid) {
        if (_all_timetable[ttid]) {
          return process();
        } else {
          return _connection.send({
            service: "_.GetTimetable",
            body: "<Request><Condition><TimetableID>" + ttid + "</TimetableID></Condition></Request>",
            result: function(response, error, http) {
              var _ref;

              if (error !== null) {
                return set_error_message("#mainMsg", "GetTimetable", error);
              } else {
                if (((_ref = response.TimeTableSections) != null ? _ref.TimeTableSection : void 0) != null) {
                  $(response.TimeTableSections.TimeTableSection).each(function(index, item) {
                    if (!_all_timetable[item.TimetableID]) {
                      _all_timetable[item.TimetableID] = {
                        max_Weekday: item.Weekday,
                        max_Period: item.Period
                      };
                    } else {
                      if (parseInt(_all_timetable[item.TimetableID].max_Weekday, 10) < parseInt(item.Weekday, 10)) {
                        _all_timetable[item.TimetableID].max_Weekday = item.Weekday;
                      }
                      if (parseInt(_all_timetable[item.TimetableID].max_Period, 10) < parseInt(item.Period, 10)) {
                        _all_timetable[item.TimetableID].max_Period = item.Period;
                      }
                    }
                    return _all_timetable[item.TimetableID][item.Period + item.Weekday] = item;
                  });
                }
                return process();
              }
            }
          });
        }
      }
    };
    getClassBusy = function(cid) {
      _runing.classbusy = false;
      _curr_classbusy = [];
      if (cid) {
        return _connection.send({
          service: "_.GetClassBusy",
          body: {
            Request: {
              Condition: {
                ClassID: cid
              }
            }
          },
          result: function(response, error, http) {
            var _ref;

            if (error !== null) {
              return set_error_message("#mainMsg", "GetClassBusy", error);
            } else {
              if (((_ref = response.Response) != null ? _ref.ClassBusy : void 0) != null) {
                $(response.Response.ClassBusy).each(function(index, item) {
                  return _curr_classbusy[item.Period + item.Weekday] = item.BusyDescription;
                });
              }
              _runing.classbusy = true;
              return process();
            }
          }
        });
      }
    };
    search = function(keyword) {
      var correspond_list;

      correspond_list = [];
      $(_alloptions).each(function() {
        if (this.Name.indexOf(keyword) !== -1) {
          return correspond_list.push(this);
        }
      });
      return setTCCDropDownList(correspond_list);
    };
    printScheduler = function() {
      var content, doc, page;

      content = null;
      doc = null;
      page = null;
      $("#timeTable caption").html($("#tabName").html() + " " + $("#tabSearch").html() + "課表");
      page = $($("#timeTable").html());
      page.find("a").wrapInner("<span>").find("span").unwrap("a");
      content = "<!DOCTYPE html>\n<html>\n  <head>\n    <link type=\"text/css\" href=\"css/bootstrap.css\" rel=\"stylesheet\" />\n    <link type=\"text/css\" href=\"css/bootstrap-responsive.css\" rel=\"stylesheet\" />\n    <link type=\"text/css\" href=\"css/mybootstrap.css\" rel=\"stylesheet\" />\n    <link type=\"text/css\" href=\"css/base.css\" rel=\"stylesheet\" />\n    <link type=\"text/css\" href=\"css/default.css\" rel=\"stylesheet\"/>\n  </head>\n  <body>\n    <div class=\"my-print\">" + ($("<div/>").append(page).html()) + "</div>\n  </body>\n</html>";
      doc = window.open("about:blank", "_blank", "");
      doc.document.open();
      doc.document.write(content);
      doc.document.close();
      return doc.focus();
    };
    setSemeDownList = function(_list) {
      var items;

      items = [];
      $("#menu1").html("");
      $(_list).each(function() {
        var FullName;

        FullName = (this.SchoolYear || "") + "學年度 " + (this.Semester || "") + "學期";
        return items.push("<li><a href=\"#\" schoolyear=\"" + (this.SchoolYear || "") + "\" semester=\"" + (this.Semester || "") + "\">" + FullName + "</a></li>");
      });
      if (items.length > 0) {
        $("#menu1").html(items.join("")).find("li:first").click();
      } else {
        $("#tabName").html("無資料");
        $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>目前無資料</td></tr>");
      }
      if (!_myself.semester_list) {
        return _myself.semester_list = $("#menu1").html();
      }
    };
    setTCCDropDownList = function(_list) {
      var items;

      items = [];
      $("#menu1, #menu2").html("");
      $(_list).each(function() {
        return items.push("<li><a href=\"#\" kid=\"" + (this.ID || "") + "\" kind=\"" + (this.Kind || "") + "\">" + (this.Name || "") + "</a></li>");
      });
      if (items.length > 0) {
        $("#menu2").html(items.join("")).find("li:first").click();
      } else {
        $("#tabSearch, #tabName").html("無資料");
        if (_list.length) {
          $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>目前無資料</td></tr>");
        } else {
          $("#timeTable").find("thead").html("").end().find("tbody").html("<tr><td>查無此資料</td></tr>");
        }
      }
      if (!_myself.tcc_list) {
        return _myself.tcc_list = $("#menu2").html();
      }
    };
    set_error_message = function(select_str, serviceName, error) {
      var tmp_msg;

      if (serviceName) {
        tmp_msg = "<i class=\"icon-white icon-info-sign my-err-info\"></i><strong>呼叫服務失敗或網路異常，請稍候重試!</strong>(" + serviceName + ")";
        if (error !== null) {
          if (error.dsaError) {
            if (error.dsaError.status === "504") {
              switch (error.dsaError.message) {
                case "501":
                  tmp_msg = "<strong>很抱歉，您無讀取資料權限！</strong>";
                  break;
                default:
                  tmp_msg = "<strong>" + error.dsaError.message + "</strong>";
              }
            } else {
              if (error.dsaError.message) {
                tmp_msg = error.dsaError.message;
              }
            }
          } else if (error.loginError.message) {
            tmp_msg = error.loginError.message;
          } else {
            if (error.message) {
              tmp_msg = error.message;
            }
          }
          $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>" + tmp_msg + "</div>");
          return $(".my-err-info").click(function() {
            return alert("請拍下此圖，並與客服人員連絡，謝謝您。\n" + JSON.stringify(error, null, 2));
          });
        }
      } else {
        return $(select_str).html("<div class='alert alert-error'>\n  <button class='close' data-dismiss='alert'>×</button>\n  " + error + "</div>");
      }
    };
    return {
      on_init: function() {
        initialize();
        return getAllSearchItem();
      },
      on_search: function(_keyword) {
        return search(_keyword);
      },
      on_runMydata: function() {
        return runMydata();
      },
      on_printScheduler: function() {
        return printScheduler();
      },
      getScheduler: function(_request) {
        return getScheduler(_request);
      },
      getSemester: function(_request) {
        return getSemester(_request);
      },
      getClassBusy: function(_cid) {
        return getClassBusy(_cid);
      },
      setTCCDropDownList: function(_list) {
        return setTCCDropDownList(_list);
      },
      printScheduler: function() {
        return printScheduler();
      }
    };
  })();

}).call(this);
