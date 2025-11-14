import { catchErrorsFrom } from '/lib/utils';
import client from '/lib/client';
import { Email } from '/lib/emails';
import { memberController } from '/lib/controllers';
import { hashPassword, generateToken } from '/lib/auth';

export default catchErrorsFrom(async (req, res) => {
	const { token, password, password2 } = req.body;
	const email = req.body.email?.toLowerCase();
	const success = !token ? await requestReset(email) : await updatePassword(token, password, password2);
	return res.status(!success ? 404 : 200).json(!success ? { error: 'Användaren hittades ej' } : { success: true });
});

const requestReset = async (email: string) => {
	const member = await memberController.get(email);

	if (!member) {
		console.log('member not found with token:', email);
		return false;
	}
	const token = await generateToken(email);
	await client.items.update(member.id, { resettoken: token });
	await Email.resetPassword({ email, token });
	return true;
};

const updatePassword = async (token, password, password2) => {
	const member = await memberController.getByPasswordToken(token);
	if (!member) {
		console.log('member not found with token:', token);
		return false;
	}
	const hashedPassword = await hashPassword(password);
	await client.items.update(member.id, {
		resettoken: null,
		password: hashedPassword,
	});
	return true;
};
