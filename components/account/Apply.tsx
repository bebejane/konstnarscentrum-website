import s from './index.module.scss';
import text from './text.json';
import memberService from '/lib/services/member';
import { SubmitButton } from './Auth';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FileUpload } from '/components';
import { isEmail } from '/lib/utils';
import type { Upload } from '/components/common/FileUpload';

export default function Apply({ regions = [], onSuccess }) {
	const [application, setApplication] = useState();
	const successRef = useRef<HTMLDivElement | undefined>();

	useEffect(() => {
		application && successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		application && onSuccess(application);
	}, [application, successRef, onSuccess]);

	return (
		<div className={s.container}>
			{!application ? (
				<ApplicationForm regions={regions} setApplication={setApplication} />
			) : (
				<div className={s.success} ref={successRef}>
					<h1>{text.thanksForRegistering}</h1>
					<p>{text.reviewYourRegistration}</p>
				</div>
			)}
		</div>
	);
}

const ApplicationForm = ({ regions, setApplication }) => {
	const [error, setError] = useState<undefined | Error>();
	const {
		register,
		handleSubmit,
		watch,
		getValues,
		formState: { errors, isSubmitting, isValid },
	} = useForm();
	const [upload, setUpload] = useState<Upload | undefined>();
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState<number | undefined>();
	const [uploadError, setUploadError] = useState<Error | undefined>();
	const uploadRef = useRef<HTMLInputElement | undefined>();
	const email = watch('email');
	const regionId = watch('regionId');

	const handleUploadDone = (upload: Upload) => {
		setUpload(upload);
		setProgress(undefined);
		setUploading(false);
	};
	useEffect(() => {
		uploading && setUpload(undefined);
	}, [uploading]);
	useEffect(() => {
		if (!uploadError) return;
		setProgress(undefined);
		setUploading(false);
	}, [uploadError]);

	useEffect(() => {
		isSubmitting && setError(undefined);
	}, [isSubmitting]);

	const onSubmitApplication = async ({
		email,
		firstName,
		lastName,
		phone,
		sex,
		address,
		postalCode,
		birthYear,
		homeCity,
		education,
		webpage,
		message,
		regionId,
	}) => {
		try {
			const app = await memberService.apply({
				email,
				firstName,
				lastName,
				phone,
				sex,
				address,
				postalCode,
				birthYear,
				homeCity,
				education,
				webpage,
				message,
				regionId,
				pdf: upload ? { upload_id: upload.id } : undefined,
			});
			setApplication(app);
		} catch (err) {
			console.log(err.response?.data);
			setError(err && err.response ? err.response.data : err.messsage || err);
		}
	};

	const uploadTags =
		regionId && regionId !== 'false' ? [regions.find((el) => el.id === regionId).slug] : [];

	return (
		<>
			<form className={s.form} onSubmit={handleSubmit(onSubmitApplication)}>
				{errors.firstName && <label className={s.formError}>Förnamn är obligatoriskt...</label>}
				<input
					{...register('firstName', { required: true })}
					className={errors.firstName && s.error}
					placeholder={`${text.firstName}...`}
				/>
				{errors.lastName && <label className={s.formError}>Efternamn är obligatoriskt...</label>}
				<input
					{...register('lastName', { required: true })}
					className={errors.lastName && s.error}
					placeholder={`${text.lastName}...`}
				/>
				{errors.email && <label className={s.formError}>E-post felaktig...</label>}
				<input
					className={errors.email && s.error}
					placeholder={`${text.email}...`}
					{...register('email', {
						required: true,
						pattern:
							/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					})}
				/>
				{errors.phone && <label className={s.formError}>Telefonnummer är obligatoriskt...</label>}
				<input
					className={errors.phone && s.error}
					placeholder={`${text.phone}...`}
					{...register('phone', {
						required: true,
					})}
				/>
				{errors.birthYear && <label className={s.formError}>Födelsår är felaktigt...</label>}
				<input
					{...register('birthYear', {
						required: true,
						validate: (val) => !isNaN(val) && parseInt(val) > 1900 && parseInt(val) < 2023,
					})}
					className={errors.birthYear && s.error}
					placeholder={`${text.birthYear}...`}
				/>
				{errors.sex && <label className={s.formError}>Kön är obligatoriskt...</label>}
				<select
					{...register('sex', {
						required: true,
						validate: (val) => ['man', 'woman', 'non-binary'].includes(val),
					})}
					placeholder={`${text.sex}...`}
					className={errors.sex && s.error}
				>
					<option value='-1'>Välj kön</option>
					<option value='man'>Man</option>
					<option value='woman'>Kvinna</option>
					<option value='non-binary'>Icke binär</option>
				</select>
				{errors.address && <label className={s.formError}>Adress är obligatoriskt...</label>}
				<textarea
					className={errors.address && s.error}
					rows={3}
					placeholder={`${text.address}...`}
					{...register('address', {
						required: true,
					})}
				/>
				{errors.postalCode && <label className={s.formError}>Postnummer är obligatoriskt...</label>}
				<input
					{...register('postalCode', { required: true })}
					className={errors.postalCode && s.error}
					placeholder={`${text.postalCode}...`}
				/>
				{errors.homeCity && <label className={s.formError}>Bostadsort är obligatoriskt...</label>}
				<input
					{...register('homeCity', { required: true })}
					className={errors.homeCity && s.error}
					placeholder={`${text.homeCity}...`}
				/>
				{errors.webpage && (
					<label className={s.formError}>
						Websida är ogiltig. Använd format &quot;https://www.exempel.se...&quot;
					</label>
				)}
				<input
					{...register('webpage', {
						required: true,
						pattern: /^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+[a-z]{2,6}$/s,
					})}
					className={errors.webpage && s.error}
					placeholder={`${text.webpage}...`}
				/>
				{errors.education && <label className={s.formError}>Utbildning felatktigt format...</label>}
				<textarea
					{...register('education', { required: true })}
					rows={5}
					className={errors.education && s.error}
					placeholder={`${text.education}...`}
				/>
				{errors.message && <label className={s.formError}>Meddelande är tomt...</label>}
				<textarea
					{...register('message', { required: false })}
					rows={10}
					className={errors.message && s.error}
					placeholder={`${text.message}...`}
				/>
				{errors.regionId && <label className={s.formError}>Välj en region...</label>}
				<select
					{...register('regionId', {
						required: true,
						validate: (value: string) => regions.find(({ id }) => value === id) !== undefined,
					})}
					className={errors.roledId && s.error}
				>
					<option value='false'>Välj region</option>
					{regions.map((r, i) => (
						<option key={i} value={r.id}>
							{r.name}
						</option>
					))}
				</select>

				{uploadError && <div className={s.formError}>{uploadError.message}</div>}
				<button
					type='button'
					onClick={() => uploadRef.current?.click()}
					disabled={
						progress !== undefined ||
						uploading ||
						!isEmail(email) ||
						!regionId ||
						regionId === 'false'
					}
				>
					{upload ? upload.basename : progress === undefined ? 'Ladda upp Pdf' : `${progress}%`}
				</button>

				<FileUpload
					ref={uploadRef}
					customData={{}}
					tags={uploadTags}
					accept='.pdf'
					sizeLimit={10}
					onDone={handleUploadDone}
					onProgress={setProgress}
					onUploading={setUploading}
					onError={setUploadError}
					mediaLibrary={false}
				/>
				<SubmitButton loading={isSubmitting}>{text.send}</SubmitButton>
				{error && <p className={s.formError}>{`${error.error || error.message || error}`}</p>}
			</form>
		</>
	);
};
