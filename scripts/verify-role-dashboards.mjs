import assert from "node:assert/strict";
import { DASHBOARD_ROLES, PERMISSIONS } from "../src/lib/roles.js";
import { ROLE_DASHBOARDS } from "../src/config/roleDashboards.js";

assert.equal(DASHBOARD_ROLES.length, 8, "expected exactly eight canonical dashboard roles");

const routes = new Set();
const permissionSignatures = new Set();
const dataScopes = new Set();

for (const role of DASHBOARD_ROLES) {
  const config = ROLE_DASHBOARDS[role];
  assert.ok(config, `${role} dashboard config is missing`);
  assert.ok(config.route.startsWith("/"), `${role} route must be absolute`);
  assert.ok(config.nav.length >= 3, `${role} must have at least three nav items`);
  assert.ok(config.permissions.length >= 3, `${role} must have at least three permissions`);
  assert.ok(config.dataAccess.length >= 3, `${role} must document scoped data access`);
  assert.ok(config.stats.length >= 3, `${role} must have dashboard stats`);

  routes.add(config.route);
  permissionSignatures.add([...config.permissions].sort().join("|"));
  dataScopes.add(config.dataAccess.join("|"));

  for (const navItem of config.nav) {
    assert.ok(navItem.path.startsWith("/"), `${role} nav path must be absolute`);
    assert.ok(PERMISSIONS[navItem.permission], `${role} nav permission ${navItem.permission} is not defined`);
  }

  for (const permission of config.permissions) {
    assert.ok(PERMISSIONS[permission], `${role} permission ${permission} is not defined`);
    assert.ok(PERMISSIONS[permission].includes(role), `${role} must be granted ${permission}`);
  }
}

assert.equal(routes.size, DASHBOARD_ROLES.length, "each role must have a unique dashboard route");
assert.equal(permissionSignatures.size, DASHBOARD_ROLES.length, "each role must have a distinct permission set");
assert.equal(dataScopes.size, DASHBOARD_ROLES.length, "each role must have a distinct data scope");

console.log(`Verified ${DASHBOARD_ROLES.length} role dashboards with unique routes, permissions, navigation, and data scopes.`);
