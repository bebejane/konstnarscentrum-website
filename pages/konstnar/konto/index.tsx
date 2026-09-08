import s from "./index.module.scss";
import cn from 'classnames'
import withGlobalProps from "/lib/withGlobalProps";
import { GetStaticProps } from "next";
import SignOut from "/components/account/SignOut";
import { getCsrfToken, getSession } from "next-auth/react";
import { MemberDocument, AllMemberCategoriesDocument } from "/graphql";
import { apiQuery } from "dato-nextjs-utils/api";
import { useState } from "react";
import { recordToSlug } from "/lib/utils";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { RevealText, Loader, ErrorModal } from "/components";

export type Props = {
	csrfToken: string,
	member: MemberRecord,
	memberCategories: MemberCategoryRecord[]
}

export default function Account({ member: memberFromProps, memberCategories }: Props) {

	const [error, setError] = useState<undefined | Error>();
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [member, setMember] = useState<MemberRecord>(memberFromProps)
	const { id, firstName, lastName, bio, birthPlace, city, yearOfBirth, webpage, instagram, memberCategory, active, showContact } = member

	const { register, handleSubmit, formState: { errors, isSubmitting }, formState } = useForm({
		defaultValues: {
			id,
			firstName,
			lastName,
			bio,
			birthPlace,
			city,
			yearOfBirth,
			webpage,
			instagram,
			active,
			showContact,
			memberCategory: memberCategory.map(c => c.id)
		}
	})

	const onSubmit = async (form) => {
		setSaving(true)

		fetch('/api/account', {
			body: JSON.stringify({ ...form }),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		})
			.then(async (res) => {
				const el = await res.json()
				if (res.status === 200)
					setMember(el)
				else
					setError(new Error(el.message.join('. ')))

			})
			.catch((err) => setError(err))
			.finally(() => {
				setSaved(true)
				setTimeout(() => {
					setSaving(false)
					setSaved(false)
				}, 1000)
			})
	}

	return (
		<>
			<div className={s.container}>
				<h1><RevealText>Konto</RevealText></h1>

				<h3>Välkommen, du är nu inloggad som {firstName} {lastName}.</h3>

				<p className="intro">
					Här kan du redigera din portfolio och de uppgifter som visas på vår hemsida.
				</p>

				<Link href={recordToSlug(member)} className={s.portfolioButton}>
					<button>Gå till din portfolio</button>
				</Link>

				<h3>Uppdatera uppgifter</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<input
						id="id"
						name="id"
						type="hidden"
						{...register("id", { required: true })}
					/>

					<label htmlFor="firstName">Förnamn</label>
					<input
						id="firstName"
						name="firstName"
						type="text"
						{...register("firstName", { required: 'Förnamn saknas' })}
					/>
					<ErrorMessage id="firstName" errors={errors} />

					<label htmlFor="lastName">Efternamn</label>
					<input
						id="lastName"
						name="lastName"
						type="text"
						{...register("lastName", { required: 'Efternamn saknas' })}
					/>
					<ErrorMessage id="lastName" errors={errors} />

					<label htmlFor="bio">Bio</label>
					<textarea
						id="bio"
						name="bio"
						rows={6}
						{...register("bio", {
							required: true,
							minLength: { value: 50, message: 'Din biografi måste minst vara 50 tecken lång' },
							maxLength: { value: 800, message: 'Din biografi får högst vara 800 tecken lång' }
						})}
					/>
					<ErrorMessage id="bio" errors={errors} />

					<label htmlFor="birthPlace">Födelseort</label>
					<input
						id="birthPlace"
						name="birthPlace"
						type="text"
						{...register("birthPlace", { required: 'Födelsort är obligatoriskt' })}
					/>
					<ErrorMessage id="birthPlace" errors={errors} />

					<label htmlFor="city">Stad du är verksam i</label>
					<input
						id="city"
						name="city"
						type="text"
						{...register("city", { required: false })}
					/>
					<ErrorMessage id="city" errors={errors} />

					<label htmlFor="yearOfBirth">Födelseår</label>
					<input
						id="yearOfBirth"
						name="yearOfBirth"
						type="text"
						{...register("yearOfBirth", { required: false })}
					/>
					<ErrorMessage id="yearOfBirth" errors={errors} />

					<label htmlFor="webpage">Hemsida</label>
					<input
						id="webpage"
						name="webpage"
						type="text"
						{...register("webpage", {
							required: false,
							pattern: {
								value: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
								message: 'Värde måste vara en URL med format https://www.exempel.se'
							}
						})}
					/>
					<ErrorMessage id="webpage" errors={errors} />

					<label htmlFor="instagram">Instagram</label>
					<input
						id="instagram"
						name="instagram"
						type="text"
						{...register("instagram", {
							required: false,
							pattern: {
								value: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
								message: 'Värde måste vara en URL'
							}
						})}
					/>
					<ErrorMessage id="instagram" errors={errors} />

					<label htmlFor="instagram">Typer av konst</label>
					<div className={s.checkboxGroup}>
						{memberCategories?.map(({ id, categoryType }, idx) =>
							<div key={idx}>
								<input
									type="checkbox"
									value={id}
									name="memberCategory"
									{...register("memberCategory", { required: false })}
								/>
								<label>
									{categoryType}
								</label>
							</div>
						)}
					</div>
					<ErrorMessage id="memberCategory" errors={errors} className={s.errorMuted} />
					<br />

					<label htmlFor="active">Synlighet</label>
					<input
						type="checkbox"
						name="active"
						{...register("active", { required: false })}
					/> <span className="small">Visa portfolio på konstnarscentrum.org</span>
					<br />
					<input
						type="checkbox"
						name="showContact"
						{...register("showContact", { required: false })}
					/> <span className="small">Visa mina kontaktuppgifter på min portfolio sida</span>

					<button disabled={saving}>
						{saved ? 'Sparad' : saving ? <Loader size={10} /> : <>Spara</>}
					</button>

				</form >
				<h3>Övrigt</h3>
				<Link href="/konstnar/konto/fakturor">
					<button>Visa mina fakturor</button>
				</Link>
				<SignOut />
			</div >
			{error && <ErrorModal error={error} onClose={() => setError(undefined)} />}
		</>
	);
}

Account.page = { title: 'Konto', crumbs: [{ title: 'Konto', regional: false }] } as PageProps

const ErrorMessage = ({ errors, id, className }: { errors: any, id: string, className?: string }) => {
	if (!errors[id])
		return null

	return (
		<div className={cn(s.error, className)}>{errors[id].message}</div>
	)
}

export const getServerSideProps: GetStaticProps = withGlobalProps({ queries: [AllMemberCategoriesDocument] }, async ({ props, revalidate, context }: any) => {
	const res = await getCsrfToken(context)
	const csrfToken = res
	const session = await getSession(context);

	if (!session)
		return { redirect: { destination: '/konstnar/konto/logga-in', permanent: false } }

	const { member } = await apiQuery(MemberDocument, { variables: { email: session.user.email } })

	if (!member)
		return { notFound: true }

	return {
		props: {
			...props,
			csrfToken,
			member
		}
	};
});
