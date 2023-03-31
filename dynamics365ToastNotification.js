function inAppNotification(executionContext) {
  var formContext = executionContext.getFormContext(); // Get the form context
  var recordid = formContext.data.entity.getId(); // Get the ID of the current record
  var ownerValue = formContext.getAttribute("ownerid").getValue(); // Get the owner of the current record

  if (ownerValue != null && ownerValue.length > 0) {
    // Check if the owner exists
    var ownerId = formContext.getAttribute("ownerid").getValue()[0].id; // Get the ID of the owner
    var ownerName = formContext.getAttribute("ownerid").getValue()[0].name; // Get the name of the owner
    var ownerEntityType = formContext
      .getAttribute("ownerid")
      .getValue()[0].entityType; // Get the type of the owner
    var ownerId_value = ownerId.slice(1, ownerId.length - 1); // Remove the curly braces from the owner ID

    if (ownerEntityType == "team") {
      // If the owner is a team
      var fetchXML =
        "?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'><entity name='systemuser'><attribute name='fullname' /><attribute name='systemuserid' /><order attribute='fullname' descending='false' /><link-entity name='teammembership' from='systemuserid' to='systemuserid' visible='false' intersect='true'><link-entity name='team' from='teamid' to='teamid' alias='ab'><filter type='and'><condition attribute='name' operator='eq' value='" +
        ownerName +
        "' /></filter></link-entity></link-entity></entity></fetch>"; // Build the fetchXML query to retrieve all members of the team
      Xrm.WebApi.retrieveMultipleRecords("systemuser", fetchXML).then(
        // Execute the fetchXML query using the Web API
        function success(resultUser) {
          for (var i = 0; i < resultUser.entities.length; i++) {
            // Loop through all the members of the team
            var notificationRecord = {
              title: "Case Assignment(Team)", // Set the title of the notification
              body: "Case has been assigned to your team. Please follow the action below. ", // Set the body of the notification
              "ownerid@odata.bind":
                "/systemusers(" + resultUser.entities[i].systemuserid + ")", // Set the owner of the notification to the current member of the team
              icontype: 100000001, // Set the icon type of the notification to success
              data: JSON.stringify({
                actions: [
                  {
                    title: "Go To Case", // Set the title of the action
                    data: {
                      url: `https://{YOUR ORGANISATION DOMAIN NAME}.crm.dynamics.com/main.aspx?appid={YOUR APP ID}&pagetype=entityrecord&etn=incident&id=${recordid}`, // Set the URL of the action
                    },
                  },
                ],
              }),
            };
            Xrm.WebApi.createRecord("appnotification", notificationRecord).then(
              // Create the notification using the Web API
              function success(result) {
                console.log(
                  "notification created with single action: " + result.id
                ); // Log a success message to the console
              },
              function (error) {
                console.log(error.message); // Log an error message to the console
                // handle error conditions
              }
            );
          }
          debugger; // Stop execution for debugging
        },
        function error() {}
      );
    } else {
      var notificationRecord = {
        title: "Case Assignment(User)",
        body: "Case has been assigned to your team. Please follow the action below.",
        "ownerid@odata.bind": "/systemusers(" + ownerId_value + ")",
        icontype: 100000001, // success
        data: JSON.stringify({
          actions: [
            {
              title: "Go To Case",
              data: {
                url: `https://{YOUR ORGANISATION DOMAIN NAME}.crm.dynamics.com/main.aspx?appid={YOUR APP ID}&pagetype=entityrecord&etn=incident&id=${recordid}`,
              },
            },
          ],
        }),
      };
      Xrm.WebApi.createRecord("appnotification", notificationRecord).then(
        function success(result) {
          console.log("notification created with single action: " + result.id);
        },
        function (error) {
          console.log(error.message);
          // handle error conditions
        }
      );
    }
  }
}
