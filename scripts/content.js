//additional functionlity add to task report page
if (location.href.includes("http://kitpoint.kit.edu/task/reports")) {
  //append new button next to search bar
  $(
    "<a id='approveAllBtn' class='btn btn-primary btn-xs'><i class='fa fa-check-circle'></i>Approve All</a>"
  ).insertBefore($('label:contains("Search")'));

  //handle click event of the new added
  $("#approveAllBtn").click(function () {
    //get all approve buttons
    var approve_obj = $('a[id^="report"]');
    try {//use try to handle warning when use location.reload
      approve_obj
        .map((index) => {//loop over all approve button
          var report_id = $("#" + approve_obj[index].id)//each approve button
            .attr("onClick")
            .split(",")[0]
            .replace(/\D/g, "");//get the onClick information and slice only digit
          $.ajax({//request api for aprroval
            type: "GET",
            url: "/task/approve_report/" + report_id,
            dataType: "json",
            async: false,//make sure api request one by one
          });
        })
        .then(location.reload());//reload the page after all report approve
    } catch (error) {}
  });
}

//addtional functionality add to project page - allow to export report to excel
if (location.href.includes("http://kitpoint.kit.edu/project/view/")) {
  var project_id = location.href.split("/")[
    location.href.split("/").length - 1
  ];
  var project_name = $($(".x_title h2")[0]).text().replace(/ /g, "_");

  //append a new button for export report
  $(
    "<a id='exportProjectReport' class='btn btn-primary btn-xs' style='float: right;margin-right: 20px;'>Export Report</a>"
  ).insertBefore($("#student-task"));

  //handle onclick of the created button
  $("#exportProjectReport").click(function (e) {
    $.ajax({//api request for all task list in the project
      type: "POST",
      url: "/task/tasks_view/datatable",
      data: {//parameter that api need
        project: project_id,
        "search[value]": "",
      },
      async: false,
      success: function (response) {
        //create the table as html so it can be download as excel
        var res_data = `
				<style>
				table, th, td {
				  border: 1px solid black;
				}
				.report{
background-color: gray;
}
				</style>

				<table>
				  <tr>
				    <th>id</th>
				    <th>type</th>
				    <th>taskname</th>
				    <th>student</th>
				    <th>actualhour/session</th>
				    <th>status</th>
				    <th>startdate/semester</th>
				    <th>enddate/deadline</th>
				  </tr>`;
        response.data.map((each_task) => {
          var task_id = $(each_task.name).attr("onclick").replace(/\D/g, "");
          var task_name = each_task.name
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/\r?\n|\r/g, "");
          var member_name = each_task.student
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/\r?\n|\r/g, "");
          var main_type = "Task";
          // each_task.actual_hour
          // each_task.task_status
          // each_task.start_date
          // each_task.deadline
          res_data =
            res_data +
            `
				  <tr class="report">
				    <td>` +
            "304" +
            `</td>
				    <td>` +
            main_type +
            `</td>
				    <td>` +
            task_name +
            `</td>
				    <td>` +
            member_name +
            `</td>
				    <td>` +
            each_task.actual_hour +
            `</td>
				    <td>` +
            each_task.task_status +
            `</td>
				    <td>` +
            each_task.start_date +
            `</td>
				    <td>` +
            each_task.deadline +
            `</td>
				  </tr>
        	`;
          $.ajax({
            type: "GET",
            url: "/task/view/" + task_id,
            async: false,
            success: function (response) {
              var lines = $($(response).find("tbody")[0]).find("tr");
              lines.map((line_index) => {
                var cols = $(lines[line_index]).find("td");
                var type = "Report";
                var end_date = $(cols[0]).html();
                var session = $(cols[1]).html();
                var semester = $(cols[2]).html();
                var approved = $(cols[3]).html();
                var desc = $(cols[4]).html();
                res_data =
                  res_data +
                  `
				  <tr>
				    <td>` +
                  task_id +
                  `</td>
				    <td>` +
                  type +
                  `</td>
				    <td>` +
                  desc +
                  `</td>
				    <td>` +
                  member_name +
                  `</td>
				    <td>` +
                  session +
                  `</td>
				    <td>` +
                  approved +
                  `</td>
				    <td>` +
                  semester +
                  `</td>
				    <td>` +
                  end_date +
                  `</td>
				  </tr>
        	`;
              });
            },
          });
        });
        res_data = res_data + "</table>";

        var element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:application/vnd.ms-excel," + encodeURIComponent(res_data)
        );
        element.download = project_name + ".xls";
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        e.preventDefault();
      },
    });
  });
}
