import regions from '/regions.json';
import { FORTNOX_ENABLED_REGIONS } from '/lib/fortnox/enabledRegions';

export type RoleRef = {
	/** `ctx.currentRole.id` — matches `roleId` in the generated regions.json. */
	id?: string;
	/** `ctx.currentRole.attributes.name`, e.g. "Öst". */
	name?: string;
};

/**
 * Resolve the region a DatoCMS role belongs to.
 *
 * `regions.json` is generated from the roles at build time, so `roleId` is the
 * authoritative link — regions are named "Öst"/"Väst" while their slugs are
 * "ost"/"vast", so matching on the display name is fragile. The global `admin`
 * role has no region of its own and maps to the first Fortnox-enabled region
 * for now (only Öst).
 */
export const regionFromRole = ({ id, name }: RoleRef) => {
	const roleId = String(id ?? '');
	if (roleId) {
		const byRoleId = regions.find((region) => String(region.roleId) === roleId);
		if (byRoleId) return byRoleId;
	}

	if ((name ?? '').trim().toLowerCase() === 'admin')
		return regions.find((region) => FORTNOX_ENABLED_REGIONS.includes(region.slug));

	return undefined;
};

/** Whether the role's region is allowed to use the Fortnox integration. */
export const isFortnoxRoleEnabled = (role: RoleRef): boolean => {
	const region = regionFromRole(role);
	return !!region && FORTNOX_ENABLED_REGIONS.includes(region.slug);
};
