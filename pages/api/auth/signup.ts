import { validateSignUp, hashPassword } from '/lib/auth';
import { regions } from '/lib/region';
import { catchErrorsFrom, parseDatoError } from '/lib/utils';
import client from '/lib/client';

export default catchErrorsFrom(async (req, res) => {
	const { password, password2, firstName, lastName, regionId, ping } = req.body;
	const email = req.body.email?.toLowerCase();

	if (ping) return res.status(200).json({ pong: true });

	validateSignUp({ email, password, password2, firstName, lastName });

	try {
		const region = regions.find((el) => el.id === regionId);
		const member = (
			await client.items.list({ filter: { type: 'member', fields: { email: { eq: email } } } })
		)?.[0];

		const accessTokens = await client.accessTokens.list();
		const accessToken = accessTokens.find((t) => t.role?.id === region.roleId).token;
		const application = (
			await client.items.list({
				filter: { type: 'application', fields: { email: { eq: email } } },
			})
		)?.[0];

		if (!application) throw 'Det går ej att registerara sig utan att först ansöka om medlemskap.';
		else if (!application.approved) throw 'Din ansökan är inte godkänd än.';
		else if (!accessToken) throw `Access token is empty`;
		else if (!member) throw 'Medlem finns ej';

		const hashedPassword = await hashPassword(password);

		await client.items.update(member.id, {
			creator: { type: 'user', id: region.userId },
			first_name: firstName,
			last_name: lastName,
			full_name: `${firstName} ${lastName}`,
			region: regionId,
			email,
			password: hashedPassword,
			application: application.id,
			resettoken: undefined,
		});
		return res.status(200).json(member);
	} catch (err) {
		return res.status(500).json({ error: parseDatoError(err) });
	}
});
