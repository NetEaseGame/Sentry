export function userDisplayName(user, shortName) {
	let displayName = null;
	if (shortName == true) { // update by hzwangzhiwei @20160406
		if (user.email !== user.name) {
    		displayName = user.name;
  		}
  		else {
  			displayName = user.name.substring(0, user.name.indexOf('@'));
  		}
	}
	else {
		displayName = user.name;
  		if (user.email !== user.name) {
    		displayName += ' (' + user.email + ')';
  		}
	}
	return displayName;
}