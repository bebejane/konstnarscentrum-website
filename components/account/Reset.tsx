import styles from './index.module.scss';
import text from './text.json';
import { SubmitButton } from './Auth';
import memberService from '/lib/services/member';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { validatePassword } from '/lib/auth/validate';
import Link from 'next/link';
import { isEmail } from '/lib/utils';

export type Props = {
	token: string;
	onSuccess?: () => void;
};

export default function Reset({ token, onSuccess }: Props) {
	const [status, setStatus] = useState();

	useEffect(() => {
		if (status === 'requestSent') onSuccess?.();
	}, [status, onSuccess]);

	return (
		<div className={styles.container}>
			{!status && !token ? (
				<ResetForm setStatus={setStatus} />
			) : !status && token ? (
				<UpdatePasswordForm setStatus={setStatus} token={token} />
			) : (
				<div className={styles.success}>
					<p>
						{status === 'requestSent' && text.passwordEmailSent}
						{status === 'resetPassword' && (
							<>
								{text.yourPasswordHasBeenUpdated}
								<Link href={'/konstnar/konto/logga-in'}>
									<button>Logga in</button>
								</Link>
							</>
						)}
					</p>
				</div>
			)}
		</div>
	);
}

const ResetForm = ({ setStatus }) => {
	const [error, setError] = useState();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();

	useEffect(() => {
		isSubmitting && setError(undefined);
	}, [isSubmitting]);

	const onSubmitReset = async ({ email }) => {
		try {
			const { success } = await memberService.reset({ email });
			setStatus('requestSent');
		} catch (err) {
			setError(err && err.response ? err.response.data : err.messsage || err);
		}
	};

	return (
		<>
			<form className={styles.form} onSubmit={handleSubmit(onSubmitReset)} autoComplete='off'>
				<input autoComplete='false' name='hidden' type='text' style={{ display: 'none' }} />
				{errors.email && <label className={styles.formError}>{errors?.email.message}</label>}
				<input
					className={errors.email && styles.error}
					placeholder='E-post...'
					{...register('email', {
						required: true,
						validate: (val: string) => isEmail(val) || 'Ogiltig e-post adress',
					})}
				/>
				<SubmitButton loading={isSubmitting}>{text.send}</SubmitButton>
				{error && <p className={styles.formError}>{`${error.error || error.message || error}`}</p>}
			</form>
		</>
	);
};

const UpdatePasswordForm = ({ setStatus, token }) => {
	const [error, setError] = useState();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting, isValid },
	} = useForm();

	const [showPass, setShowPass] = useState(false);
	const [showPass2, setShowPass2] = useState(false);

	useEffect(() => {
		isSubmitting && setError(undefined);
	}, [isSubmitting]);

	const onSubmitUpdate = async ({ password, password2 }) => {
		try {
			await memberService.reset({ token, password, password2 });
			setStatus('resetPassword');
		} catch (err) {
			console.log(err);
			setError(err && err.response ? err.response.data : err.messsage || err);
		}
	};

	return (
		<>
			<form className={styles.form} onSubmit={handleSubmit(onSubmitUpdate)} autoComplete='off'>
				<input autoComplete='false' name='hidden' type='text' style={{ display: 'none' }} />
				{errors.password && <label className={styles.formError}>{errors?.password.message}</label>}
				<div className={styles.password}>
					<input
						type={showPass ? 'text' : 'password'}
						placeholder='Lösenord...'
						{...register('password', {
							required: true,
							validate: (val: string) => validatePassword(val) ?? true,
						})}
						autoComplete={'new-password'}
						className={errors.passsord && styles.error}
					/>
					<button className={styles.toggle} type='button' onClick={() => setShowPass(!showPass)}>
						<img src={`/images/password-${showPass ? 'show' : 'hide'}.png`} />
					</button>
				</div>
				{errors.password2 && <label className={styles.formError}>{errors?.password2.message}</label>}
				<div className={styles.password}>
					<input
						type={showPass2 ? 'text' : 'password'}
						placeholder='Upprepa lösenord...'
						autoComplete={'new-password'}
						{...register('password2', {
							required: true,
							validate: (val: string) =>
								validatePassword(val) ?? watch('password') !== val ? 'Lösenorden överestämmer ej' : true,
						})}
						className={errors.password2 && styles.error}
					/>
					<button className={styles.toggle} type='button' onClick={() => setShowPass2(!showPass2)}>
						<img src={`/images/password-${showPass2 ? 'show' : 'hide'}.png`} />
					</button>
				</div>
				<label>Lösenordet måste minst innehålla 8 tecken, en versal, en gemen och en siffra</label>
				<SubmitButton loading={isSubmitting}>{text.send}</SubmitButton>
			</form>
		</>
	);
};
