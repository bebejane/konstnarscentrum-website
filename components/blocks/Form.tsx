import s from './Form.module.scss'
import cn from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { Loader } from '/components';
import { FileUpload } from '/components'
import type { Upload } from '/components/common/FileUpload'

export type ButtonBlockProps = {
	record: any
	data: FormRecord
	region: Region
	onClick: Function
}

export default function Form({ record, data: { id, formFields, confirmation } }: ButtonBlockProps) {

	const [formValues, setFormValues] = useState({ fromName: '', fromEmail: '' })
	const [error, setError] = useState<Error | undefined>()
	const [errors, setErrors] = useState<string[] | undefined>()

	const [loading, setLoading] = useState(false)
	const [upload, setUpload] = useState<Upload | undefined>()
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState<number | undefined>()
	const [uploadError, setUploadError] = useState<Error | undefined>()
	const [success, setSuccess] = useState<boolean | undefined>()
	const confirmationRef = useRef<HTMLParagraphElement | undefined>()
	const uploadRef = useRef<HTMLInputElement | undefined>()

	const handleInputChange = ({ target: { id, value } }) => {
		setFormValues({ ...formValues, [id]: value })
	}

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()

		setLoading(false)
		setSuccess(undefined)
		setError(undefined)
		setErrors(undefined)

		const fromName = formValues.fromName;
		const fromEmail = formValues.fromEmail;
		const fields = formFields.map(({ title, id }) => ({ title, value: formValues[id] }))
		const form = { recordId: record.id, fromEmail, fromName, fields }
		//console.log(fields, formFields)
		setLoading(true)
		fetch('/api/contact-form', {
			body: JSON.stringify(form),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		}).then(async (res) => {
			const { success, error, errors } = await res.json()

			if (success === true)
				setSuccess(true)
			else if (error)
				setError(new Error(error))
			else if (errors)
				setErrors(errors)

		}).catch((err) => setError(err)).finally(() => setLoading(false))
	}

	const handleUploadDone = (upload: Upload) => {
		setUpload(upload)
		setProgress(undefined)
		setUploading(false)

	}

	useEffect(() => { uploading && setUpload(undefined) }, [uploading])
	useEffect(() => {
		if (!uploadError) return
		setProgress(undefined)
		setUploading(false)
	}, [uploading])

	useEffect(() => {
		success && confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}, [success])

	return (
		<section className={s.form}>
			<h3>Dina uppgifter</h3>
			{success ?
				<p ref={confirmationRef} className={s.confirmation}>{confirmation}</p>
				:
				<form onSubmit={handleSubmit} className={cn(loading && s.loading)}>
					<label htmlFor={'fromName'}>Namn*</label>
					<input id={'fromName'} type="text" value={formValues.fromName} onChange={handleInputChange} />

					<label htmlFor={'from-email'}>Email*</label>
					<input id={'fromEmail'} type="email" value={formValues.fromEmail} onChange={handleInputChange} />

					{formFields.map(({ id: fieldId, __typename, title }, idx) => {
						const props = { id: fieldId, formId: id, 'data-typename': __typename, value: formValues[id], onChange: handleInputChange }
						return (
							<React.Fragment key={idx}>
								<label htmlFor={id}>{title}</label>
								{(() => {
									switch (__typename) {
										case 'FormTextRecord':
											return <input type="text"  {...props} />
										case 'FormTextblockRecord':
											return <textarea rows={6}  {...props} />
										case 'PdfFormRecord':
											return (
												<>
													<button type="button" onClick={() => uploadRef.current?.click()} disabled={progress !== undefined || uploading}>
														{upload ? upload.basename : progress === undefined ? 'Ladda upp pdf' : `${progress}%`}
													</button>
													{uploadError &&
														<div className={s.error}>Det uppstod ett fel vid uppladdning!</div>
													}
													<FileUpload
														ref={uploadRef}
														customData={{}}
														tags={[record?.region?.name, record?.title].filter(el => el)}
														accept=".pdf"
														onDone={(u) => {
															handleUploadDone(u)
															handleInputChange({ target: { id: fieldId, value: u.url } })
														}}
														onProgress={setProgress}
														onUploading={setUploading}
														onError={setUploadError}
														mediaLibrary={false}
													/>
												</>
											)
										default:
											return <div key={idx}>Unsupported: {__typename}</div>
									}
								})()}
							</React.Fragment>
						)
					})}

					{(error || errors) &&
						<p className={s.error}>
							{error ?
								<>{error.message}</>
								: errors.map((err) => <>{err}<br /></>)
							}
						</p>
					}

					<button type="submit" disabled={loading}>
						{loading ? <Loader /> : 'Skicka'}
					</button>

				</form>
			}
		</section>
	)
}
