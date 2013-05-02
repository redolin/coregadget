// Generated by CoffeeScript 1.3.1
(function() {
  var query_paper;

  $(function() {
    return $("a[target='query']").click(function(e) {
      e.preventDefault();
      return query_paper();
    });
  });

  query_paper = function() {
    if ($("input[target='student-name']").val() !== "" || $("input[target='teacher-name']").val() !== "" || $("input[target='paper-name']").val() !== "") {
      return gadget.getContract("emba.student").send({
        service: "public.QueryPapers",
        body: "<Request>\n	" + ($("input[target='student-name']").val() !== "" ? "<StudentName>%" + ($("input[target='student-name']").val()) + "%</StudentName>" : "") + "\n	" + ($("input[target='teacher-name']").val() !== "" ? "<TeacherName>%" + ($("input[target='teacher-name']").val()) + "%</TeacherName>" : "") + "\n	" + ($("input[target='paper-name']").val() !== "" ? "<PaperName>%" + ($("input[target='paper-name']").val()) + "%</PaperName>" : "") + "\n</Request>",
        result: function(response, error, http) {
          var items;
          if (response.Result != null) {
            items = [];
            $(response.Result.Paper).each(function(index, item) {
              var teacherName;
              teacherName = [];
              $(item.AdvisorList.Advisor).each(function() {
                if (this.Name !== '') {
                  return teacherName.push(this.Name);
                }
              });
              item.TeacherName = teacherName.join(", ");
              return items.push("<tr>\n	<td>" + item.StudentName + (item.DepartmentName !== '' ? " (" + item.DepartmentName + ")" : '') + "</td>\n	<td>" + item.TeacherName + "</td>\n	<td>" + item.PaperName + "</td>\n	<td>" + item.SchoolYear + " - " + (item.Semester === '0' ? '暑假' : item.Semester) + "</td>\n</tr>");
            });
            return $("table[target='paper-result'] tbody").html(items.join(""));
          }
        }
      });
    }
  };

}).call(this);