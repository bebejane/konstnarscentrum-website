import regions from '../../regions.json';

/**
 * Resolve the region a plugin API request refers to.
 *
 * The plugin sends the region slug (`ost`), but a role name ("Öst") or a role
 * id is accepted too, so a tab opened before a deploy keeps working. Returns
 * undefined for anything that is not a region — callers must reject it instead
 * of guessing a default (the old `?? ost` fallback made every role act on Öst).
 */
export const findPluginRegion = (value: string | undefined) => {
	const raw = (value ?? '').trim();
	if (!raw) return undefined;
	const key = raw.toLowerCase();

	return (
		regions.find((region) => region.slug.toLowerCase() === key) ??
		regions.find((region) => (region.name ?? '').toLowerCase() === key) ??
		regions.find((region) => String(region.roleId) === raw) ??
		undefined
	);
};
