// permissionConfig.js
module.exports = {
  "admin:add": ["manage-staff", "add-staff"],
  "admin:list": ["manage-staff", "view-staff"],
  "admin:get": ["manage-staff", "view-staff"],
  "admin:update": ["manage-staff", "edit-staff"],
  "admin:delete": ["manage-staff", "delete-staff"],
  "coach:changeStatus": ["manage-coach", "change-coach-status"],
};
