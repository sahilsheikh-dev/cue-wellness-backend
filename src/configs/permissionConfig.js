// permissionConfig.js
module.exports = {
  "admin:add": ["manage-staff", "add-staff"],
  "admin:list": ["manage-staff", "view-staff"],
  "admin:get": ["manage-staff", "view-staff"],
  "admin:update": ["manage-staff", "edit-staff"],
  "admin:delete": ["manage-staff", "delete-staff"],
  "coach:list": ["manage-coach", "view-coach"],
  "coach:get": ["manage-coach", "view-coach"],
  "coach:update": ["manage-coach", "edit-coach"],
  "coach:delete": ["manage-coach", "delete-coach"],
  "coach:changeStatus": ["manage-coach", "change-coach-status"],
};
